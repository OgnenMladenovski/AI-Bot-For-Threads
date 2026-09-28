import { Box } from '@mui/material';

const MOTIF = [
    '....X....',
    '...XXX...',
    '..XXXXX..',
    '.XXX.XXX.',
    'XXX...XXX',
    '.XXX.XXX.',
    '..XXXXX..',
    '...XXX...',
    '....X....'
];

interface OrnamentProps {
    size?: number;
    color?: string;
    opacity?: number;
}

const Ornament = ({ size = 32, color = '#A02222', opacity = 1 }: OrnamentProps) => (
    <Box
        component='svg'
        viewBox='0 0 27 27'
        sx={{ width: size, height: size, display: 'block', flexShrink: 0, opacity }}
    >
        {MOTIF.flatMap((row, y) =>
            row.split('').map((cell, x) => {
                if (cell !== 'X') {
                    return null;
                }
                return <rect key={`${x}-${y}`} x={x * 3} y={y * 3} width={3} height={3} fill={color}/>;
            })
        )}
    </Box>
);

export default Ornament;