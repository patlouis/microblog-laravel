import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import FlashMessage from '@/components/ui/flash-message';

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { flash } = usePage().props as any;
    
    const [localFlash, setLocalFlash] = useState<{ message: string; type: 'success' | 'error' | 'message' } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setLocalFlash({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setLocalFlash({ message: flash.error, type: 'error' });
        } else if (flash?.message) {
            setLocalFlash({ message: flash.message, type: 'message' });
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {localFlash && (
                <FlashMessage 
                    message={localFlash.message} 
                    type={localFlash.type} 
                    onClose={() => setLocalFlash(null)} 
                />
            )}
            
            {children}
        </AppLayoutTemplate>
    );
}
