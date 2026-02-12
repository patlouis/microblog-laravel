import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, MessageSquare, Repeat2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { route } from 'ziggy-js';
import type { Post } from '@/types';

interface Props {
    post: Post; 
    onCommentClick: (post: Post) => void;
    onDelete: (id: number) => void;
    onLike: (post: Post) => void;
    onShare: (post: Post) => void;
    className?: string; 
}

export default function PostCard({ post, onCommentClick, onDelete, onLike, onShare, className = '' }: Props) {
    const { auth } = usePage().props as any;
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isOwner = auth.user.id === post.user.id;

    return (
        <div className={`w-full rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md overflow-hidden ${className}`}>
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('profile.show', post.user.id)}>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 border border-transparent hover:border-muted-foreground/20 transition-colors">
                            {post.user.name.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                    <div className="min-w-0">
                        <Link href={route('profile.show', post.user.id)} className="text-sm font-semibold truncate hover:underline block">
                            {post.user.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <p className="truncate max-w-[150px]">{post.user.email}</p>
                            <span className="text-[10px]">•</span>
                            <p className="shrink-0">{formatRelativeDate(post.created_at)}</p>
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
                                    onClick={() => router.get(route('posts.edit', post.id))} 
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted text-left transition-colors cursor-pointer"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => { if(confirm('Delete?')) router.delete(route('posts.destroy', post.id), { onSuccess: () => onDelete(post.id) }) }} 
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Link href={route('posts.show', post.id)} className="block group">
                <p className="mb-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words overflow-hidden group-hover:text-primary/80 transition-colors">
                    {post.content}
                </p>
                
                {post.image_url && (
                    <div className="mt-3 overflow-hidden rounded-md border bg-muted/20">
                        <img 
                            src={`/storage/${post.image_url}`} 
                            className="w-full h-auto object-cover max-h-[500px]" 
                            alt="Content" 
                        />
                    </div>
                )}
            </Link>

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
                <button 
                    onClick={(e) => { e.preventDefault(); onLike(post); }} 
                    className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50 ${post.liked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                >
                    <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                    <span className="tabular-nums">{post.likes_count}</span>
                </button>
                
                <button 
                    onClick={(e) => { e.preventDefault(); onCommentClick(post); }} 
                    className="flex items-center gap-2 hover:text-blue-500 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50"
                >
                    <MessageSquare size={18} />
                    <span className="tabular-nums">{post.comments_count}</span>
                </button>
                
                <button 
                    onClick={(e) => { e.preventDefault(); onShare(post); }} 
                    className={`flex items-center gap-2 transition-colors px-2 py-1 cursor-pointer rounded-md hover:bg-muted/50 ${post.shared ? 'text-green-600' : 'hover:text-green-600'}`}
                >
                    <Repeat2 size={18} />
                    <span className="tabular-nums">{post.shares_count}</span>
                </button>
            </div>
        </div>
    );
}
