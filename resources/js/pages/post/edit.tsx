import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { useState } from 'react';

type Post = {
    id: number;
    content: string;
    image_url?: string;
};

export default function Edit({ post: postData }: { post: Post }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Posts', href: route('posts.index') },
        { title: 'Edit Post', href: route('posts.edit', postData.id) },
    ];

    const { data, setData, post, processing, errors, isDirty } = useForm({
        content: postData.content || '',
        image: null as File | null,
        remove_image: false,
        _method: 'put', 
    });

    const [preview, setPreview] = useState<string | null>(
        postData.image_url ? `/storage/${postData.image_url}` : null
    );

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        
        if (file && !file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        setData((prev) => ({ ...prev, image: file, remove_image: false }));
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    function removeSelectedImage() {
        setData((prev) => ({ ...prev, image: null, remove_image: true }));
        setPreview(null);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('posts.update', postData.id), {
            forceFormData: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Post" />
            <div className="py-12 px-4">
                <div className="mx-auto w-full max-w-2xl rounded-xl border border-sidebar-border/70 bg-background p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Edit Post</h1>
                        <Link href={route('posts.index')} className="text-sm text-muted-foreground hover:text-foreground font-medium transition cursor-pointer">
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
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                            <div className="flex justify-between text-xs mt-1">
                                <span className='text-muted-foreground'>{data.content.length}/140</span>
                                {errors.content && <span className="text-destructive font-medium">{errors.content}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Update Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            />
                            {errors.image && <p className="mt-1 text-sm text-destructive font-medium">{errors.image}</p>}
                        </div>

                        {preview && (
                            <div className="relative overflow-hidden rounded-lg border bg-muted group">
                                <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removeSelectedImage}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md transition-all opacity-90 hover:opacity-100 cursor-pointer"
                                    title="Remove Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/40 px-2 py-1 rounded text-[10px] text-white backdrop-blur-sm">
                                    Current Preview
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing || !isDirty}
                                className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shadow-sm cursor-pointer"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
