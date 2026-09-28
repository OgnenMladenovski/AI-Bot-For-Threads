import { Box, Typography } from '@mui/material';
import { Fragment } from 'react';
import type { DonationStatus } from '../../../../api/types/donation.ts';

const STEPS: DonationStatus[] = ['DRAFT', 'APPROVED', 'SUBMITTED', 'ACCEPTED'];

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
                let size = 9;
                let label: string = step;

                if (index <= reached) {
                    dotColor = '#A02222';
                    labelColor = 'text.primary';
                }
                if (index === reached) {
                    size = 14;
                }
                if (failed && index === 3) {
                    dotColor = '#8C2F2F';
                    labelColor = 'text.primary';
                    label = status;
                }

                return (
                    <Fragment key={step}>
                        <Box sx={{ textAlign: 'center', flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: size,
                                    height: size,
                                    mx: 'auto',
                                    borderRadius: '2px',
                                    transform: 'rotate(45deg)',
                                    backgroundColor: dotColor
                                }}
                            />
                            <Typography
                                sx={{ mt: 0.75, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', color: labelColor }}
                            >
                                {label}
                            </Typography>
                        </Box>
                        {index < STEPS.length - 1 && (
                            <Box sx={{ width: 14, flexShrink: 0, borderTop: '2px dashed #E5E0DC', mt: `${size / 2}px` }}/>
                        )}
                    </Fragment>
                );
            })}
        </Box>
    );
};

export default StatusThread;