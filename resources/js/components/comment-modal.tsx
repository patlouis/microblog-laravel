import { useForm, usePage } from '@inertiajs/react';
import { formatRelativeDate } from '@/lib/utils';
import { X, MessageCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import type { Post, Comment, User } from '@/types';
import React from 'react';

interface Props {
    post: Post;
    onClose: () => void;
    onCommentAdded: (postId: number, newComment: Comment) => void;
}

export default function CommentModal({ post, onClose, onCommentAdded }: Props) {
    const { auth } = usePage().props as any;
    const user = auth.user as User;

    const { 
        data, 
        setData, 
        post: submit, 
        processing, 
        reset 
    } = useForm({
        body: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newComment: Comment = {
            id: Date.now(),
            body: data.body,
            created_at: new Date().toISOString(),
            user: user,
        };

        submit(route('comments.store', post.id), {
            preserveScroll: true,
            onSuccess: () => {
                onCommentAdded(post.id, newComment);
                reset();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between border-b p-4 shrink-0 bg-background/95 backdrop-blur z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Comments</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                    {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-6 mb-6">
                            {post.comments.map((comment) => (
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
                            {user.name.charAt(0)}
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1">
                            <textarea
                                placeholder="Write a comment..."
                                className="w-full min-h-[44px] max-h-[120px] resize-none border border-input rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary outline-none"
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                autoFocus
                            />
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
    );
}
