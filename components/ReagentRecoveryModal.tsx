'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RotateCcw, Trash2, X, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    batchNumber?: string;
    price: string;
    stock: number;
    companyName?: string;
}

interface ReagentRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestoreSuccess: () => void;
}

export default function ReagentRecoveryModal({ isOpen, onClose, onRestoreSuccess }: ReagentRecoveryModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchDeletedProducts = useCallback(async (currentPage = page, searchQuery = search) => {
        setLoading(true);
        try {
            const response = await api.get('/admin/products', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search: searchQuery,
                    status: 'inactive'
                }
            });
            if (response.data.data) {
                setProducts(response.data.data);
                setTotalPages(response.data.pages || 1);
                setTotalItems(response.data.total || 0);
            }
        } catch (err) {
            console.error("Failed to load deleted reagents", err);
            toast.error("Failed to load recovery registry");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        if (isOpen) {
            fetchDeletedProducts(1, '');
            setPage(1);
            setSearch('');
        }
    }, [isOpen, fetchDeletedProducts]);

    const handleRestore = async (id: number) => {
        try {
            await api.patch(`/admin/products/${id}/restore`);
            toast.success("Reagent restored successfully");
            fetchDeletedProducts();
            onRestoreSuccess();
        } catch (err) {
            toast.error("Failed to restore reagent");
        }
    };

    const handlePermanentDelete = async (id: number) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this reagent? This action cannot be undone and will only work if there are no associated sales.")) return;
        try {
            await api.delete(`/admin/products/${id}/permanent`);
            toast.success("Reagent permanently deleted");
            fetchDeletedProducts();
        } catch (err: any) {
            const message = err.response?.data?.message || "Failed to permanently delete reagent";
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">REAGENT <span className="text-primary not-italic">Recovery</span></h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Restore or permanently remove inactive inventory items</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-secondary h-10 w-10 text-muted-foreground"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8 bg-secondary/5 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, batch or company..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                                fetchDeletedProducts(1, e.target.value);
                            }}
                            className="pl-10 bg-card border-border rounded-xl h-12 font-bold text-foreground"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product/Batch</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Company</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Stock</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right border-l border-border/10">Price</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                        No deleted reagents found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0 group">
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center font-black text-primary text-[10px]">
                                                    {product.name?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{product.name}</p>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-black">Batch: {product.batchNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4 font-medium text-sm text-muted-foreground">
                                            {product.companyName || '—'}
                                        </TableCell>
                                        <TableCell className="p-4 text-center font-black text-sm text-foreground">
                                            {product.stock}
                                        </TableCell>
                                        <TableCell className="p-4 text-right border-l border-border/10">
                                            <span className="font-black text-sm text-primary">
                                                PKR {parseFloat(product.price).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4 text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleRestore(product.id)}
                                                    className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shrink-0 px-4"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                    Restore
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handlePermanentDelete(product.id)}
                                                    className="h-9 w-9 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg border border-transparent hover:border-red-500/20"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-border bg-secondary/5 flex items-center justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Total {totalItems} items
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newPage = Math.max(1, page - 1);
                                    setPage(newPage);
                                    fetchDeletedProducts(newPage);
                                }}
                                disabled={page === 1 || loading}
                                className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                            >
                                Previous
                            </Button>
                            <span className="text-xs font-black px-4 text-foreground">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newPage = Math.min(totalPages, page + 1);
                                    setPage(newPage);
                                    fetchDeletedProducts(newPage);
                                }}
                                disabled={page === totalPages || loading}
                                className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-widest"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
