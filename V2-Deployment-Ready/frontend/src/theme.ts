import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4F8EF7' },
    background: { default: '#f9f9f9', paper: '#fff' },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4F8EF7' },
    background: { default: '#18191A', paper: '#242526' },
  },
});
