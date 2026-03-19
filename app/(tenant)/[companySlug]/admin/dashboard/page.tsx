'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    total_products: number;
    total_users: number;
}

interface DashboardData {
    stats: DashboardStats;
}

export default function AdminDashboard({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const { user, loading, isAuthenticated } = useAuth();
    const [adminData, setAdminData] = useState<DashboardData | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push(`/${companySlug}/login`);
            } else if (!user?.roles?.includes('ROLE_ADMIN') && !user?.roles?.includes('ROLE_SUPER_ADMIN')) {
                router.push(`/${companySlug}`);
            }
        }
    }, [loading, isAuthenticated, user, router]);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/admin/dashboard')
                .then(response => setAdminData(response.data))
                .catch(err => console.error('Failed to load admin data', err));
        }
    }, [isAuthenticated]);

    if (loading || !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center bg-background text-foreground text-xl font-black">AUTHENTICATING...</div>;
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">ADMIN <span className="text-primary">DASHBOARD</span></h1>
                <p className="text-muted-foreground font-medium">Overview of your marketplace ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Products', value: adminData?.stats?.total_products || '0', color: 'from-primary to-blue-600', icon: '📦' },
                    { label: 'Active Users', value: adminData?.stats?.total_users || '0', color: 'from-purple-500 to-pink-600', icon: '👥' },
                    { label: 'Total Sales', value: '$0', color: 'from-emerald-500 to-teal-600', icon: '💰' },
                    { label: 'Pending', value: '0', color: 'from-amber-500 to-orange-600', icon: '⏳' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-card border-border p-8 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                        <div className="relative z-10">
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-4">{stat.label}</p>
                            <h3 className={`text-4xl font-black bg-linear-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                                {stat.value}
                            </h3>
                            <div className="text-2xl mt-4 opacity-20 group-hover:opacity-100 transition-opacity absolute top-0 right-0">
                                {stat.icon}
                            </div>
                        </div>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-linear-to-br ${stat.color} opacity-5 blur-3xl`} />
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-10 shadow-sm">
                    <h3 className="text-2xl font-black text-foreground mb-8">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-border">
                                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center font-bold">
                                    {i === 1 ? '🛒' : i === 2 ? '👤' : '📦'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground">{i === 1 ? 'New sale: MacBook Pro M3' : i === 2 ? 'New user registered: sarah@example.com' : 'Stock low: iPhone 15 Pro'}</p>
                                    <p className="text-xs text-muted-foreground font-medium">2 hours ago</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="bg-card border-border rounded-3xl p-10 shadow-sm">
                    <h3 className="text-2xl font-black text-foreground mb-8">System Health</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                                <span className="text-muted-foreground">Server Load</span>
                                <span className="text-emerald-500">Optimal</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full w-[24%] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                                <span className="text-muted-foreground">API Latency</span>
                                <span className="text-primary font-bold">12ms</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full w-[12%] bg-primary rounded-full shadow-[0_0_8px_rgba(14,165,233,0.3)]" />
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-10 border-border rounded-xl h-12 font-bold hover:bg-secondary transition-all">
                        View System Logs
                    </Button>
                </Card>
            </div>
        </div>
    );
}

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
