import { Box, Button, Chip, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router';
import type { PostResponse } from '../../../../api/types/post.ts';
import WovenCard from '../../common/WovenCard/WovenCard.tsx';

interface PostCardProps {
    post: PostResponse;
    onDelete: (id: number) => Promise<void>;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
    const navigate = useNavigate();
    const confidence = post.macedonianConfidence ?? 0;
    const percent = Math.round(confidence * 100);
    const content = post.content ?? '';

    let preview = content;
    if (content.length > 220) {
        preview = content.slice(0, 220) + '…';
    }

    let accent = '#A99E96';
    if (confidence >= 0.9) {
        accent = '#8C1414';
    }
    else if (confidence >= 0.7) {
        accent = '#B32D22';
    }
    else if (confidence >= 0.5) {
        accent = '#C2703A';
    }

    let batchLabel = 'Not donated';
    let batchColor: 'default' | 'success' = 'default';
    if (post.donationBatchId !== null) {
        batchLabel = `Batch #${post.donationBatchId}`;
        batchColor = 'success';
    }

    return (
        <WovenCard
            accent={accent}
            eyebrow={
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{post.authorHandle ?? 'unknown'}
                </Typography>
            }
            badge={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', gap: '3px' }}>
                        {Array.from({ length: 9 }).map((_cell, index) => {
                            let cellColor = '#FFFFFF';
                            if (index < Math.round(confidence * 9)) {
                                cellColor = accent;
                            }
                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '1px',
                                        transform: 'rotate(45deg)',
                                        backgroundColor: cellColor,
                                        border: `1px solid ${accent}`
                                    }}
                                />
                            );
                        })}
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: accent, minWidth: 32, textAlign: 'right' }}>
                        {percent}%
                    </Typography>
                </Box>
            }
            actions={
                <>
                    <Button size='small' startIcon={<InfoIcon/>} onClick={() => navigate(`/posts/${post.id}`)}>
                        Info
                    </Button>
                    <Button size='small' startIcon={<DeleteIcon/>} color='error' onClick={() => void onDelete(post.id)}>
                        Delete
                    </Button>
                </>
            }
        >
            <Typography
                sx={{
                    flexGrow: 1,
                    pl: 1.75,
                    borderLeft: `2px solid ${accent}33`,
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line'
                }}
            >
                {preview}
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2, pt: 1.5, borderTop: '1px dashed #E5E0DC' }}>
                {post.mediaItems.length > 0 && (
                    <Chip label={`${post.mediaItems.length} media`} size='small' variant='outlined'/>
                )}
                <Chip label={batchLabel} size='small' color={batchColor}/>
            </Box>
        </WovenCard>
    );
};

export default PostCard;