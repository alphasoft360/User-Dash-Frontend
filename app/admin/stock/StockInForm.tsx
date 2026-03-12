'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Plus, Loader2, TrendingUp, FileDown, CheckCircle2, Search, X } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    stock: number;
}

interface Vendor {
    id: number;
    name: string;
    companyName: string;
    category?: {
        id: number;
        name: string;
    } | null;
}

interface StockInFormProps {
    initialProductId?: string;
    products?: Product[];
}

export default function StockInForm({ initialProductId = '', products: initialProducts = [] }: StockInFormProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(initialProducts.length === 0);
    const [selectedProductId, setSelectedProductId] = useState(initialProductId);
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastEntry, setLastEntry] = useState<{ productId: string, quantity: string, unitPrice: string, supplier: string } | null>(null);

    // Vendor Search States
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorSearch, setVendorSearch] = useState('');
    const [isSearchingVendors, setIsSearchingVendors] = useState(false);
    const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
    const vendorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) {
                setShowVendorSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVendors = async (search: string = '') => {
        const trimmedSearch = search.trim();
        setIsSearchingVendors(true);
        try {
            const endpoint = trimmedSearch
                ? `/admin/vendors?search=${encodeURIComponent(trimmedSearch)}`
                : '/admin/vendors';
            const response = await api.get(endpoint);
            setVendors(response.data.slice(0, 10));
        } catch (err) {
            console.error("Failed to load vendors", err);
        } finally {
            setIsSearchingVendors(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (vendorSearch && vendorSearch.length > 0) {
                fetchVendors(vendorSearch);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [vendorSearch]);

    const handleVendorSelect = (vendor: Vendor) => {
        setSupplierName(vendor.companyName || vendor.name);
        setVendorSearch(vendor.companyName || vendor.name);
        setShowVendorSuggestions(false);
    };

    useEffect(() => {
        if (initialProducts.length === 0) {
            const fetchProducts = async () => {
                try {
                    const response = await api.get('/admin/products', { params: { limit: 200 } });
                    setProducts(response.data.data);
                } catch (err) {
                    console.error("Failed to load products", err);
                    toast.error("Failed to load products for selection");
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [initialProducts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !quantity) {
            toast.error("Please select a product and enter quantity");
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/admin/labs/stock-in', {
                productId: parseInt(selectedProductId),
                quantity: parseInt(quantity),
                purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
                supplier: supplierName
            });
            setLastEntry({
                productId: selectedProductId,
                quantity: quantity,
                unitPrice: purchasePrice,
                supplier: supplierName
            });
            setIsSuccess(true);
            toast.success("Stock updated successfully");
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMessage = error.response?.data?.message || "Failed to update stock";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!lastEntry) return;
        try {
            toast.info("Preparing your receipt...");
            const params = new URLSearchParams({
                productId: lastEntry.productId,
                quantity: lastEntry.quantity,
                unitPrice: lastEntry.unitPrice,
                supplier: lastEntry.supplier
            });
            const response = await api.get(`/admin/labs/invoice/stock-in?${params.toString()}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Stock-Entry-${lastEntry.productId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            console.error("Download failed", err);
            const errorObj = err as { response?: { data?: any } };
            if (errorObj.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result as string);
                        toast.error(errorData.message || "Failed to download receipt");
                    } catch (e) {
                        toast.error("Failed to download receipt.");
                    }
                };
                reader.readAsText(errorObj.response.data);
            } else {
                toast.error("Failed to download receipt.");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reagent Selection</Label>
                <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={loading || !!initialProductId}
                >
                    <SelectTrigger className="bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20">
                        <SelectValue placeholder={loading ? "Loading products..." : "Select a reagent to restock"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-border max-h-[300px] z-120">
                        {products.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()} className="font-bold py-3 hover:bg-primary/5 cursor-pointer">
                                {p.name} <span className="text-[10px] font-medium text-muted-foreground ml-2">(Current: {p.stock})</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity Added</Label>
                    <div className="relative">
                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="number"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Purchase Price</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                        placeholder="Optional 0.00"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Supplier / Vendor Name</Label>
                <div ref={vendorRef} className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        value={vendorSearch}
                        onChange={(e) => {
                            const val = e.target.value;
                            setVendorSearch(val);
                            setSupplierName(val);
                            setShowVendorSuggestions(val.trim().length > 0);
                        }}
                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20 pr-10"
                        placeholder="Type to search vendors..."
                    />
                    {isSearchingVendors && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin h-4 w-4 text-primary" />
                        </div>
                    )}
                    
                    {showVendorSuggestions && vendors.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-50 dark:bg-slate-950 border border-border rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                            {vendors.map((vendor) => (
                                <button
                                    key={vendor.id}
                                    type="button"
                                    onClick={() => handleVendorSelect(vendor)}
                                    className="w-full text-left p-4 hover:bg-primary/5 transition-colors border-b border-border last:border-0 group"
                                >
                                    <div className="font-black text-sm uppercase italic group-hover:text-primary transition-colors">{vendor.companyName || vendor.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{vendor.name} • {vendor.category?.name || 'Uncategorized'}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                {!isSuccess ? (
                    <>
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => router.push('/admin/stock')}
                            className="rounded-2xl font-black h-14 px-10 border border-border"
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 px-12 shadow-xl shadow-primary/20"
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    SAVE STOCK ENTRY
                                </div>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            onClick={handleDownloadInvoice}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl h-14 px-12 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            <FileDown className="h-5 w-5" />
                            DOWNLOAD INVOICE
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.push('/admin/stock')}
                            className="rounded-2xl font-black h-14 px-10 border-emerald-500 text-emerald-600 flex items-center gap-2"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            DONE
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
}
