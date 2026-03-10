'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Phone, Building, MapPin, Loader2, Save, ChevronLeft } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone: string;
    labName?: string;
    city?: string;
    address?: string;
}

interface CustomerFormProps {
    initialData?: Partial<Customer>;
    isEditing?: boolean;
}

export default function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        labName: initialData?.labName || '',
        city: initialData?.city || '',
        address: initialData?.address || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing && initialData?.id) {
                await api.put(`/admin/labs/customers/${initialData.id}`, formData);
                toast.success("Customer record updated successfully");
            } else {
                await api.post('/admin/labs/customers', formData);
                toast.success("New customer registered successfully");
            }
            router.push('/admin/customers-lab');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Failed to save customer record";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="rounded-full h-12 w-12 hover:bg-secondary/50"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">
                        {isEditing ? 'MODIFY' : 'REGISTER'} <span className="text-primary not-italic text-2xl">Customer Record</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                        {isEditing ? 'Update existing client profile details.' : 'Create a new profile for lab or pharmacy client.'}
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] shadow-xl overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="p-8 border-b border-border bg-secondary/5">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <User className="h-6 w-6 text-primary" />
                        CLIENT IDENTITY & INFORMATION
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name / Primary Contact</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="John Doe"
                                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="+1 234 567 890"
                                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Laboratory / Clinic (Optional)</Label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        value={formData.labName}
                                        onChange={(e) => setFormData({...formData, labName: e.target.value})}
                                        placeholder="City Hospital / Green Lab"
                                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City / Region</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        placeholder="New York, NY"
                                        className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Shipping / Billing Address</Label>
                                <textarea 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder="Enter complete address details here..."
                                    className="w-full bg-secondary/30 border-border rounded-2xl p-5 font-bold focus:ring-primary/20 min-h-[120px] transition-all resize-none border focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button 
                                variant="ghost" 
                                type="button" 
                                onClick={() => router.back()}
                                className="rounded-2xl font-black h-14 px-10 border border-border"
                            >
                                CANCEL
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 bg-primary text-primary-foreground font-black rounded-2xl h-14 px-12 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        {isEditing ? 'UPDATE CUSTOMER RECORD' : 'SAVE NEW CUSTOMER'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
