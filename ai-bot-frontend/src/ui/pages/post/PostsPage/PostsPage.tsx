import { Box, CircularProgress, Pagination } from '@mui/material';
import { useState } from 'react';
import type { PostFilter } from '../../../../api/types/post.ts';
import usePosts from '../../../../hooks/usePosts.ts';
import PostFilters from '../../../components/post/PostFilters/PostFilters.tsx';
import PostGrid from '../../../components/post/PostGrid/PostGrid.tsx';
import SectionHeading from '../../../components/common/SectionHeading/SectionHeading.tsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.tsx';

const PostsPage = () => {
    const [filter, setFilter] = useState<PostFilter>({});
    const [page, setPage] = useState<number>(0);

    const { posts, loading, onDelete } = usePosts(filter, page, 12);

    const handleFilterChange = (next: PostFilter) => {
        setFilter(next);
        setPage(0);
    };

    return (
        <Box>
            <SectionHeading title='Extracted Posts' subtitle='Everything the bot collected, with its Macedonian confidence score.'/>
            <PostFilters filter={filter} onChange={handleFilterChange}/>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress/>
                </Box>
            )}
            {!loading && (!posts || posts.content.length === 0) && (
                <EmptyState
                    title='No extracted posts yet'
                    description='Run an extraction session first, then come back here to review what the bot found.'
                />
            )}
            {!loading && posts && (
                <>
                    <PostGrid posts={posts.content} onDelete={onDelete}/>
                    {posts.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={posts.totalPages}
                                page={page + 1}
                                onChange={(_event, value) => setPage(value - 1)}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default PostsPage;