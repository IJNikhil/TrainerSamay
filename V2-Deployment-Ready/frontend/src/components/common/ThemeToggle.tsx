import React from 'react';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode

interface Props {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<Props> = ({ darkMode, toggleTheme }) => (
  <IconButton onClick={toggleTheme} color="inherit" size="large">
    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />} {/* Show sun if dark, moon if light */}
  </IconButton>
);

export default ThemeToggle;