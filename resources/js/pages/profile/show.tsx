import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { formatRelativeDate } from '@/lib/utils';
import { BreadcrumbItem, User, Post, PaginatedPosts } from '@/types';
import { route } from 'ziggy-js';
import { UserPlus, UserCheck, Loader2, UserMinus, FileText, Clock } from 'lucide-react';

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

            <div className="mx-auto max-w-xl w-full pt-4 pb-8 px-4 sm:px-0">
                
                {/* PROFILE */}
                <div className="rounded-xl border bg-background shadow-sm mb-8 overflow-hidden">
                    <div className="h-28" />
                    <div className="px-6 pb-6">
                        <div className="relative flex justify-center">
                            <div className="absolute -top-12 h-24 w-24 rounded-full bg-primary border-[4px] border-background flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                                {profileUser.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        
                        <div className="pt-16 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{profileUser.name}</h1>
                            <p className="text-sm text-muted-foreground mb-6">{profileUser.email}</p>

                            {!isOwnProfile && (
                                <button
                                    onClick={toggleFollow}
                                    disabled={isFollowLoading}
                                    onMouseEnter={() => setIsHoveringFollow(true)}
                                    onMouseLeave={() => setIsHoveringFollow(false)}
                                    className={`
                                        inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm min-w-[150px] mb-8 cursor-pointer
                                        ${isFollowing 
                                            ? 'bg-secondary text-secondary-foreground border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50' 
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }
                                    `}
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isFollowing ? (
                                        isHoveringFollow ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserCheck className="w-4 h-4" /> Following</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4" /> Follow</>
                                    )}
                                </button>
                            )}

                            <div className="grid grid-cols-3 gap-0 border-t border-b py-4 bg-muted/5 -mx-6">
                                <div className="flex flex-col items-center justify-center border-r border-border/50">
                                    <span className="text-xl font-bold text-foreground">{profileUser.posts_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Posts</span>
                                </div>
                                <Link 
                                    href={route('profile.followers', profileUser.id)} 
                                    className="flex flex-col items-center justify-center border-r border-border/50 cursor-pointer"
                                >
                                    <span className="text-xl font-bold text-foreground">{profileUser.followers_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Followers</span>
                                </Link>
                                <Link 
                                    href={route('profile.following', profileUser.id)} 
                                    className="flex flex-col items-center justify-center cursor-pointer"
                                >
                                    <span className="text-xl font-bold text-foreground">{profileUser.following_count ?? 0}</span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Following</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6 px-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Recent Activity
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {allPosts.length > 0 ? (
                        allPosts.map((post) => (
                            <div key={post.id} className="rounded-xl border bg-background p-5 shadow-sm relative transition-all hover:shadow-md">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0 border border-border/50">
                                            {post.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold leading-none">{post.user.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                                {formatRelativeDate(post.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{post.content}</p>
                                {post.image_url && (
                                    <div className="mt-4 rounded-lg overflow-hidden border bg-muted/20">
                                        <img src={`/storage/${post.image_url}`} className="w-full object-cover max-h-96" alt="Post content" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="bg-background p-4 rounded-full mb-4 shadow-sm border border-border/50">
                                <FileText className="w-8 h-8 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
                                {profileUser.name} hasn't shared anything with the community yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
