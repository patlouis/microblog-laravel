import { Repeat2, AlertCircle } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import type { Post } from '@/types';
import PostCard from '@/components/post-card';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    share: any;
    onCommentClick: (post: Post) => void;
    onDelete: (id: number) => void;
    onLike: (post: Post) => void;   
    onShare: (post: Post) => void;  
    onSync?: (post: Post) => void;
}

export default function ShareCard({ 
    share, 
    onCommentClick, 
    onDelete, 
    onLike,  
    onShare, 
    onSync 
}: Props) {
    const originalPost = share.post;

    if (!originalPost) {
        return (
            <div className="w-full rounded-lg border bg-background p-4 shadow-sm text-muted-foreground text-sm flex items-center gap-2 mb-4">
                <AlertCircle size={16} />
                <span>This shared post is no longer available.</span>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-2 pl-4">
                <Repeat2 size={12} className="text-green-600" />
                
                <Link href={route('profile.show', share.user.id)} className="hover:underline">
                    {share.user.name}
                </Link>
                
                <span>shared</span>
                <span className="text-[10px] opacity-60">•</span>
                
                <span className="font-normal opacity-80">
                    {formatRelativeDate(share.updated_at)}
                </span>
            </div>

            <PostCard 
                post={originalPost} 
                onCommentClick={onCommentClick} 
                onDelete={onDelete}
                onLike={onLike} 
                onShare={onShare}
                className="border-muted/60 shadow-none hover:shadow-sm"
            />
        </div>
    );
}
