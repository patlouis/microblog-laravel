import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect, useRef } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { BreadcrumbItem, User, Post, PaginatedPosts, Comment } from '@/types';
import { route } from 'ziggy-js';
import { UserPlus, UserCheck, Loader2, UserMinus, FileText, Clock, X, MessageCircle } from 'lucide-react';
import PostCard from '@/components/post-card';

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
    const loadMoreTrigger = useRef<HTMLDivElement>(null);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isHoveringFollow, setIsHoveringFollow] = useState(false); 

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { 
        data: commentData, 
        setData: setCommentData, 
        post: submitComment, 
        processing: commentProcessing, 
        reset: resetComment 
    } = useForm({
        body: '',
    });

    const isOwnProfile = auth.user.id === profileUser.id;

    useEffect(() => {
        if (!loadMoreTrigger.current || !nextPageUrl) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && nextPageUrl) {
                loadMorePosts();
            }
        }, { threshold: 1.0 });

        observer.observe(loadMoreTrigger.current);

        return () => observer.disconnect();
    }, [nextPageUrl]);

    const loadMorePosts = () => {
        router.get(nextPageUrl!, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts'],
            onSuccess: (page) => {
                const incoming = page.props.posts as PaginatedPosts;
                setAllPosts((prev) => [...prev, ...incoming.data]);
                setNextPageUrl(incoming.next_page_url);
            },
        });
    };

    // New function to handle deletion from state
    const handlePostDelete = (deletedPostId: number) => {
        setAllPosts((currentPosts) => currentPosts.filter(post => post.id !== deletedPostId));
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

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;

        const newComment: Comment = {
            id: Date.now(), 
            body: commentData.body,
            created_at: new Date().toISOString(),
            user: auth.user,
        };

        submitComment(route('comments.store', selectedPost.id), {
            preserveScroll: true,
            onSuccess: () => {
                setAllPosts((posts) =>
                    posts.map((p) => {
                        const content = p.post || p;
                        if (content.id === selectedPost.id) {
                            const updatedContent = {
                                ...content,
                                comments_count: content.comments_count + 1,
                                comments: [...(content.comments || []), newComment],
                            };
                            return p.post ? { ...p, post: updatedContent } : updatedContent;
                        }
                        return p;
                    })
                );
                resetComment();
            },
        });
    };
    
    useEffect(() => {
        if (selectedPost) {
            const updatedWrapper = allPosts.find(p => (p.post?.id === selectedPost.id) || (p.id === selectedPost.id));
            if (updatedWrapper) {
                 const content = updatedWrapper.post || updatedWrapper;
                 setSelectedPost(content);
            }
        }
    }, [allPosts]);

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
                    <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b" />
                    
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
                                    className="flex flex-col items-center justify-center border-r border-border/50 hover:bg-muted/10 transition-colors cursor-pointer"
                                >
                                    <span className="text-xl font-bold text-foreground">{profileUser.followers_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Followers</span>
                                </Link>

                                <Link 
                                    href={route('profile.following', profileUser.id)} 
                                    className="flex flex-col items-center justify-center hover:bg-muted/10 transition-colors cursor-pointer"
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
                            onDelete={handlePostDelete} // Passed callback here
                        />
                    ))}
                </div>

                <div ref={loadMoreTrigger} className="py-8 flex justify-center">
                    {nextPageUrl ? (
                         <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                        allPosts.length > 0 ? (
                            <span className="text-xs text-muted-foreground">No more posts to load</span>
                        ) : (
                            <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center flex flex-col items-center justify-center w-full">
                                <div className="bg-background p-4 rounded-full mb-4 shadow-sm border border-border/50">
                                    <FileText className="w-8 h-8 text-muted-foreground/60" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                            </div>
                        )
                    )}
                </div>
            </div>

            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
                    
                    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between border-b p-4 shrink-0 bg-background/95 backdrop-blur z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Comments</h3>
                            <button onClick={() => setSelectedPost(null)} className="rounded-full p-1 hover:bg-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                <div className="space-y-6 mb-6">
                                    {selectedPost.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 relative">
                                            <div className="h-9 w-9 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground z-10 ring-4 ring-background">
                                                {comment.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold">{comment.user.name}</p>
                                                    <span className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                                    <div className="bg-muted/50 p-4 rounded-full mb-3">
                                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">No comments yet</p>
                                    <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-background z-20 shrink-0">
                            <div className="flex gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary shrink-0 flex items-center justify-center font-bold text-primary-foreground text-sm">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <form onSubmit={handleCommentSubmit} className="flex-1">
                                    <textarea
                                        placeholder="Write a comment..."
                                        className="w-full min-h-[44px] max-h-[120px] resize-none border border-input rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
                                        value={commentData.body}
                                        onChange={e => setCommentData('body', e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            type="submit"
                                            disabled={commentProcessing || !commentData.body.trim()} 
                                            className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50 hover:opacity-90 cursor-pointer"
                                        >
                                            {commentProcessing ? 'Posting...' : 'Reply'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
