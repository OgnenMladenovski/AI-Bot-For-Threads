import { Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import useSessionDetails from '../../../../hooks/useSessionDetails.ts';
import SessionLogViewer from '../../../components/session/SessionLogViewer/SessionLogViewer.tsx';
import type { SessionStatus } from '../../../../api/types/session.ts';

const statusColors: Record<SessionStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
    CREATED: 'default',
    RUNNING: 'info',
    PAUSED: 'warning',
    COMPLETED: 'success',
    FAILED: 'error'
};

const formatTimestamp = (value: string | null) =>
    value === null ? '—' : new Date(value).toLocaleString();

const SessionDetailsPage = () => {
    const { id } = useParams();
    const { session, logs } = useSessionDetails(id);

    if (!session) {
        return <Box className='progress-box'><CircularProgress/></Box>;
    }

    return (
        <Box>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4 }}>
                <Stack direction='row' spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                    <Typography variant='h5'>Session #{session.id} — {session.socialNetwork}</Typography>
                    <Chip label={session.status} color={statusColors[session.status]}/>
                </Stack>

                <Typography color='text.secondary' gutterBottom>{session.description}</Typography>

                <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', my: 2 }}>
                    {session.targets.map((target) => (
                        <Chip key={target.id} label={`${target.type}: ${target.value}`} variant='outlined'/>
                    ))}
                </Stack>

                <Typography variant='body2' color='text.secondary'>
                    Started: {formatTimestamp(session.startedAt)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    Finished: {formatTimestamp(session.finishedAt)}
                </Typography>
            </Paper>

            <SessionLogViewer logs={logs}/>
        </Box>
    );
};

export default SessionDetailsPage;