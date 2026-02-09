import { Head, router, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { Post, PaginatedPosts, BreadcrumbItem, Comment } from '@/types';
import PostCard from '@/components/post-card';
import CommentModal from '@/components/comment-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('dashboard'),
    },
];

export default function Dashboard({ posts: initialPosts }: { posts: PaginatedPosts }) {
    const { auth } = usePage().props as any;

    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const currentPosition = window.innerHeight + window.scrollY;
            if (currentPosition >= scrollHeight - 400 && nextPageUrl && !isLoading) {
                loadMorePosts();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [nextPageUrl, isLoading]);

    const loadMorePosts = () => {
        if (!nextPageUrl || isLoading) return;
        setIsLoading(true);

        router.get(nextPageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts'],
            onSuccess: (page) => {
                const incoming = page.props.posts as PaginatedPosts;
                setAllPosts((prev) => [...prev, ...incoming.data]);
                setNextPageUrl(incoming.next_page_url);
                setIsLoading(false);
                window.history.replaceState({}, '', route('dashboard'));
            },
            onError: () => setIsLoading(false),
        });
    };

    const updatePostInState = useCallback((postId: number, updateFn: (content: any) => any) => {
        setAllPosts((currentPosts) =>
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
        setAllPosts((currentPosts) => currentPosts.filter(p => {
            const id = p.post?.id || p.id;
            return id !== deletedPostId;
        }));
        if (selectedPost?.id === deletedPostId) setSelectedPost(null);
    };

    const handleCommentAdded = (postId: number, newComment: Comment) => {
        updatePostInState(postId, (content) => ({
            ...content,
            comments_count: (content.comments_count || 0) + 1,
            // FIXED: Spread existing comments FIRST, then add new one at the end
            comments: [...(content.comments || []), newComment], 
        }));
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

    useEffect(() => {
        if (selectedPost) {
            const updatedWrapper = allPosts.find(p => (p.post?.id === selectedPost.id) || (p.id === selectedPost.id));
            if (updatedWrapper) {
                 const content = updatedWrapper.post || updatedWrapper;
                 if (JSON.stringify(content) !== JSON.stringify(selectedPost)) {
                    setSelectedPost(content);
                 }
            }
        }
    }, [allPosts, selectedPost]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            
            <div className="mx-auto max-w-xl pt-4 pb-8 px-4 sm:px-0 flex flex-col items-center w-full">
                <div className="w-full rounded-lg border bg-background p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <Link
                            href={route('posts.create')}
                            className="flex-1 rounded-full bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer text-left"
                        >
                            What's on your mind, {auth.user.name.split(' ')[0]}?
                        </Link>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    {allPosts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onCommentClick={(targetPost) => setSelectedPost(targetPost)} 
                            onDelete={handlePostDelete}
                        />
                    ))}
                </div>

                <div className={`${allPosts.length > 0 ? 'py-8' : 'pt-0'} w-full flex justify-center`}>
                    {isLoading ? (
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                        nextPageUrl ? (
                            <span className="opacity-0">Scroll for more</span> 
                        ) : (
                            allPosts.length > 0 ? (
                                <span className="text-xs text-muted-foreground font-medium">
                                    You've reached the end of the feed
                                </span>
                            ) : (
                                <div className="w-full rounded-xl border border-dashed bg-muted/20 p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                    <div className="bg-background p-4 rounded-full mb-4 shadow-sm border border-border/50">
                                        <FileText className="w-8 h-8 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                                        Create your first post or follow people to see what's happening.
                                    </p>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>

            {selectedPost && (
                <CommentModal 
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onCommentAdded={handleCommentAdded}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentDeleted={handleCommentDeleted}
                />
            )}
        </AppLayout>
    );
}
