import { Box, Button, Typography } from '@mui/material';
import type { DonationBatchResponse, DonationStatus } from '../../../../api/types/donation.ts';
import WovenCard from '../../common/WovenCard/WovenCard.tsx';
import StatusBadge from '../../common/StatusBadge/StatusBadge.tsx';
import StatusThread from '../../common/StatusThread/StatusThread.tsx';

interface DonationBatchCardProps {
    batch: DonationBatchResponse;
    onApprove: (id: number) => Promise<void>;
    onSubmit: (id: number) => Promise<void>;
}

const accents: Record<DonationStatus, string> = {
    DRAFT: '#9B928A',
    APPROVED: '#8A6A3B',
    SUBMITTED: '#E0A329',
    ACCEPTED: '#3F6B4A',
    REJECTED: '#8C2F2F',
    FAILED: '#8C2F2F'
};

const DonationBatchCard = ({ batch, onApprove, onSubmit }: DonationBatchCardProps) => {
    const accent = accents[batch.status];

    return (
        <WovenCard
            accent={accent}
            eyebrow={
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: accent }}>
                    BATCH #{batch.id}
                </Typography>
            }
            badge={<StatusBadge label={batch.status} accent={accent}/>}
            actions={
                <>
                    <Button size='small' disabled={batch.status !== 'DRAFT'} onClick={() => void onApprove(batch.id)}>
                        Approve
                    </Button>
                    <Button size='small' variant='contained' disabled={batch.status !== 'APPROVED'} onClick={() => void onSubmit(batch.id)}>
                        Submit
                    </Button>
                </>
            }
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2.5 }}>
                <Typography variant='h3' sx={{ color: 'primary.main', lineHeight: 1 }}>
                    {batch.postIds.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    post(s) in this batch
                </Typography>
            </Box>

            <StatusThread status={batch.status}/>

            <Box sx={{ flexGrow: 1 }}/>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E5E0DC' }}>
                <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                    Created &nbsp;<Box component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>{new Date(batch.createdAt).toLocaleString()}</Box>
                </Typography>
                {batch.submittedAt && (
                    <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                        Submitted &nbsp;<Box component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>{new Date(batch.submittedAt).toLocaleString()}</Box>
                    </Typography>
                )}
                {batch.vezilkaReference && (
                    <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.secondary', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {batch.vezilkaReference}
                    </Typography>
                )}
            </Box>
        </WovenCard>
    );
};

export default DonationBatchCard;