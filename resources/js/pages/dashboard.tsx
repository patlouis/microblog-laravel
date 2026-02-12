import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { Post, BreadcrumbItem } from '@/types';
import PostCard from '@/components/post-card';
import ShareCard from '@/components/share-card';
import CommentModal from '@/components/comment-modal';
import { usePostFeed } from '@/hooks/use-post-feed';

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

    const { 
        posts: feedItems, 
        isLoading, 
        nextPageUrl,
        handlePostUpdate,
        handlePostDelete, 
        handleLike,
        handleShare,
        handleCommentAdded,
        handleCommentUpdated,
        handleCommentDeleted
    } = usePostFeed<FeedItem>(initialPosts as any);

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        if (selectedPost) {
            const foundItem = (feedItems as unknown as FeedItem[]).find(i => 
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
                    {(feedItems as unknown as FeedItem[]).map((item) => {
                        const uniqueKey = `${item.type}-${item.data.id}`;
                        if (item.type === 'share') {
                            return (
                                <ShareCard 
                                    key={uniqueKey}
                                    share={item.data}
                                    onCommentClick={(p) => setSelectedPost(p)}
                                    onDelete={handlePostDelete}
                                    onLike={handleLike}   
                                    onShare={handleShare}
                                    onSync={handlePostUpdate}
                                />
                            );
                        } else {
                            return (
                                <PostCard 
                                    key={uniqueKey}
                                    post={item.data}
                                    onCommentClick={(p) => setSelectedPost(p)}
                                    onDelete={handlePostDelete}
                                    onLike={handleLike}   
                                    onShare={handleShare}
                                />
                            );
                        }
                    })}
                </div>

                <div className="w-full flex justify-center">
                    {isLoading ? (
                        <span className="py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </span>
                    ) : (
                        nextPageUrl ? (
                            <span className="opacity-0">Scroll for more</span> 
                        ) : (
                            feedItems.length > 0 ? (
                                <span className=" py-8 text-xs text-muted-foreground font-medium">
                                    You've reached the end of the feed
                                </span>
                            ) : (
                                <div className="w-full rounded-xl border border-dashed bg-muted/20 p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                    <div className="bg-background p-4 rounded-full mb-4 shadow-sm border border-border/50">
                                        <FileText className="w-8 h-8 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                                        Create your first post or follow people to see content here.
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
