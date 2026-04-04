'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Users, Activity, Settings, Database, Lock, ShieldPlus, User, Mail, Key, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
    const [companiesCount, setCompaniesCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

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

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("All authorization fields are required");
            return;
        }

        setSaving(true);
        try {
            await api.post('/super-admin/admins', formData);
            toast.success("New Super Admin entry provisioned successfully");
            setFormData({ name: '', email: '', password: '' });
        } catch (err: unknown) {
            console.error(err);
            toast.error("Operator provisioning failed");
        } finally {
            setSaving(false);
        }
    };

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
                            <div className="flex flex-row items-center justify-between mb-4">
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
                    <CardTitle className="text-2xl font-bold flex flex-row items-center space-x-4">
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
                            <div className="inline-flex flex-row items-center space-x-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <Activity className="h-3 w-3" />
                                System Integrity Optimal
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl shadow-xl overflow-hidden border-t-4 border-t-primary/20">
                    <CardHeader className="p-8 border-b border-border/50 bg-secondary/10">
                        <div className="flex flex-row items-center space-x-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                <ShieldPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold uppercase tracking-tight">Operator Provisioning</CardTitle>
                                <CardDescription className="text-xs font-semibold uppercase tracking-widest opacity-60">Add new root administrative entity</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleCreateAdmin} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Entity Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input 
                                            placeholder="Full name..." 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="pl-10 bg-secondary/20 border-border group-focus-within:border-primary/50 rounded-xl h-12 font-bold text-xs uppercase transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">System Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input 
                                            type="email"
                                            placeholder="admin@system.io" 
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="pl-10 bg-secondary/20 border-border group-focus-within:border-primary/50 rounded-xl h-12 font-bold text-xs lowercase transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Protocol (Password)</Label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input 
                                        type="password"
                                        placeholder="••••••••••••" 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="pl-10 bg-secondary/20 border-border group-focus-within:border-primary/50 rounded-xl h-12 font-bold text-xs transition-all"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-black uppercase tracking-[0.25em] text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="flex flex-row items-center space-x-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Provisioning...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row items-center space-x-2">
                                            <ShieldPlus className="h-4 w-4" />
                                            <span>Authorize New Operator</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/10 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 group hover:bg-primary/8 transition-all">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Lock className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold uppercase tracking-tight text-sm">Security Note</h3>
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                            Authorized operators gain full root privileges. Ensure the new entity is fully vetted before provisioning system-wide access.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
