import { Box, Button, CircularProgress, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import useDonations from '../../../../hooks/useDonations.ts';
import DonationBatchCard from '../../../components/donation/DonationBatchCard/DonationBatchCard.tsx';
import SubmitDonationDialog from '../../../components/donation/SubmitDonationDialog/SubmitDonationDialog.tsx';
import SectionHeading from '../../../components/common/SectionHeading/SectionHeading.tsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.tsx';

const DonationsPage = () => {
    const { donations, loading, onCreate, onApprove, onSubmit } = useDonations();

    const [newBatchDialogOpen, setNewBatchDialogOpen] = useState<boolean>(false);

    return (
        <Box>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress/>
                </Box>
            )}
            {!loading &&
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <SectionHeading title='Donations' subtitle='Batches of Macedonian posts on their way to the Vezilka corpus.'/>
                        <Button variant='contained' startIcon={<AddIcon/>} onClick={() => setNewBatchDialogOpen(true)}>
                            New Batch
                        </Button>
                    </Box>
                    {donations.length === 0 && (
                        <EmptyState
                            title='No donation batches yet'
                            description='Group extracted posts into a batch and donate them to doniraj.vezilka.ai.'
                        />
                    )}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {donations.map((batch) => (
                            <Grid key={batch.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <DonationBatchCard batch={batch} onApprove={onApprove} onSubmit={onSubmit}/>
                            </Grid>
                        ))}
                    </Grid>
                    <SubmitDonationDialog
                        open={newBatchDialogOpen}
                        onClose={() => setNewBatchDialogOpen(false)}
                        onCreate={onCreate}
                    />
                </>}
        </Box>
    );
};

export default DonationsPage;