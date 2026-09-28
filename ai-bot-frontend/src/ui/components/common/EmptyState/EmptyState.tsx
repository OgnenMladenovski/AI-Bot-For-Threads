import { Box, Typography } from '@mui/material';
import Ornament from '../Ornament/Ornament.tsx';

interface EmptyStateProps {
    title: string;
    description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Ornament size={56} color='#A02222' opacity={0.18}/>
        </Box>
        <Typography variant='h6' sx={{ mb: 1 }}>{title}</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420, mx: 'auto' }}>
            {description}
        </Typography>
    </Box>
);

export default EmptyState;