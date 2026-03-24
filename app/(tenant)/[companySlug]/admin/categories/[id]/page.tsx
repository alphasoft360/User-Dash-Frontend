'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Edit,
    Trash2,
    Package,
    X,
    FolderPlus,
    Zap,
    Loader2,
    CheckCircle,
    Search,
    ArrowLeft,
    Plus,
    Save,
    ExternalLink,
    Unlink,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
    productCount: number;
}

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    category?: { id: number; name: string };
}

export default function CategoryDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const companySlug = params.companySlug as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Edit State
    const [editName, setEditName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    // Assigned Products State (Server-Side)
    const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
    const [assignedSearch, setAssignedSearch] = useState('');
    const [assignedAppliedSearch, setAssignedAppliedSearch] = useState('');
    const [assignedPage, setAssignedPage] = useState(1);
    const [assignedTotalPages, setAssignedTotalPages] = useState(1);
    const [isAssignedLoading, setIsAssignedLoading] = useState(false);

    // Add Products State (Server-Side)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [availableSearch, setAvailableSearch] = useState('');
    const [availableAppliedSearch, setAvailableAppliedSearch] = useState('');
    const [availablePage, setAvailablePage] = useState(1);
    const [availableTotalPages, setAvailableTotalPages] = useState(1);
    const [isAvailableLoading, setIsAvailableLoading] = useState(false);
    const [selectedForAdd, setSelectedForAdd] = useState<number[]>([]);

    const fetchCategoryStats = useCallback(async () => {
        try {
            const catStatsRes = await api.get(`/admin/categories/stats`);
            const categoriesData = catStatsRes.data.data || catStatsRes.data;
            const currentCat = categoriesData.find((c: Category) => c.id === Number(id));

            if (!currentCat) {
                toast.error("Category node not found");
                router.push(`/${companySlug}/admin/categories`);
                return;
            }

            setCategory(currentCat);
            setEditName(currentCat.name);
        } catch (err) {
            console.error("Failed to load category data", err);
            toast.error("Category data synchronization failure");
        }
    }, [id, router]);

    const fetchAssignedProducts = useCallback(async () => {
        try {
            setIsAssignedLoading(true);
            const response = await api.get('/admin/products', {
                params: {
                    category: id,
                    search: assignedAppliedSearch || undefined,
                    page: assignedPage,
                    limit: 6 // Show 6 per page for a nice grid
                }
            });
            setAssignedProducts(response.data.data);
            setAssignedTotalPages(response.data.pages);
        } catch (err) {
            console.error("Failed to load assigned products", err);
        } finally {
            setIsAssignedLoading(false);
        }
    }, [id, assignedAppliedSearch, assignedPage]);

    const fetchAvailableProducts = useCallback(async () => {
        if (!isAddModalOpen) return;
        try {
            setIsAvailableLoading(true);
            const response = await api.get('/admin/products', {
                params: {
                    search: availableAppliedSearch || undefined,
                    page: availablePage,
                    limit: 10
                }
            });
            setAvailableProducts(response.data.data);
            setAvailableTotalPages(response.data.pages);
        } catch (err) {
            console.error("Failed to load available products", err);
        } finally {
            setIsAvailableLoading(false);
        }
    }, [isAddModalOpen, availableAppliedSearch, availablePage]);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchCategoryStats();
            setLoading(false);
        };
        loadInitialData();
    }, [fetchCategoryStats]);

    // Independent effects for lists
    useEffect(() => {
        fetchAssignedProducts();
    }, [fetchAssignedProducts]);

    useEffect(() => {
        fetchAvailableProducts();
    }, [fetchAvailableProducts]);


    const handleUpdateName = async () => {
        if (!editName.trim() || editName === category?.name) {
            setIsEditingName(false);
            return;
        }

        try {
            setIsProcessing(true);
            await api.put(`/admin/categories/${id}`, { name: editName });
            toast.success("Taxonomy node updated");
            fetchCategoryStats();
            setIsEditingName(false);
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnlink = async (productId: number) => {
        if (!confirm("Execute unlinking protocol?")) return;

        try {
            setIsProcessing(true);
            await api.delete(`/admin/categories/products/${productId}/unlink`);
            toast.success("Product scrubbed from this node");
            fetchCategoryStats();
            fetchAssignedProducts();
        } catch (err) {
            toast.error("Unlinking failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkAdd = async () => {
        if (selectedForAdd.length === 0) return;

        try {
            setIsProcessing(true);
            await api.patch(`/admin/categories/${id}/products`, {
                productIds: selectedForAdd
            });
            toast.success(`Linked ${selectedForAdd.length} products`);
            fetchCategoryStats();
            fetchAssignedProducts();
            setIsAddModalOpen(false);
            setSelectedForAdd([]);
        } catch (err) {
            toast.error("Linkage failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteCategory = async () => {
        if ((category?.productCount || 0) > 0) {
            toast.error("Cannot destroy node with active linkages.");
            return;
        }

        if (!confirm("Permanently destroy this taxonomy node?")) return;

        try {
            setIsProcessing(true);
            await api.delete(`/admin/categories/${id}`);
            toast.success("Category node destroyed");
            router.push(`/${companySlug}/admin/categories`);
        } catch (err) {
            toast.error("Destruction failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAssignedSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAssignedAppliedSearch(assignedSearch);
        setAssignedPage(1);
    };

    const handleAvailableSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAvailableAppliedSearch(availableSearch);
        setAvailablePage(1);
    }

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic border-2 border-dashed border-primary/20 rounded-3xl">Synchronizing Node Data...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <Link href={`/${companySlug}/admin/categories`}>
                        <Button variant="outline" className="h-16 w-16 rounded-2xl border-border hover:border-primary hover:bg-primary/5 group relative shadow-lg overflow-hidden">
                            <ArrowLeft className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-all group-hover:-translate-x-1" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-lg uppercase">NODE_ID: {id}</Badge>
                            <span className="h-px w-6 bg-primary/20"></span>
                            <span className="text-muted-foreground font-black text-[9px] uppercase tracking-widest opacity-30 italic">Global Taxonomy Module</span>
                        </div>
                        {isEditingName ? (
                            <div className="flex items-center gap-3">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-12 text-2xl font-black italic uppercase tracking-tighter bg-secondary/50 border-primary/50 w-full md:w-64 rounded-xl px-4 focus-visible:ring-2 focus-visible:ring-primary/10"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleUpdateName} disabled={isProcessing} className="bg-primary h-12 w-12 rounded-xl shadow-lg shadow-primary/20">
                                    <Save className="h-5 w-5" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setEditName(category!.name); setIsEditingName(false); }} className="h-12 w-12 p-0 rounded-xl border border-border hover:bg-destructive/5 hover:text-destructive">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                                <h1 className="text-4xl font-black text-foreground tracking-tighter italic uppercase leading-none">
                                    {category?.name} <span className="text-primary not-italic opacity-40 group-hover:opacity-100 transition-opacity ml-1">Identity</span>
                                </h1>
                                <Edit className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDeleteCategory}
                        className="border-destructive/20 hover:bg-destructive/5 text-destructive font-black px-8 rounded-4xl h-14 uppercase text-[10px] tracking-widest transition-all hover:border-destructive/50"
                    >
                        <Trash2 className="h-5 w-5 mr-2" /> DESTROY NODE
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Linked Products Section */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card border-border rounded-4xl shadow-xl overflow-hidden border-t-4 border-t-emerald-500/20">
                        <CardHeader className="p-8 border-b border-border bg-linear-to-br from-emerald-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic flex items-center mb-1">
                                    <Package className="mr-3 h-6 w-6 text-emerald-500" />
                                    Active Linkages
                                </h2>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Synchronized unit matrix for this node.</p>
                            </div>
                            <form onSubmit={handleAssignedSearchSubmit} className="flex flex-1 md:max-w-md items-center gap-2">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" />
                                    <Input
                                        placeholder="Query assigned units..."
                                        className="pl-10 bg-secondary/30 border-emerald-500/20 rounded-xl h-12 font-bold focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all"
                                        value={assignedSearch}
                                        onChange={(e) => setAssignedSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="outline" className="h-12 w-12 p-0 rounded-xl border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground transition-all">
                                    {isAssignedLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                </Button>
                            </form>
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 rounded-xl h-12 text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-500/10 transition-all active:scale-95 group shrink-0"
                            >
                                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> LINK UNITS
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            {assignedProducts.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-4xl bg-secondary/5 uppercase tracking-widest text-[9px] font-black opacity-30 italic">
                                    {assignedAppliedSearch ? 'No units match query in this node' : 'No inventory units currently linked'}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {assignedProducts.map(product => (
                                            <div key={product.id} className="p-5 border border-border/50 rounded-4xl bg-secondary/10 hover:bg-secondary/20 transition-all flex items-center justify-between group relative">
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="h-14 w-14 rounded-xl bg-background border border-border flex items-center justify-center text-lg font-black group-hover:border-emerald-500/50 transition-all">
                                                        {product.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black uppercase tracking-tighter italic line-clamp-1 leading-none mb-1">{product.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic">${parseFloat(product.price).toLocaleString()}</span>
                                                            <span className="h-1 w-1 rounded-full bg-border"></span>
                                                            <span className="text-[8px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">STOCK: {product.stock}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 relative z-10">
                                                    <Button
                                                        onClick={() => handleUnlink(product.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-lg bg-secondary/50 text-muted-foreground border border-transparent hover:border-border shadow-none hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                                                    >
                                                        <Unlink className="h-4 w-4" />
                                                    </Button>
                                                    <Link href={`/${companySlug}/admin/products`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 rounded-lg bg-secondary/50 text-muted-foreground border border-transparent hover:border-border shadow-none hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Assigned Products Pagination */}
                                    {assignedTotalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setAssignedPage(p => Math.max(1, p - 1))}
                                                disabled={assignedPage === 1}
                                                className="h-8 w-8 p-0 rounded-lg border-border hover:border-emerald-500 hover:text-emerald-500"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground px-4">
                                                Page {assignedPage} of {assignedTotalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                onClick={() => setAssignedPage(p => Math.min(assignedTotalPages, p + 1))}
                                                disabled={assignedPage === assignedTotalPages}
                                                className="h-8 w-8 p-0 rounded-lg border-border hover:border-emerald-500 hover:text-emerald-500"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="bg-card border-border rounded-4xl shadow-xl overflow-hidden border-t-4 border-t-primary/20 sticky top-8">
                        <div className="p-8 space-y-10">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-3">
                                    <Zap className="h-4 w-4 text-primary" /> Node Statistics
                                </h3>
                                <div className="space-y-8">
                                    <div className="flex items-end justify-between border-b border-border/50 pb-4 relative group">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Total Linkages</span>
                                        <span className="text-4xl font-black italic text-foreground leading-none group-hover:text-primary transition-colors">{category?.productCount}</span>
                                    </div>
                                    <div className="flex items-end justify-between border-b border-border/50 pb-4 group">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Slug Segment</span>
                                        <span className="text-base font-black text-primary leading-none uppercase italic">{category?.slug}</span>
                                    </div>
                                    <div className="flex items-end justify-between border-b border-border/50 pb-4 group">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Protocol Type</span>
                                        <span className="text-base font-black text-muted-foreground leading-none uppercase italic">RESTRICTED_NODE</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 mb-3 italic">Moderation Protocol</p>
                                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                                    Ensure inventory units are assigned to the correct taxonomy for optimized discovery and global indexing.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Link Products Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-card border border-border rounded-4xl shadow-2xl overflow-hidden border-t-4 border-t-emerald-500/20 animate-in zoom-in-95 duration-300 h-[85vh] flex flex-col relative">
                        <div className="px-8 py-6 border-b border-border bg-linear-to-br from-emerald-500/5 to-transparent flex items-center justify-between flex-none">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">
                                    Matrix <span className="text-emerald-500 not-italic">Expansion</span>
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Inbound Taxonomy Linkage Protocol</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors group">
                                <X className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                            </button>
                        </div>

                        <div className="p-8 pb-4 flex-none border-b border-border/50">
                            <form onSubmit={handleAvailableSearchSubmit} className="flex gap-3">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                    <Input
                                        placeholder="Query global registry..."
                                        className="pl-14 bg-secondary/30 border-none rounded-xl h-14 font-black text-xl focus-visible:ring-2 focus-visible:ring-emerald-500/10 transition-all placeholder:opacity-20"
                                        value={availableSearch}
                                        onChange={(e) => setAvailableSearch(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-14 w-14 rounded-xl shadow-lg shadow-emerald-500/20 transition-all group shrink-0">
                                    {isAvailableLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
                                </Button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-3">
                            {availableProducts.length === 0 ? (
                                <div className="text-center py-12 bg-secondary/10 rounded-4xl border-2 border-dashed border-border/50 uppercase tracking-widest text-[9px] font-black opacity-30 italic">
                                    {isAvailableLoading ? 'Scanning...' : 'No compatible units found in global registry'}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableProducts.map(product => {
                                        const isAlreadyAssigned = product.category?.id === Number(id);
                                        const isSelected = selectedForAdd.includes(product.id);

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => {
                                                    if (isAlreadyAssigned) return;
                                                    if (isSelected) {
                                                        setSelectedForAdd(prev => prev.filter(id => id !== product.id));
                                                    } else {
                                                        setSelectedForAdd(prev => [...prev, product.id]);
                                                    }
                                                }}
                                                className={`p-4 border rounded-4xl transition-all flex items-center justify-between group 
                                                    ${isAlreadyAssigned ? 'opacity-50 cursor-not-allowed bg-secondary/10 border-border/50' : 'cursor-pointer'} 
                                                    ${isSelected ? 'bg-emerald-500/5 border-emerald-500 shadow-lg shadow-emerald-500/10' : (!isAlreadyAssigned ? 'hover:bg-secondary/50 border-transparent hover:border-border' : '')}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-base transition-all 
                                                        ${isSelected ? 'bg-emerald-500 text-white rotate-3' : (isAlreadyAssigned ? 'bg-secondary text-muted-foreground' : 'bg-secondary text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500')}
                                                    `}>
                                                        {isSelected ? <CheckCircle className="h-6 w-6" /> : product.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black uppercase tracking-tighter italic leading-none mb-1 flex items-center gap-2">
                                                            {product.name}
                                                            {isAlreadyAssigned && <Badge variant="outline" className="text-[7px] py-0 px-1 border-muted-foreground text-muted-foreground">CURRENTLY LINKED</Badge>}
                                                        </p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Current: {product.category?.name || 'Independent'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-base font-black text-emerald-500 italic leading-none mb-1">${parseFloat(product.price).toLocaleString()}</p>
                                                    <p className="text-[8px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">STOCK: {product.stock}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Available Products Pagination */}
                        {availableTotalPages > 1 && (
                            <div className="px-8 py-3 border-t border-border/50 bg-secondary/5 flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setAvailablePage(p => Math.max(1, p - 1))}
                                    disabled={availablePage === 1}
                                    className="h-8 w-8 p-0 rounded-lg border-border hover:border-emerald-500 hover:text-emerald-500"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                                    {availablePage} / {availableTotalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setAvailablePage(p => Math.min(availableTotalPages, p + 1))}
                                    disabled={availablePage === availableTotalPages}
                                    className="h-8 w-8 p-0 rounded-lg border-border hover:border-emerald-500 hover:text-emerald-500"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="p-8 border-t border-border flex items-center justify-between bg-linear-to-tr from-emerald-500/10 to-transparent flex-none">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-50">Linkage Selection:</p>
                                <p className="text-base font-black italic text-emerald-500 leading-none uppercase">{selectedForAdd.length} UNITS SELECTED</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="h-12 font-black uppercase tracking-widest rounded-xl px-6 border border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all text-[10px]" onClick={() => setIsAddModalOpen(false)}>ABORT</Button>
                                <Button
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-3xl px-8 shadow-xl shadow-emerald-500/20 h-12 text-[10px] transition-all active:scale-95"
                                    onClick={handleBulkAdd}
                                    disabled={isProcessing || selectedForAdd.length === 0}
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    COMMIT LINKAGE
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
