import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Post',
        href: route('posts.create'),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm<{
        content: string;
        image: File | null;
    }>({
        content: '',
        image: null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post(route('posts.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview(null);
            },
        });
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />

            <div className="mx-auto w-full max-w-2xl rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                <form onSubmit={submit} className="space-y-6">
                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Content
                        </label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            maxLength={140}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="What's on your mind?"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{data.content.length}/140</span>
                            {errors.content && (
                                <span className="text-destructive">
                                    {errors.content}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Image (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {errors.image && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    {/* Image Preview */}
                    {preview && (
                        <div className="overflow-hidden rounded-lg border">
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-64 w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Posting…' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
