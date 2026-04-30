'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    PlusCircle,
    ShoppingBag,
    MonitorPlay,
    PanelLeftClose,
    PanelLeft,
    ChevronRight,
    FlaskConical,
    Boxes,
    UsersRound,
    TrendingUp,
    ClipboardList,
    Receipt,
    Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import AlphasoftBanner from '@/components/AlphasoftBanner';
import api from '@/lib/api';

const MODERATOR_ALLOWED_PATHS = ['/admin/dashboard-lab', '/admin/sales-lab', '/admin/stock', '/admin/reagents'];
const EMPLOYEE_ALLOWED_PATHS = ['/admin/dashboard-lab', '/admin/sales-lab', '/admin/customers-lab', '/admin/invoices-lab'];
const USER_ALLOWED_PATHS: string[] = [];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const companySlug = params.companySlug as string;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCompact, setIsCompact] = useState(false);
    const [logoPath, setLogoPath] = useState('/images/logo.png');
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const companyResponse = await api.get(`/public/company/${companySlug}`);
                const settings = companyResponse.data.settings || {};

                if (settings.logo) {
                    setLogoPath(`/tenants/${companySlug}/images/${settings.logo}`);
                }

                setShowBanner(settings.show_alphasoft_banner === '1');
            } catch (error) {
                console.error('Failed to fetch company data', error);
            }
        };
        fetchCompanyData();
    }, [companySlug]);

    const roles = user?.roles || [];
    const isSuperAdmin = roles.includes('ROLE_SUPER_ADMIN');
    const isArchitectural = roles.includes('ROLE_ARCHITECTURAL') || isSuperAdmin;
    const isAdmin = roles.includes('ROLE_ADMIN') || isArchitectural;
    const isModerator = roles.includes('ROLE_MODERATOR') && !isAdmin;
    const isEmployee = roles.includes('ROLE_EMPLOYEE') && !isAdmin && !isModerator;
    const isStandardUser = roles.includes('ROLE_USER') && !isAdmin && !isModerator && !isEmployee;

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push(`/${companySlug}/login`);
            } else if (!isAdmin && !isModerator && !isEmployee && !isArchitectural) {
                router.push(`/${companySlug}`);
            } else {
                if (!isArchitectural) {
                    if (pathname.includes('/admin/users')) {
                        router.push(`/${companySlug}/admin/dashboard-lab`);
                    }
                }

                if (isAdmin && !isArchitectural) {
                    if (pathname.includes('/admin/users')) {
                        router.push(`/${companySlug}/admin/dashboard-lab`);
                    }
                }

                if (isModerator) {
                    const isAllowed = MODERATOR_ALLOWED_PATHS.some(p => pathname.includes(p));
                    if (!isAllowed) {
                        router.push(`/${companySlug}/admin/dashboard-lab`);
                    }
                }

                if (isEmployee) {
                    const isAllowed = EMPLOYEE_ALLOWED_PATHS.some(p => pathname.includes(p));
                    if (!isAllowed) {
                        router.push(`/${companySlug}/admin/dashboard-lab`);
                    }
                }

                if (isStandardUser) {
                    router.push(`/${companySlug}`);
                }
            }
        }
    }, [loading, isAuthenticated, isAdmin, isModerator, isStandardUser, isArchitectural, companySlug, router, pathname]);

    const isAuthorized = isAdmin || isModerator || isEmployee || isArchitectural;

    if (loading || !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 text-cyan-500 font-black tracking-widest animate-pulse">AUTHENTICATING...</div>;
    }

    if (!isAuthorized) {
        return <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 text-red-500 font-black tracking-widest animate-pulse">ACCESS DENIED - REDIRECTING...</div>;
    }

    const allNavItems: { label: string; icon: any; href: string; isHeader?: boolean }[] = [
        { label: 'Lab Dashboard', icon: LayoutDashboard, href: `/${companySlug}/admin/dashboard-lab` },
        { label: 'Reagents', icon: FlaskConical, href: `/${companySlug}/admin/reagents` },
        { label: 'Users', icon: User, href: `/${companySlug}/admin/users` },
        { label: 'Stock Mgr', icon: Boxes, href: `/${companySlug}/admin/stock` },
        { label: 'Lab Customers', icon: UsersRound, href: `/${companySlug}/admin/customers-lab` },
        { label: 'Lab Sales', icon: TrendingUp, href: `/${companySlug}/admin/sales-lab` },
        { label: 'Lab Reports', icon: ClipboardList, href: `/${companySlug}/admin/reports-lab` },
        { label: 'Lab Invoices', icon: Receipt, href: `/${companySlug}/admin/invoices-lab` },
        { label: 'Cash Recovery', icon: Wallet, href: `/${companySlug}/admin/cash-recovery` },
        { label: 'Lab Expenses', icon: Wallet, href: `/${companySlug}/admin/lab-expenses` },
        { label: 'Settings', icon: Settings, href: `/${companySlug}/admin/settings` },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-secondary/50 dark:bg-gray-900/80 border-r border-border backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCompact ? 'w-20' : 'w-72'}`}
            >
                <div className={`h-full flex flex-col ${isCompact ? 'p-4' : 'p-6'}`}>
                    <div className={`flex items-center pb-2 ${isCompact ? 'justify-center' : 'justify-between px-2'}`}>
                        <div className="flex items-center space-x-1 cursor-default">
                            <img src={logoPath} alt="Logo" className="h-10 rounded-lg w-10" />
                            {!isCompact && <span className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap overflow-hidden">ADMIN</span>}
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-x-hidden">
                        {allNavItems.map((item) => {
                            let isAllowed = isAdmin;

                            if (item.label === 'Users') {
                                isAllowed = isArchitectural;
                            }

                            if (isModerator) isAllowed = MODERATOR_ALLOWED_PATHS.some(p => item.href.endsWith(p));
                            if (isEmployee) isAllowed = EMPLOYEE_ALLOWED_PATHS.some(p => item.href.endsWith(p));
                            if (isStandardUser) isAllowed = false;

                            const isActive = pathname === item.href;

                            return item.isHeader ? (
                                !isCompact && <div key={item.label} className="mt-6 mb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Laboratory System</div>
                            ) : isAllowed ? (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={isCompact ? item.label : undefined}
                                    className={`flex items-center ${isCompact ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                                >
                                    <item.icon className={`${isCompact ? '' : 'mr-3'} h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95 ${isActive ? 'text-primary scale-110' : 'group-hover:text-primary'}`} />
                                    {!isCompact && <span className="font-bold text-sm whitespace-nowrap text-clip overflow-hidden transition-transform duration-300 group-active:scale-95">{item.label}</span>}
                                    {!isCompact && isActive && <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
                                </Link>
                            ) : null;
                        })}
                    </nav>

                    <div className="pt-6 border-t border-border flex flex-col gap-4">
                        {showBanner && !isCompact && (
                            <div className="px-2 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-2">
                                <AlphasoftBanner variant="compact" />
                            </div>
                        )}
                        <div className={`flex items-center ${isCompact ? 'justify-center' : 'px-4 py-1'}`}>
                            <div className="w-10 h-10 shrink-0 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            {!isCompact && (
                                <div className="flex-1 min-w-0 ml-3">
                                    <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">
                                        {isSuperAdmin ? 'Super Admin' : isArchitectural ? 'Architectural' : isModerator ? 'Moderator' : isEmployee ? 'Lab Employee' : 'Admin'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            title={isCompact ? "Sign Out" : undefined}
                            className={`w-full group ${isCompact ? 'justify-center px-0' : 'justify-start px-4'} text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl mb-4 transition-all duration-300`}
                            onClick={logout}
                        >
                            <LogOut className={`${isCompact ? '' : 'mr-3'} h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-95`} />
                            {!isCompact && <span className="transition-transform duration-300 group-active:scale-95">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCompact ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <header className="h-20 border-b border-border bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-300 ${isSidebarOpen ? 'hidden' : ''}`}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <button onClick={() => setIsCompact(!isCompact)} className="hidden lg:block p-2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-300">
                            {isCompact ? <PanelLeft className="h-6 w-6" /> : <PanelLeftClose className="h-6 w-6" />}
                        </button>
                        <p className="text-2xl font-bold text-primary ml-2">Dashboard</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
