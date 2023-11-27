const BASE_URL = process.env.REACT_APP_FLASK_API_BASE_URL;

export async function fetchLocations(subscriptionId) {
  const response = await fetch(`${BASE_URL}/locations?subscription_id=${subscriptionId}`);
  return response.json();
}

export async function fetchLogAnalyticsWorkspaces(subscriptionId) {
  const response = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}/log-analytics-workspaces`);
  return response.json();
}

export async function fetchDiagnosticsSettings(subscriptionId) {
  const response = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}/diagnostics-settings`);
  return response.json();
}

export async function enableDiagnostics(subscriptionId, workspaceId, logCategories) {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/enable_diagnostics`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, logCategories }),
    }
  );
  return response.json();
}

export async function createResourceGroup(subscriptionId, resourceGroupName, location) {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/create-resource-group`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceGroupName, location }),
    }
  );
  return response.json();
}

export async function OnDeleteResourceGroup(subscriptionId, resourceGroupName) {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/resource-groups/${resourceGroupName}`,
    {
      method: "DELETE",
    }
  );
  return response.json();
}
