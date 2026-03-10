'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import debounce from 'lodash/debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, User, Phone, MapPin, Building, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Download } from 'lucide-react';

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

export default function CustomersLabPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [isStatementOpen, setIsStatementOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

    const fetchCustomers = async (currentPage = page, searchQuery = search) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/labs/customers', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchQuery
                }
            });
            // Handle both paginated response and old array response (just in case)
            if (response.data.data && Array.isArray(response.data.data)) {
                setCustomers(response.data.data);
                setTotalPages(response.data.pages || 1);
                setTotalItems(response.data.total || 0);
            } else if (Array.isArray(response.data)) {
                setCustomers(response.data);
            }
        } catch (err) {
            console.error("Failed to load customers", err);
            toast.error("Failed to load customer registry");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search to prevent excessive API calls
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setPage(1); // Reset to first page on new search
            fetchCustomers(1, query);
        }, 500),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        fetchCustomers(page, search);
    }, [page]); // Re-fetch only when page changes here, search is handled by debounce

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSearch(val);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this customer record?")) return;
        try {
            await api.delete(`/admin/labs/customers/${id}`);
            toast.success("Customer record deleted");
            fetchCustomers();
        } catch (err) {
            toast.error("Failed to delete customer");
        }
    };

    const handleDownloadStatement = async () => {
        if (!selectedCustomer) return;
        setDownloading(true);
        try {
            const response = await api.get(`/admin/labs/invoice/customer/${selectedCustomer.id}`, {
                params: {
                    period,
                    year: selectedYear,
                    month: selectedMonth
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Statement-${selectedCustomer.name}-${period}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsStatementOpen(false);
            toast.success("Statement downloaded successfully");
        } catch (err) {
            console.error("Statement error", err);
            toast.error("Failed to generate statement");
        } finally {
            setDownloading(false);
        }
    };

    // Note: Filtering is now handled on the backend!
    const filteredCustomers = customers;

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = [
        { name: 'January', val: '1' }, { name: 'February', val: '2' }, { name: 'March', val: '3' },
        { name: 'April', val: '4' }, { name: 'May', val: '5' }, { name: 'June', val: '6' },
        { name: 'July', val: '7' }, { name: 'August', val: '8' }, { name: 'September', val: '9' },
        { name: 'October', val: '10' }, { name: 'November', val: '11' }, { name: 'December', val: '12' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">CUSTOMER <span className="text-primary not-italic">Registry</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Manage Lab & Pharmacy Customers.</p>
                </div>
                <Link href="/admin/customers-lab/new">
                    <Button
                        className="bg-primary hover:opacity-90 text-primary-foreground font-black px-8 rounded-2xl h-14 shadow-lg shadow-primary/20 flex items-center gap-3 uppercase italic"
                    >
                        <Plus className="h-5 w-5" />
                        REGISTER NEW CUSTOMER
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="max-w-md space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Database</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone or lab..."
                            value={search}
                            onChange={handleSearchChange}
                            className="pl-10 bg-secondary/30 border-border rounded-xl h-12 font-bold"
                        />
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 border-b border-border bg-secondary/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <User className="h-6 w-6 text-primary" />
                        REGISTERED CLIENTS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none">
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer / Identity</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Laboratory / Clinic</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Info</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right border-l border-border/10">Total Spent</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-red-500 text-right border-l border-border/10">Pending Amount</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground animate-pulse font-bold">
                                        Loading customer data...
                                    </TableCell>
                                </TableRow>
                            ) : filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground italic">
                                        No customers found in registry.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0 group">
                                        <TableCell className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs uppercase tracking-tighter">
                                                    {customer.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{customer.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black">ID: {customer.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-6 font-bold text-sm">
                                            {customer.labName || 'N/A'}
                                        </TableCell>
                                        <TableCell className="p-6 text-sm text-muted-foreground font-medium">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-primary" />
                                                {customer.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-6 text-sm text-muted-foreground font-medium uppercase tracking-tight">
                                            {customer.city || 'N/A'}
                                        </TableCell>
                                        <TableCell className="p-6 text-right border-l border-border/10">
                                            <span className="font-black text-foreground">
                                                ${customer.totalSpent.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-6 text-right border-l border-border/10">
                                            <span className={`font-black ${customer.remainingBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                ${(customer.remainingBalance || 0).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-6 text-right pr-10">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setIsStatementOpen(true);
                                                    }}
                                                >
                                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                                    View Sales
                                                </Button>
                                                <Link href={`/admin/customers-lab/${customer.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit Customer"
                                                        className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg border border-transparent hover:border-primary/20"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete Customer"
                                                    className="h-9 w-9 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg border border-transparent hover:border-red-500/20"
                                                    onClick={() => handleDelete(customer.id)}
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, totalItems)}</span> of <span className="text-foreground">{totalItems}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                                >
                                    Previous
                                </Button>
                                <div className="px-4 py-2 rounded-xl bg-secondary/30 text-xs font-black">
                                    Page {page} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* STATEMENT SELECTION MODAL */}
            {isStatementOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">ACCOUNT <span className="text-primary not-italic">Statement</span></h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Select period for {selectedCustomer?.name}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsStatementOpen(false)}
                                className="rounded-full hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Summary Type</Label>
                                <div className="flex p-1 bg-secondary/30 rounded-2xl gap-1">
                                    <button
                                        onClick={() => setPeriod('monthly')}
                                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${period === 'monthly' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setPeriod('yearly')}
                                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all ${period === 'yearly' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year</Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="bg-secondary/30 border-border rounded-xl h-12 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y} className="font-bold">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {period === 'monthly' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-500">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Month</Label>
                                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                            <SelectTrigger className="bg-secondary/30 border-border rounded-xl h-12 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => (
                                                    <SelectItem key={m.val} value={m.val} className="font-bold">{m.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full bg-primary hover:opacity-90 text-primary-foreground font-black h-16 rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase italic text-lg mt-4 group"
                                onClick={handleDownloadStatement}
                                disabled={downloading}
                            >
                                {downloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6 group-hover:translate-y-0.5 transition-transform" />}
                                DOWNLOAD STATEMENT
                            </Button>

                            <p className="text-[9px] text-center text-muted-foreground font-medium px-4 uppercase tracking-tighter opacity-60">
                                Statements are generated as secure PDF documents showing all purchase history and inventory usage for the selected period.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
