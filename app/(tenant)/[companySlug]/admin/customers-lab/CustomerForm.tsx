'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    remainingBalance?: number;
}

interface CustomerFormProps {
    initialData?: Partial<Customer>;
    isEditing?: boolean;
}

export default function CustomerForm({ initialData, isEditing = false }: CustomerFormProps) {
    const router = useRouter();
    const params = useParams();
    const companySlug = params.companySlug as string;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        labName: initialData?.labName || '',
        city: initialData?.city || '',
        address: initialData?.address || '',
        remainingBalance: initialData?.remainingBalance || 0,
    });
    const [paymentAmount, setPaymentAmount] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const currentBalance = formData.remainingBalance || 0;
        const pAmount = Math.round(parseFloat(paymentAmount) || 0);

        if (isEditing && pAmount > currentBalance) {
            toast.error(`Payment exceeds pending balance. Maximum allowed: PKR ${currentBalance}`);
            setLoading(false);
            return;
        }

        const finalBalance = isEditing 
            ? currentBalance - pAmount
            : Math.round(formData.remainingBalance || 0);

        const submissionData = {
            ...formData,
            remainingBalance: finalBalance
        };

        try {
            if (isEditing && initialData?.id) {
                await api.put(`/admin/labs/customers/${initialData.id}`, submissionData);
                toast.success("Customer record updated successfully");
            } else {
                await api.post('/admin/labs/customers', submissionData);
                toast.success("New customer registered successfully");
            }
            router.push(`/${companySlug}/admin/customers-lab`);
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

                            {isEditing && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Current Pending Amount (PKR)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">PKR</span>
                                        <Input 
                                            type="number"
                                            readOnly
                                            value={formData.remainingBalance === undefined ? '' : formData.remainingBalance}
                                            className="pl-12 bg-secondary/30 border-border h-14 rounded-2xl font-bold opacity-70 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            )}

                            {isEditing && (
                                <>
                                    <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Payment Received Now (Subtracts from Balance)</Label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary group-focus-within:scale-110 transition-transform">- PKR</span>
                                            <Input 
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="Enter payment amount..."
                                                className="pl-16 bg-primary/5 border-primary/20 h-14 rounded-2xl font-black text-primary focus:ring-primary/40 placeholder:text-primary/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 p-6 bg-secondary/20 rounded-[2rem] border border-dashed border-border flex items-center justify-between animate-in zoom-in-95 duration-500">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Resulting Balance Preview</p>
                                            <p className="text-2xl font-black italic tracking-tighter mt-1">
                                                PKR {Math.round(formData.remainingBalance || 0).toLocaleString()} 
                                                <span className="text-primary mx-3">→</span> 
                                                <span className={((formData.remainingBalance || 0) - (Math.round(parseFloat(paymentAmount) || 0))) > 0 ? 'text-red-500' : 'text-emerald-500'}>
                                                    PKR {Math.round((formData.remainingBalance || 0) - (Math.round(parseFloat(paymentAmount) || 0))).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${((formData.remainingBalance || 0) - (parseFloat(paymentAmount) || 0)) <= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                            <Save className="h-6 w-6" />
                                        </div>
                                    </div>
                                </>
                            )}

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
