import { Box, Button, Card, CardActions, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import type { PostResponse } from '../../../../api/types/post.ts';

interface PostCardProps {
    post: PostResponse;
    onDelete: (id: number) => Promise<void>;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
    const navigate = useNavigate();
    const confidence = post.macedonianConfidence ?? 0;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant='subtitle2'>{post.authorHandle ?? 'unknown author'}</Typography>
                <Typography variant='body2' sx={{ flexGrow: 1 }}>
                    {(post.content ?? '').slice(0, 200)}{(post.content ?? '').length > 200 ? '…' : ''}
                </Typography>

                <Box>
                    <Typography variant='caption' color='text.secondary'>
                        Macedonian: {(confidence * 100).toFixed(0)}%
                    </Typography>
                    <LinearProgress variant='determinate' value={confidence * 100}/>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {post.mediaItems.length > 0 && (
                        <Chip label={`${post.mediaItems.length} media`} size='small' variant='outlined'/>
                    )}
                    <Chip
                        label={post.donationBatchId === null ? 'Not donated' : `Batch #${post.donationBatchId}`}
                        size='small'
                        color={post.donationBatchId === null ? 'default' : 'success'}
                    />
                </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button startIcon={<InfoIcon/>} onClick={() => navigate(`/posts/${post.id}`)}>
                    Info
                </Button>
                <Button startIcon={<DeleteIcon/>} color='error' onClick={() => void onDelete(post.id)}>
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
};

export default PostCard;