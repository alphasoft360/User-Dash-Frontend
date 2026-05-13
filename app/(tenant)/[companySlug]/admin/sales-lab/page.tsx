'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
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
    Percent,
    Building,
    Activity,
    Package,
    Eye,
    X,
    AlertTriangle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    companyName?: string;
    packSize?: string;
    expiryDate?: string;
}

interface CartItem extends Product {
    cartQuantity: number;
    discountPercentage: number;
    discountAmount: number;
    discountType: 'percent' | 'amount';
}

interface Category {
    id: number;
    name: string;
}

interface RegisteredCustomer {
    id: number;
    name: string;
    phone: string;
    labName?: string;
    city?: string;
    address?: string;
    remainingBalance: number;
}

export default function SalesLabPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [labName, setLabName] = useState('');
    const [amountGiven, setAmountGiven] = useState('');
    const [remarks, setRemarks] = useState('');
    const [previousBalancePayment, setPreviousBalancePayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [customerSearchResults, setCustomerSearchResults] = useState<RegisteredCustomer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [selectedCustomerData, setSelectedCustomerData] = useState<RegisteredCustomer | null>(null);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchSource, setSearchSource] = useState<'name' | 'phone'>('name');

    const [lastOrderId, setLastOrderId] = useState<number | null>(null);
    const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [showHeader, setShowHeader] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    }, []);

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
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedSearch(search);
        setCurrentPage(1);
    };

    const handleDownloadInvoice = async (orderId: number) => {
        setIsDownloadingInvoice(true);
        try {
            const response = await api.get(`/admin/labs/invoice/download`, {
                params: { orderId, showHeader },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Invoice downloaded successfully");
        } catch (err) {
            console.error("Download error", err);
            toast.error("Failed to download invoice");
        } finally {
            setIsDownloadingInvoice(false);
        }
    };

    const handlePreviewInvoice = async (orderId: number) => {
        setIsPreviewing(true);
        try {
            toast.info(`Generating preview for invoice #${orderId}...`);
            const response = await api.get(`/admin/labs/invoice/download`, {
                params: { orderId, showHeader },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (err) {
            toast.error("Preview failed");
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleCustomerSearch = async (query: string) => {
        setCustomerName(query);
        setSearchSource('name');
        if (selectedCustomerId) {
            setSelectedCustomerId(null);
            setSelectedCustomerData(null);
        }
        if (query.length < 2) {
            setCustomerSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        try {
            setIsSearchingCustomer(true);
            const response = await api.get('/admin/labs/customers', {
                params: { search: query }
            });
            setCustomerSearchResults(response.data.data || response.data);
            setShowSearchDropdown(true);
        } catch (err) {
            console.error("Failed to search customers", err);
        } finally {
            setIsSearchingCustomer(false);
        }
    };

    const handlePhoneSearch = async (query: string) => {
        setCustomerPhone(query);
        setSearchSource('phone');
        if (selectedCustomerId) {
            setSelectedCustomerId(null);
            setSelectedCustomerData(null);
        }

        if (query.length < 3) {
            setCustomerSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        try {
            setIsSearchingCustomer(true);
            const response = await api.get('/admin/labs/customers', {
                params: { search: query }
            });
            setCustomerSearchResults(response.data.data || response.data);
            setShowSearchDropdown(true);
        } catch (err) {
            console.error("Failed to search customers", err);
        } finally {
            setIsSearchingCustomer(false);
        }
    };
    const selectCustomer = (customer: RegisteredCustomer) => {
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setLabName(customer.labName || '');
        setSelectedCustomerId(customer.id);
        setSelectedCustomerData(customer);
        setShowSearchDropdown(false);
        toast.success(`Linked to ${customer.name}`);
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.stock) {
                    toast.error(`Only ${product.stock} units available`);
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
                return [...prev, { ...product, cartQuantity: 1, discountPercentage: 0, discountAmount: 0, discountType: 'percent' }];
            }
        });
    };

    const updateDiscount = (id: number, value: number, type: 'percent' | 'amount') => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                if (type === 'percent') {
                    const val = Math.min(100, Math.max(0, value));
                    const amount = Math.round((parseFloat(item.price) * item.cartQuantity * val) / 100);
                    return { ...item, discountPercentage: val, discountAmount: amount, discountType: 'percent' };
                } else {
                    const val = Math.max(0, value);
                    const percentage = (parseFloat(item.price) * item.cartQuantity) > 0 
                        ? (val / (parseFloat(item.price) * item.cartQuantity)) * 100 
                        : 0;
                    return { ...item, discountPercentage: percentage, discountAmount: val, discountType: 'amount' };
                }
            }
            return item;
        }));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = item.cartQuantity + delta;
                if (newQuantity <= 0) return item;
                if (newQuantity > item.stock) {
                    toast.error(`Only ${item.stock} units available`);
                    return item;
                }
                return { ...item, cartQuantity: newQuantity };
            }
            return item;
        }));
    };

    const handleManualQuantityChange = (id: number, value: string) => {
        if (value === '') {
            setCart(prev => prev.map(item =>
                item.id === id ? { ...item, cartQuantity: 0 } : item
            ));
            return;
        }

        const val = parseInt(value);
        if (isNaN(val)) return;

        setCart(prev => prev.map(item => {
            if (item.id === id) {
                if (val > item.stock) {
                    toast.error(`Only ${item.stock} units available`);
                    return { ...item, cartQuantity: item.stock };
                }
                return { ...item, cartQuantity: Math.max(0, val) };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = Math.round(cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.cartQuantity), 0));
    const totalDiscountAmount = Math.round(cart.reduce((acc, item) => {
        if (item.discountType === 'amount') {
            return acc + item.discountAmount;
        }
        const itemSubtotal = parseFloat(item.price) * item.cartQuantity;
        return acc + (itemSubtotal * item.discountPercentage) / 100;
    }, 0));
    const grandTotal = subtotal - totalDiscountAmount;
    const changeDue = Math.round((parseFloat(amountGiven) || 0) - grandTotal);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        if ((!amountGiven || parseFloat(amountGiven) < 0) && !selectedCustomerId) {
            toast.error("Please enter the amount received from the customer");
            return;
        }

        if (changeDue < 0 && !selectedCustomerId) {
            toast.error(`Non-registered customers must pay the full amount. Total is PKR ${grandTotal.toLocaleString()}`);
            return;
        }

        try {
            setIsProcessing(true);
            const payload = {
                customerName: customerName.trim() || 'Walk-In Customer',
                phone: customerPhone.trim() || null,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity,
                    discountPercentage: item.discountType === 'percent' ? item.discountPercentage : undefined,
                    discountAmount: item.discountType === 'amount' ? item.discountAmount : undefined
                })),
                amountTendered: Math.round(parseFloat(amountGiven) || 0),
                changeDue: changeDue,
                registeredCustomerId: selectedCustomerId,
                previousBalancePayment: Math.round(parseFloat(previousBalancePayment) || 0),
                remarks: remarks.trim() || null
            };

            const response = await api.post('/admin/orders/walk-in', payload);
            toast.success("Transaction Complete");
            setLastOrderId(response.data.orderId);
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
        setLabName('');
        setSelectedCustomerId(null);
        setSelectedCustomerData(null);
        setAmountGiven('');
        setRemarks('');
        setPreviousBalancePayment('');
        setLastOrderId(null);
    };

    if (lastOrderId) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-vh-70 h-[70vh] animate-in zoom-in-95 duration-500">
                    <div className="bg-primary/10 h-32 w-32 rounded-full flex items-center justify-center mb-8 border border-primary/20">
                        <CheckCircle className="h-16 w-16 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Sale <span className="text-primary">Recorded</span></h1>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mb-8">Batch Order ID: #{lastOrderId}</p>

                    <div className="flex bg-secondary/30 p-2 rounded-2xl border border-border items-center gap-3 px-4 h-14 mb-8">
                        <Switch
                            id="show-header-sales"
                            checked={showHeader}
                            onCheckedChange={setShowHeader}
                            className="data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="show-header-sales" className="text-[10px] font-black uppercase tracking-widest cursor-pointer opacity-70">Include Branding (Header/Footer)</Label>
                    </div>

                    <div className="flex flex-row items-center space-x-4">
                        <Button
                            disabled={isPreviewing}
                            onClick={() => lastOrderId && handlePreviewInvoice(lastOrderId)}
                            className="h-14 px-10 rounded-2xl bg-secondary text-foreground font-black uppercase tracking-widest min-w-[200px] hover:bg-secondary/80"
                        >
                            {isPreviewing ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="mr-3 h-5 w-5" />
                            )}
                            {isPreviewing ? 'Loading...' : 'Preview Invoice'}
                        </Button>
                        <Button
                            disabled={isDownloadingInvoice}
                            onClick={() => lastOrderId && handleDownloadInvoice(lastOrderId)}
                            className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest min-w-[200px]"
                        >
                            {isDownloadingInvoice ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : (
                                <FileDown className="mr-3 h-5 w-5" />
                            )}
                            {isDownloadingInvoice ? 'Generating...' : 'Get Invoice'}
                        </Button>
                        <Button onClick={startNewSale} className="h-14 px-10 rounded-2xl bg-secondary text-foreground font-black uppercase tracking-widest">
                            Next Transaction
                        </Button>
                    </div>
                </div>

                {/* FULL SCREEN PDF PREVIEW MODAL */}
                {previewUrl && (
                    <div className="fixed inset-0 z-100 flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">INVOICE <span className="text-foreground not-italic">Preview</span></h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Order #{lastOrderId}</p>
                            </div>
                            <div className="flex flex-row items-center space-x-4">
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.setAttribute('download', `Invoice-${lastOrderId}.pdf`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                    }}
                                    className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-primary/20 h-10"
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
            </>
        );
    }

    return (
        <div className="h-[calc(100vh+10rem)] flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 animate-in fade-in duration-500 overflow-hidden px-4 pb-4 -mt-8">

            {/* Left Panel: Inventory/Search */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/30 flex-none pb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-black text-foreground tracking-tighter italic uppercase leading-none">
                            Lab <span className="text-primary not-italic">Billing POS</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSearchSubmit} className="flex flex-row space-x-2 w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search reagent or medication..."
                                className="pl-14 bg-background border-border rounded-2xl h-14 font-black focus:ring-primary/20 transition-all shadow-inner"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="w-[180px] shrink-0">
                            <Select value={selectedCategory} onValueChange={(val) => {
                                setSelectedCategory(val);
                                setCurrentPage(1);
                            }}>
                                <SelectTrigger className="h-14 bg-background border-border rounded-2xl font-black uppercase text-[10px] tracking-widest pl-5 shadow-inner">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Category" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border bg-card shadow-2xl font-black uppercase text-[10px] tracking-widest">
                                    <SelectItem value="all">Global Catalog</SelectItem>
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

                <div className="flex-1 overflow-y-auto p-6 bg-background/50 custom-scrollbar">
                    {loadingProducts ? (
                        <div className="h-full flex items-center justify-center font-black uppercase text-[10px] tracking-widest italic opacity-50">Syncing with Laboratory Cloud...</div>
                    ) : (
                        <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm mb-20 relative">
                            <Table>
                                <TableHeader className="bg-secondary/30 sticky top-0 z-10 backdrop-blur-md">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Reagent Name</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px]">Company</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Unit Price</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Expiry</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Stock</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map(product => (
                                        <TableRow
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className={`cursor-pointer transition-colors border-border/50 ${product.stock > 0 ? 'hover:bg-primary/5' : 'opacity-40 grayscale'}`}
                                        >
                                            <TableCell className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase tracking-tighter text-foreground/90">{product.name}</span>
                                                    {product.packSize && <span className="text-[9px] font-bold text-muted-foreground uppercase">{product.packSize}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4 align-middle italic text-xs text-muted-foreground">{product.companyName || 'Generic'}</TableCell>
                                            <TableCell className="p-4 text-right align-middle font-black text-primary italic text-sm">
                                                PKR {Math.round(parseFloat(product.price)).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="p-4 text-right align-middle">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[10px] font-bold ${product.expiryDate && new Date(product.expiryDate) < new Date() ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                        {product.expiryDate || '—'}
                                                    </span>
                                                    {product.expiryDate && new Date(product.expiryDate) < new Date() && (
                                                        <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4 text-right align-middle">
                                                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-md inline-block ${product.stock > 0 ? 'bg-secondary text-foreground/70' : 'bg-red-500/10 text-red-500'}`}>
                                                    {product.stock > 0 ? `${product.stock} Units` : 'EMPTY'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-4 text-right align-middle">
                                                <Button size="sm" variant="secondary" className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest bg-primary text-white">
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

                <div className="p-4 border-t border-border bg-secondary/20 flex-none flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || loadingProducts}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="h-10 px-4 rounded-xl border-border bg-background font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Prev
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
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Total Catalog Items: {totalItems}</div>
                </div>
            </div>

            {/* Right Panel: Transaction Cart */}
            <div className="w-full md:w-[950px] xl:w-[450px] flex-none flex flex-col bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b border-border bg-linear-to-br from-primary/5 to-transparent flex-none z-10">
                    <h2 className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase mb-1">
                        <ShoppingCart className="mr-3 h-6 w-6 text-primary" />
                        Order Cart
                    </h2>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-50">Local Billing Queue</p>
                </div>

                <div className="flex-[2] min-h-0 overflow-y-auto p-4 bg-secondary/5 custom-scrollbar z-10">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                            <Package className="h-20 w-20 mb-2 text-muted-foreground" />
                            <p className="font-black uppercase tracking-[0.2em] text-[10px] italic">No items drafted</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex flex-col space-y-3 p-4 bg-background border border-border rounded-xl shadow-sm animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className="w-3/4">
                                            <h4 className="font-black uppercase text-[12px] tracking-tighter leading-none">{item.name}</h4>
                                            {item.companyName && <span className="text-[9px] font-bold text-muted-foreground italic uppercase">{item.companyName}</span>}
                                        </div>
                                        <span className="font-black italic text-primary text-sm">PKR {Math.round(parseFloat(item.price) * item.cartQuantity).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="flex flex-row items-center space-x-1 bg-secondary rounded-lg p-0.5 border border-border">
                                            <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 p-0 rounded hover:bg-background">
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <input
                                                type="number"
                                                value={item.cartQuantity || ''}
                                                onChange={(e) => handleManualQuantityChange(item.id, e.target.value)}
                                                onBlur={() => {
                                                    if (item.cartQuantity < 1) {
                                                        handleManualQuantityChange(item.id, '1');
                                                    }
                                                }}
                                                className="font-black text-xs w-8 text-center bg-transparent border-none focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 p-0 rounded hover:bg-background">
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg border border-border">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => updateDiscount(item.id, item.discountType === 'percent' ? item.discountAmount : item.discountPercentage, item.discountType === 'percent' ? 'amount' : 'percent')}
                                                className="h-6 w-6 p-0 rounded hover:bg-background text-primary"
                                            >
                                                {item.discountType === 'percent' ? <Percent className="h-3 w-3" /> : <span className="text-[10px] font-bold">PKR</span>}
                                            </Button>
                                            <input
                                                type="number"
                                                value={item.discountType === 'percent' ? item.discountPercentage : item.discountAmount}
                                                onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0, item.discountType)}
                                                className="w-12 bg-transparent font-black text-[10px] focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="0"
                                            />
                                            <span className="text-[8px] font-bold opacity-30">{item.discountType === 'percent' ? '%' : ''}</span>
                                        </div>
                                        {item.discountPercentage > 0 || item.discountAmount > 0 ? (
                                            <div className="flex flex-col items-end mr-3">
                                                <span className="text-[13px] font-black text-primary uppercase italic">-PKR {Math.round(item.discountType === 'amount' ? item.discountAmount : (parseFloat(item.price) * item.cartQuantity * item.discountPercentage) / 100).toLocaleString()}</span>
                                                <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-tighter leading-none">Savings</span>
                                            </div>
                                        ) : null}
                                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-[3] min-h-0 p-6 border-t border-border bg-background z-10 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3 mb-6">
                        <div className="relative group">
                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-20" />
                            <Input
                                placeholder="Patient / Customer Name"
                                value={customerName}
                                onChange={e => handleCustomerSearch(e.target.value)}
                                onFocus={() => {
                                    setSearchSource('name');
                                    customerName.length >= 2 && setShowSearchDropdown(true);
                                }}
                                className={`pl-11 bg-secondary/30 border-border rounded-xl h-11 font-bold text-base transition-all ${selectedCustomerId ? 'border-primary shadow-[0_0_0_1px_rgba(var(--primary),0.2)]' : ''}`}
                            />
                            {isSearchingCustomer && searchSource === 'name' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                </div>
                            )}

                            {/* SEARCH DROPDOWN FOR NAME */}
                            {showSearchDropdown && searchSource === 'name' && customerSearchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-border bg-secondary/20 flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Registered Clients</span>
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 rounded-full" onClick={() => setShowSearchDropdown(false)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {customerSearchResults.map(customer => (
                                            <div
                                                key={customer.id}
                                                onClick={() => selectCustomer(customer)}
                                                className="p-3 hover:bg-primary/10 cursor-pointer border-b border-border/50 last:border-0 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-tighter group-hover:text-primary transition-colors">{customer.name}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{customer.phone} {customer.labName ? `• ${customer.labName}` : ''}</p>
                                                </div>
                                                <div className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-20" />
                            <Input
                                placeholder="Phone Number"
                                value={customerPhone}
                                onChange={e => handlePhoneSearch(e.target.value)}
                                onFocus={() => {
                                    setSearchSource('phone');
                                    customerPhone.length >= 3 && setShowSearchDropdown(true);
                                }}
                                className={`pl-11 bg-secondary/30 border-border rounded-xl h-11 font-bold text-base transition-all ${selectedCustomerId ? 'border-primary shadow-[0_0_0_1px_rgba(var(--primary),0.2)]' : ''}`}
                            />
                            {isSearchingCustomer && searchSource === 'phone' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                </div>
                            )}

                            {/* SEARCH DROPDOWN FOR PHONE */}
                            {showSearchDropdown && searchSource === 'phone' && customerSearchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-border bg-secondary/20 flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Registered Clients</span>
                                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 rounded-full" onClick={() => setShowSearchDropdown(false)}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {customerSearchResults.map(customer => (
                                            <div
                                                key={customer.id}
                                                onClick={() => selectCustomer(customer)}
                                                className="p-3 hover:bg-primary/10 cursor-pointer border-b border-border/50 last:border-0 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="font-black text-xs uppercase tracking-tighter group-hover:text-primary transition-colors">{customer.name}</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{customer.phone} {customer.labName ? `• ${customer.labName}` : ''}</p>
                                                </div>
                                                <div className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Referral Hospital / Lab"
                                value={labName}
                                onChange={e => {
                                    setLabName(e.target.value);
                                    if (selectedCustomerId) {
                                        setSelectedCustomerId(null);
                                        setSelectedCustomerData(null);
                                    }
                                }}
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-11 font-bold text-base"
                            />
                        </div>

                        <div className="relative group">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="number"
                                placeholder="Amount Received"
                                value={amountGiven}
                                onChange={e => setAmountGiven(e.target.value)}
                                min="0"
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-11 font-bold text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="relative group">
                            <MonitorPlay className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Order Remarks (Optional)"
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                className="pl-11 bg-secondary/30 border-border rounded-xl h-11 font-bold text-base"
                            />
                        </div>

                        {selectedCustomerId && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                {selectedCustomerData && (
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Balance Payment</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                            Current Bal: PKR {selectedCustomerData.remainingBalance.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="relative group">
                                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary transition-colors" />
                                    <Input
                                        type="number"
                                        placeholder="Add to Previous Balance Payment"
                                        value={previousBalancePayment}
                                        onChange={e => setPreviousBalancePayment(e.target.value)}
                                        min="0"
                                        className="pl-11 bg-primary/10 border-primary/20 rounded-xl h-11 font-bold text-base text-primary placeholder:text-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-2 mb-6 px-2">
                        <div className="flex items-end justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Subtotal</span>
                            <span className="text-xl font-black italic text-foreground tracking-tighter leading-none">PKR {subtotal.toLocaleString()}</span>
                        </div>
                        {totalDiscountAmount > 0 && (
                            <div className="flex items-end justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total Discount</span>
                                <span className="text-xl font-black italic text-primary tracking-tighter leading-none">-PKR {totalDiscountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-end justify-between pt-2 border-t border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Grand Total</span>
                            <span className="text-3xl font-black italic text-foreground tracking-tighter leading-none">PKR {grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-end justify-between pt-2 border-t border-border/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                Change Due
                            </span>
                            <span className={`text-xl font-black italic tracking-tighter leading-none ${changeDue > 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                PKR {Math.abs(changeDue).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full h-14 rounded-2xl bg-primary hover:opacity-90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                    >
                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Receipt className="h-5 w-5 mr-3" />}
                        EXECUTE TRANSACTION
                    </Button>
                </div>
            </div>
        </div>
    );
}
