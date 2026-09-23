import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent, TextField } from '@mui/material';
import { useState } from 'react';
import * as React from 'react';
import useSessions from '../../../../hooks/useSessions.ts';
import type { CreateTargetRequest, TargetType } from '../../../../api/types/session.ts';

interface StartSessionDialogProps {
    open: boolean;
    onClose: () => void;
}

interface FormData {
    description: string;
    targetType: TargetType;
    targetValue: string;
}

const emptyFormData: FormData = {
    description: '',
    targetType: 'PROFILE',
    targetValue: ''
};

const targetTypes: TargetType[] = ['PROFILE', 'HASHTAG', 'KEYWORD', 'FEED_URL'];

const StartSessionDialog = ({ open, onClose }: StartSessionDialogProps) => {
    const { onCreate } = useSessions();
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [targets, setTargets] = useState<CreateTargetRequest[]>([]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddTarget = () => {
        if (formData.targetValue.trim() === '') {
            return;
        }
        setTargets((prev) => [...prev, { type: formData.targetType, value: formData.targetValue.trim() }]);
        setFormData((prev) => ({ ...prev, targetValue: '' }));
    };

    const handleRemoveTarget = (index: number) => {
        setTargets((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        await onCreate({
            socialNetwork: 'THREADS',
            description: formData.description.trim(),
            targets
        });
        setFormData(emptyFormData);
        setTargets([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
            <DialogTitle>New Extraction Session</DialogTitle>
            <DialogContent>
                <TextField
                    margin='dense'
                    label='Description'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                />

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <FormControl margin='dense' sx={{ minWidth: 150 }}>
                        <InputLabel>Target Type</InputLabel>
                        <Select
                            label='Target Type'
                            name='targetType'
                            value={formData.targetType}
                            onChange={handleChange}
                            variant='outlined'>
                            {targetTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin='dense'
                        label='Value'
                        name='targetValue'
                        value={formData.targetValue}
                        onChange={handleChange}
                        fullWidth
                    />
                    <Button onClick={handleAddTarget}>Add</Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {targets.map((target, index) => (
                        <Chip
                            key={`${target.type}-${target.value}-${index}`}
                            label={`${target.type}: ${target.value}`}
                            onDelete={() => handleRemoveTarget(index)}
                        />
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    color='primary'
                    disabled={targets.length === 0}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StartSessionDialog;