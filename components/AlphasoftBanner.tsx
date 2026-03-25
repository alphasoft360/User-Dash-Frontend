'use client';

import { ArrowUpRight } from 'lucide-react';

interface AlphasoftBannerProps {
    variant?: 'default' | 'compact';
}

export default function AlphasoftBanner({ variant = 'default' }: AlphasoftBannerProps) {
    const isCompact = variant === 'compact';

    return (
        <div className={`relative group overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-px shadow-2xl transition-all duration-500  ${isCompact ? 'w-full' : ''}`}>
            <div className={`relative flex items-center justify-between gap-2 rounded-[15px] bg-background/90 backdrop-blur-xl transition-all duration-500  ${isCompact ? 'px-3 py-2 flex-col items-stretch' : 'px-4 py-3'}`}>
                <div className={`flex items-center ${isCompact ? 'gap-2 mb-2' : 'gap-1'}`}>
                    <div className="flex items-center justify-center bg-zinc-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
                        <img
                            src="/images/alphasoft360-logo.png"
                            alt="Alphasoft360 Logo"
                            className={`${isCompact ? 'h-8' : 'h-12'} object-contain`}
                        />
                    </div>
                    {!isCompact && <div className="h-4 w-px bg-border/50 mx-1" />}
                    <div className="flex flex-col">
                        <h4 className={`${isCompact ? 'text-[12px]' : 'text-[16px]'} font-black uppercase tracking-widest text-foreground flex items-center gap-2`}>
                            AlphaSoft 360
                        </h4>
                        <p className={`${isCompact ? 'text-[7px]' : 'text-[9px]'} font-bold text-muted-foreground/60 uppercase tracking-[0.15em] -mt-0.5`}>
                            This Site is developed by alphasoft 360
                        </p>
                    </div>
                </div>

                <a
                    href="https://www.alphasoft360.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative z-10 flex items-center justify-center gap-2 rounded-lg bg-secondary/50 font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground  ${isCompact ? 'w-full py-2 text-[9px]' : 'px-3 py-5 text-[10px]'}`}
                >
                    Visit
                    <ArrowUpRight className="h-3 w-3" />
                </a>

                {/* Animated Background Elements */}
                <div className="absolute -left-4 -top-4 h-24 w-24 bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-purple-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0 pointer-events-none" />
            </div>
        </div>
    );
}
