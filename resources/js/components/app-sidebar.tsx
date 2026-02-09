import { Link, usePage } from '@inertiajs/react'; 
import { CircleUser, Home, CirclePlus } from 'lucide-react'; 
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { route } from 'ziggy-js';

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const mainNavItems: NavItem[] = [
        {
            title: 'Home',
            href: route('dashboard'),
            icon: Home,
        },
        {
            title: 'Profile',
            href: route('profile.show', { user: auth.user.id }),
            icon: CircleUser,
        },
        {
            title: 'Create Post',
            href: route('posts.create'),
            icon: CirclePlus,
        },
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
