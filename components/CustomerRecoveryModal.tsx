'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RotateCcw, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
    id: number;
    name: string;
    phone: string;
    labName?: string;
    city?: string;
    address?: string;
    totalSpent: number;
    remainingBalance: number;
}

interface CustomerRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestoreSuccess: () => void;
}

export default function CustomerRecoveryModal({ isOpen, onClose, onRestoreSuccess }: CustomerRecoveryModalProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchDeletedCustomers = useCallback(async (currentPage = page, searchQuery = search) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/labs/customers', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchQuery,
                    status: 'inactive'
                }
            });
            if (response.data.data) {
                setCustomers(response.data.data);
                setTotalPages(response.data.pages || 1);
                setTotalItems(response.data.total || 0);
            }
        } catch (err) {
            console.error("Failed to load deleted customers", err);
            toast.error("Failed to load recovery registry");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (isOpen) {
            fetchDeletedCustomers(1, '');
            setPage(1);
            setSearch('');
        }
    }, [isOpen, fetchDeletedCustomers]);

    const handleRestore = async (id: number) => {
        try {
            await api.patch(`/admin/labs/customers/${id}/restore`);
            toast.success("Customer restored successfully");
            fetchDeletedCustomers();
            onRestoreSuccess();
        } catch (err) {
            toast.error("Failed to restore customer");
        }
    };

    const handlePermanentDelete = async (id: number) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this customer? This action cannot be undone and will only work if there are no associated orders.")) return;
        try {
            await api.delete(`/admin/labs/customers/${id}/permanent`);
            toast.success("Customer permanently deleted");
            fetchDeletedCustomers();
        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to permanently delete customer";
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">CUSTOMER <span className="text-primary not-italic">Recovery</span></h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Restore or permanently remove inactive customers</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-secondary h-10 w-10"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8 bg-secondary/5 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone or lab..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                                fetchDeletedCustomers(1, e.target.value);
                            }}
                            className="pl-10 bg-card border-border rounded-xl h-12 font-bold"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lab/Clinic</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Remaining Balance</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                        No deleted customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow key={customer.id} className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0 group">
                                        <TableCell className="p-4">
                                            <div>
                                                <p className="font-bold text-foreground">{customer.name}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase font-black">ID: {customer.id}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4 font-medium text-sm">
                                            {customer.labName || 'N/A'}
                                        </TableCell>
                                        <TableCell className="p-4 text-sm text-muted-foreground font-medium">
                                            {customer.phone}
                                        </TableCell>
                                        <TableCell className="p-4 text-right">
                                            <span className={`font-black text-sm ${customer.remainingBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                PKR {customer.remainingBalance.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleRestore(customer.id)}
                                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                    Restore
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handlePermanentDelete(customer.id)}
                                                    className="h-9 w-9 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg border border-transparent hover:border-red-500/20"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-border bg-secondary/5 flex items-center justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Total {totalItems} items
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newPage = Math.max(1, page - 1);
                                    setPage(newPage);
                                    fetchDeletedCustomers(newPage);
                                }}
                                disabled={page === 1 || loading}
                                className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                            >
                                Previous
                            </Button>
                            <span className="text-xs font-black px-4">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newPage = Math.min(totalPages, page + 1);
                                    setPage(newPage);
                                    fetchDeletedCustomers(newPage);
                                }}
                                disabled={page === totalPages || loading}
                                className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
