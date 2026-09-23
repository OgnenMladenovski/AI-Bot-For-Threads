import { Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material';
import type { DonationBatchResponse, DonationStatus } from '../../../../api/types/donation.ts';

interface DonationBatchCardProps {
    batch: DonationBatchResponse;
    onApprove: (id: number) => Promise<void>;
    onSubmit: (id: number) => Promise<void>;
}

const statusColors: Record<DonationStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
    DRAFT: 'default',
    APPROVED: 'info',
    SUBMITTED: 'warning',
    ACCEPTED: 'success',
    REJECTED: 'error',
    FAILED: 'error'
};

const DonationBatchCard = ({ batch, onApprove, onSubmit }: DonationBatchCardProps) => {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant='h6'>Batch #{batch.id}</Typography>
                <Chip label={batch.status} size='small' color={statusColors[batch.status]} sx={{ my: 1 }}/>
                <Typography variant='body2'>{batch.postIds.length} post(s)</Typography>
                <Typography variant='body2' color='text.secondary'>
                    Created: {new Date(batch.createdAt).toLocaleString()}
                </Typography>
                {batch.submittedAt && (
                    <Typography variant='body2' color='text.secondary'>
                        Submitted: {new Date(batch.submittedAt).toLocaleString()}
                    </Typography>
                )}
                {batch.vezilkaReference && (
                    <Typography variant='caption' color='text.secondary'>
                        Ref: {batch.vezilkaReference}
                    </Typography>
                )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                    color='primary'
                    disabled={batch.status !== 'DRAFT'}
                    onClick={() => void onApprove(batch.id)}
                >
                    Approve
                </Button>
                <Button
                    variant='contained'
                    color='success'
                    disabled={batch.status !== 'APPROVED'}
                    onClick={() => void onSubmit(batch.id)}
                >
                    Submit
                </Button>
            </CardActions>
        </Card>
    );
};

export default DonationBatchCard;