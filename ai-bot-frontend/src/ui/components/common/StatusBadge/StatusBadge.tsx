import { Box } from '@mui/material';

interface StatusBadgeProps {
    label: string;
    accent: string;
}

const StatusBadge = ({ label, accent }: StatusBadgeProps) => (
    <Box sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', color: accent, whiteSpace: 'nowrap' }}>
        {label}
    </Box>
);

export default StatusBadge;