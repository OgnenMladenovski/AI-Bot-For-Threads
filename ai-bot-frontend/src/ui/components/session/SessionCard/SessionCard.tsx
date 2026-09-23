import { Box, Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router';
import type { SessionResponse, SessionStatus } from '../../../../api/types/session.ts';
import useSessions from '../../../../hooks/useSessions.ts';

interface SessionCardProps {
  session: SessionResponse;
}

const statusColors: Record<SessionStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
    CREATED: 'default',
    RUNNING: 'info',
    PAUSED: 'warning',
    COMPLETED: 'success',
    FAILED: 'error'
};

const formatTimestamp = (value: string | null) =>
    value === null ? '—' : new Date(value).toLocaleString();

const SessionCard = ({ session }: SessionCardProps) => {
    const navigate = useNavigate();
    const { onStart, onStop } = useSessions();

    const canStart = session.status === 'CREATED' || session.status === 'PAUSED';
    const canStop = session.status === 'RUNNING';

    return (
        <Card sx={{ maxWidth: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant='h5'>{session.socialNetwork}</Typography>
                <Typography variant='subtitle1' sx={{ flexGrow: 1 }}>{session.description}</Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {session.targets.map((target) => (
                        <Chip key={target.id} label={`${target.type}: ${target.value}`} size='small' variant='outlined'/>
                    ))}
                </Box>

                <Typography variant='body2' color='text.secondary'>
                    Started: {formatTimestamp(session.startedAt)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    Finished: {formatTimestamp(session.finishedAt)}
                </Typography>

                <Chip
                    label={session.status}
                    size='small'
                    color={statusColors[session.status]}
                    sx={{ alignSelf: 'flex-start' }}
                />
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                    startIcon={<InfoIcon/>}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                >
                    Info
                </Button>
                <Button
                    startIcon={<PlayArrowIcon/>}
                    color='success'
                    disabled={!canStart}
                    onClick={() => onStart(session.id)}
                >
                    Start
                </Button>
                <Button
                    startIcon={<StopIcon/>}
                    color='error'
                    disabled={!canStop}
                    onClick={() => onStop(session.id)}
                >
                    Stop
                </Button>
            </CardActions>
        </Card>
    );
};

export default SessionCard;