import React, { useState } from "react";
import SubscriptionSelector from "./SubscriptionSelector";
import SubscriptionDetails from "./SubscriptionDetails";

function App() {
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscriptionSelect = (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
  };

  const handleMessage = (msg) => {
    setMessage(msg);
  };

  return (
    <div className="App">
      <SubscriptionSelector onSubscriptionSelect={handleSubscriptionSelect} />
      {selectedSubscription && (
        <SubscriptionDetails subscriptionId={selectedSubscription} onMessage={handleMessage} />
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
