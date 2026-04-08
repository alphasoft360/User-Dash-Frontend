'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Trash2,
    Edit2,
    Plus,
    Search,
    Filter,
    Loader2,
    X,
    FilterX,
    ChevronsLeft,
    ChevronsRight,
    Settings2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CategoryManagement from '@/components/CategoryManagement';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
    isRecommended: boolean;
    isActive: boolean;
    category: { id: number, name: string };
    companyName?: string;
    packSize?: string;
    purchasePrice?: string;
    expiryDate?: string;
    batchNumber?: string;
    minimumStock: number;
}

interface Category {
    id: number;
    name: string;
}

export default function LabReagentsPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);

    // Filters
    const [searchName, setSearchName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 15;

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err: unknown) {
            console.error("Failed to load categories", err);
        }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                search: searchName || undefined,
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                page: currentPage,
                limit: limit
            };

            const response = await api.get('/admin/products', { params });
            setProducts(response.data.data);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to load reagents");
        } finally {
            setLoading(false);
        }
    }, [searchName, selectedCategory, currentPage]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this reagent?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts();
            toast.success("Reagent deleted successfully");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to delete reagent");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">REAGENTS <span className="text-primary not-italic">& Inventory</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Laboratory Reagents & Pharmacy Stock Management.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => document.getElementById('category-section')?.scrollIntoView({ behavior: 'smooth' })}
                        variant="outline"
                        className="border-primary/20 hover:border-primary text-muted-foreground hover:text-primary font-black px-6 rounded-2xl h-14 flex items-center gap-3 transition-all"
                    >
                        <Settings2 className="h-5 w-5" />
                        MANAGE CATEGORIES
                    </Button>
                    <Link href={`/${companySlug}/admin/reagents/new`}>
                        <Button
                            className="bg-primary hover:opacity-90 text-primary-foreground font-black px-8 rounded-2xl h-14 shadow-lg shadow-primary/20 flex items-center gap-3"
                        >
                            <Plus className="h-5 w-5" />
                            ADD NEW REAGENT
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Reagent</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Name or batch..."
                                value={searchName}
                                onChange={(e) => {
                                    setSearchName(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 bg-secondary/30 border-border rounded-xl h-11 font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                        <Select 
                            value={selectedCategory} 
                            onValueChange={(val) => {
                                setSelectedCategory(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="bg-secondary/30 border-border h-11 rounded-xl">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 border-border">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            onClick={() => { 
                                setSearchName(''); 
                                setSelectedCategory('all'); 
                                setCurrentPage(1);
                            }}
                            className="text-muted-foreground hover:text-foreground h-11 px-6 rounded-xl font-bold flex items-center gap-2"
                        >
                            <FilterX className="h-4 w-4" /> Reset
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden text-foreground">
                <CardHeader className="p-8 border-b border-border bg-secondary/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <Package className="h-6 w-6 text-primary" />
                        INVENTORY LIST
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/5 border-b border-border">
                                <tr>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reagent / Product</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pack Size</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Purchase Price</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Sale Price</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Stock</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Expiry</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-secondary/20 transition-all border-b border-border dark:border-slate-800">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary">
                                                    {product.name?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{product.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black">Batch: {product.batchNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-medium text-muted-foreground">{product.companyName || '—'}</td>
                                        <td className="p-6 text-sm font-medium text-muted-foreground">{product.packSize || '—'}</td>
                                        <td className="p-6 text-center text-sm font-bold text-primary">
                                            {product.purchasePrice ? `PKR ${parseFloat(product.purchasePrice).toLocaleString()}` : '—'}
                                        </td>
                                        <td className="p-6 text-center text-sm font-bold text-foreground">
                                            {product.price ? `PKR ${parseFloat(product.price).toLocaleString()}` : '—'}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`font-black text-base ${product.stock <= product.minimumStock ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                                                    {product.stock}
                                                </span>
                                                {product.stock <= product.minimumStock && (
                                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">LOW STOCK</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold ${product.expiryDate && new Date(product.expiryDate) < new Date() ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                    {product.expiryDate || '—'}
                                                </span>
                                                {product.expiryDate && new Date(product.expiryDate) < new Date() && (
                                                    <AlertTriangle className="h-3 w-3 text-red-500 mt-1" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/${companySlug}/admin/reagents/${product.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 border-t border-border bg-secondary/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                            Showing <span className="text-foreground">{products.length}</span> of <span className="text-foreground">{totalItems}</span> reagents
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1 || loading}
                                className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                                className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1 mx-2">
                                <span className="text-xs font-black text-muted-foreground uppercase">Page</span>
                                <div className="h-10 px-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-black text-primary">{currentPage}</span>
                                </div>
                                <span className="text-xs font-black text-muted-foreground uppercase">of {totalPages}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                                className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages || loading}
                                className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-10 border-t border-border/50">
                <CategoryManagement companySlug={companySlug} />
            </div>
        </div>
    );
}
