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
                        <h1 className="text-2xl font-semibold">My Posts</h1>
                        <Link
                            href={route('posts.create')}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            + New Post
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm transition-hover hover:shadow-md"
                            >
                                <div className="aspect-video w-full bg-muted">
                                    {post.image_url ? (
                                        <img
                                            src={`/storage/${post.image_url}`}
                                            alt="Post content"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground italic text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <p className="mb-4 flex-1 text-sm line-clamp-3">
                                        {post.content}
                                    </p>

                                    <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        
                                        <div className="flex gap-3">
                                            <Link 
                                                href={route('posts.edit', post.id)} 
                                                className="text-primary hover:underline font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <Link 
                                                href={route('posts.destroy', post.id)} 
                                                method="delete" 
                                                as="button"
                                                className="text-destructive hover:underline font-medium"
                                            >
                                                Delete
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="mt-12 text-center">
                            <p className="text-muted-foreground">You haven't posted anything yet.</p>
                            <Link href={route('posts.create')} className="mt-2 inline-block text-primary underline">
                                Create your first post
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
