import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Post, PaginatedPosts, Comment } from '@/types';

export function usePostFeed(initialPosts: PaginatedPosts) {
    const [posts, setPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialPosts.current_page === 1) {
            setPosts(initialPosts.data);
            setNextPageUrl(initialPosts.next_page_url);
        }
    }, [initialPosts]);

    const loadMorePosts = useCallback(() => {
        if (!nextPageUrl || isLoading) return;
        setIsLoading(true);

        router.get(nextPageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts'],
            onSuccess: (page) => {
                const incoming = page.props.posts as PaginatedPosts;
                setPosts((prev) => [...prev, ...incoming.data]);
                setNextPageUrl(incoming.next_page_url);
                setIsLoading(false);
            },
            onError: () => setIsLoading(false),
        });
    }, [nextPageUrl, isLoading]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const currentPosition = window.innerHeight + window.scrollY;
            if (currentPosition >= scrollHeight - 400) {
                loadMorePosts();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMorePosts]);

    const updatePostInState = useCallback((postId: number, updateFn: (content: any) => any) => {
        setPosts((currentPosts) =>
            currentPosts.map((p) => {
                const content = p.post || p; 
                if (content.id === postId) {
                    const updatedContent = updateFn(content);
                    return p.post ? { ...p, post: updatedContent } : updatedContent;
                }
                return p;
            })
        );
    }, []);

    const handlePostDelete = (deletedPostId: number) => {
        setPosts((currentPosts) => currentPosts.filter(p => {
            const id = p.post?.id || p.id;
            return id !== deletedPostId;
        }));
    };

    const handleCommentAdded = (postId: number, newComment: Comment) => {
        updatePostInState(postId, (content) => {
            if (content.comments?.some((c: Comment) => c.id === newComment.id)) {
                return content;
            }
            return {
                ...content,
                comments_count: (content.comments_count || 0) + 1,
                comments: [...(content.comments || []), newComment],
            };
        });
    };

    const handleCommentUpdated = (postId: number, updatedComment: Comment) => {
        updatePostInState(postId, (content) => ({
            ...content,
            comments: (content.comments || []).map((c: Comment) => 
                c.id === updatedComment.id ? updatedComment : c
            ),
        }));
    };

    const handleCommentDeleted = (postId: number, commentId: number) => {
        updatePostInState(postId, (content) => ({
            ...content,
            comments_count: Math.max(0, (content.comments_count || 1) - 1),
            comments: (content.comments || []).filter((c: Comment) => c.id !== commentId),
        }));
    };

    return {
        posts,
        isLoading,
        nextPageUrl,
        handlePostDelete,
        handleCommentAdded,
        handleCommentUpdated,
        handleCommentDeleted
    };
}
