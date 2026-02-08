import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { UserPlus, UserCheck, Loader2, UserMinus, FileText } from 'lucide-react';

type User = { id: number; name: string; email: string };
type Post = { id: number; content: string; image_url?: string; created_at: string; user: User };
type PaginatedPosts = { data: Post[]; next_page_url: string | null };

export default function ProfileShow({ 
    profileUser, 
    posts: initialPosts,
    isFollowing: initialIsFollowing 
}: { 
    profileUser: User, 
    posts: PaginatedPosts,
    isFollowing: boolean 
}) {
    const { auth } = usePage().props as any;
    
    const [allPosts, setAllPosts] = useState<Post[]>(initialPosts.data);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialPosts.next_page_url);
    
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isHoveringFollow, setIsHoveringFollow] = useState(false); 

    const isOwnProfile = auth.user.id === profileUser.id;

    const toggleFollow = () => {
        if (isFollowLoading) return;
        
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        setIsFollowLoading(true);

        router.post(route('profile.follow', profileUser.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsFollowLoading(false),
            onError: () => {
                setIsFollowing(!newStatus);
            }
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const currentPosition = window.innerHeight + window.scrollY;
            if (currentPosition >= scrollHeight - 400 && nextPageUrl) {
                loadMorePosts();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [nextPageUrl]);

    const loadMorePosts = () => {
        if (!nextPageUrl) return;
        router.get(nextPageUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['posts'],
            onSuccess: (page) => {
                const incoming = page.props.posts as PaginatedPosts;
                setAllPosts((prev) => [...prev, ...incoming.data]);
                setNextPageUrl(incoming.next_page_url);
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

            {/* Added w-full to ensure it doesn't shrink when content is small */}
            <div className="mx-auto max-w-xl w-full pt-4 pb-8 px-4 sm:px-0">
                
                {/* PROFILE CARD */}
                <div className="rounded-lg border bg-background p-6 shadow-sm mb-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-muted to-muted/50 -z-0" />
                    
                    <div className="relative z-10 pt-8">
                        <div className="mx-auto h-24 w-24 rounded-full bg-primary border-[5px] border-background flex items-center justify-center text-3xl font-bold text-primary-foreground mb-3 shadow-sm">
                            {profileUser.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <h1 className="text-2xl font-bold tracking-tight">{profileUser.name}</h1>
                        <p className="text-sm text-muted-foreground mb-4">{profileUser.email}</p>

                        {!isOwnProfile && (
                            <button
                                onClick={toggleFollow}
                                disabled={isFollowLoading}
                                onMouseEnter={() => setIsHoveringFollow(true)}
                                onMouseLeave={() => setIsHoveringFollow(false)}
                                className={`
                                    inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm min-w-[140px] cursor-pointer
                                    ${isFollowing 
                                        ? 'bg-background border border-border text-foreground hover:border-red-200 hover:text-red-600 hover:bg-red-50' 
                                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    }
                                `}
                            >
                                {isFollowLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isFollowing ? (
                                    isHoveringFollow ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            Following
                                        </>
                                    )
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Follow
                                    </>
                                )}
                            </button>
                        )}

                        <div className="mt-6 flex justify-center gap-8 border-t pt-4">
                            <div className="text-center">
                                <span className="block font-bold text-xl">{allPosts.length}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Posts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1 flex items-center gap-2">
                    Latest Posts
                </h2>
                
                <div className="space-y-4">
                    {allPosts.length > 0 ? (
                        allPosts.map((post) => (
                            <div key={post.id} className="rounded-lg border bg-background p-4 shadow-sm relative transition-all hover:shadow-md">
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
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{post.content}</p>
                                {post.image_url && (
                                    <div className="mt-3 rounded-md overflow-hidden border bg-muted/20">
                                        <img src={`/storage/${post.image_url}`} className="w-full object-cover max-h-96" alt="Post" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        /* IMPROVED EMPTY STATE */
                        <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                {profileUser.name} hasn't shared anything with the community yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
