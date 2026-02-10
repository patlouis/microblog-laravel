import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { Post, BreadcrumbItem, Comment } from '@/types';
import PostCard from '@/components/post-card';
import ShareCard from '@/components/share-card';
import CommentModal from '@/components/comment-modal';

// Define the mixed feed structure
interface FeedItem {
    type: 'post' | 'share';
    sort_date: string;
    data: any;
}

interface PaginatedFeed {
    data: FeedItem[];
    next_page_url: string | null;
    current_page: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('dashboard') },
];

export default function Dashboard({ posts: initialPosts }: { posts: PaginatedFeed }) {
    const { auth } = usePage().props as any;

    // Local state for the mixed feed
    const [feedItems, setFeedItems] = useState<FeedItem[]>(initialPosts.data || []);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // --- Infinite Scroll ---
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
                const incoming = page.props.posts as any;
                
                let newItems = [];
                if (incoming && Array.isArray(incoming.data)) {
                    newItems = incoming.data;
                }

                setFeedItems((prev) => [...prev, ...newItems]);
                setNextPageUrl(incoming.next_page_url || null);
                setIsLoading(false);
            },
            onError: () => setIsLoading(false),
        });
    };

    // --- Sync Logic ---
    const handleSync = (updatedPost: Post) => {
        setFeedItems((currentItems) => 
            currentItems.map((item) => {
                if (item.type === 'post' && item.data.id === updatedPost.id) {
                    return { ...item, data: updatedPost };
                }
                if (item.type === 'share' && item.data.post.id === updatedPost.id) {
                    return { ...item, data: { ...item.data, post: updatedPost } };
                }
                return item;
            })
        );
    };

    const handlePostDelete = (id: number) => {
        setFeedItems(prev => prev.filter(item => {
             if (item.type === 'post') return item.data.id !== id;
             if (item.type === 'share') return item.data.post.id !== id;
             return true;
        }));
        if (selectedPost?.id === id) setSelectedPost(null);
    };

    const handleCommentAdded = (postId: number, newComment: Comment) => {
         const targetItem = feedItems.find(i => 
             (i.type === 'post' && i.data.id === postId) || 
             (i.type === 'share' && i.data.post.id === postId)
         );

         if (targetItem) {
            const currentPost = targetItem.type === 'post' ? targetItem.data : targetItem.data.post;
            const updatedPost = {
                ...currentPost,
                comments_count: (currentPost.comments_count || 0) + 1,
                comments: [...(currentPost.comments || []), newComment]
            };
            handleSync(updatedPost);
         }
    };

    // Keep modal synced
    useEffect(() => {
        if (selectedPost) {
            const foundItem = feedItems.find(i => 
                (i.type === 'post' && i.data.id === selectedPost.id) || 
                (i.type === 'share' && i.data.post.id === selectedPost.id)
            );
            
            if (foundItem) {
                 const content = foundItem.type === 'post' ? foundItem.data : foundItem.data.post;
                 if (JSON.stringify(content) !== JSON.stringify(selectedPost)) {
                     setSelectedPost(content);
                 }
            }
        }
    }, [feedItems, selectedPost]);

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
                    {feedItems.map((item) => {
                        const uniqueKey = `${item.type}-${item.data.id}`;
                        
                        if (item.type === 'share') {
                            return (
                                <ShareCard 
                                    key={uniqueKey}
                                    share={item.data}
                                    onCommentClick={(p) => setSelectedPost(p)}
                                    onDelete={handlePostDelete}
                                    onSync={handleSync}
                                />
                            );
                        } else {
                            return (
                                <PostCard 
                                    key={uniqueKey}
                                    post={item.data}
                                    onCommentClick={(p) => setSelectedPost(p)}
                                    onDelete={handlePostDelete}
                                    onSync={handleSync}
                                />
                            );
                        }
                    })}
                </div>

                {/* Loading / Empty States */}
                <div className="py-8 w-full flex justify-center">
                    {isLoading ? (
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                        nextPageUrl ? (
                            <span className="opacity-0">Scroll for more</span> 
                        ) : (
                            feedItems.length > 0 ? (
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
                />
            )}
        </AppLayout>
    );
}
