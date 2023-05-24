import React, { useState } from "react";
import SubscriptionSelector from "./SubscriptionSelector";
import SubscriptionDetails from "./SubscriptionDetails";
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './themes/themes';
import { ThemeContext } from './themes/ThemeContext';
import ThemeToggleButton from './themes/ThemeToggleButton';

function App() {
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(lightTheme);

  const handleSubscriptionSelect = (subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleMessage = (msg) => {
    setMessage(msg);
  };

  const toggleTheme = () => {
    if (theme.id === 'light') {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <SubscriptionSelector onSubscriptionSelect={handleSubscriptionSelect} />
          {selectedSubscription && (
            <SubscriptionDetails subscription={selectedSubscription} onMessage={handleMessage} />
          )}
          {message && <p>{message}</p>}
          <ThemeToggleButton /> 
        </div>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
