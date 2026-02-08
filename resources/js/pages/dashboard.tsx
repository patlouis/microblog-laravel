import { Head, router, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { cn, formatRelativeDate } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: route('dashboard'),
    },
];

type User = {
    id: number;
    name: string;
    email: string;
};

type Post = {
    id: number;
    content: string;
    image_url?: string;
    created_at: string;
    user: User;
};

type PaginatedPosts = {
    data: Post[];
    next_page_url: string | null;
};

export default function Dashboard({ posts: initialPosts }: { posts: PaginatedPosts }) {
    const { auth } = usePage().props as any;
    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    const [isLoading, setIsLoading] = useState(false);

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
            replace: true,       
            only: ['posts'],     
            onSuccess: (page) => {
                const incoming = page.props.posts as PaginatedPosts;
                setAllPosts((prev) => [...prev, ...incoming.data]);
                setNextPageUrl(incoming.next_page_url);
                setIsLoading(false);
            },
            onError: () => setIsLoading(false)
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            
            <div className="mx-auto max-w-xl pt-4 pb-8 px-4 sm:px-0">
                <div className="rounded-lg border bg-background p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0 overflow-hidden">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <Link
                            href={route('posts.create')}
                            className="flex-1 rounded-full bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted cursor-pointer text-left"
                        >
                            What's on your mind, {auth.user.name.split(' ')[0]}?
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {allPosts.map((post) => (
                        <div
                            key={post.id}
                            className="rounded-lg border bg-background p-4 shadow-sm relative"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground overflow-hidden shrink-0">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold leading-none truncate">
                                            {post.user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px] sm:max-w-[250px]">
                                            {post.user.email}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium text-muted-foreground whitespace-nowrap pt-1">
                                    {formatRelativeDate(post.created_at)}
                                </p>
                            </div>

                            <p className="mb-3 text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                {post.content}
                            </p>

                            {post.image_url && (
                                <div className="mt-3 overflow-hidden rounded-md border bg-muted">
                                    <img
                                        src={`/storage/${post.image_url}`}
                                        alt="Post content"
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-sm text-muted-foreground">
                                <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group px-2 py-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>Like</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group px-2 py-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Comment</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group px-2 py-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="py-12 flex flex-col items-center justify-center">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            <span>Loading more posts...</span>
                        </div>
                    ) : !nextPageUrl && allPosts.length > 0 ? (
                        <div className="text-center space-y-3">
                            <p className="text-xs text-muted-foreground italic opacity-70">You've reached the end of the feed.</p>
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-primary text-xs font-bold hover:underline cursor-pointer bg-primary/5 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/10"
                            >
                                Back to top ↑
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </AppLayout>
    );
}
