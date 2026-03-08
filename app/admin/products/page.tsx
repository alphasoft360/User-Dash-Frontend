'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Trash2,
    Eye,
    Plus,
    CheckCircle,
    EyeOff,
    Search,
    Filter,
    Tags,
    ChevronRight,
    ChevronLeft,
    Loader2,
    LayoutGrid,
    ArrowUpRight,
    Tag,
    AlertCircle,
    X,
    FilterX,
    FolderPlus,
    Zap,
    Hash
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
    isRecommended: boolean;
    isActive: boolean;
    category: { id: number, name: string };
    seller: { email: string };
    createdAt: string;
}

interface Category {
    id: number;
    name: string;
    image?: string;
    slug?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filters
    const [searchName, setSearchName] = useState('');
    const [searchId, setSearchId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

    // Category Creation
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err: unknown) {
            console.error("Failed to load categories", err);
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const params = {
                search: searchName || undefined,
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                id: searchId || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                status: statusFilter,
                page: currentPage,
                limit: itemsPerPage
            };

            const response = await api.get('/admin/products', { params });
            setProducts(response.data.data);
            setTotalItems(response.data.total);
            setTotalPages(response.data.pages);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Global Catalog Sync Failed");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [searchName, selectedCategory, searchId, minPrice, maxPrice, statusFilter, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsCreatingCategory(true);
            const response = await api.post('/admin/categories', { name: newCategoryName });
            setCategories([...categories, response.data.category]);
            toast.success(`Category "${newCategoryName}" registered`);
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Category registration failed");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Confirm entity deletion protocol? This action is irreversible.")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts(); // Refresh list to account for pagination
            toast.success("Product scrubbed from database");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Scrub protocol failed");
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            const response = await api.patch(`/admin/products/${id}/toggle-active`);
            setProducts(products.map(p => p.id === id ? { ...p, isActive: response.data.isActive } : p));
            toast.success(response.data.isActive ? "Entity visibility: ACTIVE" : "Entity visibility: HIDDEN");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Visibility toggle failed");
        }
    };

    const handleClearFilters = () => {
        setSearchName('');
        setSearchId('');
        setSelectedCategory('all');
        setMinPrice('');
        setMaxPrice('');
        setStatusFilter('all');
        setCurrentPage(1);
        toast.info("Filters reset to default");
    };

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic">Initializing Product Data Flow...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Custom Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border-t-4 border-t-primary/20 animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Register New <span className="text-primary not-italic">Category</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">Global taxonomy classification.</p>
                            </div>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Category Designation</Label>
                                <Input
                                    placeholder="e.g. Hyper-Automated Systems"
                                    className="bg-secondary/50 border-border rounded-xl h-14 font-bold px-6 focus:ring-primary/20"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-8 pt-0 flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 font-black uppercase tracking-widest rounded-xl h-12 border border-border"
                                onClick={() => setIsCategoryModalOpen(false)}
                            >
                                ABORT
                            </Button>
                            <Button
                                className="flex-2 bg-primary font-black uppercase tracking-widest rounded-xl hover:opacity-90 h-12 shadow-lg shadow-primary/20 px-8"
                                onClick={handleAddCategory}
                                disabled={isCreatingCategory || !newCategoryName.trim()}
                            >
                                {isCreatingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                                COMMITTING CATEGORY
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 italic uppercase">PRODUCT <span className="text-primary not-italic">Identity</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Global Catalog Control & Marketplace Moderation.</p>
                </div>
                <Link href="/marketplace/post-ad" className="group">
                    <Button className="bg-primary hover:opacity-90 text-primary-foreground font-black px-10 rounded-2xl h-14 shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3">
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                        DEPLOY NEW PRODUCT
                    </Button>
                </Link>
            </div>

            {/* Category Management section */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl border-t-4 border-t-primary/20">
                <div className="px-10 py-6 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-foreground uppercase italic flex items-center">
                            <Tags className="mr-3 h-5 w-5 text-primary" />
                            Category Management
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">Manage taxonomy and global classifications.</p>
                    </div>

                    <Button
                        variant="outline"
                        className="rounded-xl border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest h-10 px-6"
                        onClick={() => setIsCategoryModalOpen(true)}
                    >
                        <FolderPlus className="mr-2 h-4 w-4" /> Add Taxonomy
                    </Button>
                </div>

                <div className="p-10">
                    <div className="flex flex-wrap gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="group relative overflow-hidden bg-secondary/30 border border-border rounded-2xl p-4 min-w-[140px] flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all cursor-default shadow-sm hover:shadow-primary/5">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-foreground text-center line-clamp-1">{cat.name}</span>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl border-t-4 border-t-secondary/20">
                <div className="px-10 py-6 bg-secondary/20 flex items-center justify-between border-b border-border">
                    <div className="flex items-center text-foreground font-black tracking-widest uppercase text-xs italic">
                        <Filter className="mr-3 h-4 w-4 text-primary" />
                        Refinement Matrix
                    </div>
                    {isRefreshing && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Entity Name</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="pl-10 bg-secondary/50 border-border rounded-xl h-11 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">System Hash / ID</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Order ID..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="pl-10 bg-secondary/50 border-border rounded-xl h-11 font-bold focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Taxonomy</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-secondary/50 border-border h-11 rounded-xl text-[10px] font-black uppercase tracking-widest italic px-4">
                                    <SelectValue placeholder="CATEGORY" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-border text-foreground rounded-2xl border-t-4 border-t-primary/20 shadow-2xl dark:bg-slate-900">
                                    <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase py-3">ALL CLASSIFICATIONS</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()} className="font-bold text-[10px] tracking-widest uppercase py-3">{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="MIN"
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="bg-secondary/50 border-border rounded-xl h-11 font-black text-[10px] text-center"
                                />
                                <Input
                                    placeholder="MAX"
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="bg-secondary/50 border-border rounded-xl h-11 font-black text-[10px] text-center"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-2">Visibility State:</span>
                        {[
                            { id: 'all', label: 'ALL ENTITIES', icon: LayoutGrid },
                            { id: 'active', label: 'LIVE / SYNCED', icon: Zap },
                            { id: 'hidden', label: 'SHADOW / HIDDEN', icon: EyeOff }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStatusFilter(s.id as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === s.id ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
                            >
                                <s.icon className="h-3.5 w-3.5" />
                                {s.label}
                            </button>
                        ))}

                        <div className="ml-auto flex gap-3">
                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-black text-[10px] tracking-widest h-11 px-8 rounded-xl uppercase transition-all flex items-center gap-2 border-dashed"
                            >
                                <FilterX className="h-4 w-4" /> Reset matrix
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product List Table */}
            <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight flex items-center italic text-foreground uppercase">
                            <Package className="mr-4 h-6 w-6 text-primary" />
                            Global Inventory Output ({totalItems})
                        </CardTitle>
                    </div>
                    {(searchName || selectedCategory !== 'all' || searchId || minPrice || maxPrice || statusFilter !== 'all') && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full uppercase italic">
                            REFINED LIST
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border bg-background/50">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity Identifier</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hidden lg:table-cell">Taxonomy</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Price Value</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center hidden md:table-cell">Priority status</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Visibility Control</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right border-l border-border/50">System Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                                                <FilterX className="h-12 w-12 text-muted-foreground animate-bounce" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                                                    No products detected within current refinement parameters
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.map((product) => (
                                    <tr key={product.id} className="hover:bg-primary/5 transition-all duration-300 group">
                                        <td className="p-8">
                                            <div className="flex items-center">
                                                <div className="h-16 w-16 rounded-2xl bg-secondary border border-border mr-6 hidden sm:flex items-center justify-center font-black text-primary text-xl shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:rotate-12">
                                                    {product.name?.[0]?.toUpperCase() || 'P'}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tighter uppercase italic">{product.name}</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-md">
                                                            <Tag className="h-3 w-3 mr-1.5 text-primary" /> ID: {product.id}
                                                        </span>
                                                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary italic underline decoration-dotted underline-offset-4">
                                                            Stock Level: {product.stock}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 hidden lg:table-cell">
                                            <div className="flex items-center space-x-2 px-4 py-2 bg-secondary/30 border border-border/50 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-foreground shadow-sm">
                                                <LayoutGrid className="h-3 w-3 text-primary" />
                                                <span>{product.category?.name || 'Uncategorized'}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="font-black text-primary text-lg tracking-tighter italic">${parseFloat(product.price).toLocaleString()}</span>
                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-50">CREDIT VALUE</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center hidden md:table-cell">
                                            {product.isRecommended ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                    <Zap className="h-3 w-3" /> FEATURED
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground font-black opacity-20 uppercase tracking-widest">— STANDARD —</span>
                                            )}
                                        </td>
                                        <td className="p-8 text-center">
                                            <button
                                                onClick={() => handleToggleActive(product.id)}
                                                className={`group/btn relative h-10 w-24 rounded-xl border flex items-center justify-center transition-all ${product.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}
                                            >
                                                <div className={`absolute left-1 top-1 h-8 w-8 rounded-lg transition-all flex items-center justify-center ${product.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' : 'bg-red-500 text-white translate-x-14 shadow-lg shadow-red-500/50'}`}>
                                                    {product.isActive ? <CheckCircle className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-wider ${product.isActive ? 'ml-6' : 'mr-6'}`}>
                                                    {product.isActive ? 'LIVE' : 'HIDDEN'}
                                                </span>
                                            </button>
                                        </td>
                                        <td className="p-8 text-right border-l border-border/50 bg-secondary/5">
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/marketplace/${product.slug}`}>
                                                    <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/20">
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-11 w-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-destructive/20"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>

                {/* Pagination Footer */}
                <div className="p-8 border-t border-border bg-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center px-4 py-2 bg-background border border-border rounded-xl shadow-inner">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-3">Matrix Density:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-transparent border-none text-[10px] font-black text-primary uppercase focus:ring-0 cursor-pointer"
                            >
                                {[10, 25, 50, 100].map(v => (
                                    <option key={v} value={v} className="bg-card text-foreground">{v} ENTITIES / PAGE</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2 whitespace-nowrap">
                            Showing <span className="text-primary">{products.length}</span> of <span className="text-foreground">{totalItems}</span> sync'd nodes
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="h-11 w-11 rounded-xl border-border bg-card hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-2xl shadow-inner">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`h-8 w-8 rounded-lg text-[10px] font-black tracking-tighter transition-all ${currentPage === pageNum ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110' : 'bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        {pageNum.toString().padStart(2, '0')}
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === totalPages || loading}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="h-11 w-11 rounded-xl border-border bg-card hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
