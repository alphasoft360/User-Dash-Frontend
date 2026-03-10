'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileBarChart, Download, FileText, AlertCircle, ShoppingBag, Package, Activity, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DailySale {
    date: string;
    total: number;
}

interface LowStock {
    id: number;
    name: string;
    stock: number;
    minimumStock: number;
    companyName?: string;
}

interface ReportData {
    dailySales: DailySale[];
    lowStock: LowStock[];
}

export default function ReportsLabPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const response = await api.get('/admin/labs/reports');
            setData(response.data);
        } catch (err) {
            console.error("Failed to load reports", err);
            toast.error("Failed to sync report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const downloadReport = (type: string) => {
        // Implementation for downloading PDF/Excel would go here
        toast.info(`Generating ${type} report...`);
    };

    const downloadSummary = async (type: string, date?: string) => {
        try {
            let endpoint = `/admin/labs/invoice/summary?type=${type}`;
            
            if (date) {
                endpoint += `&date=${date}`;
            } else {
                const now = new Date();
                endpoint += `&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
            }

            toast.info(`Compiling ${type} intelligence report...`);
            
            const response = await api.get(endpoint, {
                responseType: 'blob'
            });

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link and click it to trigger download
            const link = document.createElement('a');
            link.href = url;
            const filename = `Lab-Summary-${type}-${date || new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);
        } catch (err) {
            console.error("Download failed", err);
            toast.error("Failed to generate report. Please check your connection.");
        }
    };

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic">Compiling Intelligence Matrix...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">LAB <span className="text-primary not-italic">Intelligence</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Statistical Analysis & Inventory Audits.</p>
                </div>
                <div className="flex gap-4">
                    <Select onValueChange={(val) => downloadSummary(val)}>
                        <SelectTrigger className="bg-secondary text-foreground hover:bg-secondary/80 font-black px-6 rounded-xl h-12 shadow-sm border-none w-[200px]">
                            <div className="flex items-center gap-3">
                                <Download className="h-4 w-4" />
                                <span>EXPORT REPORT</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 border-border">
                            <SelectItem value="monthly" className="font-bold">Monthly Invoice</SelectItem>
                            <SelectItem value="yearly" className="font-bold">Yearly Invoice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Daily Sales Chart/Table */}
                <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden border-t-4 border-t-indigo-500/20">
                    <CardHeader className="p-10 border-b border-border bg-secondary/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-3 uppercase">
                                <ShoppingBag className="h-6 w-6 text-indigo-500" />
                                Sales Velocity
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Revenue tracking for the last 30 intervals.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => downloadReport('Sales')}>
                            <FileText className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest">Date Node</TableHead>
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Volume (USD)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.dailySales?.map((sale, i) => (
                                    <TableRow key={i} className="border-border hover:bg-secondary/5">
                                        <TableCell className="p-6 font-bold text-muted-foreground">{sale.date}</TableCell>
                                        <TableCell className="p-6 text-right font-black text-indigo-500 italic">
                                            <div className="flex items-center justify-end gap-4">
                                                <span>${parseFloat(sale.total.toString()).toLocaleString()}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => downloadSummary('daily', sale.date)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    title="Download Daily Report"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!data?.dailySales || data.dailySales.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="p-20 text-center italic opacity-30 font-medium font-black uppercase text-[10px] tracking-widest">No transaction history detected</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Critical Inventory Alerts */}
                <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden border-t-4 border-t-red-500/20">
                    <CardHeader className="p-10 border-b border-border bg-secondary/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-3 uppercase">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                                Critical Replenish
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Items currently below minimum operating thresholds.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => downloadReport('Stock')}>
                            <FileText className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest">Entity</TableHead>
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest text-center">Remaining</TableHead>
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.lowStock?.map((item) => (
                                    <TableRow key={item.id} className="border-border hover:bg-red-500/5">
                                        <TableCell className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{item.name}</span>
                                                <span className="text-[10px] font-black uppercase text-muted-foreground italic">{item.companyName || 'Unknown Origin'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-6 text-center font-black text-red-500">{item.stock} / {item.minimumStock}</TableCell>
                                        <TableCell className="p-6 text-center">
                                            <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">REFILL</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!data?.lowStock || data.lowStock.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-20 text-center italic opacity-30 font-medium font-black uppercase text-[10px] tracking-widest">All inventory channels optimized</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Avg Sale Value', value: '$420', icon: <FileBarChart className="h-5 w-5" />, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Stock Turnover', value: '4.2x', icon: <Package className="h-5 w-5" />, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Monthly Growth', value: '+12.4%', icon: <Activity className="h-5 w-5" />, color: 'from-orange-500 to-amber-500' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-card border-border p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent italic`}>{stat.value}</p>
                            </div>
                            <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground/50 group-hover:text-primary transition-colors">
                                {stat.icon}
                            </div>
                        </div>
                        <div className={`absolute -right-2 -bottom-2 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl`} />
                    </Card>
                ))}
            </div>
        </div>
    );
}
