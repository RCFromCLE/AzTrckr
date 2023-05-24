import React, { useState, useEffect } from "react";
import SubscriptionDetails from "./SubscriptionDetails";
import styled from 'styled-components';

const StyledDiv = styled.div`
  background-color: ${props => props.theme.body};
  color: ${props => props.theme.text};
  font-family: Arial, sans-serif;
  padding: 20px;
`;

const StyledSelect = styled.select`
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.toggleBorder};
  border: none;
  margin-left: 10px;
`;

const SubscriptionSelector = ({ onMessage }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      const response = await fetch(`${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        console.error('Unexpected data format:', data);
        setSubscriptions([]);
      }
    }

    fetchSubscriptions();
  }, []);

  const handleChange = (event) => {
    const subscription = subscriptions.find(sub => sub.subscriptionId === event.target.value);
    setSelectedSubscription(subscription);
  };

  return (
    <StyledDiv>
      <label htmlFor="subscriptionSelect">Select a Subscription:</label>
      <StyledSelect
        id="subscriptionSelect"
        value={selectedSubscription?.subscriptionId || ""}
        onChange={handleChange}
      >
        <option value="">-- Select a subscription --</option>
        {subscriptions.map((sub) => (
          <option key={sub.subscriptionId} value={sub.subscriptionId}>
            {sub.displayName}
          </option>
        ))}
      </StyledSelect>
      <SubscriptionDetails subscription={selectedSubscription} onMessage={onMessage} />
    </StyledDiv>
  );
};

export default SubscriptionSelector;
