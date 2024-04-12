import styled from 'styled-components';

// StyledDiv component represents a styled div container
export const StyledDiv = styled.div`
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  font-family: Arial, sans-serif;
  padding: 20px;
`;

// StyledButton component represents a styled button
export const StyledButton = styled.button`
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
    cursor: not-allowed;
  }
`;

export const StyledInput = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: ${props => props.theme.text};
  background: ${props => props.theme.body};
  border: none;
  border-radius: 3px;
`;

// StyledSelect component represents a styled select dropdown
export const StyledSelect = styled.select`
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.toggleBorder};
  border: none;
  margin-left: 10px;
`;
export const StyledSection = styled.section`
  margin: 20px 0;
  padding: 5px;
  color: ${props => props.theme.text};
`;
export const StyledH2 = styled.h2`
  margin-bottom: 10px;
  margin: 5px;
  padding: 5px;

`;
export const StyledH3 = styled.h3`
  margin-top: 10px;
  margin-bottom: 5px;
`;
export const StyledP = styled.p`
  margin-bottom: 10px;
`;
export const Strong = styled.strong`
  font-weight: bold;
`;
export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 5px;
`;
export const StyledMessage = styled.p`
  margin-top: 10px;
  padding: 5px;
`;
export const InfoBlurb = styled.span`
  display: inline-block; /* Ensures it can have padding and margin */
  background-color: ${props => props.theme.gradientEnd}; /* Use a distinct color for visibility */
  color: ${props => props.theme.text}; /* Text color from theme */
  font-size: 0.8em; /* Slightly smaller font size for subtlety */
  padding: 6px 12px; /* Sufficient padding for emphasis */
  margin-left: 10px; /* Spacing from preceding elements */
  border-radius: 8px; /* Rounded corners for a modern look */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Soft shadow for depth */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Subtle border for definition */
`;
