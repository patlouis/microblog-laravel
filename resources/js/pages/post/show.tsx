import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PostCard from '@/components/post-card';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import type { Post, BreadcrumbItem, PaginatedComments } from '@/types';
import { useState } from 'react';
import CommentModal from '@/components/comment-modal';
import { formatRelativeDate, formatFullDate } from '@/lib/utils';
import { usePostFeed } from '@/hooks/use-post-feed';
import Pagination from '@/components/pagination';

interface Props {
    post: Post;
    comments: PaginatedComments;
}

export default function Show({ post: initialPost, comments }: Props) {
    const { auth } = usePage().props as any;
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    const {
        posts,
        handleLike,
        handleShare,
        handleCommentAdded,
        handleCommentUpdated,
        handleCommentDeleted
    } = usePostFeed({
        data: [initialPost],
        next_page_url: null,
        current_page: 1
    });

    const post = posts[0] || initialPost;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: route('dashboard') },
        { title: 'Post', href: route('posts.show', post.id) },
    ];

    const handleDelete = () => {
        window.location.href = route('dashboard');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${post.user.name}: "${post.content.substring(0, 30)}..."`} />

            <div className="max-w-2xl w-full mx-auto pt-4 pb-12 px-4">
                
                <div className="sticky top-0 z-10 flex items-center gap-4 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 mb-4 -mx-4 px-4 transition-all">
                    <Link 
                        href={route('dashboard')} 
                        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight">Post</h2>
                </div>

                <div className="mb-1">
                    <PostCard 
                        post={post} 
                        onCommentClick={() => setIsCommentModalOpen(true)}
                        onDelete={handleDelete}
                        onLike={handleLike}    
                        onShare={handleShare} 
                    />
                </div>

                <div className="px-4 py-3 border-b border-border/60 text-muted-foreground text-[15px]">
                    {formatFullDate(post.created_at)}
                </div>

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

                <div className="mt-2 divide-y divide-border/40">
                    {comments.data && comments.data.length > 0 ? (
                        <>
                            {comments.data.map((comment) => (
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
                            ))}

                            <div className="py-6 flex justify-center">
                                <Pagination links={comments.links} />
                            </div>
                        </>
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
                    initialComments={comments.data}
                    onClose={() => setIsCommentModalOpen(false)}
                    onCommentAdded={handleCommentAdded}
                    onCommentUpdated={handleCommentUpdated} 
                    onCommentDeleted={handleCommentDeleted}
                />
            )}
        </AppLayout>
    );
}
