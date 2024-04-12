import React, { useState, useEffect } from "react";
import LAWCreate from "./LAWCreate";
import CreateResourceGroup from "./CreateResourceGroup";
// import OnDeleteResourceGroup from "./DeleteResourceGroup";
import styled from 'styled-components';
import { StyledDiv, StyledButton, StyledSelect, StyledSection, StyledH2, StyledH3, StyledP, Strong, StyledLabel, StyledMessage, InfoBlurb } from './styledComponents';

// Start of SubscriptionDetails component
const SubscriptionDetails = ({ subscription, onMessage }) => {
  // State variables
  const [totalResources, setTotalResources] = useState(null); // Stores the total number of resources
  const [resourceGroups, setResourceGroups] = useState([]); // Stores the list of resource groups
  const [locations, setLocations] = useState([]); // Stores the list of locations
  const [message, setMessage] = useState(""); // Stores the message to be displayed
  const [logAnalyticsWorkspaces, setLogAnalyticsWorkspaces] = useState([]); // Stores the list of Log Analytics Workspaces
  const [selectedLAW, setSelectedLAW] = useState(""); // Stores the selected Log Analytics Workspace
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false); // Stores whether diagnostics are enabled
  const [selectedResourceGroup, setSelectedResourceGroup] = useState(""); // Stores the selected resource group
  const [lawQuery, setLawQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [diagnosticsSettings, setDiagnosticsSettings] = useState([]); // Stores the diagnostics settings
  const [logCategories, setLogCategories] = useState([
    { name: "Administrative", checked: false },
    { name: "Security", checked: false },
    { name: "ServiceHealth", checked: false },
    { name: "Alert", checked: false },
    { name: "Recommendation", checked: false },
    { name: "Policy", checked: false },
    { name: "Autoscale", checked: false },
    { name: "ResourceHealth", checked: false },
  ]);

  const [currentDiagnostics, setCurrentDiagnostics] = useState([]);


  // state variable for storing the last 3 events
  const [notificationEvents, setNotificationEvents] = useState([]);

  // Function to display a message and clear it after 10 seconds


  useEffect(() => {
    // Fetch data when the subscription changes
    if (subscription) {
      // fetchStorageAccounts();
      fetchTotalResources();
      fetchResourceGroups();
      fetchLocations();
      fetchLogAnalyticsWorkspaces();
    } else {
      setTotalResources(null);
    }
  }, [subscription]);

  // Fetches the total number of resources in the subscription
  const fetchTotalResources = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions`
    );
    const data = await response.json();
    const subscriptionData = data.find(
      (sub) => sub.subscriptionId === subscription.subscriptionId
    );
    setTotalResources(subscriptionData.resourceCount);
  };

  // Function to log user interactions

  // Fetches the list of resource groups in the subscription that are managed by AZTrckr
  const fetchResourceGroups = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/resource_groups?tag=AZTrckr`
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      setResourceGroups(data);
    } else {
      console.log(data.message);
      setResourceGroups([]); // set to empty array if data is not an array
    }
  };

  // Fetches the list of locations in the subscription
  const fetchLocations = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/locations?subscription_id=${subscription.subscriptionId}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setLocations(data);
      } else {
        console.error("Data received is not an array:", data);
        setLocations([]); // Set locations to an empty array in case of invalid data
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]); // Set locations to an empty array in case of an error
    }
  };

  // Fetches log analytics workspaces associated with the subscription
  const fetchLogAnalyticsWorkspaces = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/log-analytics-workspaces`
    );
    const data = await response.json();
    setLogAnalyticsWorkspaces(data);
  };

  // Handles the change event of the Log Analytics Workspace dropdown
  const handleLAWChange = (event) => {
    setSelectedLAW(event.target.value);
  };

  // Function to fetch and set current diagnostics settings
  const fetchCurrentDiagnosticsSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/current_diagnostics_settings`);
      const data = await response.json();
      if (data.success) {
        // Transform and store the fetched settings for rendering
        setCurrentDiagnostics(Object.entries(data.settings).map(([key, value]) => ({ name: key, enabled: value })));
      } else {
        console.error("Failed to fetch diagnostics settings:", data.message);
      }
    } catch (error) {
      console.error("Error fetching current diagnostics settings:", error);
    }
  };  // Modify the checkbox handling function to update the checked state of the relevant category
  const handleLogCategoryChange = (event) => {
    const { name, checked } = event.target;
    setLogCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.name === name ? { ...category, checked } : category
      )
    );
  };


  // Enable diagnostics for the selected Log Analytics Workspace

  // Add a function to handle the querying
  const handleQueryLAW = async () => {
    // Assuming you also have workspaceId in your subscription object.
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/log-analytics-workspaces/${subscription.workspaceId}/query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: lawQuery }),
      }
    ); const data = await response.json();
    setQueryResults(data.data);
  };

  // Function to delete a resource group to be called when the user clicks the Delete Resource Group button
  const deleteResourceGroup = async (resourceGroupName) => {
    setIsDeleting(true);
    setDeleteMessage(''); // Clear the message at the start

    try {
      onMessage && onMessage("Deleting resource group...");
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/resource-groups/${resourceGroupName}`,
        { method: "DELETE" }
      );

      setIsDeleting(false); // Update deletion status regardless of the outcome

      if (response.status === 202) {
        setDeleteMessage("Resource group deletion initiated. Please wait...");
      } else if (response.status === 200) {
        setDeleteMessage("Resource group deleted successfully.");
      } else {
        const data = await response.json();
        setDeleteMessage(`Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error("Error deleting Resource Group:", error);
      setDeleteMessage("An error occurred while deleting the Resource Group.");
      setIsDeleting(false);
    }
  };


  const StyledInput = styled.input`
  /* Add your input styles here */
  padding: 0.5rem;
`;
  // Function to fetch and set current diagnostics settings
  const applyDiagnosticSettings = async () => {
    if (!selectedLAW) {
      onMessage("Please select a Log Analytics Workspace.");
      return;
    }

    const selectedCategories = logCategories
      .filter(category => category.checked)
      .map(category => category.name);

    if (selectedCategories.length === 0) {
      onMessage("Please select at least one category to log.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/enable_diagnostics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: selectedLAW,
            logCategories: selectedCategories,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onMessage("Diagnostics settings updated successfully.");
        fetchCurrentDiagnosticsSettings(); // Fetch the current diagnostics settings again to reflect the changes
      } else {
        onMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      onMessage("An error occurred while updating diagnostics settings.");
    }
  };



  if (!subscription) {
    return <p>Welcome to AzTrckr. Please select a subscription to get started</p>;
  }

  return (
    <StyledDiv>
      {/* Subscription Information */}
      <StyledSection>
        <StyledH2>{subscription.displayName}</StyledH2>
        <StyledP><Strong>ID:</Strong> {subscription.subscriptionId}</StyledP>
        <StyledP><Strong>Display Name:</Strong> {subscription.displayName}</StyledP>
        <StyledP><Strong>Total Resources:</Strong> {totalResources}</StyledP>

        {/* Diagnostic Settings for current subscription */}
        {diagnosticsEnabled && diagnosticsSettings.length > 0 && (
          <StyledSection>
            <StyledH3>Diagnostic Settings for {subscription.displayName}</StyledH3>
            {diagnosticsSettings.map((setting, index) => (
              <StyledP key={index}>
                <Strong>Diagnostic setting name:</Strong> {setting.name}
                <InfoBlurb>This does not change</InfoBlurb><br />
                <Strong>Log Analytics Workspace:</Strong> {setting.workspaceName}
              </StyledP>
            ))}
          </StyledSection>
        )}    </StyledSection>
      {/* Notification Events */}
      <StyledSection>
        <StyledH3>Notification Events</StyledH3>
        <StyledP><Strong>Notification Events:</Strong> {notificationEvents.length}</StyledP>
        <ul>
          {notificationEvents.map((event, index) => <li key={index}>{event}</li>)}
        </ul>
      </StyledSection>

      {/* Resource Group Management */}
      <CreateResourceGroup subscriptionId={subscription.subscriptionId} onMessage={onMessage} locations={locations} />

      {/* Delete Resource Group */}
      <StyledSection>
        <StyledH3>Delete AzTrckr Resource Group</StyledH3>
        <StyledSelect id="resourceGroupDeleteSelect" value={selectedResourceGroup} onChange={(e) => setSelectedResourceGroup(e.target.value)} disabled={isDeleting}>
          <option value="">-- Select a resource group --</option>
          {resourceGroups.map(group => <option key={group.name} value={group.name}>{group.name}</option>)}
        </StyledSelect><br />
        <StyledButton onClick={() => deleteResourceGroup(selectedResourceGroup)} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</StyledButton>
        {deleteMessage && <StyledMessage>{deleteMessage}</StyledMessage>}
      </StyledSection>

      {/* Create Log Analytics Workspace */}
      <StyledH3>Create Log Analytics Workspace</StyledH3>
      <LAWCreate subscriptionId={subscription.subscriptionId} resourceGroups={resourceGroups} locations={locations} onMessage={onMessage} />
      {message && <StyledMessage>{message}</StyledMessage>}

      {/* Log Analytics Workspace Selection */}
      <StyledSection>
        <StyledH3>Select Log Analytics Workspace</StyledH3>
        <StyledSelect id="lawSelect" value={selectedLAW} onChange={handleLAWChange}>
          <option value="">-- Select a workspace --</option>
          {logAnalyticsWorkspaces.map(workspace => (
            <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
          ))}
        </StyledSelect>
      </StyledSection>

      {selectedLAW && (
        <>
          {/* Select Categories to Log */}
          <StyledSection>
            <StyledH3>Select Categories to Log</StyledH3>
            {logCategories.map((category, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`log-category-${index}`}
                  name={category.name}
                  checked={category.checked}
                  onChange={handleLogCategoryChange}
                />
                <label htmlFor={`log-category-${index}`}>{category.name}</label>
              </div>
            ))}
            <StyledButton onClick={applyDiagnosticSettings}>Apply Diagnostic Settings</StyledButton>
          </StyledSection>

          {/* Section to display current diagnostic settings */}
          {currentDiagnostics.length > 0 && (
            <StyledSection>
              <StyledH3>Current Diagnostic Settings</StyledH3>
              <ul>
                {currentDiagnostics.map((setting, index) => (
                  <li key={index}>
                    {setting.name}: {setting.enabled ? "Enabled" : "Disabled"}
                  </li>
                ))}
              </ul>
            </StyledSection>
          )}


          {/* Query Log Analytics Workspace */}
          <StyledSection>
            <StyledH3>Query Log Analytics Workspace</StyledH3>
            <StyledInput type="text" value={lawQuery} onChange={(e) => setLawQuery(e.target.value)} placeholder="Enter KQL Query Here" /><br />
            <StyledButton onClick={handleQueryLAW}>Run Query</StyledButton>
            {queryResults && <pre>{JSON.stringify(queryResults, null, 2)}</pre>}
          </StyledSection>
        </>
      )}
    </StyledDiv>
  );
};

export default SubscriptionDetails;
