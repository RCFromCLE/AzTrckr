import React from 'react';
import useTheme from './useTheme';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
    {theme.id === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}

export default ThemeToggleButton;
