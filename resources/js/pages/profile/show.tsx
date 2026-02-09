import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useCallback } from 'react';
import { BreadcrumbItem, User, Post, PaginatedPosts, Comment } from '@/types';
import { route } from 'ziggy-js';
import { UserPlus, UserCheck, Loader2, UserMinus, FileText, Clock } from 'lucide-react';
import PostCard from '@/components/post-card';
import CommentModal from '@/components/comment-modal';

export default function ProfileShow({ 
    profileUser, 
    posts: initialPosts,
    isFollowing: initialIsFollowing 
}: { 
    profileUser: User, 
    posts: PaginatedPosts,
    isFollowing: boolean 
}) {
    const { auth } = usePage().props as any;
    
    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isHoveringFollow, setIsHoveringFollow] = useState(false); 

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const isOwnProfile = auth.user.id === profileUser.id;

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
                
                window.history.replaceState({}, '', route('profile.show', { user: profileUser.id }));
            },
            onError: () => setIsLoading(false),
        });
    };

    // --- State Sync Helpers ---

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

    // --- Action Handlers ---

    const handlePostDelete = (deletedPostId: number) => {
        setAllPosts((currentPosts) => currentPosts.filter(p => {
            const id = p.post?.id || p.id;
            return id !== deletedPostId;
        }));
        if (selectedPost?.id === deletedPostId) {
            setSelectedPost(null);
        }
    };

    const handleCommentAdded = (postId: number, newComment: Comment) => {
        updatePostInState(postId, (content) => ({
            ...content,
            comments_count: (content.comments_count || 0) + 1,
            // Ensure appended to bottom
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

    const toggleFollow = () => {
        if (isFollowLoading) return;
        
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        setIsFollowLoading(true);

        router.post(route('profile.follow', profileUser.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsFollowLoading(false),
            onError: () => {
                setIsFollowing(!newStatus);
            }
        });
    };
    
    // Sync modal with background updates
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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: route('profile.show', { user: profileUser.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profileUser.name}'s Profile`} />

            <div className="mx-auto max-w-xl w-full pt-4 pb-8 px-4 sm:px-0">
                
                <div className="rounded-xl border bg-background shadow-sm mb-8 overflow-hidden">
                    <div className="h-28 bg-primary/20 border-b" />
                    
                    <div className="px-6 pb-6">
                        <div className="relative flex justify-center">
                            <div className="absolute -top-12 h-24 w-24 rounded-full bg-primary border-[4px] border-background flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                                {profileUser.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        
                        <div className="pt-16 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{profileUser.name}</h1>
                            <p className="text-sm text-muted-foreground mb-6">{profileUser.email}</p>

                            {!isOwnProfile && (
                                <button
                                    onClick={toggleFollow}
                                    disabled={isFollowLoading}
                                    onMouseEnter={() => setIsHoveringFollow(true)}
                                    onMouseLeave={() => setIsHoveringFollow(false)}
                                    className={`
                                        inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm min-w-[150px] mb-8 cursor-pointer
                                        ${isFollowing 
                                            ? 'bg-secondary text-secondary-foreground border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50' 
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }
                                    `}
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isFollowing ? (
                                        isHoveringFollow ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserCheck className="w-4 h-4" /> Following</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4" /> Follow</>
                                    )}
                                </button>
                            )}

                            <div className="grid grid-cols-3 gap-0 border-t border-b py-4 bg-muted/5 -mx-6">
                                <div className="flex flex-col items-center justify-center border-r border-border/50">
                                    <span className="text-xl font-bold text-foreground">{profileUser.posts_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Posts</span>
                                </div>

                                <Link 
                                    href={route('profile.followers', profileUser.id)} 
                                    className="flex flex-col items-center justify-center border-r border-border/50 transition-colors cursor-pointer"
                                >
                                    <span className="text-xl font-bold text-foreground">{profileUser.followers_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Followers</span>
                                </Link>

                                <Link 
                                    href={route('profile.following', profileUser.id)} 
                                    className="flex flex-col items-center justify-center transition-colors cursor-pointer"
                                >
                                    <span className="text-xl font-bold text-foreground">{profileUser.following_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Following</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6 px-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Recent Activity
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {allPosts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onCommentClick={(targetPost) => setSelectedPost(targetPost)} 
                            onDelete={handlePostDelete}
                        />
                    ))}
                </div>

                <div className="py-8 flex justify-center">
                    {isLoading ? (
                         <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        nextPageUrl ? (
                            <span className="opacity-0">Loading...</span> 
                        ) : (
                            allPosts.length > 0 ? (
                                <span className="text-xs text-muted-foreground">No more posts to load</span>
                            ) : (
                                <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center flex flex-col items-center justify-center w-full">
                                    <div className="bg-background p-4 rounded-full mb-4 shadow-sm border border-border/50">
                                        <FileText className="w-8 h-8 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        User has not uploaded any posts yet.
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
