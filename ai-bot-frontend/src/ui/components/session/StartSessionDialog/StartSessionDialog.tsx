import { Box, Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import * as React from 'react';
import useSessions from '../../../../hooks/useSessions.ts';
import type { CreateTargetRequest, TargetType } from '../../../../api/types/session.ts';
import Ornament from '../../common/Ornament/Ornament.tsx';

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

const placeholders: Record<TargetType, string> = {
    PROFILE: 'midkast091',
    HASHTAG: 'македонија',
    KEYWORD: 'скопски мостови',
    FEED_URL: 'https://www.threads.com/...'
};

const ACCENT = '#A02222';

const StartSessionDialog = ({ open, onClose }: StartSessionDialogProps) => {
    const { onCreate } = useSessions();
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [targets, setTargets] = useState<CreateTargetRequest[]>([]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectType = (type: TargetType) => {
        setFormData((prev) => ({ ...prev, targetType: type }));
    };

    const handleAddTarget = () => {
        if (formData.targetValue.trim() === '') {
            return;
        }
        setTargets((prev) => [...prev, { type: formData.targetType, value: formData.targetValue.trim() }]);
        setFormData((prev) => ({ ...prev, targetValue: '' }));
    };

    const handleValueKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddTarget();
        }
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

    const stepLabel = {
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.14em',
        color: ACCENT,
        mb: 1
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='sm'
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
                    {Array.from({ length: 20 }).map((_stitch, index) => (
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
                            NEW EXTRACTION SESSION
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

            <DialogContent sx={{ pt: 3 }}>
                <Typography sx={stepLabel}>1 · NAME THIS RUN</Typography>
                <TextField
                    name='description'
                    placeholder='Profile Session'
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    size='small'
                />

                <Box sx={{ my: 3, borderTop: '1px dashed #E5E0DC' }}/>

                <Typography sx={stepLabel}>2 · POINT THE BOT SOMEWHERE</Typography>

                <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                    {targetTypes.map((type) => {
                        let background = 'transparent';
                        let color = '#816F6A';
                        let borderColor = '#E5E0DC';
                        if (type === formData.targetType) {
                            background = alpha(ACCENT, 0.12);
                            color = ACCENT;
                            borderColor = ACCENT;
                        }
                        return (
                            <Box
                                key={type}
                                onClick={() => handleSelectType(type)}
                                sx={{
                                    flexGrow: 1,
                                    textAlign: 'center',
                                    px: 1,
                                    py: 0.75,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    border: '1px solid',
                                    borderColor,
                                    backgroundColor: background,
                                    color
                                }}
                            >
                                {type}
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        name='targetValue'
                        placeholder={placeholders[formData.targetType]}
                        value={formData.targetValue}
                        onChange={handleChange}
                        onKeyDown={handleValueKeyDown}
                        fullWidth
                        size='small'
                    />
                    <Button variant='contained' onClick={handleAddTarget} sx={{ flexShrink: 0 }}>
                        Add
                    </Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                    {targets.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 3, border: '1px dashed #E5E0DC' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                <Ornament size={34} color={ACCENT} opacity={0.18}/>
                            </Box>
                            <Typography variant='body2' color='text.secondary'>
                                No targets yet. Add at least one.
                            </Typography>
                        </Box>
                    )}

                    {targets.map((target, index) => (
                        <Box
                            key={`${target.type}-${target.value}-${index}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                px: 1.25,
                                py: 0.9,
                                mb: 0.5,
                                borderLeft: `3px solid ${ACCENT}`,
                                backgroundColor: alpha(ACCENT, 0.05)
                            }}
                        >
                            <Ornament size={16} color={ACCENT} opacity={0.65}/>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: ACCENT, flexShrink: 0 }}>
                                {target.type}
                            </Typography>
                            <Typography sx={{ fontSize: 13, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {target.value}
                            </Typography>
                            <Button
                                onClick={() => handleRemoveTarget(index)}
                                sx={{ minWidth: 0, p: 0.25, color: 'text.secondary', flexShrink: 0 }}
                            >
                                <CloseIcon sx={{ fontSize: 15 }}/>
                            </Button>
                        </Box>
                    ))}
                </Box>
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
                    {targets.length} target(s)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant='contained'
                        color='primary'
                        disabled={targets.length === 0}
                    >
                        Create
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default StartSessionDialog;