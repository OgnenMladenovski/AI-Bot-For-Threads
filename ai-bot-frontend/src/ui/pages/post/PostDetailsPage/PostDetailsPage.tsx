import { Box, Chip, CircularProgress, Divider, Link, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import usePostDetails from '../../../../hooks/usePostDetails.ts';

const formatTimestamp = (value: string | null) =>
    value === null ? '—' : new Date(value).toLocaleString();

const PostDetailsPage = () => {
    const { id } = useParams();
    const { post } = usePostDetails(id);

    if (!post) {
        return <Box className='progress-box'><CircularProgress/></Box>;
    }

    const confidence = post.macedonianConfidence ?? 0;

    return (
        <Box>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4 }}>
                <Stack direction='row' spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                    <Typography variant='h5'>Post #{post.id}</Typography>
                    <Chip label={post.socialNetwork} size='small'/>
                    <Chip
                        label={post.donationBatchId === null ? 'Not donated' : `Batch #${post.donationBatchId}`}
                        size='small'
                        color={post.donationBatchId === null ? 'default' : 'success'}
                    />
                </Stack>

                <Typography variant='subtitle1'>{post.authorHandle ?? 'unknown author'}</Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                    Posted: {formatTimestamp(post.postedAt)} · Session #{post.sessionId}
                </Typography>

                <Divider sx={{ my: 2 }}/>

                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.content ?? 'No content.'}</Typography>

                <Divider sx={{ my: 2 }}/>

                <Typography variant='body2' color='text.secondary'>
                    Macedonian confidence: {(confidence * 100).toFixed(0)}%
                </Typography>
                <LinearProgress variant='determinate' value={confidence * 100} sx={{ mb: 2 }}/>

                {post.sourceUrl && (
                    <Typography variant='body2' gutterBottom>
                        Source: <Link href={post.sourceUrl} target='_blank' rel='noopener noreferrer'>{post.sourceUrl}</Link>
                    </Typography>
                )}

                {post.mediaItems.length > 0 && (
                    <>
                        <Typography variant='h6' sx={{ mt: 3, mb: 1 }}>Media</Typography>
                        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
                            {post.mediaItems.map((media) => (
                                media.type === 'IMAGE'
                                    ? <Box
                                        key={media.id}
                                        component='img'
                                        src={media.sourceUrl}
                                        alt={`media-${media.id}`}
                                        sx={{ width: 200, borderRadius: 2 }}
                                    />
                                    : <Box
                                        key={media.id}
                                        component='video'
                                        src={media.sourceUrl}
                                        controls
                                        sx={{ width: 300, borderRadius: 2 }}
                                    />
                            ))}
                        </Stack>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default PostDetailsPage;