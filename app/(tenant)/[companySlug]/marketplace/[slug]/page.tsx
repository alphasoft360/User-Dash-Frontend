'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Heart,
    ShieldCheck,
    Truck,
    Star,
    Minus,
    Plus,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    stock: number;
    isRecommended: boolean;
    isActive: boolean;
    category: { name: string };
    seller: { name: string };
    images: string[];
    isOutOfStock: boolean;
    unit?: string;
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [inCartQuantity, setInCartQuantity] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    const { fetchCartCount } = useCart();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, cartRes] = await Promise.all([
                    api.get(`/products/${slug}`),
                    api.get('/cart').catch(() => ({ data: [] }))
                ]);

                const productData = productRes.data;
                setProduct(productData);

                const cartItems = cartRes.data;
                const existingItem = cartItems.find((item: { productId: number; isSavedForLater: boolean; quantity: number }) => item.productId === productData.id && !item.isSavedForLater);
                setInCartQuantity(existingItem ? existingItem.quantity : 0);
            } catch (err: unknown) {
                console.error('Failed to fetch data', err);
                toast.error("Product not found");
                router.push('/marketplace');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, router]);

    const handleAddToCart = async (isSavedForLater = false) => {
        setAddingToCart(true);
        try {
            await api.post('/cart', {
                product_id: product?.id,
                quantity,
                is_saved_for_later: isSavedForLater
            });
            toast.success(isSavedForLater ? "Saved for later" : "Added to cart", {
                description: `${product?.name} has been updated in your cart.`
            });
            if (!isSavedForLater) {
                setInCartQuantity(prev => prev + quantity);
                setQuantity(1);
            }
            fetchCartCount();
        } catch (err) {
            const error = err as any;
            console.error(error);
            if (error.response?.status === 401) {
                toast.error("Authentication required", { description: "Please login to manage your cart." });
                router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
            } else {
                toast.error("Action failed", {
                    description: error.response?.data?.message || "An unexpected error occurred."
                });
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">LOADING PRODUCT...</div>;
    if (!product) return null;

    const nextImage = () => setActiveImage((prev) => (prev + 1) % (product.images.length || 1));
    const prevImage = () => setActiveImage((prev) => (prev - 1 + (product.images.length || 1)) % (product.images.length || 1));

    const defaultImage = 'https://images.unsplash.com/photo-1526733170371-33157ae37812?q=80&w=1200&auto=format&fit=crop';

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <Button
                variant="ghost"
                className="mb-8 text-muted-foreground hover:text-foreground rounded-xl"
                onClick={() => router.back()}
            >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Marketplace
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Image Gallery / Carousel */}
                <div className="space-y-6">
                    <Card className="relative aspect-square overflow-hidden bg-card border-border rounded-[3rem] group shadow-sm">
                        <Image
                            src={getImageUrl(product.images[activeImage])}
                            alt={product.name}
                            fill
                            className="w-full h-full object-cover"
                        />
                        {product.images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-foreground border border-border/50"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-foreground border border-border/50"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}
                        <Badge className="absolute top-8 left-8 bg-background/80 backdrop-blur-md text-primary border-primary/20 px-4 py-2 text-sm font-black uppercase tracking-wider">
                            {product.category.name}
                        </Badge>
                        {product.isOutOfStock && (
                            <Badge className="absolute top-8 right-8 bg-red-500 text-white font-black border-none px-6 py-3 text-lg shadow-2xl">
                                OUT OF STOCK
                            </Badge>
                        )}
                    </Card>

                    {/* Thumbnails */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`h-24 w-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all relative ${activeImage === idx ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-muted-foreground/30'}`}
                            >
                                <Image src={getImageUrl(img)} alt={`${product.name} thumbnail ${idx + 1}`} fill className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center space-x-2 text-amber-500">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-amber-500" />)}
                            <span className="text-muted-foreground font-medium text-sm ml-2">(48 Reviews)</span>
                        </div>
                        <h1 className="text-5xl font-black text-foreground leading-tight tracking-tighter">{product.name}</h1>
                        <p className="text-muted-foreground font-medium leading-relaxed text-lg">{product.description}</p>
                    </div>

                    <div className="mb-10 p-10 rounded-4xl bg-card border border-border shadow-sm">
                        <div className="flex items-end flex-wrap gap-4 mb-8">
                            <span className="text-5xl font-black text-foreground">${parseFloat(product.price).toLocaleString()}</span>
                            {product.unit && (
                                <Badge variant="secondary" className="mb-1 bg-secondary border-border text-muted-foreground font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">
                                    PER {product.unit}
                                </Badge>
                            )}
                            <span className="text-muted-foreground text-xl font-bold line-through mb-1 opacity-50">${(parseFloat(product.price) * 1.2).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center space-x-6 mb-10">
                            <div className="flex items-center bg-secondary/50 border border-border rounded-2xl p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={product.isOutOfStock}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className={`w-12 text-center font-black text-foreground ${product.isOutOfStock ? 'opacity-30' : ''}`}>{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    onClick={() => setQuantity(q => Math.min(product.stock - inCartQuantity, q + 1))}
                                    disabled={product.isOutOfStock || quantity >= (product.stock - inCartQuantity)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className={`font-bold text-sm uppercase tracking-widest ${product.isOutOfStock || (product.stock - inCartQuantity) <= 0 ? 'text-red-500 font-black italic' : 'text-muted-foreground'}`}>
                                {product.isOutOfStock ? 'Currently Unavailable' :
                                    (product.stock - inCartQuantity) <= 0 ? 'All units in your cart' :
                                        `${product.stock - inCartQuantity} left in stock`}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                className="h-16 bg-primary hover:opacity-90 rounded-2xl text-lg font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 disabled:shadow-none"
                                onClick={() => handleAddToCart(false)}
                                disabled={addingToCart || product.isOutOfStock}
                            >
                                {addingToCart ? <Loader2 className="animate-spin mr-2" /> : (product.isOutOfStock ? <Plus className="mr-3 rotate-45" /> : <ShoppingCart className="mr-3" />)}
                                {product.isOutOfStock ? "STRICTLY OUT OF STOCK" : "ADD TO CART"}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-16 border-border bg-transparent hover:bg-secondary text-foreground rounded-2xl font-black transition-all active:scale-95"
                                onClick={() => handleAddToCart(true)}
                            >
                                <Heart className="mr-3 text-red-500" />
                                SAVE FOR LATER
                            </Button>
                        </div>
                    </div>

                    {/* Features/Trust */}
                    <div className="grid grid-cols-2 gap-6 pt-10 border-t border-border mt-auto">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Truck className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Free Express</h4>
                                <p className="text-muted-foreground text-xs font-medium">Orders over $500</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <ShieldCheck className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">2 Year Warranty</h4>
                                <p className="text-muted-foreground text-xs font-medium">Official coverage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
