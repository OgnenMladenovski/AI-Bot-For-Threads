import { Box, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import Ornament from '../Ornament/Ornament.tsx';

interface WovenCardProps {
    accent: string;
    eyebrow: ReactNode;
    badge?: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
}

const WovenCard = ({ accent, eyebrow, badge, children, actions }: WovenCardProps) => {
    const plate = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.4,
        backgroundColor: '#FDFCFC',
        border: '1px solid',
        borderColor: alpha(accent, 0.45),
        minWidth: 0
    };

    return (
        <Paper
            variant='outlined'
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
            <Box
                sx={{
                    position: 'relative',
                    px: 1.5,
                    py: 1.25,
                    overflow: 'hidden',
                    backgroundColor: alpha(accent, 0.16),
                    borderBottom: `3px solid ${accent}`
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '7px', pointerEvents: 'none' }}>
                    {Array.from({ length: 16 }).map((_stitch, index) => (
                        <Ornament key={index} size={26} color={accent} opacity={0.24}/>
                    ))}
                </Box>

                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, minHeight: 26 }}>
                    <Box sx={{ ...plate, overflow: 'hidden', flexShrink: 1 }}>{eyebrow}</Box>
                    {badge && <Box sx={{ ...plate, flexShrink: 0 }}>{badge}</Box>}
                </Box>
            </Box>

            <Box sx={{ p: 2.25, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>

            {actions && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 1.5,
                        py: 1,
                        borderTop: '1px dashed #E5E0DC',
                        backgroundColor: '#F9F7F5'
                    }}
                >
                    {actions}
                </Box>
            )}
        </Paper>
    );
};

export default WovenCard;