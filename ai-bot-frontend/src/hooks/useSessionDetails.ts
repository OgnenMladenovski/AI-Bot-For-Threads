import { useCallback, useEffect, useState } from 'react';
import sessionApi from '../api/sessionApi.ts';
import type { BotActionLogResponse, SessionResponse } from '../api/types/session.ts';
import useSnackbar from './useSnackbar.ts';

const useSessionDetails = (id?: string) => {
    const { showSnackbar } = useSnackbar();
    const [session, setSession] = useState<SessionResponse | null>(null);
    const [logs, setLogs] = useState<BotActionLogResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetch = useCallback(async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const sessionResponse = await sessionApi.findById(id);
            const logsResponse = await sessionApi.findLogs(id);
            setSession(sessionResponse.data);
            setLogs(logsResponse.data);
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Failed to load session details.', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showSnackbar]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    useEffect(() => {
        if (session?.status !== 'RUNNING') {
            return;
        }
        const interval = setInterval(() => void fetch(), 2000);
        return () => clearInterval(interval);
    }, [session?.status, fetch]);

    return { session, logs, loading };
};

export default useSessionDetails;