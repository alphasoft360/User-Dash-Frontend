"use client";

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    ArrowUpRight,
    ShoppingBag,
    FileText,
    Plus,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

interface VendorOrder {
    id: number;
    vendorName: string;
    productId: number;
    productName: string;
    quantity: number;
    status: 'pending' | 'approved' | 'received' | 'cancelled';
    createdAt: string;
    receivedAt: string | null;
}

export default function OrdersPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [productName, setProductName] = useState('');
    const [orderId, setOrderId] = useState('');
    const [category, setCategory] = useState('');
    const [productId, setProductId] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchOrdersWithParams = async (
        f: string = filter,
        pN: string = productName,
        oI: string = orderId,
        c: string = category,
        pI: string = productId,
        pg: number = page
    ) => {
        try {
            const query = new URLSearchParams({
                status: f,
                page: pg.toString(),
                limit: limit.toString(),
                ...(pN && { productName: pN }),
                ...(oI && { orderId: oI }),
                ...(c && { category: c }),
                ...(pI && { productId: pI }),
            });
            const url = `/admin/vendor-orders?${query.toString()}`;
            const response = await api.get(url);
            setOrders(response.data.data);
            setTotalPages(response.data.pages);
        } catch (err) {
            toast.error("Failed to load supply orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = () => fetchOrdersWithParams();

    useEffect(() => {
        // Only fetch on initial load or page change
        fetchOrders();
    }, [page]);

    const handleApplyFilters = () => {
        setPage(1); // Reset to first page
        fetchOrders();
    };

    const handleClearFilters = () => {
        setFilter('');
        setProductName('');
        setOrderId('');
        setCategory('');
        setProductId('');
        setPage(1);
        fetchOrdersWithParams('', '', '', '', '', 1);
    };


    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/admin/vendor-orders/${id}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDownloadInvoice = async (id: number) => {
        try {
            const response = await api.get(`/invoice/buyer/download?vendorOrderId=${id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-VO-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Invoice downloaded successfully");
        } catch (err) {
            toast.error("Failed to download invoice");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'approved': return <Truck className="h-4 w-4" />;
            case 'received': return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'received': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-secondary text-muted-foreground';
        }
    };

    if (loading && orders.length === 0) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase">Fetching Global Supply Chain...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic uppercase">SUPPLY <span className="text-primary not-italic">Orders</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Track and manage inventory restock requests from all vendors.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Link href={`/${companySlug}/admin/orders/new`}>
                        <Button className="bg-primary hover:opacity-90 text-primary-foreground font-black text-[10px] tracking-widest h-11 px-8 rounded-xl shadow-lg shadow-primary/20 uppercase">
                            <Plus className="mr-2 h-4 w-4" /> Create New Order
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/5 w-full">
                <div className="px-6 py-4 bg-secondary/20 flex items-center justify-between border-b border-border">
                    <div className="flex items-center text-foreground font-black tracking-widest uppercase text-xs italic">
                        <Filter className="mr-3 h-4 w-4 text-primary" />
                        Search & Filters
                    </div>
                </div>

                <div className="p-6 bg-card/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name..."
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-border rounded-xl h-10 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Order ID..."
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-border rounded-xl h-10 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Category Name or ID..."
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-border rounded-xl h-10 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product ID</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Exact Product ID..."
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-border rounded-xl h-10 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Status:</span>
                        {['', 'pending', 'approved', 'received', 'cancelled'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === s ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                            >
                                {s || 'ALL'}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-black text-[10px] tracking-widest h-11 px-8 rounded-xl uppercase transition-colors"
                        >
                            Clear Filters
                        </Button>
                        <Button
                            onClick={handleApplyFilters}
                            className="bg-primary hover:opacity-90 text-primary-foreground font-black text-[10px] tracking-widest h-11 px-8 rounded-xl shadow-lg shadow-primary/20 uppercase"
                        >
                            <Search className="mr-2 h-4 w-4" /> Apply Filters
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/30">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase">
                        <ShoppingBag className="mr-4 h-6 w-6 text-primary" />
                        GLOBAL REQUEST LIST ({orders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-background/50">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ID & Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Supplier / Product</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Qty</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Update Flow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest opacity-50 italic">
                                            No orders found matching the criteria
                                        </td>
                                    </tr>
                                ) : orders.map((o) => (
                                    <tr key={o.id} className="hover:bg-secondary/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground group-hover:text-primary transition-colors tracking-tighter">#SUP-{o.id}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold">{new Date(o.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground flex items-center">
                                                    {o.vendorName}
                                                    <ArrowUpRight className="ml-1.5 h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                                </span>
                                                <span className="text-xs text-muted-foreground uppercase font-black tracking-widest flex items-center">
                                                    <Package className="mr-1.5 h-3 w-3" /> <span className="text-primary/70 mr-1">[ID: {o.productId}]</span> {o.productName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-black text-foreground text-lg tracking-tighter">{o.quantity.toLocaleString()}</span>
                                            <span className="text-[10px] text-muted-foreground ml-1.5 font-bold uppercase">Units</span>
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest space-x-2 ${getStatusColor(o.status)}`}>
                                                {getStatusIcon(o.status)}
                                                <span>{o.status}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 text-foreground items-center">
                                                {o.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(o.id, 'approved')}
                                                        className="h-10 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 rounded-xl font-black text-[10px] tracking-widest"
                                                    >
                                                        APPROVE
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDownloadInvoice(o.id)}
                                                    className="h-10 px-4 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border-purple-500/20 rounded-xl font-black text-[10px] tracking-widest"
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    INVOICE
                                                </Button>
                                                {o.status === 'approved' && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(o.id, 'received')}
                                                        className="h-10 px-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20 rounded-xl font-black text-[10px] tracking-widest"
                                                    >
                                                        MARK RECEIVED
                                                    </Button>
                                                )}
                                                {o.status !== 'received' && o.status !== 'cancelled' && (
                                                    <Button
                                                        onClick={() => handleStatusUpdate(o.id, 'cancelled')}
                                                        variant="ghost"
                                                        className="h-10 px-4 text-red-500 hover:bg-red-500/10 rounded-xl font-black text-[10px] tracking-widest"
                                                    >
                                                        CANCEL
                                                    </Button>
                                                )}
                                                {o.status === 'received' && (
                                                    <span className="text-[10px] font-black text-emerald-500 italic uppercase bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm items-center">STOCK UPDATED ✓</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {
                totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pb-10">
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            variant="outline"
                            className="rounded-xl font-black text-[10px] tracking-widest uppercase h-10 px-6 border-border hover:bg-secondary transition-all disabled:opacity-30"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === p ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border border-border hover:border-primary/50'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            variant="outline"
                            className="rounded-xl font-black text-[10px] tracking-widest uppercase h-10 px-6 border-border hover:bg-secondary transition-all disabled:opacity-30"
                        >
                            Next
                        </Button>
                    </div>
                )
            }
        </div >
    );
}
