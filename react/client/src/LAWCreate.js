import React, { useState } from "react";
import styled from 'styled-components';

const StyledForm = styled.form`
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  font-family: Arial, sans-serif;
  padding: 10px;
`;

const StyledDiv = styled.div`
  margin-bottom: 10px;
`;

const StyledSelect = styled.select`
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.toggleBorder};
  border: none;
`;

const StyledInput = styled.input`
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.toggleBorder};
  border: none;
  margin-right: 10px;
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

const LAWCreate = ({ subscriptionId, resourceGroups, locations, onMessage }) => {
  const [selectedResourceGroup, setSelectedResourceGroup] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const handleResourceGroupChange = (event) => {
    setSelectedResourceGroup(event.target.value);
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const resetForm = () => {
    setSelectedResourceGroup("");
    setSelectedLocation("");
    setWorkspaceName("");
  };

  const createWorkspace = async (event) => {
    event.preventDefault();

    if (!selectedResourceGroup || !workspaceName || !selectedLocation) {
      onMessage && onMessage("Please provide all required fields.");
      return;
    }

    onMessage && onMessage("Creating Log Analytics Workspace...");

    const payload = { resourceGroup: selectedResourceGroup, workspaceName, location: selectedLocation };

    console.log(payload);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscriptionId}/create-law`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceGroup: selectedResourceGroup,
            workspaceName,
            location: selectedLocation,
          }),
        }
      );

      const data = await response.json();
      console.log('Create LAW Response:', data);
      if (data.success) {
        onMessage && onMessage("Log Analytics Workspace created successfully.");
        resetForm();
      } else {
        onMessage && onMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      onMessage && onMessage(`Error: ${error}`);
    }
  };
  return (
    <StyledForm onSubmit={createWorkspace}>
      <StyledDiv>
        <label htmlFor="resourceGroupSelect">Resource Group:</label>
        <StyledSelect id="resourceGroupSelect" value={selectedResourceGroup} onChange={handleResourceGroupChange}>
          <option value="">-- Select a resource group --</option>
          {resourceGroups.map((group) => (
            <option key={group.id} value={group.name}>{group.name}</option>
          ))}
        </StyledSelect>
      </StyledDiv>
      <StyledDiv>
        <label htmlFor="workspaceName">Workspace Name:</label>
        <StyledInput type="text" id="workspaceName" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
      </StyledDiv>
      <StyledDiv>
        <label htmlFor="locationSelect">Location:</label>
        <StyledSelect id="locationSelect" value={selectedLocation} onChange={handleLocationChange}>
          <option value="">-- Select a location --</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </StyledSelect>
      </StyledDiv>
      <StyledButton type="submit">Create</StyledButton>
    </StyledForm>
  );
};

export default LAWCreate;
