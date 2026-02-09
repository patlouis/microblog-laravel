import { Head, router, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import type { Post, PaginatedPosts, BreadcrumbItem, Comment } from '@/types';
import PostCard from '@/components/post-card';
import CommentModal from '@/components/comment-modal';

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
        if (selectedPost?.id === deletedPostId) {
            setSelectedPost(null);
        }
    };

    const handleCommentAdded = (postId: number, newComment: Comment) => {
        setAllPosts((posts) =>
            posts.map((p) => {
                const content = p.post || p;
                if (content.id === postId) {
                    const updatedContent = {
                        ...content,
                        comments_count: content.comments_count + 1,
                        comments: [...(content.comments || []), newComment],
                    };
                    if (selectedPost && (selectedPost.id === postId)) {
                        setSelectedPost(updatedContent);
                    }
                    return p.post ? { ...p, post: updatedContent } : updatedContent;
                }
                return p;
            })
        );
    };

    useEffect(() => {
        if (selectedPost) {
            const updatedWrapper = allPosts.find(p => (p.post?.id === selectedPost.id) || (p.id === selectedPost.id));
            if (updatedWrapper) {
                 const content = updatedWrapper.post || updatedWrapper;
                 if (content.comments_count !== selectedPost.comments_count) {
                     setSelectedPost(content);
                 }
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
                <CommentModal 
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </AppLayout>
    );
}
