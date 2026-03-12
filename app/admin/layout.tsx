'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    PlusCircle,
    ShoppingBag,
    MonitorPlay,
    PanelLeftClose,
    PanelLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!user?.roles?.includes('ROLE_ADMIN') && !user?.roles?.includes('ROLE_SUPER_ADMIN')) {
                router.push('/marketplace');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    if (loading || !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 text-cyan-500 font-black">AUTHENTICATING...</div>;
    }

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Point of Sale', icon: MonitorPlay, href: '/admin/pos' },
        { label: 'Products', icon: Package, href: '/admin/products' },
        { label: 'Categories', icon: Package, href: '/admin/categories' },
        { label: 'Users', icon: Users, href: '/admin/users' },
        { label: 'Customers', icon: Users, href: '/admin/customers' },
        { label: 'Vendors', icon: Users, href: '/admin/vendors' },
        { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
        { label: 'Settings', icon: Settings, href: '/admin/settings' },
        { label: '---', icon: Menu, href: '#', isHeader: true },
        { label: 'Lab Dashboard', icon: LayoutDashboard, href: '/admin/dashboard-lab' },
        { label: 'Reagents', icon: Package, href: '/admin/reagents' },
        { label: 'Stock Mgr', icon: Package, href: '/admin/stock' },
        { label: 'Lab Customers', icon: Users, href: '/admin/customers-lab' },
        { label: 'Lab Sales', icon: MonitorPlay, href: '/admin/sales-lab' },
        { label: 'Lab Reports', icon: ShoppingBag, href: '/admin/reports-lab' },
        { label: 'Lab Invoices', icon: ShoppingBag, href: '/admin/invoices-lab' },
    ];


    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-secondary/50 dark:bg-gray-900/80 border-r border-border backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCompact ? 'w-20' : 'w-72'}`}
            >
                <div className={`h-full flex flex-col ${isCompact ? 'p-4' : 'p-6'}`}>
                    <div className={`flex items-center mb-10 ${isCompact ? 'justify-center' : 'justify-between px-2'}`}>
                        <Link href="/marketplace" className="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="Logo" className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-lg shadow-primary/20" />
                            {!isCompact && <span className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap overflow-hidden">ADMIN</span>}
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-x-hidden">
                        {navItems.map((item) => (
                            item.isHeader ? (
                                !isCompact && <div key={item.label} className="mt-6 mb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Laboratory System</div>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={isCompact ? item.label : undefined}
                                    className={`flex items-center ${isCompact ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all group ${pathname === item.href ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                                >
                                    <item.icon className={`${isCompact ? '' : 'mr-3'} h-5 w-5 shrink-0 ${pathname === item.href ? 'text-primary' : 'group-hover:text-primary'}`} />
                                    {!isCompact && <span className="font-bold text-sm whitespace-nowrap text-clip overflow-hidden">{item.label}</span>}
                                    {!isCompact && pathname === item.href && <ChevronRight className="ml-auto h-4 w-4 shrink-0" />}
                                </Link>
                            )
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-border flex flex-col gap-4">
                        <div className={`flex items-center ${isCompact ? 'justify-center' : 'px-4 py-1'}`}>
                            <div className="w-10 h-10 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            {!isCompact && (
                                <div className="flex-1 min-w-0 ml-3">
                                    <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Admin</p>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            title={isCompact ? "Sign Out" : undefined}
                            className={`w-full ${isCompact ? 'justify-center px-0' : 'justify-start px-4'} text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl`}
                            onClick={logout}
                        >
                            <LogOut className={`${isCompact ? '' : 'mr-3'} h-5 w-5 shrink-0`} />
                            {!isCompact && <span>Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCompact ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <header className="h-20 border-b border-border bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-muted-foreground hover:text-foreground ${isSidebarOpen ? 'hidden' : ''}`}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <button onClick={() => setIsCompact(!isCompact)} className="hidden lg:block p-2 text-muted-foreground hover:text-foreground transition-all">
                            {isCompact ? <PanelLeft className="h-6 w-6" /> : <PanelLeftClose className="h-6 w-6" />}
                        </button>
                        <p className="text-2xl font-bold text-primary ml-2">Dashboard</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <Link href="/marketplace/post-ad">
                            <Button className="bg-primary hover:opacity-90 text-primary-foreground font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Product
                            </Button>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
