import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState, useRef } from 'react'; 

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Post',
        href: route('posts.create'),
    },
];

export default function Create() {
    const fileInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, isDirty } = useForm<{
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

        if (file && !file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            clearImage();
            return;
        }

        setData('image', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    }

    // 2. Function to remove the selected image
    function clearImage() {
        setData('image', null);
        setPreview(null);
        if (fileInput.current) {
            fileInput.current.value = ''; // Manually clear the input field
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="py-12 px-4">
                <div className="mx-auto w-full max-w-2xl rounded-xl border border-sidebar-border/70 bg-background p-6 dark:border-sidebar-border">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Create Post</h1>
                        <Link href={route('posts.index')} className="text-sm text-muted-foreground hover:text-foreground">
                            Cancel
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
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
                                    <span className="text-destructive">{errors.content}</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Image Upload</label>
                            <input
                                type="file"
                                ref={fileInput} // Attached the ref here
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                            />
                            {errors.image && (
                                <p className="mt-1 text-sm text-destructive">{errors.image}</p>
                            )}
                        </div>

                        {/* 3. Updated Preview with Remove Button */}
                        {preview && (
                            <div className="relative overflow-hidden rounded-lg border group bg-muted">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-64 w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-700 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={processing || !isDirty }
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
