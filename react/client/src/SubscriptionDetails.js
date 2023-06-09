import React, { useState, useEffect } from "react";
import LAWCreate from "./LAWCreate";
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
  // Function to display a message and clear it after 10 seconds
  const displayMessage = (newMessage) => {
    setMessage(newMessage);
    setTimeout(() => {
      setMessage("");
    }, 10000); // The message will disappear after 10 seconds
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
  // Function to create a resource group to be called when the user clicks the Create Resource Group button
  const createResourceGroup = async () => {
    try {
      // Get the resource group name and location from user input
      const resourceGroupName = document.getElementById("resourceGroupNameInput").value;
      const location = document.getElementById("locationSelect").value;

      if (!resourceGroupName || !location) {
        onMessage && onMessage("Resource Group Name and Location are required.");
        return;
      }

      // Call the API to create the resource group
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/create-resource-group`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceGroupName, location }),
        }
      );
      // Parse the response
      const data = await response.json();
      if (data.success) {
        onMessage && onMessage("Resource Group created successfully.");
        // Additional logic or state updates after successful resource group creation
      } else {
        onMessage && onMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating Resource Group:", error);
      onMessage && onMessage("An error occurred while creating the Resource Group.");
    }
  };
  // Styled components for the input and button
  const StyledInput = styled.input`
  /* Add your input styles here */
`;

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

      {/* Create Resource Group */}
      <StyledSection>
        <StyledH3>Create AzTrckr Resource Group</StyledH3>
        <div>
          <StyledInput type="text" id="resourceGroupNameInput" placeholder="aztrckr-rg-01" />
        </div>
        <div>
          <br />
          <StyledSelect id="locationSelect">
            <option value="">-- Select a location --</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </StyledSelect>
        </div>
        <StyledButton onClick={createResourceGroup}>Create</StyledButton>
      </StyledSection>

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
    </StyledDiv>
  );
}
export default SubscriptionDetails;

