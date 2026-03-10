'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Edit,
    X,
    FolderPlus,
    Zap,
    Loader2,
    CheckCircle,
    Search,
    ArrowRight,
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
    image?: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    category?: { id: number; name: string };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(9); // 3x3 grid

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form States
    const [categoryName, setCategoryName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Assign Products States (during creation)
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [productSearch, setProductSearch] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };

            const response = await api.get('/admin/categories/stats', { params });
            setCategories(response.data.data);
            setTotalItems(response.data.total);
            setTotalPages(response.data.pages);
        } catch (err) {
            console.error("Failed to load categories", err);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [currentPage, itemsPerPage]);

    const fetchAllProducts = async () => {
        try {
            const response = await api.get('/admin/products', { params: { limit: 100 } });
            setProducts(response.data.data);
        } catch (err) {
            console.error("Failed to load products", err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchAllProducts();
    }, [fetchCategories]);

    const handleCreate = async () => {
        if (!categoryName.trim()) return;
        try {
            setIsProcessing(true);
            await api.post('/admin/categories', {
                name: categoryName,
                productIds: selectedProductIds
            });
            toast.success(`Category "${categoryName}" registered successfully`);
            fetchCategories();
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err) {
            toast.error("Creation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setCategoryName('');
        setSelectedProductIds([]);
        setProductSearch('');
    };

    const filteredProductsForCreation = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic border-2 border-dashed border-primary/20 rounded-3xl">Synchronizing Taxonomy Engine...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header / Search Area */}
            <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-lg uppercase">SYSTEM_NODE</Badge>
                            <span className="h-px w-8 bg-primary/20"></span>
                            <span className="text-muted-foreground font-black text-[9px] uppercase tracking-widest opacity-30 italic">Global Registry</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter italic uppercase leading-none">
                            Taxonomy <span className="text-primary not-italic">Control</span>
                        </h1>
                    </div>

                    <Button
                        onClick={() => {
                            resetForm();
                            setIsCreateModalOpen(true);
                        }}
                        className="bg-primary hover:opacity-90 text-primary-foreground font-black px-8 rounded-2xl h-14 shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3 text-[10px] tracking-widest uppercase group"
                    >
                        <FolderPlus className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        REGISTER NEW NODE
                    </Button>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.length === 0 ? (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-4xl uppercase tracking-widest text-[10px] font-black opacity-30 italic">
                        No nodes matching current criteria found
                    </div>
                ) : (
                    categories.map(category => (
                        <Card key={category.id} className="bg-card border-border rounded-4xl shadow-xl overflow-hidden border-t-4 border-t-primary/20 hover:shadow-primary/5 transition-all group relative">
                            <div className="p-8 border-b border-border bg-linear-to-br from-secondary/30 to-transparent flex flex-row items-start justify-between">
                                <div className="z-10">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors mb-1 leading-none">{category.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-primary/20 text-muted-foreground py-0.5">SEGMENT: {category.slug}</Badge>
                                        <span className="h-1 w-1 rounded-full bg-primary/20"></span>
                                        <span className="text-[7px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">ID: {category.id}</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center -mr-1 -mt-1 z-10">
                                    <span className="text-lg font-black italic text-primary leading-none">{category.productCount}</span>
                                    <span className="text-[6px] font-black uppercase tracking-widest text-muted-foreground opacity-50">UNITS</span>
                                </div>
                            </div>

                            <CardContent className="p-8 relative z-10">
                                <Link href={`/admin/categories/${category.id}`}>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-3xl h-12 font-black uppercase text-[9px] tracking-widest border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary shadow-lg group-hover:shadow-primary/20"
                                    >
                                        <Edit className="h-4 w-4" /> ACCESS MODULE <ArrowRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-xl border-border hover:border-primary hover:bg-primary/5 group disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>

                    <div className="flex items-center bg-secondary/30 rounded-xl px-4 h-10 border border-border/50">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all mx-0.5 ${page === currentPage ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-xl border-border hover:border-primary hover:bg-primary/5 group disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                </div>
            )}

            {/* Creation Modal with Product Assignment */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-card border border-border rounded-4xl shadow-2xl overflow-hidden border-t-4 border-t-primary/20 animate-in zoom-in-95 duration-300 h-[80vh] flex flex-col relative">
                        <div className="px-8 py-6 border-b border-border bg-linear-to-br from-secondary/30 to-transparent flex items-center justify-between flex-none">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">
                                    Initialize <span className="text-primary not-italic">Category</span>
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Taxonomy Protocol Node Registration</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors group">
                                <X className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        <div className="p-8 pb-4 space-y-6 flex-none">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-primary/80 italic">Node Designation</Label>
                                <Input
                                    placeholder="Enter category name..."
                                    className="bg-secondary/30 border-none rounded-xl h-14 font-black text-xl px-6 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 text-primary/80 italic">Initial Linkage Matrix</Label>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Scan catalog..."
                                        className="pl-14 bg-secondary/30 border-none rounded-xl h-12 font-bold text-base focus-visible:ring-2 focus-visible:ring-primary/10 transition-all"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-3">
                            {filteredProductsForCreation.length === 0 ? (
                                <div className="text-center py-12 bg-secondary/10 rounded-4xl border-2 border-dashed border-border/50 uppercase tracking-widest text-[9px] font-black opacity-30 italic">
                                    No compatible units found
                                </div>
                            ) : (
                                filteredProductsForCreation.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            if (selectedProductIds.includes(product.id)) {
                                                setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                            } else {
                                                setSelectedProductIds(prev => [...prev, product.id]);
                                            }
                                        }}
                                        className={`p-4 border rounded-4xl cursor-pointer transition-all flex items-center justify-between group ${selectedProductIds.includes(product.id) ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'hover:bg-secondary/50 border-transparent hover:border-border'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-base transition-all ${selectedProductIds.includes(product.id) ? 'bg-primary text-primary-foreground rotate-3' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                {selectedProductIds.includes(product.id) ? <CheckCircle className="h-6 w-6" /> : product.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-base font-black uppercase tracking-tighter italic leading-none mb-1">{product.name}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Current: {product.category?.name || 'Independent'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-black text-primary italic leading-none mb-1">${parseFloat(product.price).toLocaleString()}</p>
                                            <p className="text-[8px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">STOCK: {product.stock}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-border flex items-center justify-between bg-linear-to-tr from-secondary/40 to-transparent flex-none">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1 opacity-50">Matrix Status:</p>
                                <p className="text-base font-black italic text-primary leading-none uppercase">{selectedProductIds.length} LINKS READY</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="h-12 font-black uppercase tracking-widest rounded-xl px-6 border border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all text-[10px]" onClick={() => setIsCreateModalOpen(false)}>ABORT</Button>
                                <Button
                                    className="bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest rounded-3xl px-8 shadow-xl shadow-primary/20 h-12 text-[10px] transition-all active:scale-95"
                                    onClick={handleCreate}
                                    disabled={isProcessing || !categoryName.trim()}
                                >
                                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                                    COMMIT NODE
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
