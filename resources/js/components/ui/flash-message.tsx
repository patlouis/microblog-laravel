import { useState, useEffect } from 'react';

interface Props {
    message: string;
    type: 'message' | 'success' | 'error';
    onClose: () => void;
}

export default function FlashMessage({ message, type, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        message: 'bg-blue-500 border-blue-600',
        success: 'bg-emerald-500 border-emerald-600',
        error: 'bg-red-500 border-red-600',
    };

    return (
        <div 
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white transition-all duration-300 transform ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            } ${bgColors[type]}`}
        >
            <span className="text-sm font-medium">{message}</span>
            <button onClick={() => setIsVisible(false)} className="hover:opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
