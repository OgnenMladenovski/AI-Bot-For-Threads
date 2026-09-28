import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#A02222', dark: '#6F2020', light: '#C24A4A', contrastText: '#FAF7F0' },
        secondary: { main: '#E0A329', dark: '#CF8217', contrastText: '#281A15' },
        background: { default: '#F9F7F5', paper: '#FDFCFC' },
        text: { primary: '#281A15', secondary: '#816F6A' },
        divider: '#E5E0DC',
        success: { main: '#3F6B4A', contrastText: '#FAF7F0' },
        info: { main: '#8A6A3B', contrastText: '#FAF7F0' },
        warning: { main: '#E0A329', contrastText: '#281A15' },
        error: { main: '#8C2F2F', contrastText: '#FAF7F0' },
    },
    shape: { borderRadius: 0 },
    typography: {
        fontFamily: '"Golos Text", system-ui, sans-serif',
        h3: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 700, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
        subtitle1: { color: '#816F6A' },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#A02222',
                    boxShadow: 'none',
                    borderBottom: '2px solid #E0A329'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: { border: '1px solid #E5E0DC', boxShadow: '0 1px 2px #221c1d0a, 0 14px 34px -18px #221c1d1f' }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    paddingInline: 18,
                    '&.MuiButton-containedPrimary': { boxShadow: 'none' },
                    '&.MuiButton-containedPrimary:hover': { backgroundColor: '#8C1D1D', boxShadow: 'none' }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, borderRadius: 6, letterSpacing: '0.02em' },
                sizeSmall: { height: 24 },
                outlined: { borderColor: '#E5E0DC', backgroundColor: '#F9F7F5' }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 6, backgroundColor: '#FDFCFC' } }
        },
        MuiDialog: {
            styleOverrides: { paper: { border: '1px solid #E5E0DC' } }
        },
    }
});

export default theme;