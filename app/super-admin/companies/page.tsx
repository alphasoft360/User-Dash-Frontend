'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
    Building2, 
    Plus, 
    Trash2, 
    UserPlus, 
    Loader2,
    ShieldCheck
} from 'lucide-react';

interface Company {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
}

export default function CompaniesGovernance() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    
    const [newCompany, setNewCompany] = useState({ name: '', slug: '' });
    const [newAdmin, setNewAdmin] = useState({ email: '', name: '', password: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const companiesRes = await api.get('/super-admin/companies');
            setCompanies(companiesRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/super-admin/companies', newCompany);
            toast.success('Company initialized successfully');
            setIsCreatingCompany(false);
            setNewCompany({ name: '', slug: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Company initialization failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCompany = async (id: number) => {
        if (!confirm('Are you sure you want to delete this company? All associated data will be removed.')) return;
        try {
            await api.delete(`/super-admin/companies/${id}`);
            toast.success('Company removed');
            fetchData();
        } catch (err) {
            toast.error('Removal failed');
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) return;
        setSaving(true);
        try {
            await api.post(`/super-admin/companies/${selectedCompanyId}/admins`, newAdmin);
            toast.success('Admin created successfully');
            setIsCreatingAdmin(false);
            setNewAdmin({ email: '', name: '', password: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Admin creation failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <div className="text-sm font-medium text-muted-foreground animate-pulse">Loading companies...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Companies</h1>
                    <p className="text-muted-foreground">Manage organizational nodes and administration.</p>
                </div>
                <Button 
                    onClick={() => setIsCreatingCompany(true)}
                    className="rounded-xl shadow-lg shadow-primary/10"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Company
                </Button>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 pl-6 text-muted-foreground">Company Name</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 text-center text-muted-foreground">Slug</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 text-muted-foreground">Created At</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider py-4 pr-6 text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id} className="hover:bg-secondary/20 transition-colors border-border/50">
                                <TableCell className="py-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                            {company.name[0]}
                                        </div>
                                        <span className="font-semibold text-sm">{company.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <code className="text-[10px] font-mono bg-secondary px-2 py-1 rounded-md text-primary font-bold">{company.slug}</code>
                                </TableCell>
                                <TableCell className="py-4 text-xs text-muted-foreground font-medium">
                                    {new Date(company.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-4 pr-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                                            onClick={() => {
                                                setSelectedCompanyId(company.id);
                                                setIsCreatingAdmin(true);
                                            }}
                                            title="Add Admin"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground"
                                            onClick={() => handleDeleteCompany(company.id)}
                                            title="Delete Company"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modals */}
            {(isCreatingCompany || isCreatingAdmin) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
                        onClick={() => { setIsCreatingCompany(false); setIsCreatingAdmin(false); }}
                    />
                    <Card className="relative w-full max-w-md bg-card border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="p-8 border-b bg-secondary/5">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                {isCreatingCompany ? <Building2 className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary" />}
                                {isCreatingCompany ? 'New Company' : 'New Admin'}
                            </CardTitle>
                        </CardHeader>
                        
                        <form onSubmit={isCreatingCompany ? handleCreateCompany : handleCreateAdmin} className="p-8 space-y-6">
                            {isCreatingCompany ? (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Company Name</Label>
                                        <Input 
                                            placeholder="e.g. Acme Corp"
                                            value={newCompany.name}
                                            onChange={e => setNewCompany(c => ({...c, name: e.target.value}))}
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Slug</Label>
                                        <Input 
                                            placeholder="acme-corp"
                                            value={newCompany.slug}
                                            onChange={e => setNewCompany(c => ({...c, slug: e.target.value.toLowerCase().replace(/ /g, '-')}))}
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50 font-mono text-sm focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Email</Label>
                                        <Input 
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={newAdmin.email}
                                            onChange={e => setNewAdmin(a => ({...a, email: e.target.value}))}
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Full Name</Label>
                                        <Input 
                                            placeholder="Full Name"
                                            value={newAdmin.name}
                                            onChange={e => setNewAdmin(a => ({...a, name: e.target.value}))}
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Password</Label>
                                        <Input 
                                            type="password"
                                            placeholder="••••••••"
                                            value={newAdmin.password}
                                            onChange={e => setNewAdmin(a => ({...a, password: e.target.value}))}
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="flex gap-4 pt-4">
                                <Button 
                                    type="button"
                                    variant="ghost"
                                    onClick={() => { setIsCreatingCompany(false); setIsCreatingAdmin(false); }}
                                    className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
