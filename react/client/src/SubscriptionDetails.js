import React, { useState, useEffect } from "react";

const SubscriptionDetails = ({ subscription, onMessage }) => {
  const [storageAccounts, setStorageAccounts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedStorageAccount, setSelectedStorageAccount] = useState("");
  const [totalResources, setTotalResources] = useState(null);

  useEffect(() => {
    if (subscription) {
      fetchStorageAccounts();
      fetchTotalResources();
    } else {
      setTotalResources(null);
    }
  }, [subscription]);

  const fetchStorageAccounts = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/storage_accounts`
    );
    const data = await response.json();
    const storageAccountsData = data.map((account) => {
      const diagnosticsEnabled = subscription.activityLogsEnabled;
      return { ...account, diagnosticsEnabled };
    });
    setStorageAccounts(storageAccountsData);
  };


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

  const handleStorageAccountChange = (event) => {
    setSelectedStorageAccount(event.target.value);
  };

  const enableDiagnostics = async () => {
    if (!selectedStorageAccount) {
      onMessage && onMessage("Please select a storage account.");
      return;
    }

    const storageAccount = storageAccounts.find(sa => sa.id === selectedStorageAccount);

    if (storageAccount && storageAccount.diagnosticsEnabled) {
      onMessage && onMessage("Diagnostics are already enabled for this storage account.");
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_FLASK_API_BASE_URL}/subscriptions/${subscription.subscriptionId}/enable-diagnostics`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageAccountId: selectedStorageAccount }),
      }
    );
    const data = await response.json();
    if (data.success) {
      onMessage && onMessage("Diagnostics enabled successfully.");
    } else {
      onMessage && onMessage(`Error: ${data.error}`);
    }
  };

  if (!subscription) {
    return <p>Please select a subscription to view details.</p>;
  }

  return (
    <div>
      <h2>{subscription.displayName}</h2>
      <p>
        <strong>ID:</strong> {subscription.subscriptionId}
      </p>
      <p>
        <strong>Display Name:</strong> {subscription.displayName}
      </p>
      {subscription && (
        <p>
          <strong>Total Resources:</strong> {totalResources}
        </p>
      )}
      {storageAccounts && storageAccounts.length > 0 && (
        <div>
          <label htmlFor="storageAccountSelect">Select a Storage Account:</label>
          <select id="storageAccountSelect" value={selectedStorageAccount} onChange={handleStorageAccountChange}>
            <option value="">-- Select a storage account --</option>
            {storageAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <button onClick={enableDiagnostics} disabled={!selectedStorageAccount || (storageAccounts.find(sa => sa.id === selectedStorageAccount) && storageAccounts.find(sa => sa.id === selectedStorageAccount).diagnosticsEnabled)}>
            Enable Diagnostics
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
