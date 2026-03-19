'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
    Loader2, 
    LayoutDashboard, 
    ShieldAlert, 
    LogOut, 
    Globe, 
    Menu, 
    X, 
    PanelLeftClose, 
    PanelLeft,
    ChevronRight,
    Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !user?.roles.includes('ROLE_SUPER_ADMIN')) {
                router.push('/login');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    const handleLogout = () => {
        logout();
        toast.success("Governance session terminated.");
    };

    if (loading || !isAuthenticated || !user?.roles.includes('ROLE_SUPER_ADMIN')) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const navItems = [
        { label: 'Intelligence', icon: LayoutDashboard, href: '/super-admin', description: 'Real-time system health' },
        { label: 'Governance', icon: Globe, href: '/super-admin/companies', description: 'Global brand management' },
        { label: 'Banners', icon: Megaphone, href: '/super-admin/banner', description: 'Promotional visibility' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-secondary/50 dark:bg-gray-900/40 border-r border-border backdrop-blur-xl transition-all duration-500 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCompact ? 'w-20' : 'w-72'}`}
            >
                <div className={`h-full flex flex-col ${isCompact ? 'p-4' : 'p-6'}`}>
                    <div className={`flex items-center mb-10 ${isCompact ? 'justify-center' : 'justify-between px-2'}`}>
                        <Link href="/super-admin" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            {!isCompact && (
                                <div className="flex flex-col">
                                    <span className="font-bold tracking-tight text-lg leading-none">Console</span>
                                    <span className="text-primary tracking-widest text-[9px] font-medium uppercase opacity-70">Privileged Root</span>
                                </div>
                            )}
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center ${isCompact ? 'justify-center p-3.5' : 'px-4 py-3'} rounded-xl transition-all group relative ${pathname === item.href ? 'bg-primary/5 text-primary' : 'text-muted-foreground/80 hover:bg-secondary/80 hover:text-foreground'}`}
                            >
                                <item.icon className={`${isCompact ? '' : 'mr-3.5'} h-5 w-5 shrink-0 transition-colors ${pathname === item.href ? 'text-primary' : 'group-hover:text-primary/70'}`} />
                                {!isCompact && (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                                        <span className="text-[10px] font-medium opacity-50">{item.description}</span>
                                    </div>
                                )}
                                {pathname === item.href && !isCompact && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-border/50">
                        <div className={`flex items-center mb-6 ${isCompact ? 'justify-center' : 'px-2'}`}>
                            <div className="w-9 h-9 shrink-0 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-xs font-bold text-primary/70 shadow-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            {!isCompact && (
                                <div className="flex-1 min-w-0 ml-3">
                                    <p className="text-[11px] font-semibold text-foreground truncate">{user?.email}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-medium tracking-wider">Root Access</p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            className={`w-full ${isCompact ? 'justify-center h-12' : 'justify-start h-11 px-4'} text-muted-foreground hover:bg-red-500/5 hover:text-red-500 rounded-xl transition-all`}
                            onClick={handleLogout}
                        >
                            <LogOut className={`${isCompact ? '' : 'mr-3'} h-4 w-4 shrink-0`} />
                            {!isCompact && <span className="text-xs font-semibold">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            <div className={`flex-1 flex flex-col transition-all duration-500 ${isCompact ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <header className="h-20 sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-8">
                    <div className="flex items-center gap-5">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-muted-foreground hover:text-foreground ${isSidebarOpen ? 'hidden' : ''}`}>
                            <Menu className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsCompact(!isCompact)} className="hidden lg:block p-2 text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
                            {isCompact ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </button>
                        <div className="hidden sm:block h-5 w-px bg-border/50 mx-2" />
                        <nav className="flex items-center text-sm font-medium text-muted-foreground">
                            {pathname.split('/').filter(Boolean).map((part, i, arr) => (
                                <span key={part} className="flex items-center capitalize">
                                    <span className={i === arr.length - 1 ? 'text-foreground font-semibold' : ''}>{part.replace(/-/g, ' ')}</span>
                                    {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 mx-2 opacity-30" />}
                                </span>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-xl border border-border/50">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-secondary/2">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
