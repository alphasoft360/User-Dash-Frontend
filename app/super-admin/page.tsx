'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Activity, Settings, Database, Lock } from 'lucide-react';

export default function SuperAdminDashboard() {
    const [companiesCount, setCompaniesCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/super-admin/companies')
            .then(res => setCompaniesCount(res.data.length))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: 'Infrastructure Nodes', value: loading ? '...' : `${companiesCount} Global`, icon: <Activity className="h-5 w-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
        { label: 'Privileged Access', value: 'Root Active', icon: <Users className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-500/5' },
        { label: 'Data Isolation', value: 'Encrypted', icon: <Database className="h-5 w-5" />, color: 'text-purple-500', bg: 'bg-purple-500/5' },
        { label: 'Security Layer', value: 'Active', icon: <Lock className="h-5 w-5" />, color: 'text-primary', bg: 'bg-primary/5' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Intelligence Console
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                    Unified telemetry and orchestration for the multi-tenant architecture.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl transition-transform duration-500 ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 px-2 pb-0.5 rounded-full border border-border/50">Node {i + 1}</div>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 tracking-tight">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground tracking-tighter">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-card/30 backdrop-blur-md border-border/50 rounded-3xl shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="h-64 w-64 -mr-20 -mt-20" />
                </div>
                <CardHeader className="p-10 border-b border-border/50 bg-secondary/5 relative z-10">
                    <CardTitle className="text-2xl font-bold flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        Infrastructure Governance
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">
                        Global administrative control for the decentralized node network.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-20 text-center relative z-10">
                    <div className="max-w-md mx-auto space-y-8">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                <Settings className="h-10 w-10 text-primary animate-[spin_10s_linear_infinite]" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-foreground tracking-tighter italic">Privileged Root Online</h2>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                The multi-tenant orchestration engine is fully initialized. You now have complete governance over global nodes, operator privileges, and system-wide security protocols.
                            </p>
                        </div>
                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <Activity className="h-3 w-3" />
                                System Integrity Optimal
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
