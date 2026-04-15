'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import debounce from 'lodash/debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Receipt, Search, FileDown, Eye, Calendar, User, Building, Trash2, ChevronLeft, ChevronRight, Loader2, X, Edit, Plus, Minus, ShoppingCart, Percent, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Invoice {
    id: number;
    customerName: string;
    phone: string;
    totalAmount: string;
    pendingAmount: number;
    createdAt: string;
}

export default function InvoicesLabPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [showHeader, setShowHeader] = useState(true);

    // Editing State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const fetchInvoices = async (currentPage = page, searchQuery = search) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/labs/invoices', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchQuery
                }
            });
            setInvoices(response.data.data || []);
            setTotalPages(response.data.pages || 1);
            setTotalItems(response.data.total || 0);
        } catch (err) {
            console.error("Failed to load invoices", err);
            toast.error("Failed to sync invoice database");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setPage(1);
            fetchInvoices(1, query);
        }, 500),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        fetchInvoices(page, search);
    }, [page]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/admin/products', { params: { limit: 100 } });
                setAvailableProducts(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = async (id: number) => {
        setEditLoading(true);
        setIsEditModalOpen(true);
        try {
            const response = await api.get(`/admin/labs/invoices/${id}`);
            setEditingInvoice(response.data);
        } catch (err) {
            toast.error("Failed to fetch invoice details");
            setIsEditModalOpen(false);
        } finally {
            setEditLoading(false);
        }
    };

    const addItem = (product: any) => {
        if (!editingInvoice) return;
        const newItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: parseFloat(product.price),
            discountPercentage: 0,
            discountAmount: 0
        };
        setEditingInvoice({
            ...editingInvoice,
            items: [...editingInvoice.items, newItem]
        });
        setIsProductPickerOpen(false);
        setProductSearch('');
    };

    const removeItem = (index: number) => {
        const newItems = [...editingInvoice.items];
        newItems.splice(index, 1);
        setEditingInvoice({ ...editingInvoice, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...editingInvoice.items];
        const item = { ...newItems[index] };

        if (field === 'productId') {
            const product = availableProducts.find(p => p.id === parseInt(value));
            if (product) {
                item.productId = product.id;
                item.productName = product.name;
                item.price = parseFloat(product.price);
            }
        } else {
            item[field] = value;
        }

        // Recalculate item discount amount if percentage or quantity/price changed
        const subtotal = item.quantity * item.price;
        item.discountAmount = (subtotal * (item.discountPercentage || 0)) / 100;

        newItems[index] = item;
        setEditingInvoice({ ...editingInvoice, items: newItems });
    };

    const calculateNewTotals = () => {
        if (!editingInvoice) return { subtotal: 0, discount: 0, total: 0, changeDue: 0 };
        const subtotal = editingInvoice.items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
        const discount = editingInvoice.items.reduce((acc: number, item: any) => acc + (item.discountAmount || 0), 0);
        const total = subtotal - discount;
        const changeDue = (editingInvoice.amountTendered || 0) - total;
        return { subtotal, discount, total, changeDue };
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                customerName: editingInvoice.customerName,
                phone: editingInvoice.phone,
                amountTendered: editingInvoice.amountTendered,
                items: editingInvoice.items
            };
            await api.put(`/admin/labs/invoices/${editingInvoice.id}`, payload);
            toast.success("Invoice updated and synchronized");
            setIsEditModalOpen(false);
            fetchInvoices();
        } catch (err) {
            toast.error("Failed to update invoice");
        } finally {
            setSaving(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSearch(val);
    };

    const handleDownload = async (id: number) => {
        try {
            toast.info(`Downloading digital invoice #${id}...`);
            const response = await api.get(`/admin/labs/invoice/download`, {
                params: { orderId: id, showHeader },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
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
            toast.info(`Generating preview for invoice #${id}...`);
            const response = await api.get(`/admin/labs/invoice/download`, {
                params: { orderId: id, showHeader },
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


    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic text-pink-500">INVOICE <span className="text-foreground not-italic">Archive</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Digital Receipts & Billing History Records.</p>
                </div>
                <div className="flex bg-secondary/30 p-2 rounded-2xl border border-border items-center gap-4">
                    <div className="flex items-center gap-2 px-4 border-r border-border py-1">
                        <Switch 
                            id="show-header" 
                            checked={showHeader} 
                            onCheckedChange={setShowHeader}
                            className="data-[state=checked]:bg-pink-500"
                        />
                        <Label htmlFor="show-header" className="text-[9px] font-black uppercase tracking-widest cursor-pointer opacity-70">Header/Footer</Label>
                    </div>
                    <div className="flex items-center">
                        <Search className="h-10 w-10 p-2 text-muted-foreground" />
                        <Input
                            placeholder="Filter by ID or Name..."
                            value={search}
                            onChange={handleSearchChange}
                            className="bg-transparent border-none font-bold placeholder:font-medium focus-visible:ring-0 w-64 uppercase text-[10px] tracking-widest"
                        />
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden border-t-4 border-t-pink-500/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3 uppercase italic">
                        <Receipt className="h-6 w-6 text-pink-500" />
                        Billing Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Receipt ID</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Customer Node</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest text-center">Amount Due</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest text-center">Pending</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-24 text-center font-black uppercase italic text-pink-500/50 animate-pulse">Accessing Vault...</TableCell>
                                </TableRow>
                            ) : invoices.map((inv) => (
                                <TableRow key={inv.id} className="border-border hover:bg-pink-500/5 transition-colors">
                                    <TableCell className="p-8 font-black text-foreground">#{inv.id}</TableCell>
                                    <TableCell className="p-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground uppercase tracking-tighter">{inv.customerName || 'Anonymous User'}</span>
                                            <span className="text-[10px] font-black text-muted-foreground opacity-50">{inv.phone || 'NO CONTACT'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-8">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                                            <Calendar className="h-3 w-3 text-pink-500" />
                                            {new Date(inv.createdAt).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-8 text-center">
                                        <span className="font-black text-lg italic text-foreground">PKR {parseFloat(inv.totalAmount).toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell className="p-8 text-center">
                                        <span className={`font-black text-lg italic ${inv.pendingAmount > 0 ? 'text-pink-500' : 'text-muted-foreground/30'}`}>
                                            PKR {inv.pendingAmount.toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-10 w-10 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl" 
                                                onClick={() => handleEdit(inv.id)}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-10 w-10 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 rounded-xl" 
                                                onClick={() => handlePreview(inv.id)}
                                                disabled={previewing}
                                            >
                                                {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-5 w-5" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 rounded-xl" onClick={() => handleDownload(inv.id)}>
                                                <FileDown className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-24 text-center italic opacity-30 font-bold uppercase text-[10px] tracking-[0.3em]">Vault is empty</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-8 border-t border-border bg-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, totalItems)}</span> of <span className="text-foreground">{totalItems}</span> sync'd nodes
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                    className="h-11 w-11 rounded-xl border-border bg-card hover:bg-pink-500/10 hover:text-pink-500 transition-all disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="px-5 py-2.5 rounded-xl bg-background border border-border text-[10px] font-black uppercase tracking-widest shadow-inner">
                                    Page {page} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                    className="h-11 w-11 rounded-xl border-border bg-card hover:bg-pink-500/10 hover:text-pink-500 transition-all disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* FULL SCREEN PDF PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-pink-500/80">INVOICE <span className="text-foreground not-italic">Preview</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing digital receipt</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = previewUrl;
                                    link.setAttribute('download', `Invoice-Preview.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="bg-pink-500 hover:bg-pink-600 text-white font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-pink-500/20 h-10"
                            >
                                <FileDown className="h-4 w-4" />
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

            {/* EDIT INVOICE MODAL (Custom Implementation matching Lab Expenses) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
                        <div className="px-8 py-6 border-b border-border bg-card/50 flex justify-between items-start sticky top-0 z-10 backdrop-blur-xl">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                    <Edit className="h-6 w-6 text-emerald-500" />
                                    Modify <span className="text-emerald-500">Invoice</span> #{editingInvoice?.id}
                                </h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Itemized reconciliation & financial adjustment</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsEditModalOpen(false)} 
                                className="rounded-full hover:bg-foreground/10 h-10 w-10 shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {editLoading ? (
                            <div className="flex-1 p-20 text-center flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-emerald-500/50" />
                                <p className="font-black uppercase tracking-widest text-[10px] italic">Accessing Ledger Data...</p>
                            </div>
                        ) : editingInvoice && (
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32 custom-scrollbar">
                                {/* Metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Customer Name</Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                                            <Input
                                                value={editingInvoice.customerName}
                                                onChange={e => setEditingInvoice({ ...editingInvoice, customerName: e.target.value })}
                                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-emerald-500/20 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Customer Phone</Label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                                            <Input
                                                value={editingInvoice.phone}
                                                onChange={e => setEditingInvoice({ ...editingInvoice, phone: e.target.value })}
                                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-emerald-500/20 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Items Editor */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-emerald-500" />
                                            Manifest Items
                                        </h3>
                                        <Button 
                                            onClick={() => setIsProductPickerOpen(true)}
                                            size="sm"
                                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-4"
                                        >
                                            <Plus className="h-3 w-3 mr-2" /> Select Product
                                        </Button>
                                    </div>

                                    <div className="border border-border rounded-2xl overflow-hidden bg-background/50 shadow-inner">
                                        <Table>
                                            <TableHeader className="bg-secondary/30">
                                                <TableRow className="border-border hover:bg-transparent">
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest w-[40%]">Product/Reagent</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">QTY</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Unit Price</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Disc %</TableHead>
                                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Item Total</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="text-[11px] font-bold uppercase tracking-tighter">
                                                {editingInvoice.items.map((item: any, idx: number) => (
                                                    <TableRow key={idx} className="border-border hover:bg-emerald-500/5 transition-colors">
                                                        <TableCell>
                                                            <select
                                                                value={item.productId}
                                                                onChange={e => updateItem(idx, 'productId', e.target.value)}
                                                                className="w-full bg-transparent border-none focus:ring-0 font-bold uppercase cursor-pointer"
                                                            >
                                                                {availableProducts.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                                                className="h-8 w-16 mx-auto bg-card border-border rounded-lg text-center font-black"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={e => updateItem(idx, 'price', parseFloat(e.target.value))}
                                                                className="h-8 w-24 ml-auto bg-card border-border rounded-lg text-right font-black"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right italic text-pink-500">
                                                            <Input
                                                                type="number"
                                                                value={item.discountPercentage}
                                                                onChange={e => updateItem(idx, 'discountPercentage', parseFloat(e.target.value))}
                                                                className="h-8 w-16 ml-auto bg-card border-border rounded-lg text-right font-black"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-black">
                                                            PKR {(item.quantity * item.price - (item.discountAmount || 0)).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => removeItem(idx)}
                                                                className="h-8 w-8 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 rounded-lg"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {editingInvoice.items.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="p-10 text-center italic opacity-30 font-black uppercase text-[10px] tracking-widest">No items in manifest</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Summary & Reconciliation */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                            <Building className="h-3 w-3" /> Financial Adjustments
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Amount Tendered</Label>
                                                <div className="relative group w-32">
                                                    <Input
                                                        type="number"
                                                        value={editingInvoice.amountTendered}
                                                        onChange={e => setEditingInvoice({ ...editingInvoice, amountTendered: parseFloat(e.target.value) })}
                                                        className="bg-secondary/20 border-border rounded-xl h-10 font-black text-right focus-visible:ring-emerald-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 space-y-4 shadow-sm">
                                        <div className="flex items-end justify-between border-b border-emerald-500/10 pb-3 opacity-40">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Original Total</span>
                                            <span className="font-black text-sm italic">PKR {editingInvoice.total?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-end justify-between pt-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/70">Modified Total</span>
                                            <span className="text-3xl font-black italic text-foreground tracking-tighter leading-none">
                                                PKR {calculateNewTotals().total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between pt-1 opacity-60">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pending Diff</span>
                                            <span className={`font-black text-sm italic ${calculateNewTotals().changeDue < 0 ? 'text-pink-500' : 'text-emerald-500'}`}>
                                                PKR {calculateNewTotals().changeDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-8 pb-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="h-12 px-8 rounded-xl border-border bg-card font-black uppercase text-[10px] tracking-widest hover:bg-secondary/20 transition-all"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        disabled={saving || !calculateNewTotals().total}
                                        className="h-12 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                        COMMIT RECONCILIATION
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PRODUCT PICKER OVERLAY */}
                    {isProductPickerOpen && (
                        <div className="absolute inset-0 z-20 bg-card flex flex-col p-8 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                        <ShoppingCart className="h-6 w-6 text-emerald-500" />
                                        Select <span className="text-emerald-500">Product</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Search and click to add to manifest</p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsProductPickerOpen(false)}
                                    className="rounded-full h-10 w-10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    autoFocus
                                    className="pl-12 h-14 bg-secondary/30 border-border rounded-2xl font-black italic shadow-inner"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableProducts
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .map(product => (
                                            <div 
                                                key={product.id}
                                                onClick={() => addItem(product)}
                                                className="p-5 bg-card border border-border rounded-2xl hover:bg-emerald-500/5 hover:border-emerald-500/20 cursor-pointer transition-all flex flex-col gap-3 group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-xs uppercase tracking-tight w-2/3 group-hover:text-emerald-500 transition-colors">{product.name}</h4>
                                                    <span className="text-[10px] font-black bg-secondary px-2 py-1 rounded-md uppercase tracking-widest opacity-60">
                                                        STOCK: {product.stock}
                                                    </span>
                                                </div>
                                                <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/10">
                                                    <span className="text-[10px] font-bold text-muted-foreground">UNIT PRICE</span>
                                                    <span className="font-black italic text-emerald-500">PKR {parseFloat(product.price).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
