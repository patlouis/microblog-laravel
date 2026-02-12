import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { User, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { ArrowLeft, UserPlus, UserCheck, Loader2, UserMinus } from 'lucide-react';
import { useState } from 'react';

function FollowButton({ user, initialFollowing }: { user: User, initialFollowing: boolean }) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const toggleFollow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);

        router.post(route('profile.follow', user.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
            onError: () => {
                setIsFollowing(!newStatus);
            },
        });
    };

    return (
        <button
            onClick={toggleFollow}
            disabled={isLoading}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
                inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 shadow-sm min-w-[110px] cursor-pointer
                ${isFollowing 
                    ? 'bg-secondary text-secondary-foreground border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
            `}
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : isFollowing ? (
                isHovering ? (
                    <><UserMinus className="w-3 h-3" /> Unfollow</>
                ) : (
                    <><UserCheck className="w-3 h-3" /> Following</>
                )
            ) : (
                <><UserPlus className="w-3 h-3" /> Follow</>
            )}
        </button>
    );
}

/**
 * Main UserList Page Component
 */
export default function UserList({ 
    profileUser, 
    title, 
    users 
}: { 
    profileUser: User, 
    title: string, 
    users: { data: (User & { is_following?: boolean })[] } 
}) {
    const { auth } = usePage().props as any;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Profile',
            href: route('profile.show', { user: profileUser.id }),
        },
        {
            title: title,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profileUser.name} - ${title}`} />

            <div className="mx-auto max-w-xl w-full pt-4 pb-8 px-4 sm:px-0">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <Link 
                        href={route('profile.show', profileUser.id)} 
                        className="p-2 hover:bg-muted rounded-full transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                        <p className="text-xs text-muted-foreground">for {profileUser.name}</p>
                    </div>
                </div>

                {/* User List Container */}
                <div className="bg-background border rounded-xl divide-y overflow-hidden shadow-sm">
                    {users.data.length > 0 ? (
                        users.data.map((user) => (
                            <div 
                                key={user.id} 
                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                            >
                                {/* User Info Link */}
                                <Link href={route('profile.show', user.id)} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0 border border-background shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </Link>

                                {/* Action Button (Hidden on self) */}
                                <div className="ml-4 shrink-0">
                                    {auth.user.id !== user.id ? (
                                        <FollowButton 
                                            user={user} 
                                            initialFollowing={user.is_following ?? false} 
                                        />
                                    ) : (
                                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded">You</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                <UserPlus className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="text-sm font-medium text-foreground">No {title.toLowerCase()} yet</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                When people {title === 'Followers' ? 'follow' : 'are followed by'} this user, they will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
