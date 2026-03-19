'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    AlertTriangle,
    ArrowLeft,
    Package,
    TrendingUp,
    Loader2
} from 'lucide-react';

interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    minimumStock: number;
    companyName?: string;
}

export default function LowStockPage() {
    const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const response = await api.get('/admin/labs/reports');
                setLowStockItems(response.data.lowStock || []);
            } catch (err) {
                console.error("Failed to load low stock items", err);
                toast.error("Failed to load low stock data");
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">
                        LOW STOCK <span className="text-red-500 not-italic">Alerts</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                        Reagents currently below minimum inventory levels.
                    </p>
                </div>
                <Link href="/admin/dashboard-lab">
                    <Button variant="ghost" className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-t-red-500/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black uppercase italic">Critical Inventory</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                These items require immediate restocking to avoid lab downtime.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-secondary/5 border-b border-border">
                                <TableRow className="border-none">
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Supplier</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Current Stock</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Minimum Required</TableHead>
                                    <TableHead className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-20 text-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading low stock data...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : lowStockItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-20 text-center">
                                            <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">All reagent levels are currently healthy.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lowStockItems.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-secondary/10 transition-colors border-b border-border last:border-0">
                                            <TableCell className="p-6">
                                                <p className="font-black text-foreground uppercase tracking-tight text-sm">{item.name}</p>
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.companyName || 'Unknown'}</p>
                                            </TableCell>
                                            <TableCell className="p-6 text-center">
                                                <span className="text-lg font-black text-red-500">{item.stock}</span>
                                                <span className="text-[8px] block font-black uppercase tracking-tighter text-muted-foreground">Units</span>
                                            </TableCell>
                                            <TableCell className="p-6 text-center text-sm font-bold text-muted-foreground">
                                                {item.minimumStock}
                                            </TableCell>
                                            <TableCell className="p-6 text-right">
                                                <Link href={`/admin/stock/${item.id}/in`}>
                                                    <Button
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase rounded-xl h-10 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 ml-auto"
                                                    >
                                                        <TrendingUp className="h-4 w-4" />
                                                        Refill Stock
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
