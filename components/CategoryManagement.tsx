'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Package, 
    Search, 
    Link as LinkIcon,
    Loader2,
    CheckCircle2,
    XCircle,
    Building2,
    Settings2,
    ArrowRightCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
    id: number;
    name: string;
    slug: string;
    productCount: number;
    vendor?: { id: number, name: string };
}

interface Vendor {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    category?: { id: number, name: string };
}

export default function CategoryManagement({ companySlug }: { companySlug: string }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formName, setFormName] = useState('');
    const [formVendorId, setFormVendorId] = useState<string>('none');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Product Assignment
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<Category | null>(null);
    const [unassignedProducts, setUnassignedProducts] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [assigningProducts, setAssigningProducts] = useState(false);

    const fetchData = async (targetPage: number = page) => {
        setLoading(true);
        try {
            const [catRes, venRes] = await Promise.all([
                api.get('/admin/categories/stats', { 
                    params: { 
                        page: targetPage, 
                        limit: 10,
                        search: searchTerm || undefined
                    } 
                }),
                api.get('/admin/vendors')
            ]);
            setCategories(catRes.data.data);
            setTotalPages(catRes.data.pages || 1);
            setTotalItems(catRes.data.total || 0);
            setVendors(venRes.data);
        } catch (err) {
            console.error("Failed to fetch category data", err);
            toast.error("Failed to load categories or vendors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) {
                fetchData(1);
            } else {
                setPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error("Category name is required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formName,
                vendorId: formVendorId === 'none' ? null : parseInt(formVendorId)
            };

            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, payload);
                toast.success("Category updated successfully");
            } else {
                await api.post('/admin/categories', payload);
                toast.success("Category created successfully");
            }
            setIsFormOpen(false);
            setEditingCategory(null);
            setFormName('');
            setFormVendorId('none');
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? Categories with products cannot be deleted.")) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success("Category deleted");
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const openForm = (cat?: Category) => {
        if (cat) {
            setEditingCategory(cat);
            setFormName(cat.name);
            setFormVendorId(cat.vendor?.id.toString() || 'none');
        } else {
            setEditingCategory(null);
            setFormName('');
            setFormVendorId('none');
        }
        setIsFormOpen(true);
    };

    const openProductAssignment = async (cat: Category) => {
        setSelectedCategoryForProducts(cat);
        setIsProductModalOpen(true);
        setSelectedProductIds([]);
        
        try {
            // Fetch all products to find those NOT in this category or just all to allow move
            const res = await api.get('/admin/products', { params: { limit: 100 } });
            // Filter out products already in this category
            setUnassignedProducts(res.data.data.filter((p: Product) => p.category?.id !== cat.id));
        } catch (err) {
            toast.error("Failed to load products");
        }
    };

    const handleAssignProducts = async () => {
        if (!selectedCategoryForProducts || selectedProductIds.length === 0) return;
        
        setAssigningProducts(true);
        try {
            await api.patch(`/admin/categories/${selectedCategoryForProducts.id}/products`, {
                productIds: selectedProductIds
            });
            toast.success("Products assigned successfully");
            setIsProductModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Assignment failed");
        } finally {
            setAssigningProducts(false);
        }
    };

    const toggleProductSelection = (id: number) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    return (
        <div id="category-section" className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic flex items-center gap-3">
                        <Settings2 className="h-6 w-6 text-primary not-italic" />
                        Category <span className="text-primary not-italic">Management</span>
                    </h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Organize your reagents and link them to vendors.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border-border rounded-xl h-11 pl-10 pr-4 font-bold focus:ring-primary/20 transition-all placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                        />
                    </div>
                    <Button 
                        onClick={() => openForm()}
                        className="bg-primary hover:opacity-90 text-primary-foreground font-black rounded-xl gap-2 h-11 px-6 shadow-lg shadow-primary/10"
                    >
                        <Plus className="h-4 w-4" />
                        CREATE NEW CATEGORY
                    </Button>
                </div>
            </div>

            <Card className="bg-card border-border rounded-4xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-secondary/10">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category Name</TableHead>
                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Linked Vendor</TableHead>
                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Reagents</TableHead>
                            <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loading categories...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                                    No categories created yet.
                                </TableCell>
                            </TableRow>
                        ) : categories.map((cat) => (
                            <TableRow key={cat.id} className="hover:bg-secondary/20 transition-all border-border">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner">
                                            {cat.name[0].toUpperCase()}
                                        </div>
                                        <span className="font-bold text-foreground">{cat.name}</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    {cat.vendor ? (
                                        <div className="flex items-center gap-2 group cursor-default">
                                            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2">
                                                <Building2 className="h-3 w-3 text-indigo-400" />
                                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">{cat.vendor.name}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground opacity-30 italic">Not Linked</span>
                                    )}
                                </td>
                                <td className="p-6 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-base text-foreground">{cat.productCount}</span>
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">TOTAL STOCK ITEMS</span>
                                    </div>
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => openProductAssignment(cat)}
                                        className="h-9 w-9 text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg"
                                        title="Add Products"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => openForm(cat)}
                                        className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(cat.id)}
                                        className="h-9 w-9 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {!loading && (
                    <div className="p-4 bg-secondary/10 border-t border-border flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                            Showing <span className="text-primary">{categories.length}</span> of {totalItems} categories
                            {totalPages > 1 && <span className="ml-2 opacity-50">| Page {page} of {totalPages}</span>}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1 mx-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .map((p, i, arr) => (
                                            <div key={p} className="flex items-center">
                                                {i > 0 && arr[i-1] !== p - 1 && (
                                                    <span className="text-muted-foreground px-1">...</span>
                                                )}
                                                <Button
                                                    variant={p === page ? "primary" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setPage(p)}
                                                    className={`h-8 w-8 rounded-lg text-[10px] font-black ${p === page ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                                >
                                                    {p}
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    className="h-8 w-8 rounded-lg"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Form Drawer/Modal Logic (Simple local implementation if custom components are missing) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <Card className="relative w-full max-w-md bg-card border-border rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="p-8 border-b border-border">
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                {editingCategory ? <Edit2 className="h-5 w-5 text-primary not-italic" /> : <Plus className="h-5 w-5 text-primary not-italic" />}
                                {editingCategory ? 'Edit' : 'Create'} <span className="text-primary not-italic font-black">Category</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Name</Label>
                                    <Input 
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Enter category name..."
                                        className="bg-secondary/30 border-border rounded-xl h-12 font-bold px-4 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Link to Vendor (Optional)</Label>
                                    <Select value={formVendorId} onValueChange={setFormVendorId}>
                                        <SelectTrigger className="bg-secondary/30 border-border h-12 rounded-xl px-4 font-bold">
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-slate-900 border-border">
                                            <SelectItem value="none">None (No link)</SelectItem>
                                            {vendors.map(v => (
                                                <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-border"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        disabled={submitting}
                                        className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingCategory ? 'SAVE CHANGES' : 'CREATE CATEGORY')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Product Assignment Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
                    <Card className="relative w-full max-w-2xl bg-card border-border rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader className="p-8 border-b border-border">
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <Package className="h-5 w-5 text-indigo-400 not-italic" />
                                Assign Reagents to <span className="text-indigo-400 not-italic font-black">{selectedCategoryForProducts?.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {unassignedProducts.length === 0 ? (
                                        <p className="text-center py-10 text-muted-foreground font-bold uppercase text-[10px] tracking-widest italic opacity-50">All reagents already assigned or none available.</p>
                                    ) : unassignedProducts.map(p => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => toggleProductSelection(p.id)}
                                            className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${selectedProductIds.includes(p.id) ? 'bg-primary/10 border-primary shadow-inner scale-[0.98]' : 'bg-secondary/20 border-border hover:border-primary/30'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${selectedProductIds.includes(p.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                    {p.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{p.name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Currently: {p.category?.name || 'Uncategorized'}</p>
                                                </div>
                                            </div>
                                            <div className="transition-all duration-500">
                                            {selectedProductIds.includes(p.id) ? (
                                                <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in spin-in-12 border-none" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                                            )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 gap-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Selected: <span className="text-primary font-black">{selectedProductIds.length}</span> items
                                </p>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setIsProductModalOpen(false)}
                                        className="h-11 rounded-xl font-black uppercase tracking-widest px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleAssignProducts}
                                        disabled={selectedProductIds.length === 0 || assigningProducts}
                                        className="h-11 rounded-xl font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600 text-white px-8 shadow-lg shadow-indigo-500/20"
                                    >
                                        {assigningProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ASSIGN REAGENTS'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
