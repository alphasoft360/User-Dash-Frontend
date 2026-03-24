'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Package, ShoppingBag, Activity } from 'lucide-react';

interface RecentSale {
    id: number;
    customerName: string;
    total: number;
    createdAt: string;
}

interface LabDashboardData {
    totalProducts: number;
    stockValue: number;
    todaySales: number;
    lowStockCount: number;
    recentSales: RecentSale[];
}

export default function LabDashboard() {
    const { loading, isAuthenticated } = useAuth();
    const [stats, setStats] = useState<LabDashboardData | null>(null);
    const router = useRouter();
    const params = useParams();
    const companySlug = params.companySlug as string;

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/admin/labs/dashboard')
                .then(response => setStats(response.data))
                .catch(err => console.error('Failed to load lab dashboard data', err));
        }
    }, [isAuthenticated]);

    if (loading || !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center bg-background text-foreground text-xl font-black text-cyan-500">AUTHENTICATING LAB...</div>;
    }

    const statCards = [
        { label: 'Total Reagents', value: stats?.totalProducts || '0', color: 'from-blue-500 to-cyan-500', icon: <Package className="h-6 w-6" /> },
        { label: 'Stock Value', value: `$${stats?.stockValue?.toLocaleString() || '0'}`, color: 'from-emerald-500 to-teal-600', icon: <Activity className="h-6 w-6" /> },
        { label: 'Today Sales', value: `$${stats?.todaySales?.toLocaleString() || '0'}`, color: 'from-indigo-500 to-purple-600', icon: <ShoppingBag className="h-6 w-6" /> },
        { label: 'Low Stock', value: stats?.lowStockCount || '0', color: stats?.lowStockCount && stats.lowStockCount > 0 ? 'from-red-500 to-orange-600' : 'from-slate-500 to-slate-600', icon: <Activity className="h-6 w-6" /> }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase">LAB <span className="text-primary">DASHBOARD</span></h1>
                <p className="text-muted-foreground font-medium">Pharmacy & Reagent Inventory Overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => {
                    const valueStr = stat.value.toString();
                    const isLong = valueStr.length > 12;
                    const fontSizeClass = isLong ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl';
                    
                    return (
                        <Card key={i} className="bg-card border-border p-8 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm hover:shadow-md h-full">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4">{stat.label}</p>
                                    <h3 className={`${fontSizeClass} font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 break-all leading-tight`}>
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity absolute top-0 right-0">
                                    {stat.icon}
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl`} />
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border rounded-3xl p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-foreground">Recent Transactions</h3>
                        <Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-xl" onClick={() => router.push(`/${companySlug}/admin/sales-lab`)}>
                            New Sale <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {stats?.recentSales && stats.recentSales.length > 0 ? (
                            stats.recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-border">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">{sale.customerName}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{new Date(sale.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-primary">${sale.total.toFixed(2)}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Paid</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground font-medium italic">No recent sales found.</div>
                        )}
                    </div>
                </Card>

                <Card className="bg-card border-border rounded-3xl p-10 shadow-sm">
                    <h3 className="text-2xl font-black text-foreground mb-8">Inventory Alerts</h3>
                    <div className="space-y-8">
                        {stats?.lowStockCount && stats.lowStockCount > 0 ? (
                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-red-500 font-black text-sm uppercase tracking-tighter mb-1">Low Stock Warning</p>
                                <p className="text-xs text-red-500/80 font-bold mb-4">{stats.lowStockCount} items are below minimum stock levels.</p>
                                <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-10 rounded-xl" onClick={() => router.push(`/${companySlug}/admin/stock/low`)}>
                                    Refill Stock
                                </Button>
                            </div>
                        ) : (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                <p className="text-emerald-500 font-black text-sm uppercase tracking-tighter">All Good</p>
                                <p className="text-xs text-emerald-500/80 font-medium">Stock levels are healthy.</p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-border">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Quick Links</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="secondary" className="justify-start rounded-xl font-bold h-12" onClick={() => router.push(`/${companySlug}/admin/reagents`)}>
                                    Manage Reagents
                                </Button>
                                <Button variant="secondary" className="justify-start rounded-xl font-bold h-12" onClick={() => router.push(`/${companySlug}/admin/reports-lab`)}>
                                    Inventory Reports
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
