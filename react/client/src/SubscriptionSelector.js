import React, { useState, useEffect } from "react";
import SubscriptionDetails from "./SubscriptionDetails";

const SubscriptionSelector = ({ onMessage }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    // Fetch subscriptions from back-end
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
    <div>
      <label htmlFor="subscriptionSelect">Select a Subscription:</label>
      <select
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
      </select>
      <SubscriptionDetails subscription={selectedSubscription} onMessage={onMessage} />
    </div>
  );
};

export default SubscriptionSelector;
