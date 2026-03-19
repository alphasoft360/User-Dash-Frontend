'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import {
    Trash2,
    ArrowRight,
    ShoppingBag,
    Heart,
    CreditCard,
    Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productPrice: string;
    productImage: string;
    quantity: number;
    isSavedForLater: boolean;
}

export default function CartPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { fetchCartCount } = useCart();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setItems(response.data);
        } catch (err: unknown) {
            console.error('Failed to fetch cart', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchCart();
    }, [isAuthenticated]);

    const handleRemove = async (id: number) => {
        try {
            await api.delete(`/cart/${id}`);
            setItems(items.filter(item => item.id !== id));
            toast.success("Item removed");
            fetchCartCount();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Cleanup failed");
        }
    };

    const handleToggleSave = async (id: number) => {
        try {
            await api.patch(`/cart/${id}/toggle-save`);
            fetchCart();
            toast.success("Cart updated");
            fetchCartCount();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    const cartItems = items.filter(i => !i.isSavedForLater);
    const savedItems = items.filter(i => i.isSavedForLater);

    const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.productPrice) * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">SYNCING CART...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-black text-foreground mb-10 flex items-center tracking-tighter">
                    <ShoppingBag className="mr-4 h-10 w-10 text-primary" />
                    MY <span className="text-primary ml-2 uppercase">shopping bag</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Active Cart */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h2 className="text-xl font-bold text-foreground">Current Items ({cartItems.length})</h2>
                                {cartItems.length > 0 && <Button variant="ghost" className="text-muted-foreground hover:text-red-500 text-xs font-black">CLEAR ALL</Button>}
                            </div>

                            {cartItems.length === 0 ? (
                                <Card className="bg-card border-border border-dashed rounded-4xl py-16 text-center shadow-sm">
                                    <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-muted-foreground font-medium mb-6">Your bag is empty. Let&apos;s find something cool!</p>
                                    <Link href="/marketplace">
                                        <Button className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-10 font-black h-12">START SHOPPING</Button>
                                    </Link>
                                </Card>
                            ) : (
                                cartItems.map(item => (
                                    <Card key={item.id} className="bg-card border-border rounded-4xl overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                                        <div className="p-6 flex flex-col sm:flex-row gap-6 items-center">
                                            <div className="h-32 w-32 rounded-2xl overflow-hidden border border-border shrink-0 relative bg-secondary">
                                                <Image src={item.productImage || 'https://images.unsplash.com/photo-1526733170371-33157ae37812'} alt={item.productName} fill className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.productName}</h3>
                                                <p className="text-muted-foreground font-medium text-sm">Quantity: <span className="text-foreground font-bold">{item.quantity}</span></p>
                                                <h4 className="text-2xl font-black text-foreground">${parseFloat(item.productPrice).toLocaleString()}</h4>
                                            </div>
                                            <div className="flex flex-row sm:flex-col gap-2">
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground" onClick={() => handleRemove(item.id)}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground" onClick={() => handleToggleSave(item.id)}>
                                                    <Heart className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Saved for Later */}
                        {savedItems.length > 0 && (
                            <div className="space-y-6 pt-10 border-t border-border">
                                <h2 className="text-xl font-bold text-foreground px-4 flex items-center">
                                    <Heart className="mr-3 h-5 w-5 text-red-500 animate-pulse" /> Saved for Later
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {savedItems.map(item => (
                                        <Card key={item.id} className="bg-card border-border rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 shadow-sm">
                                            <div className="p-6 flex gap-4">
                                                <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 relative bg-secondary border border-border">
                                                    <Image src={item.productImage || 'https://images.unsplash.com/photo-1526733170371-33157ae37812'} alt={item.productName} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-muted-foreground text-sm line-clamp-1">{item.productName}</h4>
                                                    <p className="text-foreground font-black mb-3">${parseFloat(item.productPrice).toLocaleString()}</p>
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto text-primary hover:text-primary/80 text-xs font-black tracking-widest"
                                                        onClick={() => handleToggleSave(item.id)}
                                                    >
                                                        MOVE TO BAG <ArrowRight className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <Card className="bg-card border-border rounded-[2.5rem] sticky top-32 overflow-hidden shadow-xl border-t-4 border-t-primary/20">
                            <div className="p-10 space-y-8">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Summary</h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-foreground">${subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-medium">
                                        <span>Shipping</span>
                                        <span className="font-bold text-emerald-500">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                                    </div>
                                    <div className="pt-6 border-t border-border flex justify-between items-end">
                                        <span className="text-foreground font-bold text-sm uppercase tracking-widest">Total Amount</span>
                                        <span className="text-4xl font-black text-foreground tracking-tighter">${total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href="/checkout/address">
                                    <Button className="w-full h-16 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] my-5">
                                        CHECKOUT <CreditCard className="ml-3 h-6 w-6" />
                                    </Button>
                                </Link>

                                <div className="space-y-4">
                                    <div className="flex items-center text-[10px] font-black uppercase text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border">
                                        <Truck className="h-4 w-4 mr-3 text-primary" />
                                        <span>Free delivery on orders over $500</span>
                                    </div>
                                    <div className="flex items-center text-[10px] font-black uppercase text-muted-foreground bg-secondary/50 p-4 rounded-xl border border-border">
                                        <RotateCcw className="h-4 w-4 mr-3 text-purple-500" />
                                        <span>30-day effortless returns policy</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RotateCcw(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}
