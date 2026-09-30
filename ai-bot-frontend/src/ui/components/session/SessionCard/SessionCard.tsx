import { Box, Button, Chip, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router';
import type { SessionResponse, SessionStatus } from '../../../../api/types/session.ts';
import useSessions from '../../../../hooks/useSessions.ts';
import WovenCard from '../../common/WovenCard/WovenCard.tsx';
import StatusBadge from '../../common/StatusBadge/StatusBadge.tsx';

interface SessionCardProps {
    session: SessionResponse;
}

const accents: Record<SessionStatus, string> = {
    CREATED: '#9B928A',
    RUNNING: '#E0A329',
    PAUSED: '#B07A28',
    COMPLETED: '#2E7D46',
    FAILED: '#A81F1F'
};

const formatTimestamp = (value: string | null) => {
    if (value === null) {
        return '—';
    }
    return new Date(value).toLocaleString();
};

const SessionCard = ({ session }: SessionCardProps) => {
    const navigate = useNavigate();
    const { onStart, onStop } = useSessions();

    const canStart = session.status === 'CREATED' || session.status === 'PAUSED';
    const canStop = session.status === 'RUNNING';
    const accent = accents[session.status];

    return (
        <WovenCard
            accent={accent}
            eyebrow={
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: accent }}>
                    {session.socialNetwork}
                </Typography>
            }
            badge={<StatusBadge label={session.status} accent={accent}/>}
            actions={
                <>
                    <Button size='small' startIcon={<InfoIcon/>} onClick={() => navigate(`/sessions/${session.id}`)}>
                        Info
                    </Button>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size='small' startIcon={<PlayArrowIcon/>} color='success' disabled={!canStart} onClick={() => onStart(session.id)}>
                            Start
                        </Button>
                        <Button size='small' startIcon={<StopIcon/>} color='error' disabled={!canStop} onClick={() => onStop(session.id)}>
                            Stop
                        </Button>
                    </Box>
                </>
            }
        >
            <Typography variant='h6' sx={{ lineHeight: 1.3, mb: 1.5 }}>
                {session.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flexGrow: 1, alignContent: 'flex-start' }}>
                {session.targets.map((target) => (
                    <Chip key={target.id} label={`${target.type}: ${target.value}`} size='small' variant='outlined'/>
                ))}
            </Box>

            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #E5E0DC' }}>
                <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                    Started &nbsp;<Box component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>{formatTimestamp(session.startedAt)}</Box>
                </Typography>
                <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                    Finished &nbsp;<Box component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>{formatTimestamp(session.finishedAt)}</Box>
                </Typography>
            </Box>
        </WovenCard>
    );
};

export default SessionCard;