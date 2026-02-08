import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: dashboard().url,
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

export default function Dashboard({ posts }: { posts: Post[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <div className="mx-auto max-w-xl space-y-4 py-8">                
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="rounded-lg border bg-background p-4 shadow-sm"
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                {post.user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {post.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(post.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <p className="mb-3 text-sm">{post.content}</p>
                        {post.image_url && (
                            <img
                                src={`/storage/${post.image_url}`}
                                alt="Post image"
                                className="w-full rounded-md border"
                            />
                        )}
                        <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                            <button className="hover:text-primary">
                                Like
                            </button>
                            <button className="hover:text-primary">
                                Comment
                            </button>
                            <button className="hover:text-primary">
                                Share
                            </button>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        No posts yet.
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
