'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    Package,
    Plus,
    Search,
    Tag,
    Loader2,
    ArrowUpRight,
    ClipboardList,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    stock: number;
    category?: { id: number, name: string };
    batchNumber?: string;
    companyName?: string;
}

export default function StockManagementPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const fetchProducts = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await api.get('/admin/products', {
                params: {
                    page,
                    limit,
                    search: search || undefined
                }
            });
            setProducts(response.data.data);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
            setCurrentPage(response.data.page);
        } catch (err) {
            console.error("Failed to load products", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(1, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage, searchTerm);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">STOCK <span className="text-primary not-italic">Manager</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Update Reagent Inventory & Manage Stock Volume.</p>
                </div>
                <Link href="/admin/stock/new">
                    <Button
                        className="bg-primary hover:opacity-90 text-primary-foreground font-black px-8 rounded-2xl h-14 shadow-lg shadow-primary/20 flex items-center gap-3"
                    >
                        <Plus className="h-5 w-5" />
                        NEW STOCK ENTRY
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border rounded-[2rem] shadow-sm p-6 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Reagents</p>
                        <p className="text-2xl font-black text-foreground">{totalItems}</p>
                    </div>
                </Card>
                <Card className="bg-card border-border rounded-[2rem] shadow-sm p-6 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Page Stock Units</p>
                        <p className="text-2xl font-black text-foreground">{products.reduce((acc, p) => acc + (p.stock || 0), 0)}</p>
                    </div>
                </Card>
                <Card className="bg-card border-border rounded-[2.5rem] shadow-sm p-6 flex items-center gap-6 cursor-pointer hover:bg-secondary/5 transition-colors">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <ClipboardList className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">View History</p>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1 uppercase tracking-tighter">Stock Log <ArrowUpRight className="h-3 w-3" /></p>
                    </div>
                </Card>
            </div>

            {/* Main Table Section */}
            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <CardHeader className="p-8 border-b border-border bg-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black uppercase italic tracking-widest">Inventory List</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Current stock levels for all laboratory items.</CardDescription>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, batch or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 bg-secondary/30 border-border rounded-xl h-12 font-bold focus:ring-primary/20"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-secondary/5 border-b border-border">
                                <TableRow className="border-none">
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reagent / Item</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Batch</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Current Stock</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-20 text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading inventory data...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-20 text-center">
                                            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No matching reagents found in stock.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0 group">
                                            <TableCell className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs uppercase tracking-tighter">
                                                        {product.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground uppercase tracking-tight text-sm">{product.name}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{product.companyName || 'Unknown Supplier'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-secondary/50 rounded-full text-foreground border border-border">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="p-6 text-center font-mono text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                                {product.batchNumber || '—'}
                                            </TableCell>
                                            <TableCell className="p-6 text-center">
                                                <span className={`text-base font-black ${product.stock <= 5 ? 'text-red-500' : 'text-foreground'}`}>
                                                    {product.stock}
                                                </span>
                                                <span className="text-[8px] block font-black uppercase tracking-tighter text-muted-foreground">Units</span>
                                            </TableCell>
                                            <TableCell className="p-6 text-right">
                                                <Link href={`/admin/stock/${product.id}/in`}>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-xl border-primary/20 hover:border-primary text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase gap-2 h-9 px-4 transition-all"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Stock In
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="p-8 border-t border-border bg-secondary/5 flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Page {currentPage} of {totalPages} — Total {totalItems} reagents
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
