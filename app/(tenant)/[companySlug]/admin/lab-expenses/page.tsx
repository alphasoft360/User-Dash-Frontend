'use client';

import { useEffect, useState, useCallback, use } from 'react';
import api from '@/lib/api';
import debounce from 'lodash/debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    Trash2,
    Plus,
    Search,
    FilterX,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    ReceiptText,
    Calendar,
    X,
    Eye,
    FileDown,
    Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

interface LabExpense {
    id: number;
    title: string;
    description: string;
    amount: string;
    expenseDate: string;
    category: string;
    createdAt: string;
    companyName?: string;
}

const EXPENSE_CATEGORIES = [
    'Utility',
    'Equipment',
    'Reagents',
    'Maintenance',
    'Salaries',
    'Logistics',
    'Marketing',
    'Miscellaneous',
    'Other'
];

export default function LabExpensesPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const [expenses, setExpenses] = useState<LabExpense[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 15;

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState<number | null>(null);
    const [showHeader, setShowHeader] = useState(true);

    // Form states
    const [newExpense, setNewExpense] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'Miscellaneous',
        expenseDate: new Date().toISOString().split('T')[0]
    });

    const fetchExpenses = async (page = currentPage, search = searchQuery) => {
        setLoading(true);
        try {
            const paramsList = {
                search: search || undefined,
                page: page,
                limit: limit
            };

            const response = await api.get('/admin/labs/expenses', { params: paramsList });
            setExpenses(response.data.data);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setCurrentPage(1);
            fetchExpenses(1, query);
        }, 500),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        fetchExpenses(currentPage, searchQuery);
    }, [currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        debouncedSearch(val);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) return;
        try {
            await api.delete(`/admin/labs/expenses/${id}`);
            fetchExpenses(currentPage, searchQuery);
            toast.success("Expense deleted successfully");
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to delete expense");
        }
    };

    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/labs/expenses', newExpense);
            toast.success("Expense recorded successfully");
            setShowAddModal(false);
            setNewExpense({
                title: '',
                description: '',
                amount: '',
                category: 'Miscellaneous',
                expenseDate: new Date().toISOString().split('T')[0]
            });
            fetchExpenses(1, searchQuery);
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Failed to create expense";
            toast.error((err as any)?.response?.data?.message || errorMessage);
        }
    };

    const handleDownload = async (id: number) => {
        try {
            toast.info(`Downloading digital expense receipt #${id}...`);
            const response = await api.get(`/admin/labs/invoice/expense/${id}`, {
                params: { showHeader },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Expense-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Download failed");
        }
    };

    const handlePreview = async (id: number) => {
        setPreviewing(id);
        try {
            toast.info(`Generating preview for expense #${id}...`);
            const response = await api.get(`/admin/labs/invoice/expense/${id}`, {
                params: { showHeader },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setPreviewUrl(url);
        } catch (err) {
            toast.error("Preview failed");
        } finally {
            setPreviewing(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">
                        LAB <span className="text-primary not-italic">EXPENSES</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                        Manage all laboratory operational and one-off expenses.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-secondary/30 p-2 rounded-2xl border border-border items-center gap-4 px-4 h-11">
                        <div className="flex items-center gap-2">
                            <Switch 
                                id="show-header" 
                                checked={showHeader} 
                                onCheckedChange={setShowHeader}
                                className="data-[state=checked]:bg-primary"
                            />
                            <Label htmlFor="show-header" className="text-[9px] font-black uppercase tracking-widest cursor-pointer opacity-70">Header/Footer</Label>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:opacity-90 text-primary-foreground font-black px-6 rounded-xl h-11 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        RECORD NEW EXPENSE
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Expenses</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or description..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 bg-secondary/30 border-border rounded-xl h-11 font-bold text-sm focus-visible:ring-primary/50"
                            />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setCurrentPage(1);
                                fetchExpenses(1, '');
                            }}
                            className="text-muted-foreground hover:text-foreground h-11 px-4 rounded-xl font-bold flex items-center gap-2"
                        >
                            <FilterX className="h-4 w-4" /> Reset
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-sm overflow-hidden text-foreground print:hidden">
                <CardHeader className="p-8 border-b border-border bg-secondary/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <ReceiptText className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black">EXPENSE HISTORY</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/5 border-b border-border">
                                <tr>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Amount</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading && expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center font-black uppercase italic text-primary/50 animate-pulse">Loading Expenses...</td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground font-black uppercase tracking-widest text-xs">
                                            No expenses found.
                                        </td>
                                    </tr>
                                ) : expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-secondary/20 transition-all border-b border-border dark:border-slate-800">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                                                    {expense.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-base leading-tight mb-0.5">{expense.title}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] truncate">{expense.description || 'No description provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs font-black text-muted-foreground tracking-wider uppercase">
                                            <span className="px-2 py-1 bg-secondary rounded-lg border border-border">
                                                {expense.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-base font-black text-red-500">
                                                PKR {parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground font-bold text-xs">
                                                <Calendar className="h-3 w-3" />
                                                {expense.expenseDate}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl"
                                                    onClick={() => handlePreview(expense.id)}
                                                    disabled={previewing === expense.id}
                                                >
                                                    {previewing === expense.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl"
                                                    onClick={() => handleDownload(expense.id)}
                                                >
                                                    <FileDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl"
                                                    onClick={() => handleDelete(expense.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-border bg-secondary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Showing <span className="text-foreground">{(currentPage - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(currentPage * limit, totalItems)}</span> of <span className="text-foreground">{totalItems}</span> expenses
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1 || loading}
                                    className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1 mx-2">
                                    <div className="h-10 px-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="text-xs font-black text-primary">Page {currentPage} of {totalPages}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || loading}
                                    className="h-10 w-10 rounded-xl border-border bg-card hover:bg-secondary/20 disabled:opacity-50"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 print:hidden">
                    <div className="bg-card w-full max-w-2xl rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                        <div className="px-6 py-5 border-b border-border bg-secondary/30 flex justify-between items-center">
                            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-primary" />
                                UNIVERSAL EXPENSE FORM
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="rounded-full hover:bg-foreground/10 h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleCreateExpense} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expense Title / Item</Label>
                                <Input
                                    required
                                    autoFocus
                                    placeholder="e.g. Utility Bill, New Microscopes..."
                                    value={newExpense.title}
                                    onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                                    className="bg-secondary/20 h-11 rounded-xl px-4 font-bold text-sm border-border"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount (PKR)</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-xs">PKR</div>
                                        <Input
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="bg-secondary/20 h-11 rounded-xl pl-12 font-black text-sm border-border text-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</Label>
                                    <Input
                                        required
                                        type="date"
                                        value={newExpense.expenseDate}
                                        onChange={e => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                                        className="bg-secondary/20 h-11 rounded-xl px-4 font-bold text-sm border-border font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                                <Select value={newExpense.category} onValueChange={v => setNewExpense({ ...newExpense, category: v })}>
                                    <SelectTrigger className="bg-secondary/20 h-11 rounded-xl px-4 font-bold text-sm border-border">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border rounded-xl shadow-xl">
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <SelectItem value={cat} key={cat} className="font-bold py-2 text-sm">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description / Notes (Optional)</Label>
                                <textarea
                                    className="w-full bg-secondary/20 rounded-xl p-3 text-sm font-medium text-foreground border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    rows={3}
                                    placeholder="Add any relevant details about this expense..."
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="h-11 px-6 rounded-xl font-bold text-sm">
                                    CANCEL
                                </Button>
                                <Button type="submit" className="bg-primary hover:opacity-90 text-primary-foreground font-black h-11 px-8 rounded-xl shadow-lg shadow-primary/20 text-sm">
                                    RECORD EXPENSE
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FULL SCREEN PDF PREVIEW MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm">
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">EXPENSE <span className="text-foreground not-italic">Receipt</span></h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reviewing digital document</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = previewUrl;
                                    link.setAttribute('download', `Expense-Receipt.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }}
                                className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl flex items-center gap-2 uppercase italic shadow-lg shadow-primary/20 h-10 text-xs"
                            >
                                <FileDown className="h-4 w-4" />
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
