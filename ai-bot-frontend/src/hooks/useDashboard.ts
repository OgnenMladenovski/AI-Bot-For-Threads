import { useCallback, useEffect, useState } from 'react';
import donationApi from '../api/donationApi.ts';
import postApi from '../api/postApi.ts';
import sessionApi from '../api/sessionApi.ts';
import type { DonationBatchResponse } from '../api/types/donation.ts';
import type { SessionResponse } from '../api/types/session.ts';
import useSnackbar from './useSnackbar.ts';

const useDashboard = (enabled: boolean) => {
    const { showSnackbar } = useSnackbar();
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [donations, setDonations] = useState<DonationBatchResponse[]>([]);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [donatedPosts, setDonatedPosts] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetch = useCallback(async () => {
        if (!enabled) {
            return;
        }
        setLoading(true);
        try {
            const sessionsResponse = await sessionApi.findAll();
            const donationsResponse = await donationApi.findAll();
            const allPostsResponse = await postApi.findAll({}, 0, 1);
            const donatedPostsResponse = await postApi.findAll({ donated: true }, 0, 1);

            setSessions(sessionsResponse.data);
            setDonations(donationsResponse.data);
            setTotalPosts(allPostsResponse.data.totalElements);
            setDonatedPosts(donatedPostsResponse.data.totalElements);
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Failed to load dashboard.', 'error');
        } finally {
            setLoading(false);
        }
    }, [enabled, showSnackbar]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return { sessions, donations, totalPosts, donatedPosts, loading };
};

export default useDashboard;