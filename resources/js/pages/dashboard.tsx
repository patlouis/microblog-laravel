import { Head, router, Link, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { MessageSquare, Heart, Share2, X, MessageCircle, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('dashboard'),
    },
];

type User = { 
    id: number; 
    name: string; 
    email: string 
};

type Comment = {
    id: number;
    body: string;
    created_at: string;
    user: User;
};

type Post = {
    id: number;
    content: string;
    image_url?: string;
    created_at: string;
    user: User;
    likes_count: number;
    liked: boolean;
    comments_count: number;
    comments: Comment[];
    shared: boolean; 
    shares_count: number;
    post?: Post; 
};

type PaginatedPosts = {
    data: Post[];
    next_page_url: string | null;
};

export default function Dashboard({ posts: initialPosts }: { posts: PaginatedPosts }) {
    const { auth } = usePage().props as any;

    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);
    
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { data: commentData, setData: setCommentData, post: submitComment, processing: commentProcessing, reset: resetComment } = useForm({
        body: '',
    });

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

    const toggleLike = (postId: number) => {
        router.post(route('posts.like', postId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setAllPosts((posts) =>
                    posts.map((p) => {
                        const targetId = p.post ? p.post.id : p.id;
                        
                        if (targetId === postId) {
                             if (p.post) {
                                 return { ...p, post: { ...p.post, liked: !p.post.liked, likes_count: p.post.liked ? p.post.likes_count - 1 : p.post.likes_count + 1 } };
                             } else {
                                 return { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 };
                             }
                        }
                        return p;
                    })
                );
            },
        });
    };

    const toggleShare = (postToShare: Post) => {
        const isCurrentlyShared = postToShare.shared;
        const newCount = isCurrentlyShared ? Math.max(0, postToShare.shares_count - 1) : postToShare.shares_count + 1;

        setAllPosts((posts) => 
            posts.map(p => {
                const pContent = p.post || p;
                if (pContent.id === postToShare.id) {
                    if (p.post) {
                         return { ...p, post: { ...p.post, shared: !isCurrentlyShared, shares_count: newCount } };
                    }
                    return { ...p, shared: !isCurrentlyShared, shares_count: newCount };
                }
                return p;
            })
        );

        router.post(route('posts.share', postToShare.id), {}, {
            preserveScroll: true,
            onError: () => {
                alert("Action failed");
                window.location.reload();
            }
        });
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost) return;

        const newComment = {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            
            <div className="mx-auto max-w-xl pt-4 pb-8 px-4 sm:px-0">
                <div className="rounded-lg border bg-background p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <Link
                            href={route('posts.create')}
                            className="flex-1 rounded-full bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted cursor-pointer text-left"
                        >
                            What's on your mind, {auth.user.name.split(' ')[0]}?
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {allPosts.map((item) => {
                        const isShare = item.post !== undefined;
                        const displayPost = isShare ? item.post : item;
                        const sharer = isShare ? item.user : null;

                        if (!displayPost) {
                             return (
                                 <div key={`deleted-${item.id}`} className="rounded-lg border bg-background p-4 shadow-sm text-muted-foreground text-sm flex items-center gap-2">
                                     <AlertCircle size={16} />
                                     <span>This shared post is no longer available.</span>
                                 </div>
                             );
                        }

                        return (
                            <div key={`${isShare ? 's' : 'p'}-${item.id}`} className="rounded-lg border bg-background p-4 shadow-sm relative">
                                
                                {/* SHARE HEADER */}
                                {isShare && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2 pl-12">
                                        <Share2 size={12} className="text-green-600" />
                                        <span>{sharer?.name} shared</span>
                                    </div>
                                )}

                                {/* POST HEADER */}
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                            {displayPost.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{displayPost.user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{displayPost.user.email}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        {formatRelativeDate(displayPost.created_at)}
                                    </p>
                                </div>

                                {/* CONTENT */}
                                <p className="mb-3 text-[15px] leading-relaxed whitespace-pre-wrap">{displayPost.content}</p>

                                {displayPost.image_url && (
                                    <div className="mt-3 overflow-hidden rounded-md border">
                                        <img src={`/storage/${displayPost.image_url}`} className="w-full h-auto object-cover max-h-[500px]" alt="Content" />
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
                                    {/* Like */}
                                    <button
                                        onClick={() => toggleLike(displayPost.id)}
                                        className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer ${
                                            displayPost.liked ? 'text-rose-500' : 'hover:text-rose-500'
                                        }`}
                                    >
                                        <Heart size={18} fill={displayPost.liked ? 'currentColor' : 'none'} />
                                        <span>{displayPost.likes_count || 'Like'}</span>
                                    </button>

                                    {/* Comment */}
                                    <button 
                                        onClick={() => setSelectedPost(displayPost)}
                                        className="flex items-center gap-2 hover:text-blue-500 transition-colors px-2 py-1 cursor-pointer"
                                    >
                                        <MessageSquare size={18} />
                                        <span>{displayPost.comments_count || 'Comment'}</span>
                                    </button>

                                    {/* Share */}
                                    <button 
                                        onClick={() => toggleShare(displayPost)}
                                        className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer ${
                                            displayPost.shared ? 'text-green-600' : 'hover:text-green-600'
                                        }`}
                                    >
                                        <Share2 size={18} />
                                        <span>{displayPost.shares_count || 'Share'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="py-12 flex flex-col items-center">
                    {isLoading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                </div>
            </div>

            {/* COMMENT MODAL */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
                    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between border-b p-4 shrink-0">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Comments</h3>
                            <button onClick={() => setSelectedPost(null)} className="rounded-full p-1 hover:bg-muted transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                <div className="space-y-6 mb-6">
                                    {selectedPost.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 relative">
                                            <div className="h-10 w-10 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground z-10 ring-4 ring-background">
                                                {comment.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold">{comment.user.name}</p>
                                                    <span className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">{comment.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                                    <div className="bg-muted/50 p-4 rounded-full mb-3"><MessageCircle className="w-8 h-8 text-muted-foreground" /></div>
                                    <p className="text-sm font-medium">No comments yet</p>
                                    <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-background z-20 shrink-0">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary shrink-0 flex items-center justify-center font-bold text-primary-foreground">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <form onSubmit={handleCommentSubmit} className="flex-1">
                                    <textarea
                                        placeholder="Write a comment..."
                                        className="w-full min-h-[80px] max-h-[150px] resize-none border-none bg-transparent p-0 text-lg placeholder:text-muted-foreground/60 focus:ring-0 outline-none"
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
