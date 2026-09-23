import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import postApi from '../../../../api/postApi.ts';
import type { PostResponse } from '../../../../api/types/post.ts';
import useDonations from '../../../../hooks/useDonations.ts';
import useSnackbar from '../../../../hooks/useSnackbar.ts';

interface SubmitDonationDialogProps {
    open: boolean;
    onClose: () => void;
}

const SubmitDonationDialog = ({ open, onClose }: SubmitDonationDialogProps) => {
    const { onCreate } = useDonations();
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
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((selected) => selected !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        await onCreate({ postIds: selectedIds });
        onClose();
    };

    const isEmpty = posts.length === 0;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
            <DialogTitle>New Donation Batch</DialogTitle>
            <DialogContent>
                {isEmpty ? (
                    <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
                        No posts available for donation.
                    </Typography>
                ) : (
                    <List>
                        {posts.map((post) => (
                            <ListItem key={post.id} disablePadding>
                                <ListItemButton onClick={() => handleToggle(post.id)}>
                                    <Checkbox edge='start' checked={selectedIds.includes(post.id)} disableRipple/>
                                    <ListItemText
                                        primary={`#${post.id} — ${post.authorHandle ?? 'unknown'}`}
                                        secondary={`${(post.content ?? '').slice(0, 120)} · ${((post.macedonianConfidence ?? 0) * 100).toFixed(0)}% MK`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    color='primary'
                    disabled={selectedIds.length === 0}
                >
                    Create ({selectedIds.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitDonationDialog;