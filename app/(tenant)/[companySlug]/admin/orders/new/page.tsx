"use client";

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    ShoppingCart,
    Plus,
    Trash2,
    ArrowLeft,
    Package,
    Send,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Vendor {
    id: number;
    name: string;
    companyName: string;
    category: {
        id: number;
        name: string;
    };
}

interface Product {
    id: number;
    name: string;
    stock: number;
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    comment: string;
}

export default function NewOrderPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorSearch, setVendorSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);
    const [currentComment, setCurrentComment] = useState<string>('');
    const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
    const vendorRef = useRef<HTMLDivElement>(null);
    const productRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (vendorRef.current && !vendorRef.current.contains(event.target as Node)) {
                setShowVendorSuggestions(false);
            }
            if (productRef.current && !productRef.current.contains(event.target as Node)) {
                setShowProductSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVendors = async (search: string = '') => {
        const trimmedSearch = search.trim();
        setIsSearching(true);
        try {
            const endpoint = trimmedSearch
                ? `/admin/vendors?search=${encodeURIComponent(trimmedSearch)}`
                : '/admin/vendors';
            const response = await api.get(endpoint);
            setVendors(response.data.slice(0, 10)); // Show top 10 results
        } catch (err) {
            toast.error("Failed to load vendors");
        } finally {
            setIsSearching(false);
        }
    };

    const fetchProducts = async (search: string = '') => {
        if (!selectedVendor) return;

        const trimmedSearch = search.trim();
        setIsSearchingProducts(true);
        try {
            const endpoint = trimmedSearch
                ? `/admin/products?category=${selectedVendor.category.id}&search=${encodeURIComponent(trimmedSearch)}`
                : `/admin/products?category=${selectedVendor.category.id}`;
            const response = await api.get(endpoint);
            setProducts(response.data.slice(0, 10)); // Show top 10 results
        } catch (err) {
            toast.error("Failed to load products");
        } finally {
            setIsSearchingProducts(false);
        }
    };

    // Initial load for vendors
    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (vendorSearch && (!selectedVendor || vendorSearch !== selectedVendor.name)) {
                fetchVendors(vendorSearch);
            } else if (!vendorSearch && vendors.length === 0) {
                fetchVendors();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [vendorSearch, selectedVendor]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (productSearch && (!selectedProduct || productSearch !== selectedProduct.name)) {
                fetchProducts(productSearch);
            } else if (!productSearch && selectedVendor) {
                fetchProducts();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearch, selectedProduct, selectedVendor]);

    const handleVendorSelect = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setVendorSearch(vendor.name);
        setVendors([]);
        setDraftItems([]);
        setProducts([]);
        setProductSearch('');
        setSelectedProduct(null);
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setProductSearch(product.name);
        setProducts([]);
    };

    const addToDraft = () => {
        if (!selectedProduct) {
            toast.error("Please select a product");
            return;
        }

        if (currentQuantity < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }

        const existingItem = draftItems.find(item => item.productId === selectedProduct.id);
        if (existingItem) {
            setDraftItems(draftItems.map(item =>
                item.productId === selectedProduct.id
                    ? { ...item, quantity: item.quantity + currentQuantity }
                    : item
            ));
        } else {
            setDraftItems([...draftItems, {
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity: currentQuantity,
                comment: currentComment
            }]);
        }

        // Reset product selection
        setSelectedProduct(null);
        setProductSearch('');
        // Re-load top 10 products
        fetchProducts();
        setCurrentQuantity(1);
        setCurrentComment('');
        toast.success("Added to order draft");
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setDraftItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromDraft = (productId: number) => {
        setDraftItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSubmitOrder = async () => {
        if (!selectedVendor || draftItems.length === 0) return;

        setSubmitting(true);
        try {
            await api.post('/admin/vendor-orders/batch', {
                vendorId: selectedVendor.id,
                items: draftItems
            });
            toast.success("Batch order submitted successfully");
            router.push('/admin/orders');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit order");
        } finally {
            setSubmitting(false);
        }
    };

    // Remove the global initializing screen as it blocks UI after selection

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic uppercase">CREATE <span className="text-primary not-italic">New Order</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Select a vendor and add products to your restock request.</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/orders')}
                    className="text-muted-foreground hover:text-primary font-black text-[10px] tracking-widest uppercase items-center"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
                </Button>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-xl border-t-4 border-t-primary/20">
                <CardHeader className="p-8 border-b border-border bg-secondary/10 rounded-t-[2.5rem]">
                    <CardTitle className="text-lg font-black tracking-tight text-foreground uppercase italic flex items-center">
                        <Search className="mr-3 h-5 w-5 text-primary" />
                        Supplier Search
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div ref={vendorRef} className="w-full space-y-3 relative">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vendor Name or Company</Label>
                        <div className="relative">
                            <Input
                                placeholder="Start typing to search vendors..."
                                value={vendorSearch}
                                onFocus={() => {
                                    setShowVendorSuggestions(true);
                                    if (!vendorSearch && vendors.length === 0) fetchVendors();
                                }}
                                onChange={(e) => {
                                    setVendorSearch(e.target.value);
                                    setShowVendorSuggestions(true);
                                    if (selectedVendor && e.target.value !== selectedVendor.name) {
                                        setSelectedVendor(null);
                                    }
                                }}
                                className="bg-secondary/50 border-border rounded-xl h-12 font-bold focus:ring-primary/20 pr-10"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>

                        {showVendorSuggestions && vendors.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-black/5">
                                {vendors.map((vendor) => (
                                    <button
                                        key={vendor.id}
                                        onClick={() => {
                                            handleVendorSelect(vendor);
                                            setShowVendorSuggestions(false);
                                        }}
                                        className="w-full text-left p-4 hover:bg-secondary transition-colors border-b border-border last:border-0 group"
                                    >
                                        <div className="font-black text-sm uppercase italic group-hover:text-primary transition-colors">{vendor.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{vendor.companyName} • {vendor.category.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedVendor && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Active Partner</div>
                                    <div className="font-black text-foreground uppercase italic">{selectedVendor.companyName}</div>
                                </div>
                                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {selectedVendor.category.name}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedVendor && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-in slide-in-from-bottom-6 duration-700">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Order Draft Table */}
                        <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                            <CardHeader className="p-8 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                                <CardTitle className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase">
                                    <ShoppingCart className="mr-4 h-6 w-6 text-primary" />
                                    Order Items ({draftItems.length})
                                </CardTitle>
                                {draftItems.length > 0 && (
                                    <Button
                                        disabled={submitting}
                                        onClick={handleSubmitOrder}
                                        className="bg-primary hover:opacity-90 text-primary-foreground font-black text-[10px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-primary/20 uppercase"
                                    >
                                        {submitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" /> Confirm All Orders</>}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-background/50 hover:bg-transparent">
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground w-32">Quantity</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Comment</TableHead>
                                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {draftItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest opacity-30 italic">
                                                    No items added yet
                                                </TableCell>
                                            </TableRow>
                                        ) : draftItems.map((item) => (
                                            <TableRow key={item.productId} className="hover:bg-secondary/30 transition-colors group">
                                                <TableCell className="p-6">
                                                    <span className="font-black text-foreground group-hover:text-primary transition-colors tracking-tighter uppercase italic">{item.productName}</span>
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                        className="h-10 w-24 bg-secondary/50 border-border rounded-xl font-black text-lg text-primary text-center focus:ring-primary/20"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-6">
                                                    <span className="text-xs text-muted-foreground font-medium">{item.comment || '-'}</span>
                                                </TableCell>
                                                <TableCell className="p-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFromDraft(item.productId)}
                                                        className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-xl"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Item Form */}
                    <div className="space-y-8">
                        <Card className="bg-card border-border rounded-[2.5rem] shadow-xl border-t-4 border-t-secondary overflow-hidden sticky top-32">
                            <CardHeader className="p-8 border-b border-border bg-secondary/10">
                                <CardTitle className="text-lg font-black tracking-tight text-foreground uppercase italic flex items-center">
                                    <Plus className="mr-3 h-5 w-5 text-primary" />
                                    Add Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div ref={productRef} className="space-y-3 relative">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Product</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Type product name..."
                                            value={productSearch}
                                            onFocus={() => {
                                                setShowProductSuggestions(true);
                                                if (!productSearch && products.length === 0) fetchProducts();
                                            }}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                setShowProductSuggestions(true);
                                                if (selectedProduct && e.target.value !== selectedProduct.name) {
                                                    setSelectedProduct(null);
                                                }
                                            }}
                                            className="bg-secondary/50 border-border rounded-xl h-12 font-bold focus:ring-primary/20 pr-10"
                                        />
                                        {isSearchingProducts && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                            </div>
                                        )}
                                    </div>

                                    {showProductSuggestions && products.length > 0 && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/5">
                                            {products.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        handleProductSelect(product);
                                                        setShowProductSuggestions(false);
                                                    }}
                                                    className="w-full text-left p-4 hover:bg-secondary transition-colors border-b border-border last:border-0 group"
                                                >
                                                    <div className="font-black text-[10px] uppercase italic group-hover:text-primary transition-colors">{product.name}</div>
                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Stock: {product.stock}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Order Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 0)}
                                        className="bg-secondary/50 border-border rounded-xl h-12 font-black text-lg focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes (Optional)</Label>
                                    <Input
                                        placeholder="Add specialized instructions..."
                                        value={currentComment}
                                        onChange={(e) => setCurrentComment(e.target.value)}
                                        className="bg-secondary/50 border-border rounded-xl h-12 font-medium focus:ring-primary/20"
                                    />
                                </div>

                                <Button
                                    onClick={addToDraft}
                                    className="w-full bg-foreground text-background hover:bg-primary hover:text-white font-black text-[10px] tracking-widest rounded-xl h-14 uppercase shadow-xl transition-all"
                                >
                                    Add to Order Flow
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
                            <div className="flex items-center mb-4">
                                <Package className="h-5 w-5 text-primary mr-3" />
                                <h3 className="font-black text-xs uppercase tracking-widest text-foreground italic">Fulfillment Guide</h3>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
                                Adding items to the draft does not notify the vendor. You must confirm all selections in the order table to trigger the supply request.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
