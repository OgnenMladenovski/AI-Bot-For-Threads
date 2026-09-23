import { Box, FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent, Slider, TextField, Typography } from '@mui/material';
import { useEffect, useState, type SyntheticEvent } from 'react';
import type { PostFilter } from '../../../../api/types/post.ts';
import useSessions from '../../../../hooks/useSessions.ts';

interface PostFiltersProps {
    filter: PostFilter;
    onChange: (filter: PostFilter) => void;
}

const PostFilters = ({ filter, onChange }: PostFiltersProps) => {
    const { sessions } = useSessions();
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange({ ...filter, search: search.trim() === '' ? undefined : search.trim() });
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleSessionChange = (event: SelectChangeEvent) => {
        const { value } = event.target;
        onChange({ ...filter, sessionId: value === '' ? undefined : Number(value) });
    };

    const handleDonatedChange = (event: SelectChangeEvent) => {
        const { value } = event.target;
        onChange({ ...filter, donated: value === '' ? undefined : value === 'true' });
    };

    const handleConfidenceChange = (_event: Event | SyntheticEvent, value: number | number[]) => {
        const confidence = value as number;
        onChange({ ...filter, minMacedonianConfidence: confidence === 0 ? undefined : confidence });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Session</InputLabel>
                <Select
                    label='Session'
                    value={filter.sessionId?.toString() ?? ''}
                    onChange={handleSessionChange}
                    variant='outlined'>
                    <MenuItem value=''>All</MenuItem>
                    {sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                            #{session.id} — {session.socialNetwork}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Donated</InputLabel>
                <Select
                    label='Donated'
                    value={filter.donated === undefined ? '' : String(filter.donated)}
                    onChange={handleDonatedChange}
                    variant='outlined'>
                    <MenuItem value=''>All</MenuItem>
                    <MenuItem value='true'>Donated</MenuItem>
                    <MenuItem value='false'>Not donated</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ width: 200 }}>
                <Typography variant='body2' color='text.secondary'>
                    Min. Macedonian: {filter.minMacedonianConfidence ?? 0}
                </Typography>
                <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={filter.minMacedonianConfidence ?? 0}
                    onChangeCommitted={handleConfidenceChange}
                    valueLabelDisplay='auto'
                />
            </Box>

            <TextField
                label='Search'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ minWidth: 200 }}
            />
        </Box>
    );
};

export default PostFilters;