"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Users, PlusCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Vendor {
    id: number;
    name: string;
    email: string;
    phone: string;
    companyName: string;
    status: string;
}

export default function AdminVendorsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [vendorsLoading, setVendorsLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                toast.error("Failed to load categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const fetchVendors = async () => {
                setVendorsLoading(true);
                try {
                    const response = await api.get(`/admin/vendors?category=${selectedCategory.id}`);
                    setVendors(response.data);
                } catch (err) {
                    toast.error("Failed to load vendors");
                } finally {
                    setVendorsLoading(false);
                }
            };
            fetchVendors();
        }
    }, [selectedCategory]);

    if (loading) return <div className="py-20 text-center font-black animate-pulse text-primary tracking-widest uppercase">Initializing Marketplace Ecosystem...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">VENDOR <span className="text-primary uppercase tracking-tight">Management</span></h1>
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest leading-loose">Supply Chain control: Manage your partners and inventory intake.</p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-6 rounded-3xl border transition-all flex flex-col items-center justify-center space-y-3 group ${selectedCategory?.id === cat.id ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-card border-border hover:border-primary/50'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedCategory?.id === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
                    </button>
                ))}
            </div>

            {selectedCategory ? (
                <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                    <CardHeader className="p-10 border-b border-border bg-secondary/30 flex flex-row items-center justify-between space-y-0 text-foreground">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center italic">
                            <Users className="mr-4 h-6 w-6 text-primary" />
                            {selectedCategory.name.toUpperCase()} VENDORS
                        </CardTitle>
                        <Link href="/admin/vendors/new">
                            <Button className="bg-primary hover:opacity-90 rounded-2xl h-11 font-bold px-6 text-primary-foreground">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {vendorsLoading ? (
                            <div className="p-20 text-center text-primary font-black animate-pulse uppercase tracking-[0.2em] italic">Accessing Supplier Database...</div>
                        ) : vendors.length === 0 ? (
                            <div className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest opacity-50">NO VENDORS REGISTERED FOR THIS CATEGORY</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border bg-background/50">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Supplier Details</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Company</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Status</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {vendors.map((v) => (
                                        <tr key={v.id} className="hover:bg-secondary/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{v.name}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">{v.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xs font-bold text-foreground bg-secondary/70 px-3 py-1.5 rounded-xl border border-border">{v.companyName || 'N/A'}</span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-current ${v.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="h-64 rounded-[3rem] border-4 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                    <LayoutGrid className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest italic opacity-40">Select a category above to manage component suppliers</p>
                </div>
            )}
        </div>
    );
}
