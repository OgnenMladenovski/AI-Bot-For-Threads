import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router';
import useAuth from '../../../../hooks/useAuth.ts';
import useDashboard from '../../../../hooks/useDashboard.ts';
import Ornament from '../../../components/common/Ornament/Ornament.tsx';
import SectionHeading from '../../../components/common/SectionHeading/SectionHeading.tsx';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { sessions, donations, totalPosts, donatedPosts, loading } = useDashboard(user !== null);

    const runningSessions = sessions.filter((session) => session.status === 'RUNNING').length;
    const completedSessions = sessions.filter((session) => session.status === 'COMPLETED').length;
    const acceptedBatches = donations.filter((batch) => batch.status === 'ACCEPTED').length;

    const stats = [
        { label: 'Extracted posts', value: totalPosts },
        { label: 'Donated posts', value: donatedPosts },
        { label: 'Sessions', value: sessions.length },
        { label: 'Running now', value: runningSessions },
        { label: 'Completed', value: completedSessions },
        { label: 'Accepted batches', value: acceptedBatches }
    ];

    return (
        <Box>
            <Paper variant='outlined' sx={{ overflow: 'hidden', borderColor: '#8C1D1D' }}>
                <Box
                    sx={{
                        position: 'relative',
                        px: 1.5,
                        py: 1.25,
                        overflow: 'hidden',
                        backgroundColor: '#8C1D1D',
                        borderBottom: '2px solid #E0A329'
                    }}
                >
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '7px', pointerEvents: 'none' }}>
                        {Array.from({ length: 60 }).map((_stitch, index) => (
                            <Ornament key={index} size={26} color='#E0A329' opacity={0.2}/>
                        ))}
                    </Box>

                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, minHeight: 26 }}>
                        <Box sx={{ px: 1, py: 0.4, backgroundColor: '#FAF7F0', border: '1px solid rgba(40, 26, 21, 0.2)' }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#A02222' }}>
                                ВЕЗИЛКА БОТ
                            </Typography>
                        </Box>
                        <Box sx={{ px: 1, py: 0.4, backgroundColor: '#FAF7F0', border: '1px solid rgba(40, 26, 21, 0.2)' }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#281A15' }}>
                                THREADS
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#A02222',
                        color: '#FAF7F0',
                        px: { xs: 3, md: 6 },
                        py: { xs: 5, md: 7 }
                    }}
                >
                    <Box sx={{ position: 'absolute', right: -50, top: -50, pointerEvents: 'none' }}>
                        <Ornament size={280} color='#FAF7F0' opacity={0.07}/>
                    </Box>

                    <Typography variant='h3' sx={{ position: 'relative', maxWidth: 680 }}>
                        Македонски збор од Threads, зачуван засекогаш
                    </Typography>

                    <Typography sx={{ position: 'relative', mt: 2.5, maxWidth: 560, opacity: 0.9, lineHeight: 1.7 }}>
                        Ботот ги чита јавните објави, го препознава македонскиот јазик
                        и ги подготвува текстовите за донација во корпусот на Везилка.
                    </Typography>

                    <Button
                        variant='contained'
                        size='large'
                        endIcon={<ArrowForwardIcon/>}
                        onClick={() => navigate('/sessions')}
                        sx={{
                            position: 'relative',
                            mt: 4,
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                            bgcolor: '#FAF7F0',
                            color: '#A02222',
                            '&:hover': { bgcolor: '#FFFFFF' }
                        }}
                    >
                        ЗАПОЧНИ СЕСИЈА
                    </Button>
                </Box>

                <Box
                    sx={{
                        px: { xs: 3, md: 6 },
                        py: 1.5,
                        backgroundColor: '#8C1D1D',
                        borderTop: '1px dashed rgba(250, 247, 240, 0.25)'
                    }}
                >
                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#E0A329' }}>
                        ДОНИРАЈ.ВЕЗИЛКА.АИ · ОТВОРЕН МАКЕДОНСКИ КОРПУС
                    </Typography>
                </Box>
            </Paper>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress/>
                </Box>
            )}

            {!loading && (
                <Box sx={{ mt: 5 }}>
                    <SectionHeading title='Overview' subtitle='What the bot has gathered so far.'/>

                    <Paper variant='outlined' sx={{ overflow: 'hidden' }}>
                        <Box
                            sx={{
                                position: 'relative',
                                height: 34,
                                overflow: 'hidden',
                                backgroundColor: 'rgba(160, 34, 34, 0.09)',
                                borderBottom: '2px solid #A02222'
                            }}
                        >
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '7px', pointerEvents: 'none' }}>
                                {Array.from({ length: 60 }).map((_stitch, index) => (
                                    <Ornament key={index} size={26} color='#A02222' opacity={0.17}/>
                                ))}
                            </Box>
                        </Box>

                        <Grid container sx={{ py: 3, px: 1 }}>
                            {stats.map((stat, index) => {
                                let borderLeft = '1px dashed';
                                let borderColor = '#E5E0DC';

                                if (index === 0) {
                                    borderLeft = 'none';
                                    borderColor = 'transparent';
                                }

                                return (
                                    <Grid
                                        key={stat.label}
                                        size={{ xs: 6, sm: 4, md: 2 }}
                                        sx={{
                                            textAlign: 'center',
                                            py: 1.5,
                                            borderLeft: { xs: 'none', md: borderLeft },
                                            borderColor: { xs: 'transparent', md: borderColor }
                                        }}
                                    >
                                        <Typography variant='h4' sx={{ color: 'primary.main' }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: '0.09em',
                                                color: 'text.secondary',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {stat.label}
                                        </Typography>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default HomePage;