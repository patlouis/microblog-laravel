import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PostCard from '@/components/post-card';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import type { Post, BreadcrumbItem, Comment } from '@/types';
import { useState } from 'react';
import CommentModal from '@/components/comment-modal';
import { formatRelativeDate, formatFullDate } from '@/lib/utils';

export default function Show({ post: initialPost }: { post: Post }) {
    const { auth } = usePage().props as any;
    
    const [post, setPost] = useState(initialPost);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Post', href: route('posts.show', post.id) },
    ];

    const handleCommentAdded = (postId: number, newComment: Comment) => {
        setPost(prev => ({
            ...prev,
            comments_count: prev.comments_count + 1,
            // Adds new comment to the BOTTOM of the list
            comments: [...(prev.comments || []), newComment] 
        }));
    };

    const handleSyncPost = (updatedPost: Post) => {
        setPost(updatedPost);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${post.user.name}: "${post.content.substring(0, 30)}..."`} />

            {/* LAYOUT FIX: Added w-full and px-4 here. Removed inner margins. */}
            <div className="max-w-2xl w-full mx-auto pt-4 pb-12 px-4">
                
                {/* Header: Negative margin allows hover effect to touch edges while keeping icon aligned */}
                <div className="sticky top-0 z-10 flex items-center gap-4 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 mb-4 -mx-4 px-4 transition-all">
                    <Link 
                        href={route('dashboard')} 
                        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Post</h2>
                </div>

                {/* POST CARD: No extra padding needed, parent handles it */}
                <div className="mb-1">
                    <PostCard 
                        post={post} 
                        onCommentClick={() => setIsCommentModalOpen(true)}
                        onDelete={() => window.location.href = route('dashboard')}
                        onSync={handleSyncPost} 
                    />
                </div>

                {/* TIMESTAMP: px-4 aligns text with PostCard's internal text */}
                <div className="px-4 py-3 border-b border-border/60 text-muted-foreground text-[15px]">
                    {formatFullDate(post.created_at)}
                </div>

                {/* STATS BAR: whitespace-nowrap prevents shrinking on small screens */}
                <div className="flex gap-6 px-4 py-4 border-b border-border/60 text-sm overflow-x-auto no-scrollbar">
                    <span className="cursor-default whitespace-nowrap shrink-0">
                        <strong className="text-foreground">{post.likes_count}</strong> 
                        <span className="text-muted-foreground ml-1">Likes</span>
                    </span>
                    <span className="cursor-default whitespace-nowrap shrink-0">
                        <strong className="text-foreground">{post.comments_count}</strong> 
                        <span className="text-muted-foreground ml-1">Comments</span>
                    </span>
                    <span className="cursor-default whitespace-nowrap shrink-0">
                        <strong className="text-foreground">{post.shares_count}</strong> 
                        <span className="text-muted-foreground ml-1">Shares</span>
                    </span>
                </div>

                {/* QUICK REPLY TRIGGER */}
                <div 
                    className="flex gap-3 px-4 py-4 border-b border-border/60 items-center group cursor-pointer" 
                    onClick={() => setIsCommentModalOpen(true)}
                >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-border/50">
                        {auth.user.name[0].toUpperCase()}
                    </div>
                    <div className="text-muted-foreground text-[17px] group-hover:text-muted-foreground/80 transition-colors truncate">
                        Post your reply
                    </div>
                </div>

                {/* COMMENTS LIST */}
                <div className="mt-2 divide-y divide-border/40">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <div key={comment.id} className="py-4 px-4 flex gap-3 group transition-colors hover:bg-muted/30 -mx-4 rounded-lg">
                                <Link href={route('profile.show', comment.user.id)} className="shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border border-border/50">
                                        {comment.user.name[0].toUpperCase()}
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Link href={route('profile.show', comment.user.id)} className="font-bold text-sm hover:underline truncate shrink-0">
                                            {comment.user.name}
                                        </Link>
                                        <span className="text-muted-foreground text-xs shrink-0">·</span>
                                        <span className="text-muted-foreground text-xs shrink-0">
                                            {formatRelativeDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-[15px] leading-normal text-foreground/90 whitespace-pre-wrap break-words">
                                        {comment.body}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/60">
                            <MessageCircle size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No comments yet</p>
                            <p className="text-sm">Be the first to reply!</p>
                        </div>
                    )}
                </div>
            </div>

            {isCommentModalOpen && (
                <CommentModal 
                    post={post}
                    onClose={() => setIsCommentModalOpen(false)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </AppLayout>
    );
}
