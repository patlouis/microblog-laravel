import { useForm, usePage, router } from '@inertiajs/react';
import { formatRelativeDate } from '@/lib/utils';
import { X, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import type { Post, Comment, User } from '@/types';
import React, { useState, useRef, useEffect } from 'react';

interface Props {
    post: Post;
    onClose: () => void;
    onCommentAdded?: (postId: number, newComment: Comment) => void;
    onCommentUpdated?: (postId: number, updatedComment: Comment) => void;
    onCommentDeleted?: (postId: number, commentId: number) => void;
}

export default function CommentModal({ 
    post, 
    onClose, 
    onCommentAdded, 
    onCommentUpdated, 
    onCommentDeleted 
}: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user as User;

    const [localComments, setLocalComments] = useState<Comment[]>(post.comments || []);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState('');
    
    const menuRef = useRef<HTMLDivElement>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    const { data, setData, post: submit, processing, reset } = useForm({
        body: '',
    });

    useEffect(() => {
        if(post.comments) setLocalComments(post.comments);
    }, [post.comments]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tempId = Date.now();
        const newComment: Comment = {
            id: tempId, 
            body: data.body,
            created_at: new Date().toISOString(),
            user: user,
        };

        submit(route('comments.store', post.id), {
            preserveScroll: true,
            onSuccess: () => {
                setLocalComments((prev) => [...prev, newComment]);
                if (onCommentAdded) onCommentAdded(post.id, newComment);
                reset();
                setTimeout(() => {
                    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
            },
        });
    };

    const handleDelete = (commentId: number) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            router.delete(route('comments.destroy', commentId), {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalComments((prev) => prev.filter(c => c.id !== commentId));
                    if (onCommentDeleted) onCommentDeleted(post.id, commentId);
                    setActiveMenuId(null);
                },
            });
        }
    };

    const saveEdit = (commentId: number) => {
        router.put(route('comments.update', commentId), { body: editBody }, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalComments((prev) => prev.map(c => 
                    c.id === commentId ? { ...c, body: editBody } : c
                ));
                
                if (onCommentUpdated) {
                    const updated = localComments.find(c => c.id === commentId);
                    if (updated) onCommentUpdated(post.id, { ...updated, body: editBody });
                }
                
                setEditingCommentId(null);
                setEditBody('');
            }
        });
    };

    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditBody(comment.body);
        setActiveMenuId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                
                <div className="flex items-center justify-between border-b p-4 shrink-0 bg-background/95 backdrop-blur z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Comments</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                    {localComments.length > 0 ? (
                        <div className="space-y-6">
                            {localComments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 relative group">
                                    <div className="h-9 w-9 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground z-10 ring-4 ring-background">
                                        {comment.user.name.charAt(0)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold">{comment.user.name}</p>
                                                <span className="text-[10px] text-muted-foreground">•</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatRelativeDate(comment.created_at)}
                                                </span>
                                            </div>

                                            {auth.user.id === comment.user.id && !editingCommentId && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                                                        className="p-1 rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    
                                                    {activeMenuId === comment.id && (
                                                        <div ref={menuRef} className="absolute right-0 top-6 z-20 w-32 rounded-md border bg-background shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                                            <button onClick={() => startEditing(comment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted text-left cursor-pointer">
                                                                <Pencil size={12} /> Edit
                                                            </button>
                                                            <button onClick={() => handleDelete(comment.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer">
                                                                <Trash2 size={12} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editBody}
                                                    onChange={(e) => setEditBody(e.target.value)}
                                                    className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                                                    autoFocus
                                                    onFocus={(e) => {
                                                        const val = e.target.value;
                                                        e.target.value = '';
                                                        e.target.value = val;
                                                    }}
                                                />
                                                <div className="flex gap-2 justify-end mt-2">
                                                    <button onClick={() => setEditingCommentId(null)} className="text-xs font-medium px-3 py-1.5 rounded-md hover:bg-muted cursor-pointer">Cancel</button>
                                                    <button 
                                                        onClick={() => saveEdit(comment.id)}
                                                        disabled={!editBody.trim()}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap leading-relaxed break-words">
                                                {comment.body}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollEndRef} className="h-0 w-0" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                            <MessageCircle className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">No comments yet</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-background z-20 shrink-0">
                    <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary shrink-0 flex items-center justify-center font-bold text-primary-foreground text-sm">
                            {user.name.charAt(0)}
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1">
                            <textarea
                                placeholder="Write a comment..."
                                className="w-full min-h-[44px] max-h-[120px] resize-none border border-input rounded-md bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                            />
                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit"
                                    disabled={processing || !data.body.trim()} 
                                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Posting...' : 'Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
