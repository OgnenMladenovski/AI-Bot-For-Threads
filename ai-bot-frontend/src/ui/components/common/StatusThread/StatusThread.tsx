import { Box, Typography } from '@mui/material';
import { Fragment } from 'react';
import type { DonationStatus } from '../../../../api/types/donation.ts';

const STEPS: DonationStatus[] = ['DRAFT', 'APPROVED', 'SUBMITTED', 'ACCEPTED'];
const ROW_HEIGHT = 18;

interface StatusThreadProps {
    status: DonationStatus;
}

const StatusThread = ({ status }: StatusThreadProps) => {
    let reached = STEPS.indexOf(status);
    let failed = false;

    if (status === 'REJECTED' || status === 'FAILED') {
        reached = 2;
        failed = true;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {STEPS.map((step, index) => {
                let dotColor = '#E5E0DC';
                let labelColor = 'text.secondary';
                let labelWeight = 700;
                let size = 9;
                let label: string = step;

                if (index <= reached) {
                    dotColor = '#A02222';
                    labelColor = 'text.primary';
                }
                if (index === reached) {
                    size = ROW_HEIGHT;
                    labelWeight = 800;
                }
                if (failed && index === 3) {
                    dotColor = '#8C2F2F';
                    labelColor = 'text.primary';
                    label = status;
                }

                return (
                    <Fragment key={step}>
                        <Box sx={{ textAlign: 'center', flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                            <Box sx={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        width: size,
                                        height: size,
                                        borderRadius: '2px',
                                        transform: 'rotate(45deg)',
                                        backgroundColor: dotColor
                                    }}
                                />
                            </Box>
                            <Typography
                                sx={{ mt: 0.75, fontSize: 9, fontWeight: labelWeight, letterSpacing: '0.04em', color: labelColor }}
                            >
                                {label}
                            </Typography>
                        </Box>
                        {index < STEPS.length - 1 && (
                            <Box sx={{ width: 14, flexShrink: 0, borderTop: '2px dashed #E5E0DC', mt: `${ROW_HEIGHT / 2}px` }}/>
                        )}
                    </Fragment>
                );
            })}
        </Box>
    );
};

export default StatusThread;