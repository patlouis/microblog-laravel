import { Head, router, Link, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { MessageSquare, Heart, Share2, X, MessageCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('dashboard'),
    },
];

type User = { id: number; name: string; email: string };

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
    const { data, setData, post: submitComment, processing, reset, errors } = useForm({
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
                    posts.map((p) =>
                        p.id === postId
                            ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
                            : p
                    )
                );
            },
        });
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedPost) return;

            const newComment = {
                id: Date.now(), 
                body: data.body,
                created_at: new Date().toISOString(),
                user: auth.user,
            };

            submitComment(route('comments.store', selectedPost.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setAllPosts((posts) =>
                        posts.map((p) =>
                            p.id === selectedPost.id
                                ? {
                                    ...p,
                                    comments_count: p.comments_count + 1,
                                    comments: [...(p.comments || []), newComment],
                                }
                                : p
                        )
                    );
                    reset();
                },
            });
        };
    
    useEffect(() => {
        if (selectedPost) {
            const updatedPost = allPosts.find(p => p.id === selectedPost.id);
            if (updatedPost) setSelectedPost(updatedPost);
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
                    {allPosts.map((post) => (
                        <div key={post.id} className="rounded-lg border bg-background p-4 shadow-sm">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{post.user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{post.user.email}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    {formatRelativeDate(post.created_at)}
                                </p>
                            </div>

                            <p className="mb-3 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>

                            {post.image_url && (
                                <div className="mt-3 overflow-hidden rounded-md border">
                                    <img src={`/storage/${post.image_url}`} className="w-full h-auto object-cover max-h-[500px]" alt="Content" />
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
                                <button
                                    onClick={() => toggleLike(post.id)}
                                    className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer ${post.liked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                >
                                    <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                                    <span>{post.likes_count || 'Like'}</span>
                                </button>

                                <button 
                                    onClick={() => setSelectedPost(post)}
                                    className="flex items-center gap-2 hover:text-blue-500 transition-colors px-2 py-1 cursor-pointer"
                                >
                                    <MessageSquare size={18} />
                                    <span>{post.comments_count || 'Comment'}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-green-500 transition-colors px-2 py-1 cursor-pointer">
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="py-12 flex flex-col items-center">
                    {isLoading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                </div>
            </div>

            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setSelectedPost(null)}
                    />
                    
                    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between border-b p-4 shrink-0">
                            <h3 className="text-sm font-bold uppercase tracking-widest">
                                Comments
                            </h3>
                            <button 
                                onClick={() => setSelectedPost(null)}
                                className="rounded-full p-1 hover:bg-muted transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                <div className="space-y-6 mb-6">
                                    {selectedPost.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 relative">
                                             <div className="absolute left-[19px] top-10 -bottom-6 w-0.5 bg-muted/30" />

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
                                <div className="h-10 w-10 rounded-full bg-primary shrink-0 flex items-center justify-center font-bold text-primary-foreground">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <form onSubmit={handleCommentSubmit} className="flex-1">
                                    <textarea
                                        placeholder={selectedPost.comments && selectedPost.comments.length > 0 ? "Post your reply" : "Write a comment..."}
                                        className="w-full min-h-[80px] max-h-[150px] resize-none border-none bg-transparent p-0 text-lg placeholder:text-muted-foreground/60 focus:ring-0 outline-none"
                                        value={data.body}
                                        onChange={e => setData('body', e.target.value)}
                                        autoFocus
                                    />
                                    {errors.body && <p className="text-xs text-rose-500 mb-2">{errors.body}</p>}
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            type="submit"
                                            disabled={processing || !data.body.trim()} 
                                            className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50 hover:opacity-90 cursor-pointer"
                                        >
                                            {processing ? 'Posting...' : 'Reply'}
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
