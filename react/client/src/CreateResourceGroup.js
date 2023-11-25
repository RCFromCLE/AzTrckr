// createresourcegroup.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { StyledButton, StyledSelect, StyledSection, StyledH3, StyledInput, StyledMessage } from './styledComponents';

const CreateResourceGroup = ({ onMessage, subscriptionId, locations }) => {
  const [resourceGroupName, setResourceGroupName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Function to create a resource group to be called when the user clicks the Create Resource Group button
  const createResourceGroup = async () => {
    if (!resourceGroupName || !selectedLocation) {
      onMessage && onMessage("Resource Group Name and Location are required.");
      return;
    }

    try {
      // Call the API to create the resource group
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscriptionId}/create-resource-group`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceGroupName, location: selectedLocation }),
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

  return (
    <StyledSection>
      <StyledH3>Create AzTrckr Resource Group</StyledH3>
      <div>
        <StyledInput
          type="text"
          value={resourceGroupName}
          onChange={(e) => setResourceGroupName(e.target.value)}
          placeholder="aztrckr-rg-01"
        />
      </div>
      <div>
        <br />
        <StyledSelect
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
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
  );
};

export default CreateResourceGroup;
