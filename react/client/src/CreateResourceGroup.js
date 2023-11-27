import React, { useState } from 'react';
import { StyledButton, StyledSelect, StyledSection, StyledH3, StyledInput, StyledMessage } from './styledComponents';

const CreateResourceGroup = ({ onMessage, subscriptionId, locations }) => {
  const [resourceGroupName, setResourceGroupName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [buttonText, setButtonText] = useState('Create'); // Initially set to 'Create'

  const createResourceGroup = async () => {
    if (!resourceGroupName || !selectedLocation || isLoading) {
      return;
    }

    setIsLoading(true);
    setButtonText('Creating...'); // Update button text while creating

    const payload = { resourceGroupName, location: selectedLocation };
    let response;

    try {
      response = await fetch(
        `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscriptionId}/create-resource-group`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('Create Resource Group Response:', data);

      if (response.status === 201 || (response.status === 200 && data && data.success)) {
        onMessage && onMessage("Resource Group created successfully.");
        setResourceGroupName('');
        setSelectedLocation('');
        setErrorOccurred(false);
        setButtonText('Success'); // Update button text to 'Success' after success

        // Reset button text to 'Create' after a delay (e.g., 2 seconds)
        setTimeout(() => {
          setButtonText('Create');
        }, 2000);
      } else {
        setErrorOccurred(true);
        setButtonText('Create'); // Update button text to 'Create' after error
      }
    } catch (error) {
      console.error("Error creating Resource Group:", error);
      setErrorOccurred(true);
      setButtonText('Create'); // Update button text to 'Create' after error
    } finally {
      setIsLoading(false);
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
      <StyledButton onClick={createResourceGroup} disabled={isLoading}>
        {buttonText}
      </StyledButton>
      {errorOccurred && (
        <StyledMessage>An error occurred while creating the Resource Group.</StyledMessage>
      )}
    </StyledSection>
  );
};

export default CreateResourceGroup;
