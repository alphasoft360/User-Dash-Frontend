'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import {
    Search,
    MonitorPlay,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    UserCircle,
    Phone,
    Loader2,
    Receipt,
    CheckCircle,
    Wallet,
    ChevronLeft,
    ChevronRight,
    Filter,
    FileDown,
    Percent
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    image?: string;
}

interface CartItem extends Product {
    cartQuantity: number;
}

interface Category {
    id: number;
    name: string;
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    // Filtering state
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [amountGiven, setAmountGiven] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Success State
    const [lastOrderId, setLastOrderId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoadingProducts(true);
            const response = await api.get('/admin/products', {
                params: {
                    search: appliedSearch || undefined,
                    category: selectedCategory === 'all' ? undefined : selectedCategory,
                    page: currentPage,
                    limit: pageSize
                }
            });
            setProducts(response.data.data);
            setTotalPages(response.data.totalPages || Math.ceil(response.data.total / pageSize));
            setTotalItems(response.data.total);
        } catch (err) {
            toast.error("Failed to sync inventory");
        } finally {
            setLoadingProducts(false);
        }
    }, [appliedSearch, selectedCategory, currentPage, pageSize]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedSearch(search);
        setCurrentPage(1); // Reset to first page on search
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.stock) {
                    toast.error(`Only ${product.stock} units available in stock`);
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
                );
            } else {
                if (product.stock <= 0) {
                    toast.error("Item out of stock");
                    return prev;
                }
                return [...prev, { ...product, cartQuantity: 1 }];
            }
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = item.cartQuantity + delta;
                if (newQuantity <= 0) return item; // Handled by remove
                if (newQuantity > item.stock) {
                    toast.error(`Only ${item.stock} units available`);
                    return item;
                }
                return { ...item, cartQuantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.cartQuantity), 0);
    const discountValue = (subtotal * (parseFloat(discountPercentage) || 0)) / 100;
    const total = subtotal - discountValue;
    const changeDue = amountGiven ? parseFloat(amountGiven) - total : 0;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        if (amountGiven && parseFloat(amountGiven) < total) {
            toast.error("Amount given is less than total");
            return;
        }

        try {
            setIsProcessing(true);
            const payload = {
                customerName: customerName.trim() || 'Walk-In Customer',
                phone: customerPhone.trim() || null,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity
                })),
                amountTendered: amountGiven ? parseFloat(amountGiven) : null,
                changeDue: changeDue > 0 ? changeDue : 0,
                discountPercentage: parseFloat(discountPercentage) || 0,
                discountAmount: discountValue
            };

            const response = await api.post('/admin/orders/walk-in', payload);
            toast.success("Transaction Complete");

            // Show Success screen with Receipt ID
            setLastOrderId(response.data.orderId);

            // Re-fetch products to get updated stock
            fetchProducts();

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Checkout failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const startNewSale = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setAmountGiven('');
        setDiscountPercentage('');
        setLastOrderId(null);
    };

    const handleDownloadInvoice = async () => {
        if (!lastOrderId) return;

        try {
            const response = await api.get(`/invoice/download`, {
                params: { orderId: lastOrderId },
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${lastOrderId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Invoice downloaded successfully");
        } catch (err: any) {
            console.error("Download error:", err);

            // Try to read error message from blob
            if (err.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result as string);
                        toast.error(`Download failed: ${errorData.message || 'Unknown error'}`);
                    } catch {
                        toast.error("Failed to download invoice");
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                toast.error("Failed to download invoice");
            }
        }
    };

    if (lastOrderId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
                <div className="bg-emerald-500/10 h-32 w-32 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="h-16 w-16 text-emerald-500 animate-in spin-in-180 duration-700" />
                </div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Transaction <span className="text-emerald-500">Successful</span></h1>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-sm mb-12 opacity-50">Local Order ID: #{lastOrderId}</p>

                <div className="flex gap-4">
                    <Button
                        onClick={handleDownloadInvoice}
                        className="h-14 px-10 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:-translate-y-1 transition-all"
                    >
                        <FileDown className="mr-3 h-5 w-5" /> Download Invoice
                    </Button>
                    <Button onClick={startNewSale} className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                        <MonitorPlay className="mr-3 h-5 w-5" /> Next Customer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-1rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 overflow-hidden px-4 pb-4 -mt-8">

            {/* Left Panel: Inventory/Search */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-border bg-secondary/30 flex-none pb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <MonitorPlay className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-black text-foreground tracking-tighter italic uppercase leading-none">
                            Point of <span className="text-primary not-italic">Sale</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Scan or search inventory..."
                                autoFocus
                                className="pl-14 bg-background border-border rounded-2xl h-14 font-black text-lg focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="w-[180px] shrink-0">
                            <Select value={selectedCategory} onValueChange={(val) => {
                                setSelectedCategory(val);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="h-14 bg-background border-border rounded-2xl font-black uppercase text-[10px] tracking-widest pl-5 shadow-inner focus:ring-primary/20">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Category" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border bg-card shadow-2xl font-black uppercase text-[10px] tracking-widest">
                                    <SelectItem value="all">All Items</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                            {loadingProducts ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                        </Button>
                    </form>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-background/50 custom-scrollbar">
                    {products.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-center font-black uppercase tracking-widest text-[10px] opacity-30 italic border-2 border-dashed border-border rounded-3xl p-10">
                                No items found in registry
                            </p>
                        </div>
                    ) : (
                        <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm mb-20 relative">
                            <Table>
                                <TableHeader className="bg-secondary/30 sticky top-0 z-10 backdrop-blur-md">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] w-[60px] text-center">Icon</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Product</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Price</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Stock</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map(product => (
                                        <TableRow
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className={`cursor-pointer transition-colors border-border/50 ${product.stock > 0 ? 'hover:bg-primary/5' : 'opacity-40 grayscale hover:bg-destructive/5'}`}
                                        >
                                            <TableCell className="p-2 sm:p-4 text-center align-middle">
                                                <div className="h-10 w-10 bg-secondary/50 rounded-lg flex items-center justify-center border border-border/50 mx-auto">
                                                    <span className="text-lg font-black text-muted-foreground/60 uppercase italic">{product.name[0]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2 sm:p-4 align-middle">
                                                <span className="font-black text-sm uppercase tracking-tighter text-foreground/90">{product.name}</span>
                                            </TableCell>
                                            <TableCell className="p-2 sm:p-4 text-right align-middle font-black text-primary italic text-sm">
                                                ${parseFloat(product.price).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="p-2 sm:p-4 text-right align-middle">
                                                <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-md inline-block ${product.stock > 0 ? 'bg-secondary text-foreground/70' : 'bg-destructive/10 text-destructive'}`}>
                                                    {product.stock > 0 ? product.stock : 'OUT OF STOCK'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-2 sm:p-4 text-right align-middle">
                                                <Button size="sm" variant="secondary" className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20">
                                                    Add
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-border bg-secondary/20 flex-none flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} matches
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || loadingProducts}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="h-10 px-4 rounded-xl border-border bg-background font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>

                        <div className="bg-background border border-border px-4 h-10 rounded-xl flex items-center justify-center font-black text-[10px] tracking-widest text-foreground shadow-inner">
                            {currentPage} / {totalPages}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0 || loadingProducts}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="h-10 px-4 rounded-xl border-border bg-background font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Transaction Cart */}
            <div className="w-full md:w-[950px] xl:w-[500px] flex-none flex flex-col bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b border-border bg-linear-to-br from-primary/5 to-transparent flex-none z-10">
                    <h2 className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase mb-1">
                        <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
                        Current Bill
                    </h2>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-50">Local Transaction Matrix</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-secondary/5 custom-scrollbar z-10">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-6">
                            <ShoppingCart className="h-20 w-20 mb-2 text-muted-foreground" />
                            <p className="font-black uppercase tracking-[0.2em] text-[12px] italic">Cart is empty<br />Scan items to begin</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart.map(item => (
                                <div key={item.id} className="flex flex-col gap-5 p-6 bg-background border border-border rounded-2xl shadow-sm animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black uppercase text-sm tracking-tighter leading-none w-3/4 pr-2">{item.name}</h4>
                                        <span className="font-black italic text-primary">${(parseFloat(item.price) * item.cartQuantity).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 border border-border">
                                            <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 p-0 rounded-lg hover:bg-background hover:text-foreground">
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="font-black text-sm w-8 text-center">{item.cartQuantity}</span>
                                            <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 p-0 rounded-lg hover:bg-background hover:text-foreground">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="h-10 w-10 p-0 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-background flex-none z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="space-y-4 mb-6">
                        <div className="relative group">
                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Walk-In Customer Name"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-primary/20 text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Phone Number (Optional)"
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-primary/20 text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="number"
                                placeholder="Amount Given"
                                value={amountGiven}
                                onChange={e => setAmountGiven(e.target.value)}
                                min="0"
                                step="any"
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-primary/20 text-sm"
                            />
                        </div>
                        <div className="relative group">
                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="number"
                                placeholder="Discount Percentage (%)"
                                value={discountPercentage}
                                onChange={e => setDiscountPercentage(e.target.value)}
                                min="0"
                                max="100"
                                step="any"
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-12 font-bold focus-visible:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-6 px-2">
                        <div className="flex items-end justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Total Amount</span>
                            <span className="text-4xl font-black italic text-foreground tracking-tighter leading-none">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-end justify-between pt-3 border-t border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Change Due</span>
                            <span className={`text-2xl font-black italic tracking-tighter leading-none ${changeDue > 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                ${changeDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        disabled={isProcessing || cart.length === 0 || !!(amountGiven && parseFloat(amountGiven) < total)}
                        className="w-full h-16 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/25 disabled:opacity-50 transition-all hover:-translate-y-1"
                    >
                        {isProcessing ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Receipt className="h-6 w-6 mr-3" />}
                        COMPLETE SALE
                    </Button>
                </div>
            </div>
        </div>
    );
}
