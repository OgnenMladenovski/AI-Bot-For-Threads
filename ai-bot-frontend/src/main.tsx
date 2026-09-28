import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AuthProvider from './providers/authProvider.tsx';
import SnackbarProvider from './providers/snackbarProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.ts';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AuthProvider>
                <SnackbarProvider>
                    <App/>
                </SnackbarProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>
);
