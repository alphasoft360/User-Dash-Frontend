'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, FileDown, CheckCircle2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id?: number;
    name: string;
    slug: string;
    price: string | number;
    stock: number;
    isRecommended: boolean;
    isActive: boolean;
    category?: { id: number; name: string };
    companyName?: string;
    packSize?: string;
    purchasePrice?: string | number;
    expiryDate?: string;
    batchNumber?: string;
    minimumStock: number;
    description?: string;
}

interface ReagentFormProps {
    initialData?: Partial<Product>;
    isEditing?: boolean;
}

export default function ReagentForm({ initialData, isEditing = false }: ReagentFormProps) {
    const router = useRouter();
    const params = useParams();
    const companySlug = params.companySlug as string;
    const [loading, setLoading] = useState(false);
    const [savedId, setSavedId] = useState<number | null>(initialData?.id || null);
    const [isSaved, setIsSaved] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        companyName: '',
        packSize: '',
        price: '',
        purchasePrice: '',
        stock: 0,
        minimumStock: 0,
        expiryDate: '',
        batchNumber: '',
        description: '',
        isActive: true,
        isRecommended: false,
        ...initialData
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to load categories", err);
                toast.error("Failed to load categories. Please check your connection.");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'category_id') {
            setFormData(prev => ({
                ...prev,
                category: { id: parseInt(value), name: '' }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category?.id) {
            toast.error("Please select a category");
            return;
        }



        setLoading(true);
        try {
            if (isEditing && formData.id) {
                const dataToSubmit = {
                    name: formData.name,
                    description: formData.description,
                    price: Math.round(parseFloat(formData.price?.toString() || "0")),
                    purchasePrice: formData.purchasePrice ? Math.round(parseFloat(formData.purchasePrice.toString())) : undefined,
                    stock: parseInt(formData.stock?.toString() || "0"),
                    minimumStock: parseInt(formData.minimumStock?.toString() || "0"),
                    categoryId: formData.category?.id,
                    companyName: formData.companyName,
                    packSize: formData.packSize,
                    expiryDate: formData.expiryDate,
                    batchNumber: formData.batchNumber,
                    isActive: formData.isActive,
                    isRecommended: formData.isRecommended
                };
                await api.put(`/admin/products/${formData.id}`, dataToSubmit);
                setSavedId(formData.id);
                setIsSaved(true);
                toast.success("Reagent updated successfully");
            } else {
                const dataToSubmit = {
                    ...formData,
                    category_id: formData.category?.id,
                    price: Math.round(parseFloat(formData.price?.toString() || "0")),
                    purchasePrice: formData.purchasePrice ? Math.round(parseFloat(formData.purchasePrice.toString())) : undefined,
                    stock: parseInt(formData.stock?.toString() || "0"),
                    minimumStock: parseInt(formData.minimumStock?.toString() || "0"),
                };
                const response = await api.post('/products', dataToSubmit);
                setSavedId(response.data.id);
                setIsSaved(true);
                toast.success("Reagent added successfully");
            }
        } catch (err: unknown) {
            console.error(err);
            const error = err as { response?: { data?: { message?: string, errors?: string[] } } };
            const backendErrors = error.response?.data?.errors;

            if (backendErrors && Array.isArray(backendErrors)) {
                backendErrors.forEach(msg => toast.error(msg));
            } else {
                const errorMessage = error.response?.data?.message || "Failed to save reagent";
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!savedId) return;
        try {
            toast.info("Preparing your PDF document...");
            const response = await api.get(`/admin/labs/invoice/reagent/${savedId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reagent-Invoice-${savedId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            console.error("Download failed", err);
            const errorObj = err as { response?: { data?: any } };
            if (errorObj.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result as string);
                        toast.error(errorData.message || "Failed to download invoice");
                    } catch (e) {
                        toast.error("Failed to download invoice. Server error.");
                    }
                };
                reader.readAsText(errorObj.response.data);
            } else {
                toast.error("Failed to download invoice. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full hover:bg-secondary/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                        {isEditing ? 'EDIT' : 'NEW'} <span className="text-primary not-italic">REAGENT</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                        {isEditing ? 'Modify existing reagent details' : 'Register a new laboratory reagent to inventory'}
                    </p>
                    <p className="text-[10px] font-black text-primary uppercase mt-2">
                        Debug: {categories.length} categories found. URL Segment: {window.location.pathname.split('/')[1]}
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Product Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    name="name"
                                    required
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Enter reagent name..."
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
                                <Input
                                    name="companyName"
                                    value={formData.companyName || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Manufacturer / Brand"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.category?.id?.toString() || ''}
                                    onValueChange={(val) => handleSelectChange('category_id', val)}
                                >
                                    <SelectTrigger className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl z-50">
                                        {categories.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-muted-foreground font-bold uppercase italic">
                                                No categories found
                                            </div>
                                        ) : (
                                            categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pack Size</Label>
                                <Input
                                    name="packSize"
                                    value={formData.packSize || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. 500ml, 100 Tests"
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Purchase Price (PKR)</Label>
                                <Input
                                    name="purchasePrice"
                                    type="number"
                                    value={formData.purchasePrice || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Sale Price (PKR) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    name="price"
                                    required
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Available Stock</Label>
                                <Input
                                    name="stock"
                                    required
                                    type="number"
                                    value={formData.stock || '0'}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Stock Alert</Label>
                                <Input
                                    name="minimumStock"
                                    type="number"
                                    value={formData.minimumStock || '0'}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expiry Date</Label>
                                <Input
                                    name="expiryDate"
                                    type="date"
                                    value={formData.expiryDate || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Batch Number</Label>
                                <Input
                                    name="batchNumber"
                                    value={formData.batchNumber || ''}
                                    onChange={handleChange}
                                    className="bg-secondary/30 border-border rounded-2xl h-14 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Batch reference..."
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Description / Notes
                            </Label>
                            <textarea
                                name="description"
                                className="w-full bg-secondary/30 border-border rounded-2xl p-6 font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] focus:outline-none"
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Additional details or storage instructions..."
                            />
                        </div>

                        <div className="pt-6 border-t border-border flex flex-col md:flex-row gap-4">
                            {!isSaved ? (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-primary text-white font-black rounded-2xl h-16 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Save className="mr-2 h-6 w-6" />}
                                        {isEditing ? 'UPDATE REAGENT' : 'SAVE NEW REAGENT'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="md:w-48 bg-secondary/50 border-border font-bold rounded-2xl h-16 text-lg"
                                    >
                                        CANCEL
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        onClick={handleDownloadInvoice}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl h-16 text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 animate-in zoom-in-95 duration-300"
                                    >
                                        <FileDown className="h-6 w-6" />
                                        DOWNLOAD INVOICE
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push(`/${companySlug}/admin/reagents`)}
                                        className="md:w-48 border-emerald-500 text-emerald-600 font-bold rounded-2xl h-16 text-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        DONE
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
