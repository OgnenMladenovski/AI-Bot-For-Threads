import { Box, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material';
import useAuth from '../../../../hooks/useAuth.ts';
import useDashboard from '../../../../hooks/useDashboard.ts';

interface StatCardProps {
    label: string;
    value: number;
}

const StatCard = ({ label, value }: StatCardProps) => (
    <Card>
        <CardContent>
            <Typography variant='h4'>{value}</Typography>
            <Typography variant='body2' color='text.secondary'>{label}</Typography>
        </CardContent>
    </Card>
);

const HomePage = () => {
    const { user } = useAuth();
    const { sessions, donations, totalPosts, donatedPosts, loading } = useDashboard(user !== null);

    const runningSessions = sessions.filter((session) => session.status === 'RUNNING').length;
    const completedSessions = sessions.filter((session) => session.status === 'COMPLETED').length;
    const acceptedBatches = donations.filter((batch) => batch.status === 'ACCEPTED').length;

    return (
        <Box sx={{ m: 0, p: 0 }}>
            <Container maxWidth='xl' sx={{ mt: 3, py: 3 }}>
                <Typography variant='h4' gutterBottom>
                    Welcome to the Threads Bot! 👋
                </Typography>

                {!user && (
                    <Typography variant='body1'>
                        Log in to see your extraction statistics.
                    </Typography>
                )}

                {user && loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress/>
                    </Box>
                )}

                {user && !loading && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Extracted posts' value={totalPosts}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Donated posts' value={donatedPosts}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Sessions' value={sessions.length}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Running now' value={runningSessions}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Completed sessions' value={completedSessions}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Donation batches' value={donations.length}/></Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard label='Accepted batches' value={acceptedBatches}/></Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default HomePage;