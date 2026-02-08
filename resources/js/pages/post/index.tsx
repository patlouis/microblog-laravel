import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Plus, Pencil, Trash2, ImageOff, FileText } from 'lucide-react';

import type { Post, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Posts',
        href: route('posts.index'),
    },
];

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
                            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2"
                        >
                            <Plus size={16} />
                            <span>New Post</span>
                        </Link>
                    </div>

                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                        {post.image_url ? (
                                            <img
                                                src={`/storage/${post.image_url}`}
                                                alt="Post content"
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50">
                                                <ImageOff className="h-10 w-10 mb-2" />
                                                <span className="text-[10px] uppercase tracking-wider font-semibold">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-5">
                                        <p className="mb-6 flex-1 text-sm leading-relaxed line-clamp-3 text-foreground/90">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
                                            <span className="text-muted-foreground">
                                                {new Date(post.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    href={route('posts.edit', post.id)} 
                                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </Link>
                                                
                                                <Link 
                                                    href={route('posts.destroy', post.id)} 
                                                    method="delete" 
                                                    as="button"
                                                    onBefore={() => confirm('Are you sure you want to delete this post? This cannot be undone.')}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <Trash2 size={14} />
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
                                <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No posts found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                                You haven't shared anything with the community yet.
                            </p>
                            <Link 
                                href={route('posts.create')} 
                                className="mt-6 text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                                Create your first post <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
