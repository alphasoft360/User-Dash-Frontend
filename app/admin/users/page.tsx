"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Shield,
    User,
    Mail,
    ShieldCheck,
    Search,
    Filter,
    Loader2,
    CheckCircle2,
    Calendar,
    ChevronRight,
    AtSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface UserData {
    id: number;
    email: string;
    roles: string[];
    name: string;
    createdAt?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [updating, setUpdating] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId: number, newRole: string) => {
        try {
            setUpdating(userId);
            const response = await api.patch(`/admin/users/${userId}/role`, { roles: [newRole] });
            setUsers(users.map(u => u.id === userId ? { ...u, roles: response.data.user.roles } : u));
            toast.success("User protocol elevated successfully");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to update access level");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const nameMatch = (user.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const emailMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const roleMatch = roleFilter === 'ALL' || user.roles.includes(roleFilter);
            return (nameMatch || emailMatch) && roleMatch;
        });
    }, [users, searchQuery, roleFilter]);

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic">Accessing Global User Identity Database...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic uppercase">USER <span className="text-primary not-italic">Identity</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Access Control & Global Directory Management.</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/5 w-full">
                <div className="px-6 py-4 bg-secondary/20 flex items-center justify-between border-b border-border">
                    <div className="flex items-center text-foreground font-black tracking-widest uppercase text-xs italic">
                        <Filter className="mr-3 h-4 w-4 text-primary" />
                        Directory Filters
                    </div>
                </div>

                <div className="p-6 bg-card/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Identity</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-border rounded-xl h-12 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Protocol</Label>
                            <div className="flex flex-wrap gap-2">
                                {['ALL', 'ROLE_USER', 'ROLE_ADMIN'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setRoleFilter(role)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${roleFilter === role ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                                    >
                                        {role.replace('ROLE_', '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/30">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase">
                        <Users className="mr-4 h-6 w-6 text-primary" />
                        Authenticated Entities ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-background/50">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User Overview</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current Protocol</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Access Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest opacity-50 italic">
                                            No entities found matching the query
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-secondary/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-primary mr-4 shadow-inner">
                                                    <span className="text-lg uppercase italic font-black">{u.name?.[0] || u.email[0].toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground group-hover:text-primary transition-colors tracking-tighter uppercase italic text-sm">
                                                        {u.name || 'ANONYMOUS ENTITY'}
                                                    </span>
                                                    <div className="flex items-center space-x-2 text-muted-foreground text-[10px] font-bold">
                                                        <AtSign className="h-3 w-3" />
                                                        <span>{u.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-2">
                                                {u.roles.map(role => (
                                                    <div key={role} className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${role.includes('ADMIN') ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                                                        {role.includes('ADMIN') ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                        <span>{role.replace('ROLE_', '')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end items-center gap-4">
                                                {updating === u.id && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                                                <Select
                                                    disabled={updating === u.id}
                                                    onValueChange={(val) => handleRoleUpdate(u.id, val)}
                                                    defaultValue={u.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : u.roles.includes('ROLE_MODERATOR') ? 'ROLE_MODERATOR' : 'ROLE_USER'}
                                                >
                                                    <SelectTrigger className="w-48 bg-secondary/50 border-border rounded-xl h-11 font-black text-[10px] tracking-widest focus:ring-primary/20 text-foreground uppercase italic px-4">
                                                        <SelectValue placeholder="SET ACCESS" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-border text-foreground rounded-2xl border-t-4 border-t-primary/20 shadow-2xl dark:bg-slate-900">
                                                        <SelectItem value="ROLE_USER" className="font-bold text-[10px] tracking-widest uppercase py-3">STAFF / USER</SelectItem>
                                                        <SelectItem value="ROLE_MODERATOR" className="font-bold text-[10px] tracking-widest uppercase py-3">MODERATOR</SelectItem>
                                                        <SelectItem value="ROLE_ADMIN" className="font-bold text-[10px] tracking-widest uppercase py-3 text-primary">ADMINISTRATOR</SelectItem>
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
            </Card>
        </div>
    );
}

