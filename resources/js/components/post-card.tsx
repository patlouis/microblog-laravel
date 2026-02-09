import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, MessageSquare, Repeat2, MoreHorizontal, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { route } from 'ziggy-js';
import type { Post } from '@/types';

interface Props {
    post: Post;
    onCommentClick: (post: Post) => void;
    onDelete: (id: number) => void;
}

export default function PostCard({ post: initialPost, onCommentClick, onDelete }: Props) {
    const { auth } = usePage().props as any;
    const [post, setPost] = useState<Post>(initialPost);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isShare = post.post !== undefined;
    const displayPost = isShare ? post.post : post;
    const sharer = isShare ? post.user : null;
    const isOwner = auth.user.id === post.user.id;

    if (!displayPost) {
        return (
            <div className="rounded-lg border bg-background p-4 shadow-sm text-muted-foreground text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>This shared post is no longer available.</span>
            </div>
        );
    }

    const toggleLike = () => {
        const newLiked = !displayPost.liked;
        const newCount = newLiked ? displayPost.likes_count + 1 : displayPost.likes_count - 1;

        const updatedDisplay = { ...displayPost, liked: newLiked, likes_count: newCount };
        const updatedPost = isShare ? { ...post, post: updatedDisplay } : updatedDisplay as Post;
        
        setPost(updatedPost);

        router.post(route('posts.like', displayPost.id), {}, { 
            preserveScroll: true,
            onError: () => setPost(initialPost) 
        });
    };

    const toggleShare = () => {
        const isCurrentlyShared = displayPost.shared;
        const newCount = isCurrentlyShared ? Math.max(0, displayPost.shares_count - 1) : displayPost.shares_count + 1;

        const updatedDisplay = { ...displayPost, shared: !isCurrentlyShared, shares_count: newCount };
        const updatedPost = isShare ? { ...post, post: updatedDisplay } : updatedDisplay as Post;

        setPost(updatedPost);

        router.post(route('posts.share', displayPost.id), {}, {
            preserveScroll: true,
            onError: () => {
                setPost(initialPost);
                alert("Action failed");
            }
        });
    };

    const handleEdit = () => {
        setShowMenu(false);
        router.get(route('posts.edit', post.id));
    };

    const handleDelete = () => {
        setShowMenu(false);
        if (confirm('Are you sure you want to delete this?')) {
            router.delete(route('posts.destroy', post.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onDelete(post.id);
                }
            });
        }
    };

    return (
        <div className="rounded-lg border bg-background p-4 shadow-sm relative transition-all hover:shadow-md">
            
            {isShare && (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2 pl-12">
                    <Repeat2 size={12} className="text-green-600" />
                    <span>{sharer?.name} shared</span>
                </div>
            )}

            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('profile.show', displayPost.user.id)}>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 border border-transparent hover:border-muted-foreground/20 transition-colors">
                            {displayPost.user.name.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                    <div className="min-w-0">
                        <Link href={route('profile.show', displayPost.user.id)} className="text-sm font-semibold truncate hover:underline">
                            {displayPost.user.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <p className="truncate max-w-[150px]">{displayPost.user.email}</p>
                            <span className="text-[10px]">•</span>
                            <p className="shrink-0">{formatRelativeDate(displayPost.created_at)}</p>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-muted-foreground hover:bg-muted p-1.5 rounded-full transition-colors -mr-2 cursor-pointer"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-8 z-20 w-32 rounded-md border bg-background shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                    onClick={handleEdit}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted text-left transition-colors cursor-pointer"
                                >
                                    <Pencil size={14} />
                                    Edit
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 text-left transition-colors cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {!isOwner && (
                    <button className="text-muted-foreground/50 cursor-default p-1.5 -mr-2">
                         <MoreHorizontal size={20} />
                    </button>
                )}
            </div>

            <p className="mb-3 text-[15px] leading-relaxed whitespace-pre-wrap">{displayPost.content}</p>

            {displayPost.image_url && (
                <div className="mt-3 overflow-hidden rounded-md border bg-muted/20">
                    <img 
                        src={`/storage/${displayPost.image_url}`} 
                        className="w-full h-auto object-cover max-h-[500px]" 
                        alt="Content" 
                    />
                </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
                <button
                    onClick={toggleLike}
                    className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50 ${
                        displayPost.liked ? 'text-rose-500' : 'hover:text-rose-500'
                    }`}
                >
                    <Heart size={18} fill={displayPost.liked ? 'currentColor' : 'none'} />
                    <span className="tabular-nums">{displayPost.likes_count}</span>
                </button>

                <button 
                    onClick={() => onCommentClick(displayPost)}
                    className="flex items-center gap-2 hover:text-blue-500 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50"
                >
                    <MessageSquare size={18} />
                    <span className="tabular-nums">{displayPost.comments_count}</span>
                </button>

                <button 
                    onClick={toggleShare}
                    className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50 ${
                        displayPost.shared ? 'text-green-600' : 'hover:text-green-600'
                    }`}
                >
                    <Repeat2 size={18} />
                    <span className="tabular-nums">{displayPost.shares_count}</span>
                </button>
            </div>
        </div>
    );
}
