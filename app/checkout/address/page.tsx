'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, User, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AddressPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        phone: '',
        name: user?.name || ''
    });

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Name Validation: At least 2 chars, not just numbers
        if (!formData.name || formData.name.length < 2) {
            toast.error("Please enter a valid full name");
            return;
        }
        if (/^\d+$/.test(formData.name)) {
            toast.error("Name cannot be only numbers");
            return;
        }

        // 2. Address Validation: Not just numbers, min 5 chars
        if (!formData.address || formData.address.length < 5) {
            toast.error("Please enter a more detailed address");
            return;
        }
        if (/^\d+$/.test(formData.address)) {
            toast.error("Address cannot be only numbers");
            return;
        }

        // 3. Phone Validation: Only digits, max 11
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length === 0) {
            toast.error("Please enter a phone number");
            return;
        }
        if (phoneDigits.length > 11) {
            toast.error("Phone number cannot be more than 11 digits");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/orders', {
                address: formData.address,
                phone: formData.phone,
                name: formData.name
            });
            toast.success("Order placed successfully!");
            router.push(`/checkout/summary/${response.data.id}`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <Link href="/cart" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-bold group">
                        <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Cart
                    </Link>
                    <div className="flex items-center">
                        <img src="/images/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain shadow-lg shadow-primary/20" />
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase">Delivery <span className="text-primary">Details</span></h1>
                    <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">Provide your information to finalize the order.</p>
                </div>

                <Card className="bg-card border-border rounded-[2.5rem] shadow-xl overflow-hidden border-t-4 border-t-primary/20">
                    <CardHeader className="p-8 border-b border-border bg-secondary/30">
                        <CardTitle className="flex items-center text-xl font-bold">
                            <MapPin className="mr-3 h-5 w-5 text-primary" />
                            Shipping Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-14 pl-12 bg-secondary/50 border-border rounded-2xl font-bold focus:ring-primary/20"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Delivery Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="h-14 pl-12 bg-secondary/50 border-border rounded-2xl font-bold focus:ring-primary/20"
                                            placeholder="Enter your street address"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-14 pl-12 bg-secondary/50 border-border rounded-2xl font-bold focus:ring-primary/20"
                                            placeholder="+1 (555) 000-0000"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? "PROCESSING..." : (
                                    <>CONFIRM & PLACE ORDER <Send className="ml-3 h-5 w-5" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
