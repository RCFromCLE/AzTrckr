import React, { useState, useEffect } from "react";
import LAWCreate from "./LAWCreate";
import styled from 'styled-components';

// StyledDiv component represents a styled div container
const StyledDiv = styled.div`
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  font-family: Arial, sans-serif;
  padding: 20px;
`;

// StyledButton component represents a styled button
const StyledButton = styled.button`
  background-color: ${props => props.theme.toggleBorder};
  color: ${props => props.theme.text};
  border: none;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.theme.gradientEnd}; // This color is used in LAWCreate.js hover effect
  }

  &:disabled {
    color: ${props => props.theme.disabledColor}; // Replace with the actual color for disabled button text
    cursor: not-allowed;
  }
`;



// StyledSelect component represents a styled select dropdown
const StyledSelect = styled.select`
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.toggleBorder};
  border: none;
  margin-left: 10px;
`;

const StyledSection = styled.section`
  margin: 20px 0;
  padding: 5px;
  color: ${props => props.theme.text};
`;

const StyledH2 = styled.h2`
  margin-bottom: 10px;
  margin: 5px;
  padding: 5px;

`;

const StyledH3 = styled.h3`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const StyledP = styled.p`
  margin-bottom: 10px;
`;

const Strong = styled.strong`
  font-weight: bold;
`;

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const StyledMessage = styled.p`
  margin-top: 10px;
  padding: 5px;
`;

// SubscriptionDetails component displays the details of a subscription
const SubscriptionDetails = ({ subscription, onMessage }) => {
  // State variables
  // const [storageAccounts, setStorageAccounts] = useState([]); // Stores the list of storage accounts
  // const [selectedStorageAccount, setSelectedStorageAccount] = useState(""); // Stores the selected storage account
  const [totalResources, setTotalResources] = useState(null); // Stores the total number of resources
  const [resourceGroups, setResourceGroups] = useState([]); // Stores the list of resource groups
  const [locations, setLocations] = useState([]); // Stores the list of locations
  const [message, setMessage] = useState(""); // Stores the message to be displayed
  const [logAnalyticsWorkspaces, setLogAnalyticsWorkspaces] = useState([]); // Stores the list of Log Analytics Workspaces
  const [selectedLAW, setSelectedLAW] = useState(""); // Stores the selected Log Analytics Workspace

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

// Fetches storage accounts associated with the subscription
// const fetchStorageAccounts = async () => {
//   const response = await fetch(
//     `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/storage_accounts`
//   );
//   const data = await response.json();
//   const storageAccountsData = data.map((account) => {
//     const diagnosticsEnabled = subscription.activityLogsEnabled;
//     return { ...account, diagnosticsEnabled };
//   });
//   setStorageAccounts(storageAccountsData);
// };

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

// // Handles the change event of the storage account dropdown
// const handleStorageAccountChange = (event) => {
//   setSelectedStorageAccount(event.target.value);
// };

// // Enables diagnostics for the selected storage account
// const enableDiagnostics = async () => {
//   if (!selectedStorageAccount) {
//     onMessage && onMessage("Please select a storage account."); // Display an error message if no storage account is selected
//     return;
//   }

//   const storageAccount = storageAccounts.find(sa => sa.id === selectedStorageAccount);
//   if (storageAccount && storageAccount.diagnosticsEnabled) {
//     onMessage && onMessage("Diagnostics are already enabled for this storage account."); // Display a message if diagnostics are already enabled
//     return;
//   }

//   const response = await fetch(
//     `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/enable-diagnostics`, // Make a request to enable diagnostics for the selected storage account
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ storageAccountId: selectedStorageAccount }), // Send the selected storage account ID in the request body
//     }
//   );

//   const data = await response.json();
//   if (data.success) {
//     onMessage && onMessage("Diagnostics enabled successfully."); // Display a success message if diagnostics are enabled successfully
//   } else {
//     onMessage && onMessage(`Error: ${data.error}`); // Display an error message if there's an error enabling diagnostics
//   }
// };

  const fetchResourceGroups = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/resource_groups`
    );
    const data = await response.json();
    setResourceGroups(data);
  };

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

// You will need these two state variables to store the diagnostics settings
const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false);
const [diagnosticsDestination, setDiagnosticsDestination] = useState("");
const [diagnosticsMessage, setDiagnosticsMessage] = useState("");

// Extracts the LAW name from the resource URI
const extractLAWName = (resourceUri) => {
  if (!resourceUri) return '';
  const parts = resourceUri.split('/');
  if (parts.length > 8) {
    return parts[8];
  }
  return '';
};

// Fetch current diagnostics settings status when subscription changes
useEffect(() => {
  const fetchDiagnosticsSettings = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/diagnostics-settings`
    );
    const data = await response.json();
    if (data.success) {
      setDiagnosticsEnabled(data.diagnosticsEnabled);
      setDiagnosticsDestination(data.destination);
    } else {
      onMessage && onMessage(`Error: ${data.error}`);
    }
  };
  if (subscription) {  // only fetch diagnostics settings if subscription exists
    fetchDiagnosticsSettings();
  }
}, [subscription]);  // depends on subscription

// Enables diagnostics for the selected Log Analytics Workspace
const enableDiagnosticsForLAW = async () => {
  if (!selectedLAW) {
    onMessage && onMessage("Please select a Log Analytics Workspace.");
    return;
  }

  const LAW = logAnalyticsWorkspaces.find(law => law.id === selectedLAW);
  if (LAW && LAW.diagnosticsEnabled) {
    onMessage && onMessage("Diagnostics are already enabled for this Log Analytics Workspace.");
    return;
  }

  const response = await fetch(
    `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/enable-diagnostics`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: selectedLAW })
    }
  );
  
  const data = await response.json();
  console.log('Enable Diagnostics Response:', data); // Log the response for debugging
  if (data.success) {
    onMessage && onMessage("Diagnostics enabled successfully for the Log Analytics Workspace.");
    fetchLogAnalyticsWorkspaces();
  } else {
    onMessage && onMessage(`Error: ${data.error}`);
  }
};

// Function to create a resource group
const createResourceGroup = async () => {
  try {
    // Get the resource group name and location from user input
    const resourceGroupName = document.getElementById("resourceGroupNameInput").value;
    const location = document.getElementById("locationSelect").value;

    if (!resourceGroupName || !location) {
      onMessage && onMessage("Resource Group Name and Location are required.");
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/create-resource-group`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceGroupName, location }),
      }
    );

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

const StyledInput = styled.input`
  /* Add your input styles here */
`;

// Function to delete a resource group
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
  return <p>Welcome to AZTrckr. Please select a subscription to get started</p>;
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
      <StyledH3>Create Resource Group</StyledH3>
      <div>
        <StyledLabel htmlFor="resourceGroupNameInput">Resource Group Name:</StyledLabel>
        <StyledInput type="text" id="resourceGroupNameInput" />
      </div>
      <div>
        <StyledLabel htmlFor="locationSelect"></StyledLabel>
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

    {/* Display Resource Groups */}
    <StyledSection>
      <StyledH3>Resource Groups</StyledH3>
      {resourceGroups.length > 0 ? (
        <ul>
          {resourceGroups.map((group) => (
            <li key={group.id}>
              {group.name}
              <StyledButton onClick={() => deleteResourceGroup(group.name)}>Delete</StyledButton>
            </li>
          ))}
        </ul>
      ) : (
        <StyledP>No resource groups found.</StyledP>
      )}
    </StyledSection>

    {/* Export Activity Logs */}
    <StyledSection>
      <StyledH3>Activity Logs</StyledH3>
      {diagnosticsEnabled && (
        <StyledP>
          Current Activity Logs Destination:
          <Strong>{extractLAWName(diagnosticsDestination)}</Strong>
        </StyledP>
      )}
      {!diagnosticsEnabled && <StyledP>Activity logs are not currently being exported.</StyledP>}
      {logAnalyticsWorkspaces && logAnalyticsWorkspaces.length > 0 && (
        <div>
          <StyledLabel htmlFor="lawSelect">Change Activity Logs Destination:</StyledLabel>
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
              Enable Activity Logs
            </StyledButton>
          </div>
          {diagnosticsMessage && <StyledP>{diagnosticsMessage}</StyledP>}
        </div>
      )}
    </StyledSection>

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

