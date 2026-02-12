import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Post, Comment } from '@/types';
import { route } from 'ziggy-js';

interface PaginatedData<T> {
    data: T[];
    next_page_url: string | null;
    current_page: number;
}

export function usePostFeed<T extends { id?: number; type?: string; data?: any }>(initialPosts: PaginatedData<T>) {
    const [posts, setPosts] = useState<T[]>(initialPosts.data);
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
                const incoming = page.props.posts as PaginatedData<T>;
                if (incoming && incoming.data) {
                    setPosts((prev) => [...prev, ...incoming.data]);
                    setNextPageUrl(incoming.next_page_url);
                    window.history.replaceState({}, '', window.location.pathname);
                }
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

    const updatePostInState = useCallback((postId: number, updateFn: (post: Post) => Post) => {
        setPosts((currentItems) => 
            currentItems.map((item: any) => {
                if (item.type === 'post' && item.data?.id === postId) {
                    return { ...item, data: updateFn(item.data) };
                }
                
                if (item.type === 'share' && item.data?.post?.id === postId) {
                    return { 
                        ...item, 
                        data: { ...item.data, post: updateFn(item.data.post) } 
                    };
                }

                if (item.id === postId && !item.type) {
                    return updateFn(item) as any;
                }

                if (item.post?.id === postId) {
                    return { ...item, post: updateFn(item.post) };
                }

                return item;
            })
        );
    }, []);

    const handlePostUpdate = useCallback((updatedPost: Post) => {
        updatePostInState(updatedPost.id, () => updatedPost);
    }, [updatePostInState]);

    const handlePostDelete = useCallback((deletedPostId: number) => {
        setPosts((currentItems) => currentItems.filter((item: any) => {
            if (item.type === 'post') {
                return item.data?.id !== deletedPostId;
            }

            if (item.type === 'share') {
                return item.data?.post?.id !== deletedPostId;
            }

            if (item.post?.id) {
                return item.post.id !== deletedPostId;
            }

            return item.id !== deletedPostId;
        }));
    }, []);

    const handleLike = useCallback((post: Post) => {
        const originalPost = post;
        
        updatePostInState(post.id, (p) => ({ 
            ...p, 
            liked: !p.liked, 
            likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 
        }));

        router.post(route('posts.like', post.id), {}, { 
            preserveScroll: true, 
            onError: () => updatePostInState(post.id, () => originalPost)
        });
    }, [updatePostInState]);

    const handleShare = useCallback((post: Post) => {
        const originalPost = post;

        updatePostInState(post.id, (p) => ({ 
            ...p, 
            shared: !p.shared, 
            shares_count: p.shared ? p.shares_count - 1 : p.shares_count + 1 
        }));

        router.post(route('posts.share', post.id), {}, {
            preserveScroll: true,
            onError: () => updatePostInState(post.id, () => originalPost)
        });
    }, [updatePostInState]);

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
        handleLike,
        handleShare,
        handleCommentAdded,
        handleCommentUpdated,
        handleCommentDeleted
    };
}
