import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { router } from '@inertiajs/react';
import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User } from '@/types';
import { route } from 'ziggy-js';

export function GlobalSearch() {
    const getInitials = useInitials();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/search/users?q=${query}`);
                setResults(response.data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-full max-w-sm" ref={searchRef}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm focus:border-neutral-400 focus:outline-none focus:ring-0 dark:border-neutral-800 dark:bg-neutral-900"
                />
                {isLoading && <Loader2 className="absolute right-3 size-3 animate-spin text-neutral-400" />}
            </div>

            {isOpen && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="p-2">
                        {results.length > 0 ? (
                            results.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                        router.visit(route('profile.show', { user: user.id }));
                                    }}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                                >
                                    <Avatar className="size-8">
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden text-left">
                                        <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs text-neutral-500">
                                            {user.email}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-neutral-500">
                                {isLoading ? 'Searching...' : 'No users found'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
