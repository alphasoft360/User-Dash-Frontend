'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Edit3,
    Eye,
    MoreVertical,
    PackageSearch
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
    createdAt: string;
    images: string[];
}

export default function MyAdsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ads, setAds] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchAds = async () => {
        try {
            const response = await api.get('/products/my-ads');
            setAds(response.data);
        } catch (err: unknown) {
            console.error('Failed to fetch ads', err);
            toast.error("Failed to load ads");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchAds();
    }, [isAuthenticated]);

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">LOADING YOUR LISTINGS...</div>;

    return (
        <div className="min-h-screen bg-background py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <div>
                        <h1 className="text-5xl font-black text-foreground mb-4 tracking-tighter">
                            MY <span className="text-primary uppercase">ads</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">Manage your active listings and sales performance.</p>
                    </div>
                    <Link href="/marketplace/post-ad">
                        <Button className="h-16 px-10 bg-primary hover:opacity-90 rounded-2xl text-lg font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                            <Plus className="mr-3 h-6 w-6" /> POST NEW AD
                        </Button>
                    </Link>
                </div>

                {ads.length === 0 ? (
                    <Card className="bg-card border-border border-dashed rounded-[3rem] py-32 text-center shadow-sm relative overflow-hidden group transition-all hover:border-primary/30">
                        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-50" />
                        <div className="relative z-10">
                            <div className="bg-secondary h-32 w-32 rounded-full flex items-center justify-center mx-auto mb-8 border border-border group-hover:border-primary/30 transition-colors shadow-inner">
                                <PackageSearch className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors opacity-20 group-hover:opacity-100" />
                            </div>
                            <h2 className="text-4xl font-black text-foreground mb-4 tracking-tight uppercase">No Active Ads</h2>
                            <p className="text-muted-foreground font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed italic">It looks like you haven&apos;t posted any items yet. <br />Start selling today on our premium network!</p>
                            <Link href="/marketplace/post-ad">
                                <Button className="h-14 px-12 bg-primary hover:opacity-90 transition-all text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                                    <Plus className="mr-3 h-5 w-5" /> CREATE YOUR FIRST AD
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ads.map(ad => (
                            <Card key={ad.id} className="bg-card border-border rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all group shadow-sm">
                                <CardContent className="p-0">
                                    <div className="p-8 flex items-center gap-8">
                                        <div className="h-32 w-32 rounded-3xl overflow-hidden border border-border shrink-0 relative bg-secondary">
                                            <Image
                                                src={ad.images[0] || 'https://images.unsplash.com/photo-1526733170371-33157ae37812'}
                                                alt={ad.name}
                                                fill
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <Link href={`/marketplace/${ad.slug}`}>
                                                    <Eye className="h-8 w-8 text-primary" />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-foreground truncate pr-4 group-hover:text-primary transition-colors">{ad.name}</h3>
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black tracking-widest">ACTIVE</Badge>
                                            </div>
                                            <p className="text-3xl font-black text-foreground tracking-tighter">${parseFloat(ad.price).toLocaleString()}</p>
                                            <div className="flex items-center text-muted-foreground font-medium text-xs gap-4">
                                                <span>Stock: <span className="text-foreground font-black">{ad.stock}</span></span>
                                                <span className="h-1 w-1 rounded-full bg-border" />
                                                <span>Posted: <span className="text-foreground font-black">{new Date(ad.createdAt).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/30 border-t border-border p-4 flex justify-between px-8">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-background rounded-xl font-black uppercase text-[10px] tracking-widest">
                                                <Edit3 className="mr-2 h-4 w-4 text-primary" /> Edit
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 hover:bg-background rounded-xl font-black uppercase text-[10px] tracking-widest">
                                                <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
