import React, { useState } from 'react';
import { StyledButton, StyledSelect, StyledSection, StyledH3 } from './styledComponents';

// DeleteResourceGroup component
const DeleteResourceGroup = ({ resourceGroups, selectedResourceGroup, setSelectedResourceGroup, deleteResourceGroup }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeleteResourceGroup = () => {
    deleteResourceGroup(selectedResourceGroup, (response, error) => {
      if (error) {
        // Handle the error response
        setErrorMessage(`Error deleting resource group '${selectedResourceGroup}': ${error.message}`);
        console.error(error);
      } else {
        // Handle the successful response
        setSuccessMessage(`Resource group '${selectedResourceGroup}' deleted successfully`);
        console.log(response);
      }
    });
  };

  return (
    <StyledSection>
      <StyledH3>Delete AzTrckr Resource Group</StyledH3>
      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
      <div>
        <StyledSelect id="resourceGroupDeleteSelect" value={selectedResourceGroup} onChange={(e) => setSelectedResourceGroup(e.target.value)}>
          <option value="">-- Select a resource group --</option>
          {resourceGroups.map((group) => (
            <option key={group.name} value={group.name}>
              {group.name}
            </option>
          ))}
        </StyledSelect>
      </div>
      <StyledButton onClick={handleDeleteResourceGroup}>Delete</StyledButton>
    </StyledSection>
  );
};

export default DeleteResourceGroup;