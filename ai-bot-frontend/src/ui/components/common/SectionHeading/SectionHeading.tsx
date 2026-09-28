import { Box, Typography } from '@mui/material';

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
}

const SectionHeading = ({ title, subtitle, centered = false }: SectionHeadingProps) => {
    let align: 'left' | 'center' = 'left';
    let barMargin: string | number = 0;

    if (centered) {
        align = 'center';
        barMargin = 'auto';
    }

    return (
        <Box sx={{ mb: 3, textAlign: align }}>
            <Typography variant='h5'>{title}</Typography>
            <Box sx={{ width: 64, height: 3, borderRadius: 2, bgcolor: 'primary.main', mt: 1.5, mx: barMargin }}/>
            {subtitle && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 2, maxWidth: 620, mx: barMargin }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
};

export default SectionHeading;