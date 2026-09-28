import './Header.css';
import { AppBar, Box, Button, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import AuthToggle from '../../auth/AuthToggle/AuthToggle.tsx';
import useAuth from '../../../../hooks/useAuth.ts';
import Ornament from '../../common/Ornament/Ornament.tsx';
import type { Role } from '../../../../api/types/user.ts';

interface Page {
    path: string;
    name: string;
    authenticated: boolean;
    role?: Role;
}

const pages: Page[] = [
    { path: '/', name: 'home', authenticated: false },
    { path: '/sessions', name: 'sessions', authenticated: true },
    { path: '/posts', name: 'posts', authenticated: true },
    { path: '/donations', name: 'donations', authenticated: true }
];

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();

    const { isLoggedIn, user } = useAuth();
    const visiblePages = pages.filter((page) =>
        (!page.authenticated || isLoggedIn) &&
        (!page.role || (user?.roles.includes(page.role) ?? false))
    );

    return (
        <Box>
            <AppBar position='static' sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '7px', pointerEvents: 'none' }}>
                    {Array.from({ length: 60 }).map((_stitch, index) => (
                        <Ornament key={index} size={30} color='#FAF7F0' opacity={0.09}/>
                    ))}
                </Box>

                <Toolbar sx={{ minHeight: 64, position: 'relative' }}>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='menu'
                        sx={{ mr: 1, display: { md: 'none' } }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.25,
                            py: 0.5,
                            mr: 4,
                            backgroundColor: '#FAF7F0',
                            border: '1px solid rgba(40, 26, 21, 0.15)'
                        }}
                    >
                        <Ornament size={20} color='#A02222'/>
                        <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#A02222', letterSpacing: '0.02em' }}>
                            ВЕЗИЛКА
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {visiblePages.map((page) => {
                            let opacity = 0.7;
                            let borderBottom = '2px solid transparent';

                            if (location.pathname === page.path) {
                                opacity = 1;
                                borderBottom = '2px solid #E0A329';
                            }

                            return (
                                <Link key={page.name} to={page.path} style={{ textDecoration: 'none' }}>
                                    <Button
                                        disableRipple
                                        sx={{
                                            color: '#FAF7F0',
                                            opacity,
                                            px: 1.75,
                                            borderRadius: 0,
                                            textTransform: 'capitalize',
                                            fontWeight: 600,
                                            borderBottom,
                                            '&:hover': { backgroundColor: 'transparent', opacity: 1 }
                                        }}
                                    >
                                        {page.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <AuthToggle/>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer anchor='left' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 240 }} role='presentation' onClick={() => setDrawerOpen(false)}>
                    <List>
                        {visiblePages.map((page) => (
                            <ListItem key={page.name} disablePadding>
                                <ListItemButton component={Link} to={page.path}>
                                    <ListItemText primary={page.name} sx={{ textTransform: 'capitalize' }}/>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
};

export default Header;