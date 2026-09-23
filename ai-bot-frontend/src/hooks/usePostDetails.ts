import { useCallback, useEffect, useState } from 'react';
import postApi from '../api/postApi.ts';
import type { PostResponse } from '../api/types/post.ts';
import useSnackbar from './useSnackbar.ts';

const usePostDetails = (id?: string) => {
    const { showSnackbar } = useSnackbar();
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetch = useCallback(async () => {
        if (!id) {
            return;
        }
        setLoading(true);
        try {
            const response = await postApi.findById(id);
            setPost(response.data);
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Failed to load post.', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showSnackbar]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return { post, loading };
};

export default usePostDetails;