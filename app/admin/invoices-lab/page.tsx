'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Receipt, Search, FileDown, Eye, Calendar, User, Building, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
    id: number;
    customerName: string;
    phone: string;
    totalAmount: string;
    createdAt: string;
}

export default function InvoicesLabPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/admin/labs/invoices');
            setInvoices(response.data.data || []);
        } catch (err) {
            console.error("Failed to load invoices", err);
            toast.error("Failed to sync invoice database");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleDownload = async (id: number) => {
        try {
            toast.info(`Downloading digital invoice #${id}...`);
            const response = await api.get(`/invoice/download`, {
                params: { orderId: id },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Download failed");
        }
    };

    const filteredInvoices = (invoices || []).filter(inv =>
        inv?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        inv?.id?.toString().includes(search)
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic text-pink-500">INVOICE <span className="text-foreground not-italic">Archive</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Digital Receipts & Billing History Records.</p>
                </div>
                <div className="flex bg-secondary/30 p-2 rounded-2xl border border-border">
                    <Search className="h-10 w-10 p-2 text-muted-foreground" />
                    <Input
                        placeholder="Filter by ID or Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none font-bold placeholder:font-medium focus-visible:ring-0 w-64 uppercase text-[10px] tracking-widest"
                    />
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden border-t-4 border-t-pink-500/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3 uppercase italic">
                        <Receipt className="h-6 w-6 text-pink-500" />
                        Billing Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Receipt ID</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Customer Node</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest text-center">Amount Due</TableHead>
                                <TableHead className="p-8 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-24 text-center font-black uppercase italic text-pink-500/50 animate-pulse">Accessing Vault...</TableCell>
                                </TableRow>
                            ) : filteredInvoices.map((inv) => (
                                <TableRow key={inv.id} className="border-border hover:bg-pink-500/5 transition-colors">
                                    <TableCell className="p-8 font-black text-foreground">#{inv.id}</TableCell>
                                    <TableCell className="p-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground uppercase tracking-tighter">{inv.customerName || 'Anonymous User'}</span>
                                            <span className="text-[10px] font-black text-muted-foreground opacity-50">{inv.phone || 'NO CONTACT'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-8">
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                                            <Calendar className="h-3 w-3 text-pink-500" />
                                            {new Date(inv.createdAt).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-8 text-center">
                                        <span className="font-black text-lg italic text-pink-500">${parseFloat(inv.totalAmount).toLocaleString()}</span>
                                    </TableCell>
                                    <TableCell className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 rounded-xl" onClick={() => handleDownload(inv.id)}>
                                                <FileDown className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 rounded-xl">
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredInvoices.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-24 text-center italic opacity-30 font-bold uppercase text-[10px] tracking-[0.3em]">Vault is empty</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
