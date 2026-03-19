'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Download,
    CheckCircle2,
    ShoppingBag,
    FileText,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface OrderItem {
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    total: number;
    address: string;
    phone: string;
    items: OrderItem[];
}

export default function OrderSummaryPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const companySlug = params.companySlug as string;
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [logoPath, setLogoPath] = useState('/images/logo.png');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/${companySlug}/login`);
        }
    }, [authLoading, isAuthenticated, router, companySlug]);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const companyResponse = await api.get(`/public/company/${companySlug}`);
                const settings = companyResponse.data.settings || {};
                
                if (settings.logo) {
                    setLogoPath(`/tenants/${companySlug}/images/${settings.logo}`);
                }
            } catch (error) {
                console.error('Failed to fetch company data', error);
            }
        };
        fetchCompanyData();
    }, [companySlug]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${params.id}`);
                setOrder(response.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };
        if (isAuthenticated && params.id) fetchOrder();
    }, [isAuthenticated, params.id]);

    const handleDownloadInvoice = async () => {
        try {
            if (!order) return;
            const response = await api.get(`/invoice/download?orderId=${params.id}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error('Failed to download invoice', err);
            toast.error("Download failed");
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">ORDER SECURED...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-black">ORDER NOT FOUND</div>;

    const subtotal = order.total;
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 animate-in fade-in duration-700">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-center">
                    <img src={logoPath} alt="Logo" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-primary/20" />
                </div>

                <div className="text-center space-y-4">
                    <div className="h-24 w-24 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in zoom-in duration-500" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter">ORDER <span className="text-primary uppercase">Confirmed</span></h1>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto uppercase text-[10px] tracking-widest leading-loose">Thank you for your purchase. Your order <span className="text-foreground font-black">#INV-{order.id}</span> has been successfully placed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-primary/20">
                        <CardHeader className="p-10 border-b border-border bg-secondary/30">
                            <CardTitle className="flex items-center text-xl font-black italic tracking-tight">
                                <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                                ORDER DETAILS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                            <div className="space-y-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <div className="min-w-0">
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{item.productName}</p>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Quantity: {item.quantity}</p>
                                        </div>
                                        <span className="font-black text-foreground text-sm shrink-0">${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-border space-y-4">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="text-foreground font-bold">${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-emerald-500 font-bold">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                                </div>
                                <div className="pt-6 flex justify-between items-end">
                                    <span className="font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground">Total Paid</span>
                                    <span className="text-4xl font-black text-foreground tracking-tighter">${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-4 border-t-emerald-500/20">
                            <CardHeader className="p-10 border-b border-border bg-secondary/30">
                                <CardTitle className="flex items-center text-xl font-black italic tracking-tight">
                                    <FileText className="mr-3 h-5 w-5 text-emerald-500" />
                                    INVOICE ACTION
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Delivering To</label>
                                        <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
                                            <p className="font-bold text-foreground mb-1">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase">{order.address}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Contact Phone</label>
                                        <p className="font-bold text-foreground px-1">{order.phone}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleDownloadInvoice}
                                    className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] group"
                                >
                                    <Download className="mr-3 h-5 w-5 group-hover:translate-y-0.5 transition-transform" /> DOWNLOAD PDF INVOICE
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Link href={`/${companySlug}/marketplace`} className="w-full">
                                <Button variant="ghost" className="w-full h-14 bg-secondary/50 hover:bg-secondary text-foreground rounded-2xl font-black uppercase text-xs tracking-widest border border-border group">
                                    Continue Shopping <ExternalLink className="ml-3 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
