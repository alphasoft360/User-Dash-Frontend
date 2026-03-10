'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Plus, Loader2, TrendingUp } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    stock: number;
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
            toast.success("Stock updated successfully");
            router.push('/admin/stock');
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = (err as any).response?.data?.message || "Failed to update stock";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
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
                    <SelectContent className="bg-white dark:bg-slate-900 border-border max-h-[300px] z-[110]">
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
                <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                        placeholder="Enter supplier name..."
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-4">
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
            </div>
        </form>
    );
}
