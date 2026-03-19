'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Building2, Mail, Phone, MapPin, LayoutGrid, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
}

export default function AddVendorPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        status: 'active',
        categoryId: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                toast.error("Failed to load categories");
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Vendor name is required");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (!formData.categoryId) {
            toast.error("Please select a category");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await api.post('/admin/vendors', {
                ...formData,
                categoryId: parseInt(formData.categoryId)
            });
            toast.success("Vendor Added!", { description: `${formData.name} has been successfully registered.` });
            router.push('/admin/vendors');
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to add vendor.";
            toast.error("Operation Failed", { description: message });
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err: string) => toast.error(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <Link href="/admin/vendors" className="flex items-center text-muted-foreground hover:text-primary transition-colors mb-4 group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to Vendors</span>
                    </Link>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center">
                        <UserPlus className="mr-4 h-10 w-10 text-primary" />
                        ADD NEW <span className="text-primary ml-2 uppercase">Vendor</span>
                    </h1>
                </div>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full tracking-widest text-[10px]">
                    ADMIN PORTAL
                </Badge>
            </div>

            <Card className="bg-card border-border rounded-[3rem] overflow-hidden shadow-2xl border-t-4 border-t-primary/20">
                <CardHeader className="bg-secondary/30 p-10 border-b border-border">
                    <CardTitle className="text-xl font-black flex items-center text-foreground tracking-tight italic uppercase">
                        <Building2 className="mr-3 h-6 w-6 text-primary" />
                        Onboarding Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Core Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-foreground">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Vendor Name <span className="text-primary">*</span></Label>
                                <div className="relative">
                                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. TechSupply Pro"
                                        className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6 font-bold focus:ring-primary/20"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Email address <span className="text-primary">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="contact@vendor.com"
                                        className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6 font-bold focus:ring-primary/20"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Contact Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="+1 (555) 000-0000"
                                        className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6 font-bold"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="companyName" className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Company Registered Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        placeholder="TechSupply Global Ltd."
                                        className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6 font-bold"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 text-foreground">
                                <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Industry Category <span className="text-primary">*</span></Label>
                                <Select
                                    onValueChange={(val) => handleSelectChange('categoryId', val)}
                                    required
                                    disabled={categoriesLoading}
                                >
                                    <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl px-6 font-bold">
                                        <div className="flex items-center">
                                            <LayoutGrid className="mr-3 h-5 w-5 text-primary" />
                                            <SelectValue placeholder={categoriesLoading ? "Loading Categories..." : "Select Category"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground rounded-2xl">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-primary/10 focus:text-primary font-bold py-3">
                                                {cat.name.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 text-foreground">
                                <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Operational Status</Label>
                                <Select
                                    onValueChange={(val) => handleSelectChange('status', val)}
                                    defaultValue="active"
                                >
                                    <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl px-6 font-bold">
                                        <div className="flex items-center">
                                            <CheckCircle2 className="mr-3 h-5 w-5 text-primary" />
                                            <SelectValue placeholder="Select Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground rounded-2xl">
                                        <SelectItem value="active" className="focus:bg-emerald-500/10 focus:text-emerald-500 font-bold py-3">ACTIVE</SelectItem>
                                        <SelectItem value="inactive" className="focus:bg-red-500/10 focus:text-red-500 font-bold py-3">INACTIVE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-3 text-foreground">
                            <Label htmlFor="address" className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] pl-1">Business Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-8 h-5 w-5 text-muted-foreground" />
                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Enter full physical address or headquarters..."
                                    className="w-full h-32 bg-secondary/50 border border-border rounded-3xl p-8 pl-16 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground font-medium scrollbar-hide"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-18 bg-primary hover:opacity-90 text-primary-foreground font-black text-xl rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                                )}
                                REGISTER VENDOR
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-6 font-bold uppercase tracking-[0.3em]">Authorized Personnel Only • Secure Data Entry</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
