import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            outline: 'border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
            ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground text-muted-foreground',
            danger: 'bg-red-600 text-white hover:bg-red-500',
            link: 'text-primary underline-offset-4 hover:underline bg-transparent !h-auto !p-0',
        };

        const sizes = {
            sm: 'h-9 px-3 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base font-bold',
            icon: 'h-10 w-10 px-0',
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    variant !== 'link' && sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
