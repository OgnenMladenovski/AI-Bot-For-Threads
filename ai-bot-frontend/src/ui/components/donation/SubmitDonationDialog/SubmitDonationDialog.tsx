import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import postApi from '../../../../api/postApi.ts';
import type { CreateDonationBatchRequest } from '../../../../api/types/donation.ts';
import type { PostResponse } from '../../../../api/types/post.ts';
import useSnackbar from '../../../../hooks/useSnackbar.ts';
import Ornament from '../../common/Ornament/Ornament.tsx';

interface SubmitDonationDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: CreateDonationBatchRequest) => Promise<void>;
}

const ACCENT = '#A02222';
const THRESHOLD = 0.5;

const SubmitDonationDialog = ({ open, onClose, onCreate }: SubmitDonationDialogProps) => {
    const { showSnackbar } = useSnackbar();
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }
        const fetch = async () => {
            try {
                const response = await postApi.findAll({ donated: false }, 0, 50);
                setPosts(response.data.content);
                setSelectedIds([]);
            } catch (err) {
                showSnackbar(err instanceof Error ? err.message : 'Failed to load posts.', 'error');
            }
        };
        void fetch();
    }, [open, showSnackbar]);

    const handleToggle = (id: number) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selected) => selected !== id);
            }
            return [...prev, id];
        });
    };

    const handleSelectEligible = () => {
        const eligible: number[] = [];
        for (const post of posts) {
            if ((post.macedonianConfidence ?? 0) >= THRESHOLD) {
                eligible.push(post.id);
            }
        }
        setSelectedIds(eligible);
    };

    const handleClear = () => {
        setSelectedIds([]);
    };

    const handleSubmit = async () => {
        await onCreate({ postIds: selectedIds });
        onClose();
    };

    let eligibleCount = 0;
    for (const post of posts) {
        if (selectedIds.includes(post.id) && (post.macedonianConfidence ?? 0) >= THRESHOLD) {
            eligibleCount++;
        }
    }

    const isEmpty = posts.length === 0;
    const canCreate = selectedIds.length > 0 && eligibleCount > 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='md'
            slotProps={{ paper: { sx: { borderRadius: 0 } } }}
        >
            <Box
                sx={{
                    position: 'relative',
                    px: 2,
                    py: 1.5,
                    overflow: 'hidden',
                    backgroundColor: alpha(ACCENT, 0.16),
                    borderBottom: `3px solid ${ACCENT}`
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '7px', pointerEvents: 'none' }}>
                    {Array.from({ length: 26 }).map((_stitch, index) => (
                        <Ornament key={index} size={30} color={ACCENT} opacity={0.3}/>
                    ))}
                </Box>

                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            px: 1.25,
                            py: 0.5,
                            backgroundColor: '#FDFCFC',
                            border: '1px solid',
                            borderColor: alpha(ACCENT, 0.45)
                        }}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', color: ACCENT }}>
                            NEW DONATION BATCH
                        </Typography>
                    </Box>
                    <Button
                        onClick={onClose}
                        sx={{ minWidth: 0, p: 0.5, color: ACCENT, backgroundColor: '#FDFCFC', border: '1px solid', borderColor: alpha(ACCENT, 0.45) }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }}/>
                    </Button>
                </Box>
            </Box>

            <DialogContent sx={{ pt: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: ACCENT }}>
                        PICK THE POSTS TO DONATE
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size='small' onClick={handleSelectEligible}>Select eligible</Button>
                        <Button size='small' onClick={handleClear}>Clear</Button>
                    </Box>
                </Box>

                <Typography variant='caption' sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
                    Only posts scoring {THRESHOLD} or higher are sent to Vezilka. The rest stay in the batch but are left out of the payload.
                </Typography>

                {isEmpty && (
                    <Box sx={{ textAlign: 'center', py: 5, border: '1px dashed #E5E0DC' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <Ornament size={40} color={ACCENT} opacity={0.18}/>
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                            No undonated posts available.
                        </Typography>
                    </Box>
                )}

                {!isEmpty && posts.map((post) => {
                    const confidence = post.macedonianConfidence ?? 0;
                    const percent = Math.round(confidence * 100);
                    const selected = selectedIds.includes(post.id);

                    let rowAccent = '#A99E96';
                    if (confidence >= 0.9) {
                        rowAccent = '#8C1414';
                    }
                    else if (confidence >= 0.7) {
                        rowAccent = '#B32D22';
                    }
                    else if (confidence >= THRESHOLD) {
                        rowAccent = '#C2703A';
                    }

                    let background = 'transparent';
                    if (selected) {
                        background = alpha(rowAccent, 0.07);
                    }

                    let preview = post.content ?? '';
                    if (preview.length > 150) {
                        preview = preview.slice(0, 150) + '...';
                    }

                    return (
                        <Box
                            key={post.id}
                            onClick={() => handleToggle(post.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                px: 1,
                                py: 1.25,
                                mb: 0.5,
                                cursor: 'pointer',
                                borderLeft: `3px solid ${rowAccent}`,
                                backgroundColor: background,
                                borderBottom: '1px dashed #E5E0DC'
                            }}
                        >
                            <Checkbox checked={selected} disableRipple size='small' sx={{ p: 0.5, mt: -0.25 }}/>

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'text.primary' }}>
                                        @{post.authorHandle ?? 'unknown'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                        #{post.id}
                                    </Typography>
                                    {confidence < THRESHOLD && (
                                        <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: '#A99E96' }}>
                                            BELOW THRESHOLD
                                        </Typography>
                                    )}
                                </Box>
                                <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
                                    {preview}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, pt: 0.25 }}>
                                <Box sx={{ display: 'flex', gap: '3px' }}>
                                    {Array.from({ length: 9 }).map((_cell, index) => {
                                        let cellColor = '#FFFFFF';
                                        if (index < Math.round(confidence * 9)) {
                                            cellColor = rowAccent;
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
                                                    border: `1px solid ${rowAccent}`
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 800, color: rowAccent, minWidth: 34, textAlign: 'right' }}>
                                    {percent}%
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: '1px dashed #E5E0DC',
                    backgroundColor: '#F9F7F5',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant='caption' color='text.secondary'>
                    {selectedIds.length} selected, <Box component='span' sx={{ color: 'text.primary', fontWeight: 700 }}>{eligibleCount}</Box> will reach Vezilka
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant='contained'
                        color='primary'
                        disabled={!canCreate}
                    >
                        Create ({selectedIds.length})
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitDonationDialog;