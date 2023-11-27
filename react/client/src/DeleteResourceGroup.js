import React, { useState } from "react";
import styled from 'styled-components';

const StyledSelect = styled.select`
  /* Add your select styles here */
`;

const StyledButton = styled.button`
  /* Add your button styles here */
`;

const DeleteResourceGroup = ({ resourceGroups, onDelete }) => {
  const [selectedResourceGroup, setSelectedResourceGroup] = useState("");

  const handleDeleteClick = async () => {
    if (selectedResourceGroup) {
      try {
        // Call the onDelete function to initiate the delete operation
        const response = await onDelete(selectedResourceGroup);

        if (response.success) {
          // Handle successful deletion, e.g., display a message or update the UI
          console.log(`Successfully deleted resource group: ${selectedResourceGroup}`);
        } else {
          // Handle deletion failure, e.g., display an error message
          console.error(`Failed to delete resource group: ${selectedResourceGroup}`);
        }

        setSelectedResourceGroup(""); // Clear the selection after deletion (you can customize this behavior)
      } catch (error) {
        console.error("Error during resource group deletion:", error);
      }
    }
  };

  return (
    <div>
      <label htmlFor="resourceGroupDeleteSelect">Select a resource group to delete:</label>
      <StyledSelect
        id="resourceGroupDeleteSelect"
        value={selectedResourceGroup}
        onChange={(e) => setSelectedResourceGroup(e.target.value)}
      >
        <option value="">-- Select a resource group --</option>
        {resourceGroups.map((group) => (
          <option key={group.name} value={group.name}>
            {group.name}
          </option>
        ))}
      </StyledSelect>
      <StyledButton onClick={handleDeleteClick}>Delete</StyledButton>
    </div>
  );
};

export default DeleteResourceGroup;
