from flask import Flask, request
from azure.mgmt.subscription import SubscriptionClient
from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.mgmt.loganalytics import LogAnalyticsManagementClient
from flask import jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.monitor.models import (
    DiagnosticSettingsResource,
    RetentionPolicy,
    LogSettings,
    MetricSettings,
)
import logging


app = Flask(__name__)
CORS(app)

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


# Enable diagnostics for a subscription
@app.route("/subscriptions/<subscription_id>/enable-diagnostics", methods=["POST"])
def enable_diagnostics(subscription_id):
    try:
        payload = request.get_json()
        storage_account_id = payload.get("storageAccountId")

        if not storage_account_id:
            return (
                jsonify({"success": False, "error": "Storage Account ID is required."}),
                400,
            )

        credential = DefaultAzureCredential()
        monitor_client = MonitorManagementClient(credential, subscription_id)

        retention_policy = RetentionPolicy(enabled=True, days=7)

        diagnostic_settings = DiagnosticSettingsResource(
            storage_account_id=storage_account_id,
            logs=[
                LogSettings(
                    category="Administrative",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="Security",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="ServiceHealth",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="Alert",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="Recommendation",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="Policy",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="Autoscale",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
                LogSettings(
                    category="ResourceHealth",
                    enabled=True,
                    retention_policy=retention_policy,
                ),
            ],
            metrics=[
                MetricSettings(
                    time_grain=None,
                    category=None,
                    enabled=True,
                    retention_policy=retention_policy,
                )
            ],
        )

        diagnostic_settings_resource = (
            monitor_client.diagnostic_settings.create_or_update(
                resource_uri=f"/subscriptions/{subscription_id}",
                name="diagnostic-settings",
                parameters=diagnostic_settings,
            )
        )

        return jsonify({"success": True})
    except Exception as e:
        logging.exception("Error occurred while enabling diagnostics")
        return jsonify({"error": str(e)}), 500


# Get storage accounts for a subscription
@app.route("/subscriptions/<subscription_id>/storage_accounts", methods=["GET"])
def get_storage_accounts(subscription_id):
    try:
        credential = DefaultAzureCredential()
        storage_client = StorageManagementClient(credential, subscription_id)
        storage_accounts = storage_client.storage_accounts.list()

        storage_account_list = []

        for account in storage_accounts:
            storage_account_list.append({"id": account.id, "name": account.name})

        return jsonify(storage_account_list)
    except Exception as e:
        logging.exception("Error occurred while getting storage accounts")
        return jsonify({"error": str(e)}), 500

# Create a Log Analytics Workspace for a subscription
@app.route("/subscriptions/<subscription_id>/create-workspace", methods=["POST"])
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
        workspace_creation = log_analytics_client.workspaces.create_or_update(
            resource_group,
            workspace_name,
            workspace,
        )

        return jsonify({"success": True, "workspaceId": workspace_creation.id})
    except Exception as e:
        logging.exception("Error occurred while creating Log Analytics Workspace")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()
