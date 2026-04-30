'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Search,
    Users,
    Download,
    CheckCircle2,
    X,
    Loader2,
    Banknote,
    FileText,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import api from '@/lib/api';
import { toast } from 'sonner';

interface Customer {
    id: number;
    name: string;
    phone: string;
    labName: string;
    remainingBalance: number;
    totalSpent: number;
    totalPaid?: number;
}

export default function CashRecoveryPage() {
    const params = useParams();
    const companySlug = params.companySlug as string;

    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showBranding, setShowBranding] = useState(true);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [recoveryAmount, setRecoveryAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successData, setSuccessData] = useState<{ recoveryId: number, amount: number } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/cash-recovery/customers`, {
                params: {
                    search: searchQuery,
                    page: page,
                    limit: 10,
                    pending: 'true'
                }
            });
            setCustomers(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            console.error('Failed to fetch customers', error);
            const message = error.response?.data?.message || 'Failed to load customer data';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery, page]);

    const handleRecovery = async () => {
        if (!selectedCustomer || !recoveryAmount) return;

        const amount = parseFloat(recoveryAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > selectedCustomer.remainingBalance) {
            toast.error(`Amount cannot exceed the pending balance of PKR ${selectedCustomer.remainingBalance}`);
            return;
        }

        setIsProcessing(true);
        try {
            const response = await api.post(`/admin/cash-recovery/pay`, {
                customerId: selectedCustomer.id,
                amount: amount,
                remarks: remarks
            });

            setSuccessData({
                recoveryId: response.data.recoveryId,
                amount: amount
            });

            toast.success('Payment recorded successfully');
            fetchCustomers();
        } catch (error) {
            console.error('Payment failed', error);
            toast.error('Failed to record payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = async (id: number) => {
        try {
            toast.info(`Downloading payment receipt...`);
            const response = await api.get(`/admin/labs/invoice/recovery/${id}`, {
                params: { showHeader: showBranding },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt-RECOV-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Download failed");
        }
    };

    const handlePreview = async (id: number) => {
        setPreviewing(true);
        try {
            toast.info(`Generating receipt preview...`);
            const response = await api.get(`/admin/labs/invoice/recovery/${id}`, {
                params: { showHeader: showBranding, preview: true },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (err) {
            toast.error("Preview failed");
        } finally {
            setPreviewing(false);
        }
    };

    const stats = {
        totalPending: customers.reduce((acc, curr) => acc + curr.remainingBalance, 0),
        customerCount: customers.length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Cash Recovery</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage and recover outstanding customer balances.</p>
                </div>
                <div className="flex items-center gap-6">
                    {/* Header & Footer Toggle */}
                    <div className="flex items-center space-x-4 bg-secondary/50 p-4 rounded-2xl border border-border">
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest">Header & Footer</span>
                            <span className="text-[10px] text-muted-foreground font-bold">INCLUDE BRANDING IN PDFS</span>
                        </div>
                        <Switch
                            checked={showBranding}
                            onCheckedChange={setShowBranding}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    <Card className="bg-primary/5 border-primary/20 shadow-none">
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Banknote className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary/70">Total Pending (Current Page)</p>
                                <p className="text-lg font-black text-primary">PKR {Math.round(stats.totalPending).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Search & Filters */}
            <Card className="border-none shadow-xl bg-secondary/30 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by name, phone or lab name..."
                            className="pl-12 bg-background/50 border-none h-14 rounded-2xl text-lg font-bold shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary/50 border-y border-border">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total Spent</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Remaining Balance</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-8">
                                                <div className="h-12 bg-secondary/50 rounded-xl w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-50">
                                                <Users className="h-12 w-12 mb-2" />
                                                <p className="text-xl font-bold">No customers found</p>
                                                <p className="text-sm">Try searching for someone else or check the filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="group hover:bg-secondary/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                                        {customer.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg group-hover:text-primary transition-colors">{customer.name}</p>
                                                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                            {customer.phone}
                                                            {customer.labName && (
                                                                <>
                                                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                                                                    <span className="text-primary/70">{customer.labName}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-foreground">
                                                PKR {Math.round(customer.totalSpent || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`px-4 py-2 rounded-xl text-lg font-black italic ${customer.remainingBalance > 0 ? 'text-pink-500 bg-pink-500/5' : 'text-emerald-500 bg-emerald-500/5'}`}>
                                                    PKR {Math.round(customer.remainingBalance).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setSuccessData(null);
                                                        setRecoveryAmount('');
                                                        setRemarks('');
                                                    }}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6"
                                                >
                                                    Recover Cash
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={page === p ? 'primary' : 'secondary'}
                            onClick={() => setPage(p)}
                            className="w-10 h-10 rounded-xl font-bold"
                        >
                            {p}
                        </Button>
                    ))}
                </div>
            )}

            {/* Recovery Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {!successData ? (
                            <>
                                <CardHeader className="pt-10 pb-6">
                                    <CardTitle className="text-3xl font-black">Record Payment</CardTitle>
                                    <CardDescription className="text-lg font-medium">
                                        Collecting payment from <span className="text-primary font-bold">{selectedCustomer.name}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 bg-secondary/50 rounded-2xl flex items-center justify-between">
                                        <p className="font-bold text-muted-foreground">Current Balance</p>
                                        <p className="text-2xl font-black text-red-500 underline decoration-red-500/30 underline-offset-8">
                                            PKR {selectedCustomer.remainingBalance.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Amount</label>
                                            <div className="relative group">
                                                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    type="number"
                                                    placeholder="Enter amount received..."
                                                    className="pl-12 bg-secondary/30 border-none h-14 rounded-2xl text-xl font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    value={recoveryAmount}
                                                    onChange={(e) => setRecoveryAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Remarks (Optional)</label>
                                            <div className="relative group">
                                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder="Reason for payment, cheque number, etc."
                                                    className="pl-12 bg-secondary/30 border-none h-14 rounded-2xl font-bold"
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            variant="secondary"
                                            className="flex-1 h-14 rounded-2xl font-bold text-lg"
                                            onClick={() => setSelectedCustomer(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-[2] h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20"
                                            onClick={handleRecovery}
                                            disabled={isProcessing || !recoveryAmount}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>Confirm Payment</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <CardContent className="pt-16 pb-12 text-center animate-in zoom-in-95 duration-500">
                                <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 border-4 border-green-500/20">
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                </div>
                                <h2 className="text-4xl font-black mb-2">Payment Confirmed!</h2>
                                <p className="text-xl font-bold text-muted-foreground mb-10">
                                    PKR {successData.amount.toLocaleString()} received from {selectedCustomer.name}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
                                    <Button
                                        className="flex-1 h-14 rounded-2xl font-black text-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                        onClick={() => handlePreview(successData.recoveryId)}
                                        disabled={previewing}
                                    >
                                        {previewing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Eye className="mr-2 h-5 w-5" />}
                                        Preview
                                    </Button>
                                    <Button
                                        className="flex-1 h-14 rounded-2xl font-black text-lg bg-primary shadow-lg shadow-primary/20"
                                        onClick={() => handleDownload(successData.recoveryId)}
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download
                                    </Button>
                                </div>

                                <Button
                                    variant="link"
                                    className="mt-8 text-primary font-bold hover:no-underline hover:opacity-80"
                                    onClick={() => setSelectedCustomer(null)}
                                >
                                    Go back to list
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>
            )}

            {/* FULL SCREEN PDF PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-[110] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary/80">RECEIPT <span className="text-foreground not-italic">Preview</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing payment receipt</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = previewUrl;
                                    link.setAttribute('download', `Receipt-Preview.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-primary/20 h-10"
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
        </div>
    );
}
