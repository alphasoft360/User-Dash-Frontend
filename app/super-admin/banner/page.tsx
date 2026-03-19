'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
    Megaphone,
    Loader2
} from 'lucide-react';

interface Company {
    id: number;
    name: string;
    slug: string;
    settings_json?: {
        show_alphasoft_banner?: string;
    };
}

export default function BannerManagement() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<number | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/super-admin/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Failed to fetch companies', error);
            toast.error('Failed to load banner states');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBanner = async (companyId: number, currentStatus: boolean) => {
        setToggling(companyId);
        try {
            await api.post(`/super-admin/companies/${companyId}/toggle-banner`, {
                enabled: !currentStatus
            });
            
            setCompanies(prev => prev.map(c => 
                c.id === companyId 
                    ? { ...c, settings_json: { ...c.settings_json, show_alphasoft_banner: !currentStatus ? '1' : '0' } }
                    : c
            ));
            
            toast.success(`Banner updated for ${companies.find(c => c.id === companyId)?.name}`);
        } catch (error) {
            toast.error('Failed to update banner setting');
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <div className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing banner states...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Banner Management</h1>
                    <p className="text-muted-foreground">Toggle promotional visibility per company node.</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <Megaphone className="h-6 w-6" />
                </div>
            </div>

            <Card className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 pl-6 text-muted-foreground">Company</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 text-center text-muted-foreground">Status</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 pr-6 text-right text-muted-foreground">Toggle Visibility</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => {
                            const isBannerEnabled = company.settings_json?.show_alphasoft_banner === '1';
                            
                            return (
                                <TableRow key={company.id} className="hover:bg-secondary/20 transition-colors border-border/50">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                                {company.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{company.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Node ID: {company.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isBannerEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {isBannerEnabled ? 'ACTIVE' : 'DISABLED'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {toggling === company.id && <Loader2 className="h-4 w-4 animate-spin text-primary/40" />}
                                            <Switch 
                                                checked={isBannerEnabled}
                                                onCheckedChange={() => handleToggleBanner(company.id, isBannerEnabled)}
                                                disabled={toggling === company.id}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
