import React, { useState, useEffect } from "react";
import LAWCreate from "./LAWCreate";
import CreateResourceGroup from "./CreateResourceGroup";
// import OnDeleteResourceGroup from "./DeleteResourceGroup";
import styled from 'styled-components';
import { StyledDiv, StyledButton, StyledSelect, StyledSection, StyledH2, StyledH3, StyledP, Strong, StyledLabel, StyledMessage } from './styledComponents';

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
  const [diagnosticsMessage, setDiagnosticsMessage] = useState(""); // Stores the diagnostics message
  const [selectedResourceGroup, setSelectedResourceGroup] = useState(""); // Stores the selected resource group
  const [lawQuery, setLawQuery] = useState('');

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

  // state variable for storing the last 3 events
  const [notificationEvents, setNotificationEvents] = useState([]);
  
  // Function to display a message and clear it after 10 seconds
  const displayMessage = (newMessage) => {
    setMessage(newMessage);
    setTimeout(() => {
      setMessage("");
    }, 15000); // The message will disappear after 15 seconds
  };

  
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
  const logUserInteraction = (interaction) => {
    console.log(`User interaction: ${interaction}`);
    
    // Update notificationEvents with the latest event
    setNotificationEvents((prevEvents) => {
      // Keep the last three events and discard the rest
      const newEvents = [...prevEvents, interaction].slice(-3);
      return newEvents;
    });
  };

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
  
  // Fetch current diagnostics settings status when subscription changes
  useEffect(() => {
    const fetchDiagnosticsSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/diagnostics-settings`
        );
        const data = await response.json();
        if (data.success) {
          setDiagnosticsEnabled(data.diagnosticsEnabled);
          setDiagnosticsSettings(data.settings.map((setting) => ({
            name: setting.name,
            workspaceName: setting.workspaceName,
            enabled: setting.enabled
          })));
        } else {
          onMessage && onMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error fetching diagnostics settings:", error);
        onMessage && onMessage("An error occurred while fetching diagnostics settings.");
      }
    };

    if (subscription) {
      fetchDiagnosticsSettings();
    }
  }, [subscription]);

  // Modify the checkbox handling function to update the checked state of the relevant category
  const handleLogCategoryChange = (event) => {
    const { name, checked } = event.target;
    setLogCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.name === name ? { ...category, checked } : category
      )
    );
  };

  const selectedCategories = logCategories.filter((category) => category.checked).map((category) => category.name);

  // Enable diagnostics for the selected Log Analytics Workspace
  const enableDiagnosticsForLAW = async () => {
    const LAW = logAnalyticsWorkspaces.find((law) => law.id === selectedLAW);
    const currentSettings = diagnosticsSettings.find((setting) => setting.workspaceName === LAW.name);
    if (LAW && currentSettings && currentSettings.enabled) {
      onMessage && onMessage("Diagnostics are already enabled for this Log Analytics Workspace.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/enable_diagnostics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId: selectedLAW, logCategories: selectedCategories }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Enable Diagnostics Response:', data); // Log the response for debugging
        if (data.success) {
          onMessage && onMessage("Diagnostics enabled successfully for the Log Analytics Workspace.");
          fetchLogAnalyticsWorkspaces();
        } else {
          onMessage && onMessage(`Error: ${data.error}`);
        }
      } else if (response.status === 401) {
        onMessage && onMessage(`Error: Authentication failed. Please check your Azure credentials.`);
      } else if (response.status === 503) {
        onMessage && onMessage(`Error: Unable to connect to Azure. Please check your network connection.`);
      } else if (response.status === 500) {
        onMessage && onMessage(`Error: Failed to enable diagnostics. You may need to enable the Operational Insights Provider.`);
      } else {
        onMessage && onMessage(`Error: Unexpected error occurred.`);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

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
    );  const data = await response.json();
  setQueryResults(data.data);
};

  // Function to delete a resource group to be called when the user clicks the Delete Resource Group button
  const deleteResourceGroup = async (resourceGroupName) => {
    try {
      // Update UI to indicate deletion in progress
      onMessage && onMessage("Deleting resource group...");

      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/resource-groups/${resourceGroupName}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 202) {
        // Resource group deletion initiated
        onMessage && onMessage("Resource group deletion initiated. Please wait...");
      } else if (response.status === 200) {
        // Resource group deleted successfully
        onMessage && onMessage("Resource group deleted successfully.");
        // Additional logic or state updates after successful resource group deletion
      } else {
        // Handle other response statuses
        const data = await response.json();
        onMessage && onMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting Resource Group:", error);
      onMessage && onMessage("An error occurred while deleting the Resource Group.");
    }
  };


const StyledInput = styled.input`
  /* Add your input styles here */
`;


  if (!subscription) {
    return <p>Welcome to AzTrckr. Please select a subscription to get started</p>;
  }
  return (
    <StyledDiv>
      {/* Subscription Information */}
      <StyledSection>
        <StyledH2>{subscription.displayName}</StyledH2>
        <StyledP>
          <Strong>ID:</Strong> {subscription.subscriptionId}
        </StyledP>
        <StyledP>
          <Strong>Display Name:</Strong> {subscription.displayName}
        </StyledP>
        {subscription && <StyledP><Strong>Total Resources:</Strong> {totalResources}</StyledP>}
      </StyledSection>

<StyledSection>
  <StyledH3>Notification Events</StyledH3>
  <StyledP>
    <Strong>Notification Events:</Strong> {notificationEvents.length}
  </StyledP>
  <StyledP>
    <Strong>Last 3 Events:</Strong>
    <ul>
      {notificationEvents.map((event, index) => (
        <li key={index}>{event}</li>
      ))}
    </ul>
  </StyledP>
</StyledSection>

{/* Use the CreateResourceGroup component */}
<CreateResourceGroup
  subscriptionId={subscription.subscriptionId} // Pass only the subscription ID
  onMessage={displayMessage}
  locations={locations}
/>
 {/* Delete AZTrckr Resource Group */}
 <StyledSection>
        <StyledH3>Delete AzTrckr Resource Group</StyledH3>
        <div>
          <StyledLabel htmlFor="resourceGroupDeleteSelect"></StyledLabel>
          <StyledSelect id="resourceGroupDeleteSelect" value={selectedResourceGroup} onChange={(e) => setSelectedResourceGroup(e.target.value)}>
            <option value="">-- Select a resource group --</option>
            {resourceGroups.map((group) => (
              <option key={group.name} value={group.name}>
                {group.name}
              </option>
            ))}
          </StyledSelect>
        </div>
        <StyledButton onClick={() => deleteResourceGroup(selectedResourceGroup)}>Delete</StyledButton>
      </StyledSection>
{/* Logging Categories */}
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

      </StyledSection>
      {diagnosticsEnabled && diagnosticsSettings.length > 0 ? (
        <div>
          {diagnosticsSettings.map((setting, index) => (
            <StyledP key={index}>
              Diagnostic Setting: <Strong>{setting.name}</Strong> <br />
              Log Analytics Workspace: <Strong>{setting.workspaceName}</Strong> <br />
            </StyledP>
          ))}
        </div>
      ) : (
        <StyledP>No log analytics workspaces found. Create one below to enable activity logs.</StyledP>
      )}

      {logAnalyticsWorkspaces && logAnalyticsWorkspaces.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StyledSelect id="lawSelect" value={selectedLAW} onChange={handleLAWChange}>
              <option value="">-- Select a workspace --</option>
              {logAnalyticsWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </StyledSelect>
            <StyledButton
              onClick={enableDiagnosticsForLAW}
              disabled={
                !selectedLAW ||
                (logAnalyticsWorkspaces.find((law) => law.id === selectedLAW) &&
                  logAnalyticsWorkspaces.find((law) => law.id === selectedLAW).diagnosticsEnabled)
              }
            >
              Enable
            </StyledButton>
          </div>
          {diagnosticsMessage && <StyledP>{diagnosticsMessage}</StyledP>}
        </div>
      )}

      {/* Create Log Analytics Workspace */}
      <StyledSection>
        <StyledH3>Create Log Analytics Workspace</StyledH3>
        <LAWCreate
          subscriptionId={subscription.subscriptionId}
          resourceGroups={resourceGroups}
          locations={locations}
          onMessage={displayMessage}
        />
        {message && <StyledMessage>{message}</StyledMessage>}
      </StyledSection>
      <StyledSection>
        <StyledH3>Select Log Analytics Workspace</StyledH3>
        <StyledSelect onChange={(e) => setSelectedLAW(e.target.value)}>
          <option value="">Select a workspace...</option>
          {logAnalyticsWorkspaces.map(workspace => (
            <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
          ))}
        </StyledSelect>

        <StyledH3>Query Log Analytics Workspace</StyledH3>
        <div>
          <StyledInput
            type="text"
            value={lawQuery}
            onChange={(e) => setLawQuery(e.target.value)}
            placeholder="Enter KQL Query Here"
          />
        </div>
        <StyledButton onClick={handleQueryLAW}>Run Query</StyledButton>

        {queryResults && (
          <div>
            <pre>{JSON.stringify(queryResults, null, 2)}</pre>
          </div>
        )}
      </StyledSection>
    </StyledDiv>
  );
}

export default SubscriptionDetails;