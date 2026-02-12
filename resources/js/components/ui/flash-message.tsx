import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Props {
    message: string;
    type: 'message' | 'success' | 'error';
    onClose: () => void;
}

export default function FlashMessage({ message, type, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const entryTimer = setTimeout(() => setIsVisible(true), 10);
        
        const autoCloseTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); 
        }, 5000);

        return () => {
            clearTimeout(entryTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [onClose]);

    const config = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            text: 'text-emerald-800',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            progress: 'bg-emerald-500'
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            progress: 'bg-red-500'
        },
        message: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-500" />,
            progress: 'bg-blue-500'
        }
    };

    const current = config[type];

    return (
        <div 
            className={`fixed top-5 right-5 z-[100] w-full max-w-[320px] sm:max-w-[400px] overflow-hidden rounded-xl border shadow-2xl transition-all duration-500 ease-out transform ${
                isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : '-translate-y-4 opacity-0'
            } ${current.bg}`}
        >
            <div className="relative p-4 flex items-start gap-3">
                <div className="shrink-0 pt-0.5">
                    {current.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${current.text}`}>
                        {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'}
                    </p>
                    <p className={`text-xs mt-1 leading-relaxed opacity-90 ${current.text}`}>
                        {message}
                    </p>
                </div>

                <button 
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }} 
                    className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${current.text}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
                <div 
                    className={`h-full transition-all duration-[5000ms] linear ${current.progress}`}
                    style={{ width: isVisible ? '0%' : '100%' }}
                />
            </div>
        </div>
    );
}
