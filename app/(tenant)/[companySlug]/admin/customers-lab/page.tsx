'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, use } from 'react';
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
import { Switch } from "@/components/ui/switch";
import CustomerRecoveryModal from '@/components/CustomerRecoveryModal';
import { History } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone: string;
    labName?: string;
    city?: string;
    address?: string;
    totalSpent: number;
    totalDiscount: number;
    remainingBalance: number;
}

export default function CustomersLabPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [search, setSearch] = useState('');
    const [pendingFilter, setPendingFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

    const fetchCustomers = async (currentPage = page, searchQuery = search, pending = pendingFilter) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/labs/customers', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchQuery,
                    pending: pending === 'all' ? undefined : (pending === 'pending' ? 'true' : 'false')
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
            fetchCustomers(1, query, pendingFilter);
        }, 500),
        [pendingFilter]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        fetchCustomers(page, search, pendingFilter);
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
            fetchCustomers(page, search, pendingFilter);
        } catch (err) {
            toast.error("Failed to delete customer");
        }
    };

    const handleDownloadLedger = async () => {
        if (!selectedCustomer) return;
        setDownloading(true);
        try {
            const response = await api.get(`/admin/labs/invoice/customer/${selectedCustomer.id}`, {
                params: {
                    period: 'custom',
                    startDate,
                    endDate,
                    showHeader
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Ledger-${selectedCustomer.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsLedgerOpen(false);
            toast.success("Ledger downloaded successfully");
        } catch (err) {
            console.error("Ledger error", err);
            toast.error("Failed to generate ledger");
        } finally {
            setDownloading(false);
        }
    };

    const handlePreviewLedger = async () => {
        if (!selectedCustomer) return;
        setPreviewing(true);
        try {
            const response = await api.get(`/admin/labs/invoice/customer/${selectedCustomer.id}`, {
                params: {
                    period: 'custom',
                    startDate,
                    endDate,
                    showHeader
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (err) {
            console.error("Preview error", err);
            toast.error("Failed to generate preview");
        } finally {
            setPreviewing(false);
        }
    };

    // Note: Filtering is now handled on the backend!
    const filteredCustomers = customers;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">CUSTOMER <span className="text-primary not-italic">Registry</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Manage Lab & Pharmacy Customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsRecoveryOpen(true)}
                        className="border-primary/20 hover:border-primary text-muted-foreground hover:text-primary font-black px-6 rounded-2xl h-14 flex items-center gap-3 transition-all uppercase italic"
                    >
                        <History className="h-5 w-5" />
                        RECOVERY
                    </Button>
                    <Link href={`/${companySlug}/admin/customers-lab/new`}>
                        <Button
                            className="bg-primary hover:opacity-90 text-primary-foreground font-black px-8 rounded-2xl h-14 shadow-lg shadow-primary/20 flex items-center gap-3 uppercase italic"
                        >
                            <Plus className="h-5 w-5" />
                            REGISTER NEW CUSTOMER
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full space-y-2">
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

                    <div className="w-full md:w-64 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Filter by Status</Label>
                        <Select 
                            value={pendingFilter} 
                            onValueChange={(val) => {
                                setPendingFilter(val);
                                setPage(1);
                                fetchCustomers(1, search, val);
                            }}
                        >
                            <SelectTrigger className="bg-secondary/30 border-border rounded-xl h-12 font-bold">
                                <SelectValue placeholder="All Customers" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border rounded-xl font-bold font-sans">
                                <SelectItem value="all">All Clients</SelectItem>
                                <SelectItem value="pending">Pending Balance</SelectItem>
                                <SelectItem value="paid">No Pending Balance</SelectItem>
                            </SelectContent>
                        </Select>
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
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-emerald-500 text-right border-l border-border/10">Total Discount</TableHead>
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
                                                PKR {customer.totalSpent.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-6 text-right border-l border-border/10">
                                            <span className="font-black text-emerald-500">
                                                PKR {(customer.totalDiscount || 0).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-6 text-right border-l border-border/10">
                                            <span className={`font-black ${customer.remainingBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                PKR {(customer.remainingBalance || 0).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-6 text-right pr-10">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setIsLedgerOpen(true);
                                                    }}
                                                >
                                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                                    View Sales
                                                </Button>
                                                <Link href={`/${companySlug}/admin/customers-lab/${customer.id}/edit`}>
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

            {/* LEDGER SELECTION MODAL */}
            {isLedgerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">ACCOUNT <span className="text-primary not-italic">Ledger</span></h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Select period for {selectedCustomer?.name}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsLedgerOpen(false)}
                                className="rounded-full hover:bg-secondary"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Range Initiation</Label>
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border rounded-xl h-12 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Range Termination</Label>
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border rounded-xl h-12 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                                <div className="flex flex-col">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Header & Footer</Label>
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Include UHS branding in PDF</p>
                                </div>
                                <Switch 
                                    checked={showHeader} 
                                    onCheckedChange={setShowHeader}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Button
                                    className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-black h-16 rounded-3xl flex items-center justify-center gap-3 uppercase italic text-sm group"
                                    onClick={handlePreviewLedger}
                                    disabled={previewing || downloading}
                                >
                                    {previewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" /> }
                                    PREVIEW
                                </Button>
                                <Button
                                    className="flex-[2] bg-primary hover:opacity-90 text-primary-foreground font-black h-16 rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase italic text-sm group"
                                    onClick={handleDownloadLedger}
                                    disabled={downloading || previewing}
                                >
                                    {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />}
                                    DOWNLOAD NOW
                                </Button>
                            </div>

                            <p className="text-[9px] text-center text-muted-foreground font-medium px-4 uppercase tracking-tighter opacity-60">
                                Ledgers are generated as secure PDF documents showing all purchase history and inventory usage for the selected period.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL SCREEN PDF PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">LEDGER <span className="text-primary not-italic">Preview</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing document before download</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = previewUrl;
                                    link.setAttribute('download', `Ledger-${selectedCustomer?.name}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="bg-primary hover:opacity-90 text-primary-foreground font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-primary/20 h-10"
                            >
                                <Download className="h-4 w-4" />
                                DOWNLOAD PDF
                            </Button>
                            <div className="w-px h-8 bg-border"></div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    URL.revokeObjectURL(previewUrl);
                                    setPreviewUrl(null);
                                }}
                                className="rounded-full bg-secondary/50 hover:bg-secondary h-10 w-10 shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 w-full p-4 md:p-8 bg-secondary/5 overflow-hidden">
                        <iframe src={previewUrl} className="w-full h-full rounded-2xl shadow-2xl border border-border bg-white" />
                    </div>
                </div>
            )}

            <CustomerRecoveryModal 
                isOpen={isRecoveryOpen}
                onClose={() => setIsRecoveryOpen(false)}
                onRestoreSuccess={() => fetchCustomers(page, search, pendingFilter)}
            />
        </div>
    );
}
