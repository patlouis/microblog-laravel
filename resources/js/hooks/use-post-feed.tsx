import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Post, Comment } from '@/types';

// Generic interface for paginated responses
interface PaginatedData<T> {
    data: T[];
    next_page_url: string | null;
    current_page: number;
}

export function usePostFeed<T extends { id?: number; type?: string; data?: any }>(initialPosts: PaginatedData<T>) {
    const [posts, setPosts] = useState<T[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when the initial source changes (e.g. visiting a different profile)
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
                const incoming = page.props.posts as PaginatedData<T>;
                if (incoming && incoming.data) {
                    setPosts((prev) => [...prev, ...incoming.data]);
                    setNextPageUrl(incoming.next_page_url);
                }
                setIsLoading(false);
            },
            onError: () => setIsLoading(false),
        });
    }, [nextPageUrl, isLoading]);

    // Infinite Scroll
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

    // --- Centralized Update Logic ---

    // This Helper recursively finds the post within an item and updates it
    const updatePostInState = useCallback((postId: number, updateFn: (post: Post) => Post) => {
        setPosts((currentItems) => 
            currentItems.map((item: any) => {
                // 1. Dashboard Structure: FeedItem { type: 'post', data: Post }
                if (item.type === 'post' && item.data?.id === postId) {
                    return { ...item, data: updateFn(item.data) };
                }
                
                // 2. Dashboard Structure: FeedItem { type: 'share', data: Share { post: Post } }
                if (item.type === 'share' && item.data?.post?.id === postId) {
                    return { 
                        ...item, 
                        data: { ...item.data, post: updateFn(item.data.post) } 
                    };
                }

                // 3. Profile Structure: Post (direct)
                if (item.id === postId) {
                    return updateFn(item) as any;
                }

                // 4. Profile Structure: Post (wrapper/share)
                if (item.post?.id === postId) {
                    return { ...item, post: updateFn(item.post) };
                }

                return item;
            })
        );
    }, []);

    // Exposed: Use this for Likes, Edits, Shares
    const handlePostUpdate = useCallback((updatedPost: Post) => {
        updatePostInState(updatedPost.id, () => updatedPost);
    }, [updatePostInState]);

    // Exposed: Deletes
    const handlePostDelete = useCallback((deletedPostId: number) => {
        setPosts((currentItems) => currentItems.filter((item: any) => {
            // Check all possible locations of the ID
            if (item.type === 'post') return item.data.id !== deletedPostId;
            if (item.type === 'share') return item.data.post.id !== deletedPostId;
            if (item.post?.id) return item.post.id !== deletedPostId;
            return item.id !== deletedPostId;
        }));
    }, []);

    // Exposed: Comments
    const handleCommentAdded = (postId: number, newComment: Comment) => {
        updatePostInState(postId, (post) => {
            if (post.comments?.some((c) => c.id === newComment.id)) return post;
            return {
                ...post,
                comments_count: (post.comments_count || 0) + 1,
                comments: [...(post.comments || []), newComment]
            };
        });
    };

    const handleCommentUpdated = (postId: number, updatedComment: Comment) => {
        updatePostInState(postId, (post) => ({
            ...post,
            comments: (post.comments || []).map((c) => 
                c.id === updatedComment.id ? updatedComment : c
            )
        }));
    };

    const handleCommentDeleted = (postId: number, commentId: number) => {
        updatePostInState(postId, (post) => ({
            ...post,
            comments_count: Math.max(0, (post.comments_count || 1) - 1),
            comments: (post.comments || []).filter((c) => c.id !== commentId)
        }));
    };

    return {
        posts,
        isLoading,
        nextPageUrl,
        handlePostUpdate,
        handlePostDelete,
        handleCommentAdded,
        handleCommentUpdated,
        handleCommentDeleted
    };
}
