import { createContext } from 'react';
import { lightTheme } from './themes';

export const ThemeContext = createContext({
  theme: lightTheme,
  setTheme: () => {},
});