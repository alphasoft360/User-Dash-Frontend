"use client";

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Shield,
    ShieldCheck,
    Search,
    Filter,
    Loader2,
    AtSign,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    LayoutGrid,
    List,
    MoreVertical,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface UserData {
    id: number;
    email: string;
    roles: string[];
    name: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [updating, setUpdating] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = async (page: number, search: string, role: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/users`, {
                params: {
                    page,
                    limit: 8,
                    search,
                    role: role === 'ALL' ? '' : role
                }
            });
            setUsers(response.data.data);
            setTotalPages(response.data.pages);
            setTotalUsers(response.data.total);
            setCurrentPage(response.data.page);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to sync user database");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search to prevent excessive API calls
    const debouncedSearch = useCallback(
        debounce((query: string, role: string) => {
            fetchUsers(1, query, role);
        }, 500),
        []
    );

    useEffect(() => {
        fetchUsers(1, '', 'ALL');
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query, roleFilter);
    };

    const handleRoleFilterChange = (role: string) => {
        setRoleFilter(role);
        fetchUsers(1, searchQuery, role);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchUsers(newPage, searchQuery, roleFilter);
        }
    };

    const handleRoleUpdate = async (userId: number, newRole: string) => {
        try {
            setUpdating(userId);
            const response = await api.patch(`/admin/users/${userId}/role`, { roles: [newRole] });
            setUsers(users.map(u => u.id === userId ? { ...u, roles: response.data.user.roles } : u));
            toast.success("Security clearance updated successfully");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Protocol elevation failed");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header section - more compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight uppercase flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        USER <span className="text-primary font-normal">Identity</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" /> Directory Management
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border/40 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                        Total: <span className="text-primary">{totalUsers}</span>
                    </div>
                </div>
            </div>

            {/* Filter Hub - tighter layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12 bg-card/30 backdrop-blur-md border border-border p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Search</Label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                            <Input
                                placeholder="Email or name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 bg-secondary/20 border-border group-hover:border-primary/40 rounded-xl h-10 font-medium transition-all focus:ring-primary/10 text-xs"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-52 space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Protocol</Label>
                        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                            <SelectTrigger className="bg-secondary/20 border-border h-10 rounded-xl font-bold text-[9px] tracking-widest uppercase transition-all">
                                <SelectValue placeholder="ROLE" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border rounded-xl shadow-xl">
                                <SelectItem value="ALL" className="font-semibold text-[9px] uppercase py-2">ALL ENTITIES</SelectItem>
                                <SelectItem value="ROLE_USER" className="font-semibold text-[9px] uppercase py-2">STAFF / USER</SelectItem>
                                <SelectItem value="ROLE_MODERATOR" className="font-semibold text-[9px] uppercase py-2">MODERATOR</SelectItem>
                                <SelectItem value="ROLE_ADMIN" className="font-semibold text-[9px] uppercase py-2">ADMINISTRATOR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main Table - Sleeker and more compact */}
            <div className="relative">
                <Card className="bg-card/40 backdrop-blur-xl border-border rounded-3xl shadow-xl overflow-hidden border-t-4 border-t-primary/10">
                    <CardHeader className="p-6 border-b border-border bg-secondary/10 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold tracking-tight flex items-center text-foreground uppercase">
                            <List className="mr-3 h-5 w-5 text-primary" />
                            Directory
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />}
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2.5 py-1 rounded-lg border border-border">P. {currentPage} / {totalPages}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border bg-background/20">
                                        <th className="p-4 px-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Entity</th>
                                        <th className="p-4 px-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Clearance</th>
                                        <th className="p-4 px-6 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {loading && users.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Syncing...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-16 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <AlertCircle className="h-8 w-8" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No entries found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.filter(u => !u.roles.includes('ROLE_SUPER_ADMIN')).map((u) => (
                                        <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="p-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center font-bold text-primary mr-3 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        <span className="text-sm uppercase font-bold">{u.name?.[0] || u.email[0].toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight uppercase text-xs truncate">
                                                            {u.name || 'ANONYMOUS'}
                                                        </span>
                                                        <div className="flex items-center space-x-1.5 text-muted-foreground/60 text-[9px] font-medium tracking-wide">
                                                            <AtSign className="h-2.5 w-2.5" />
                                                            <span className="truncate">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 px-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {u.roles.map(role => (
                                                        <div key={role} className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider ${role.includes('ADMIN') ? 'bg-primary/5 text-primary border-primary/10' : 'bg-secondary/40 text-muted-foreground border-border/50'}`}>
                                                            {role.includes('ADMIN') ? <ShieldCheck className="h-2.5 w-2.5" /> : <Shield className="h-2.5 w-2.5" />}
                                                            <span>{role.replace('ROLE_', '')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 px-6 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {updating === u.id && <Loader2 className="h-3 w-3 text-primary animate-spin" />}
                                                    <Select
                                                        disabled={updating === u.id}
                                                        onValueChange={(val) => handleRoleUpdate(u.id, val)}
                                                        defaultValue={u.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : u.roles.includes('ROLE_MODERATOR') ? 'ROLE_MODERATOR' : 'ROLE_USER'}
                                                    >
                                                        <SelectTrigger className="w-36 bg-secondary/30 border-border rounded-lg h-8 font-bold text-[8px] tracking-widest text-foreground uppercase px-3 transition-all">
                                                            <SelectValue placeholder="ACCESS" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border-border rounded-xl shadow-2xl font-bold">
                                                            <SelectItem value="ROLE_USER" className="text-[9px] uppercase py-2">USER / STAFF</SelectItem>
                                                            <SelectItem value="ROLE_MODERATOR" className="text-[9px] uppercase py-2">MODERATOR</SelectItem>
                                                            <SelectItem value="ROLE_ADMIN" className="text-[9px] uppercase py-2 text-primary">ADMINISTRATOR</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>

                    {/* Compact Pagination Footer */}
                    <div className="p-6 border-t border-border bg-secondary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                            Viewing <span className="text-primary font-bold">{users.length}</span> / <span className="text-primary font-bold">{totalUsers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="h-8 w-8 rounded-lg border-border bg-card p-0 hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(i + 1)}
                                        disabled={loading}
                                        className={`h-8 w-8 rounded-lg font-bold text-[9px] transition-all ${currentPage === i + 1 ? 'shadow-none' : 'bg-card'}`}
                                    >
                                        {i + 1}
                                    </Button>
                                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="h-8 w-8 rounded-lg border-border bg-card p-0 hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

