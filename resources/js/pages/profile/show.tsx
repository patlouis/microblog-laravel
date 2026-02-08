import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

type User = { id: number; name: string; email: string };
type Post = { id: number; content: string; image_url?: string; created_at: string; user: User };
type PaginatedPosts = { data: Post[]; next_page_url: string | null };

export default function ProfileShow({ profileUser, posts: initialPosts }: { profileUser: User, posts: PaginatedPosts }) {
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
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: route('profile.show', { user: profileUser.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profileUser.name}'s Profile`} />

            <div className="mx-auto max-w-xl pt-4 pb-8 px-4 sm:px-0">
                <div className="rounded-lg border bg-background p-6 shadow-sm mb-6 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4">
                        {profileUser.name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-xl font-bold">{profileUser.name}</h1>
                    <p className="text-sm text-muted-foreground">{profileUser.email}</p>
                    <div className="mt-4 flex justify-center gap-4 border-t pt-4">
                        <div className="text-center">
                            <span className="block font-bold text-lg">{allPosts.length}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Posts</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">Latest Posts</h2>
                
                <div className="space-y-4">
                    {allPosts.map((post) => (
                        <div key={post.id} className="rounded-lg border bg-background p-4 shadow-sm relative">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold leading-none">{post.user.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(post.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[15px] leading-relaxed">{post.content}</p>
                            {post.image_url && (
                                <img src={`/storage/${post.image_url}`} className="mt-3 w-full rounded-md border" alt="Post" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="py-10 flex justify-center">
                    {isLoading && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                </div>
            </div>
        </AppLayout>
    );
}
