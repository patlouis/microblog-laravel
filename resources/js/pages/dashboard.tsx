import { Head, router, Link, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { X, MessageCircle } from 'lucide-react';
import type { Post, PaginatedPosts, BreadcrumbItem, Comment } from '@/types';
import PostCard from '@/components/post-card';

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
    const { 
        data: commentData, 
        setData: setCommentData, 
        post: submitComment, 
        processing: commentProcessing, 
        reset: resetComment 
    } = useForm({
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

    const handlePostDelete = (deletedPostId: number) => {
        setAllPosts((currentPosts) => currentPosts.filter(post => post.id !== deletedPostId));
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
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onCommentClick={(targetPost) => setSelectedPost(targetPost)} 
                            onDelete={handlePostDelete}
                        />
                    ))}
                </div>

                <div className="py-12 flex flex-col items-center">
                    {isLoading && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
