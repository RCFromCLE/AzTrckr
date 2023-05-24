1.  Get Subscriptions

    -   Description: Retrieves a list of Azure subscriptions for the currently logged in user.
    -   Method: GET
    -   URL: `/subscriptions`

2.  Enable Diagnostics for a Subscription

    -   Description: Enables diagnostics settings for a given Azure subscription.
    -   Method: POST
    -   URL: `/subscriptions/<subscription_id>/enable-diagnostics`
    -   Path Parameters:
        -   `subscription_id` (required): The ID of the Azure subscription.
    -   Payload: JSON object with the following property:
        -   `storageAccountId` (required): The ID of the storage account to be used for storing diagnostic logs.

3.  Get Storage Accounts for a Subscription

    -   Description: Retrieves a list of storage accounts for a given Azure subscription.
    -   Method: GET
    -   URL: `/subscriptions/<subscription_id>/storage_accounts`
    -   Path Parameters:
        -   `subscription_id` (required): The ID of the Azure subscription.
        
4.  Create a Log Analytics Workspace for a Subscription

    -   Description: Creates a Log Analytics Workspace for a given Azure subscription.
    -   Method: POST
    -   URL: `/subscriptions/<subscription_id>/create-workspace`
    -   Path Parameters:
        -   `subscription_id` (required): The ID of the Azure subscription.
    -   Payload: JSON object with the following properties:
        -   `resourceGroup` (required): The name of the resource group where the workspace should be created.
        -   `workspaceName` (required): The name of the Log Analytics Workspace.
        -   `location` (required): The Azure region where the workspace should be created (e.g., "East US").

License
-------