import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
    className?: string;
}

export default function Pagination({ links, className = '' }: Props) {
    if (links.length <= 3) return null;

    return (
        <div className={`flex flex-wrap justify-center items-center gap-1 ${className}`}>
            {links.map((link, key) => {
                const isPrev = link.label.includes('&laquo;') || link.label.includes('Previous');
                const isNext = link.label.includes('&raquo;') || link.label.includes('Next');
                const isEllipsis = link.label === '...';

                const baseClasses = "relative inline-flex items-center justify-center w-8 h-8 text-sm font-medium transition-colors rounded-md border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
                
                let variantClasses = "";
                
                if (link.active) {
                    variantClasses = "z-10 bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90";
                } else if (!link.url) {
                    variantClasses = "text-muted-foreground bg-muted/30 border-transparent cursor-default opacity-50";
                } else {
                    variantClasses = "bg-background text-foreground border-border hover:bg-muted hover:text-foreground shadow-sm";
                }

                if (isEllipsis) {
                    return (
                        <span key={key} className="flex items-center justify-center w-8 h-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </span>
                    );
                }

                const content = isPrev ? (
                    <ChevronLeft className="h-4 w-4" />
                ) : isNext ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                );

                if (!link.url) {
                    return (
                        <span key={key} className={`${baseClasses} ${variantClasses}`}>
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={key}
                        href={link.url}
                        preserveScroll
                        className={`${baseClasses} ${variantClasses}`}
                    >
                        {content}
                    </Link>
                );
            })}
        </div>
    );
}
