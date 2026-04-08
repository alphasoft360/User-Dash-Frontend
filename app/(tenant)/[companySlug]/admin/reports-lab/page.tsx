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
import { FileBarChart, Download, FileText, AlertCircle, ShoppingBag, Package, Activity, ChevronDown, Eye, X, Loader2, Calendar, BarChart as BarChartIcon } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import SpotlightCard from '@/components/SpotlightCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DailySale {
    date: string;
    total: number;
    pending: number;
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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState(false);

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
            if (date) endpoint += `&date=${date}`;
            else {
                const now = new Date();
                endpoint += `&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
            }

            toast.info(`Compiling ${type} intelligence report...`);
            const response = await api.get(endpoint, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Lab-Summary-${type}-${date || new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);
        } catch (err) {
            toast.error("Download failed");
        }
    };

    const previewSummary = async (type: string, date?: string) => {
        setPreviewing(true);
        try {
            let endpoint = `/admin/labs/invoice/summary?type=${type}`;
            if (date) endpoint += `&date=${date}`;
            else {
                const now = new Date();
                endpoint += `&year=${now.getFullYear()}&month=${now.getMonth() + 1}`;
            }

            toast.info(`Generating ${type} preview...`);
            const response = await api.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (err) {
            toast.error("Preview failed");
        } finally {
            setPreviewing(false);
        }
    };

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase italic">Compiling Intelligence Matrix...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">LAB <span className="text-primary not-italic">Intelligence</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-relaxed">Statistical Analysis & Financial Audits <br />Generated at {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Ultra Slim Premium Intelligence Matrix */}
            <div className="flex flex-col sm:flex-row gap-2">
                {[
                    { id: 'monthly', title: 'Monthly Ledger', icon: Calendar, bg: 'bg-indigo-500/10', text: 'text-indigo-500', btn: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' },
                    { id: 'yearly', title: 'Yearly Audit', icon: BarChartIcon, bg: 'bg-pink-500/10', text: 'text-pink-500', btn: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/20' }
                ].map((report) => (
                    <SpotlightCard key={report.id} className="flex-1 border border-border/40 bg-secondary/5 rounded-xl h-22">
                        <div className="px-4 h-full flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${report.bg} flex items-center justify-center ${report.text} shrink-0`}>
                                    <report.icon size={14} />
                                </div>
                                <h3 className="text-[15px] font-black uppercase italic tracking-wider whitespace-nowrap">{report.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <MagneticButton>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => previewSummary(report.id)}
                                        disabled={previewing}
                                        className="rounded-md border-border/40 hover:bg-background h-7 px-2 font-black uppercase text-[10px] tracking-widest gap-1"
                                    >
                                        {previewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
                                        PREVIEW
                                    </Button>
                                </MagneticButton>
                                <MagneticButton>
                                    <Button
                                        size="sm"
                                        onClick={() => downloadSummary(report.id)}
                                        className={`rounded-md ${report.btn} text-white h-7 px-2 font-black uppercase text-[10px] tracking-widest gap-1 shadow-sm`}
                                    >
                                        <Download className="h-4 w-4" />
                                        EXPORT
                                    </Button>
                                </MagneticButton>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Daily Sales Chart/Table */}
                <Card className="bg-card border-border rounded-3xl shadow-sm overflow-hidden border-t-4 border-t-indigo-500/20">
                    <CardHeader className="p-6 border-b border-border bg-secondary/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-3 uppercase">
                                <ShoppingBag className="h-6 w-6 text-indigo-500" />
                                Sales Velocity
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Revenue tracking for the last 30 intervals.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest">Date Node</TableHead>
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Pending</TableHead>
                                    <TableHead className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Volume (PKR)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.dailySales?.map((sale, i) => (
                                    <TableRow key={i} className="border-border hover:bg-secondary/5 group">
                                        <TableCell className="p-6 font-bold text-muted-foreground">{sale.date}</TableCell>
                                        <TableCell className="p-6 text-right font-black text-pink-500/40 group-hover:text-pink-500 transition-colors italic">
                                            PKR {parseFloat((sale.pending || 0).toString()).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="p-6 text-right font-black text-indigo-500 italic">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>PKR {parseFloat(sale.total.toString()).toLocaleString()}</span>
                                                <div className="flex bg-secondary/30 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => previewSummary('daily', sale.date)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-background rounded-md transition-all"
                                                        title="Preview Daily"
                                                        disabled={previewing}
                                                    >
                                                        {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => downloadSummary('daily', sale.date)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-background rounded-md transition-all"
                                                        title="Download Daily"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!data?.dailySales || data.dailySales.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-20 text-center italic opacity-30 font-medium font-black uppercase text-[10px] tracking-widest">No transaction history detected</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Critical Inventory Alerts */}
                <Card className="bg-card border-border rounded-3xl shadow-sm overflow-hidden border-t-4 border-t-red-500/20">
                    <CardHeader className="p-6 border-b border-border bg-secondary/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-3 uppercase">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                                Critical Replenish
                            </CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Items currently below minimum operating thresholds.</CardDescription>
                        </div>
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

            {/* FULL SCREEN PDF PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-500/80">INTELLIGENCE <span className="text-foreground not-italic">Preview</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing statistical summary</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = previewUrl;
                                    link.setAttribute('download', `Summary-Preview.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-indigo-500/20 h-10"
                            >
                                <Download className="h-4 w-4" />
                                DOWNLOAD PDF
                            </Button>
                            <div className="w-px h-8 bg-border"></div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    URL.revokeObjectURL(previewUrl);
                                    setPreviewUrl(null);
                                }}
                                className="rounded-full bg-secondary/50 hover:bg-secondary h-10 w-10 shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 w-full p-4 md:p-8 bg-secondary/5 overflow-hidden">
                        <iframe src={previewUrl} className="w-full h-full rounded-2xl shadow-2xl border border-border bg-white" />
                    </div>
                </div>
            )}
        </div>
    );
}
