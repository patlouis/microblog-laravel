export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    followers_count?: number; 
    following_count?: number;
    posts_count?: number;
    shares_count?: number;
    is_following?: boolean;
}

export interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: User;
}

export interface Post {
    id: number;
    content: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    user: User;
    
    likes_count: number;
    liked: boolean;
    comments_count: number;
    comments?: Comment[]; 
    
    shared: boolean;
    shares_count: number;
    
    post?: Post; 
}

export interface Share {
    id: number;
    updated_at: string; 
    user: User;         
    post: Post;        
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export type PaginatedPosts = PaginatedData<Post>;
export type PaginatedComments = PaginatedData<Comment>;
