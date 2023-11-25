from flask import Flask, request
from azure.mgmt.subscription import SubscriptionClient
from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.mgmt.loganalytics import LogAnalyticsManagementClient
from azure.mgmt.loganalytics.models import Workspace
from flask import jsonify
from flask_cors import CORS
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.monitor.models import (
    DiagnosticSettingsResource,
    RetentionPolicy,
    LogSettings,
    MetricSettings,
)
from azure.loganalytics import LogAnalyticsDataClient
from azure.loganalytics.models import QueryBody
import logging

# Need to specify exact origins in production
app = Flask(__name__)
allowed_origins = [
    "http://localhost:3000",  # Your frontend
    "http://localhost:5000",  # Other allowed origins
    # Add more origins as needed
]

CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)
logging.basicConfig(level=logging.DEBUG)

# Get subscriptions for currently logged in Azure user
@app.route("/subscriptions", methods=["GET"])
def get_subscriptions():
    try:
        credential = DefaultAzureCredential()
        subscription_client = SubscriptionClient(credential)
        subscriptions = subscription_client.subscriptions.list()

        subscription_list = []

        for sub in subscriptions:
            subscription_id = sub.subscription_id
            display_name = sub.display_name

            resource_count = 0
            resource_client = ResourceManagementClient(credential, subscription_id)
            for item in resource_client.resources.list():
                resource_count += 1

            subscription_list.append(
                {
                    "subscriptionId": subscription_id,
                    "displayName": display_name,
                    "resourceCount": resource_count,
                }
            )

        return jsonify(subscription_list)
    except Exception as e:
        logging.exception("Error occurred while getting subscriptions")
        return jsonify({"error": str(e)}), 500

# Get all Azure supported locations
@app.route("/locations", methods=["GET"])
def get_locations():
    try:
        subscription_id = request.args.get("subscription_id")
        if not subscription_id:
            return jsonify({"error": "Subscription ID is required"}), 400

        credential = DefaultAzureCredential()
        subscription_client = SubscriptionClient(credential) 
        # Get all locations
        locations = subscription_client.subscriptions.list_locations(subscription_id)
        print("Locations:", locations)

        location_list = []

        for location in locations:
            if location.name:
                location_list.append(location.name)

        print("Location list:", location_list)
        return jsonify(location_list)
    except Exception as e:
        logging.exception("Error occurred while getting locations")
        return jsonify({"error": str(e)}), 500

@app.route("/subscriptions/<subscription_id>/resource_groups", methods=["GET"])
def get_resource_groups(subscription_id):
    try:
        tag_name = request.args.get("tag")  # Retrieve tag from request arguments
        if not tag_name:
            return jsonify({"error": "Tag is required"}), 400

        credential = DefaultAzureCredential()
        resource_client = ResourceManagementClient(credential, subscription_id)
        resource_groups = resource_client.resource_groups.list()

        resource_group_list = []

        for group in resource_groups:
            if group.tags and tag_name in group.tags:  # Check if resource group has the tag
                resource_group_list.append({"id": group.id, "name": group.name})

        if len(resource_group_list) == 0:  # If no resource groups have the tag, return a message
            return jsonify([])  # return an empty array if no resource groups found

        return jsonify(resource_group_list)
    except Exception as e:
        logging.exception("Error occurred while getting resource groups")
        return jsonify({"error": str(e)}), 500

# Create Resource Group for a subscription
@app.route("/subscriptions/<subscription_id>/create-resource-group", methods=["POST"])
def create_resource_group(subscription_id):
    try:
        payload = request.get_json()
        resource_group_name = payload.get("resourceGroupName")
        location = payload.get("location")

        if not resource_group_name or not location:
            return (
                jsonify({"success": False, "error": "Resource Group Name and Location are required."}),
                400,
            )

        credential = DefaultAzureCredential()
        resource_client = ResourceManagementClient(credential, subscription_id)

        # Add a simple tag to identify the resource group
        resource_group_params = {
            "location": location,
            "tags": {
                "AZTrckr": "true",
            },
        }

        resource_group = resource_client.resource_groups.create_or_update(
            resource_group_name,
            resource_group_params,
        )

        return jsonify({"success": True, "resourceGroupId": resource_group.id})

    except Exception as e:
        logging.exception(f"Error occurred while creating Resource Group: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
# Delete a resource group for a subscription if it has tag "AZTrckr"
@app.route("/subscriptions/<subscription_id>/resource-groups/<resource_group_name>", methods=["DELETE"])
def delete_resource_group(subscription_id, resource_group_name):
    try:
        credential = DefaultAzureCredential()
        resource_client = ResourceManagementClient(credential, subscription_id)
        
        # Check if the resource group is managed by AZTrckr
        resource_group = resource_client.resource_groups.get(resource_group_name)
        if not resource_group.tags or "AZTrckr" not in resource_group.tags:
            return jsonify({"error": "Resource Group is not managed by AZTrckr"}), 400

        delete_operation = resource_client.resource_groups.begin_delete(resource_group_name)
        delete_operation.wait()  # Wait for the delete operation to complete

        return jsonify({"success": True})

    except Exception as e:
        logging.exception(f"Error occurred while deleting Resource Group: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/subscriptions/<subscription_id>/enable_diagnostics", methods=["POST"])
def enable_diagnostics(subscription_id):
    try:
        # Get the payload from request
        payload = request.get_json()
        workspace_id = payload.get("workspaceId")

        # Check if workspace_id is not present
        if not workspace_id:
            return (
                jsonify({"success": False, "error": "Workspace ID is required."}),
                400,
            )

        # Get the log categories from the payload, or default to all categories
        log_categories = payload.get("logCategories", [
            "Administrative",
            "Security",
            "ServiceHealth",
            "Alert",
            "Recommendation",
            "Policy",
            "Autoscale",
            "ResourceHealth"
        ])

        # Use Azure Default Credentials to authenticate with Azure
        credential = DefaultAzureCredential()

        # Instantiate Monitor Management Client
        monitor_client = MonitorManagementClient(credential, subscription_id)

        # Define a retention policy of 30 days
        retention_policy = RetentionPolicy(enabled=True, days=30)

        # Define the diagnostic settings
        diagnostic_settings = DiagnosticSettingsResource(
            workspace_id=workspace_id,
            logs=[
                LogSettings(category=category, enabled=True, retention_policy=retention_policy)
                for category in log_categories
            ],
            metrics=[
                MetricSettings(time_grain=None, category=None, enabled=True, retention_policy=retention_policy),
            ],
        )

        resource_uri = f"/subscriptions/{subscription_id}"

        # Create or update the diagnostic settings
        diagnostic_settings_resource = (
            monitor_client.diagnostic_settings.create_or_update(
                resource_uri=resource_uri,
                name="aztrckr-diagnostic-settings",
                parameters=diagnostic_settings,
            )
        )

        return jsonify({"success": True})
    except ConnectionError:
        # Log the error and return a message to the client
        logging.exception("Unable to connect to Azure")
        return jsonify({"success": False, "error": "Unable to connect to Azure. Please check your network connection."}), 503
    except Exception as e:
        # Log the error and return a message to the client
        logging.exception("Error occurred while enabling diagnostics")
        return jsonify({"success": False, "error": "Failed to enable diagnostics. If the issue persists, you may need to enable the Operational Insights Provider. Error details: " + str(e)}), 500    
# Get diagnostics settings for a subscription
@app.route("/subscriptions/<subscription_id>/diagnostics-settings", methods=["GET"])
def get_diagnostics_settings(subscription_id):
    try:
        # Use Azure Default Credentials to authenticate with Azure
        credential = DefaultAzureCredential()

        # Instantiate Monitor Management Client
        monitor_client = MonitorManagementClient(credential, subscription_id)

        # Instantiate Resource Management Client
        resource_client = ResourceManagementClient(credential, subscription_id)

        # Instantiate Log Analytics Management Client
        loganalytics_client = LogAnalyticsManagementClient(credential, subscription_id)

        # Get diagnostic settings
        resource_uri = f"/subscriptions/{subscription_id}"
        diagnostic_settings = monitor_client.diagnostic_settings.list(resource_uri)

        matching_workspaces = []

        # Check if there are any diagnostic settings
        for setting in diagnostic_settings:
            # Check if there's at least one that has a workspace id
            if setting.workspace_id:
                # Extract the resource group name and workspace name from the workspace id
                workspace_resource_group = setting.workspace_id.split("/")[4]
                workspace_name = setting.workspace_id.split("/")[-1]

                # Get the resource group details
                resource_group = resource_client.resource_groups.get(workspace_resource_group)

                # Check if the 'AZTrckr' tag is present and set to 'true'
                if resource_group.tags and resource_group.tags.get('AZTrckr') == 'true':
                    # Get the workspace details
                    workspace = loganalytics_client.workspaces.get(resource_group.name, workspace_name)
                    # Determine if the diagnostic setting is enabled
                    enabled = getattr(setting, 'enabled', True)
                    # Append the diagnostic settings with the workspace name and enabled status
                    matching_workspaces.append({
                        "name": setting.name,
                        "workspaceName": workspace.name,
                        "enabled": enabled
                    })
                else:
                    logging.warning("Diagnostic setting '%s' is skipped because the 'AZTrckr' tag is not set to 'true' in the associated resource group '%s'.", setting.name, resource_group.name)
            else:
                logging.warning("Diagnostic setting '%s' is skipped because it does not have a workspace id.", setting.name)

        # Return all matching workspaces
        return jsonify({"success": True, "diagnosticsEnabled": bool(matching_workspaces), "settings": matching_workspaces})

    except Exception as e:
        logging.exception("An error occurred while retrieving diagnostics settings.")
        return jsonify({"success": False, "error": str(e)})
            
# Get Log Analytics Workspaces for a subscription
@app.route("/subscriptions/<subscription_id>/log-analytics-workspaces", methods=["GET"])
def get_log_analytics_workspaces(subscription_id):
    try:
        credential = DefaultAzureCredential()
        resource_client = ResourceManagementClient(credential, subscription_id)
        log_analytics_client = LogAnalyticsManagementClient(credential, subscription_id)
        
        resource_groups = resource_client.resource_groups.list()
        workspace_list = []

        for resource_group in resource_groups:
            # Check if the 'AZTrckr' tag is present and set to 'true'
            if resource_group.tags and resource_group.tags.get('AZTrckr') == 'true':
                workspaces = log_analytics_client.workspaces.list_by_resource_group(resource_group.name)
                for workspace in workspaces:
                    workspace_list.append({"id": workspace.id, "name": workspace.name})
            else:
                logging.warning("Resource group '%s' is skipped because the 'AZTrckr' tag is not set to 'true'.", resource_group.name)

        return jsonify(workspace_list)
    except Exception as e:
        logging.exception("Error occurred while getting Log Analytics Workspaces")
        return jsonify({"error": str(e)}), 500

# Create a Log Analytics Workspace for a subscription
@app.route("/subscriptions/<subscription_id>/create-law", methods=["POST"])
def create_log_analytics_workspace(subscription_id):
    try:
        payload = request.get_json()
        resource_group = payload.get("resourceGroup")
        workspace_name = payload.get("workspaceName")
        location = payload.get("location")

        if not resource_group or not workspace_name or not location:
            return (
                jsonify({"success": False, "error": "Resource Group, Workspace Name, and Location are required."}),
                400,
            )

        credential = DefaultAzureCredential()
        log_analytics_client = LogAnalyticsManagementClient(credential, subscription_id)

        workspace = Workspace(location=location)
        workspace_creation = log_analytics_client.workspaces.begin_create_or_update(
            resource_group,
            workspace_name,
            workspace,
        )

        workspace_creation.wait()  # Wait for the creation operation to complete
        workspace_result = workspace_creation.result()  # Get the result of the operation

        return jsonify({"success": True, "workspaceId": workspace_result.id})

    except Exception as e:
        logging.exception(f"Error occurred while creating Log Analytics Workspace: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()

@app.route("/subscriptions/<subscription_id>/log-analytics-workspaces/<workspace_id>/", methods=["POST"])
def execute_log_analytics_query(subscription_id, workspace_id):
    try:
        payload = request.get_json()
        query = payload.get("query")
        
        if not query:
            return (
                jsonify({"success": False, "error": "KQL query is required."}),
                400,
            )
        
        credential = DefaultAzureCredential()
        
        # Create a client to execute KQL queries
        client = LogAnalyticsDataClient(credential)
        
        # Execute the query
        response = client.query(workspace_id, QueryBody(query=query))

        # Parsing the response to a more friendly format can be added here
        return jsonify({"success": True, "data": response.as_dict()})
        
    except Exception as e:
        logging.exception(f"Error occurred while executing Log Analytics query: {str(e)}")
        return jsonify({"error": str(e)}), 500