import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Posts',
        href: route('posts.index'),
    },
];

type User = {
    id: number;
    name: string;
};

type Post = {
    id: number;
    content: string;
    image_url?: string;
    created_at: string;
    user: User;
};

export default function Index({ posts }: { posts: Post[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Posts" />
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">My Posts</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage and edit your shared content.
                            </p>
                        </div>
                        <Link
                            href={route('posts.create')}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            + New Post
                        </Link>
                    </div>

                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="aspect-video w-full bg-muted">
                                        {post.image_url ? (
                                            <img
                                                src={`/storage/${post.image_url}`}
                                                alt="Post content"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-[10px] uppercase tracking-wider font-semibold">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-5">
                                        <p className="mb-6 flex-1 text-sm leading-relaxed line-clamp-3 text-foreground/90">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center justify-between border-t pt-4 text-xs">
                                            <span className="text-muted-foreground">
                                                {new Date(post.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            
                                            <div className="flex items-center gap-4">
                                                <Link 
                                                    href={route('posts.edit', post.id)} 
                                                    className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                                >
                                                    Edit
                                                </Link>
                                                <Link 
                                                    href={route('posts.destroy', post.id)} 
                                                    method="delete" 
                                                    as="button"
                                                    onBefore={() => confirm('Are you sure you want to delete this post? This cannot be undone.')}
                                                    className="font-semibold text-destructive hover:text-destructive/80 transition-colors focus:outline-none cursor-pointer"
                                                >
                                                    Delete
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-20 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium">No posts found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                                You haven't shared anything with the community yet.
                            </p>
                            <Link 
                                href={route('posts.create')} 
                                className="mt-6 text-sm font-semibold text-primary hover:underline"
                            >
                                Create your first post →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
