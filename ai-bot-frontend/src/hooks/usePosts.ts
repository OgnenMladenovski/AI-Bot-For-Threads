import { useCallback, useEffect, useState } from 'react';
import postApi from '../api/postApi.ts';
import type { PageResponse, PostFilter, PostResponse } from '../api/types/post.ts';
import useSnackbar from './useSnackbar.ts';

const usePosts = (filter: PostFilter, page: number, size: number) => {
    const { showSnackbar } = useSnackbar();
    const [posts, setPosts] = useState<PageResponse<PostResponse> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const response = await postApi.findAll(filter, page, size);
            setPosts(response.data);
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Failed to load posts.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, page, size, showSnackbar]);

    const onDelete = useCallback(async (id: number) => {
        try {
            await postApi.delete(id.toString());
            await fetch();
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Failed to delete post.', 'error');
        }
    }, [fetch, showSnackbar]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return { posts, loading, onDelete };
};

export default usePosts;