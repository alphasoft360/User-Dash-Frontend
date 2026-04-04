'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    isRecommended: boolean;
    isActive: boolean;
    category: { name: string };
    images: string[];
    isOutOfStock: boolean;
    unit?: string;
}

function ProductGrid() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (search) params.search = search;
                if (category) params.category = category;

                const response = await api.get('/products', { params });
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, category]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl bg-gray-50 dark:bg-gray-900" />
                        <Skeleton className="h-4 w-2/3 bg-gray-50 dark:bg-gray-900" />
                        <Skeleton className="h-4 w-1/3 bg-gray-50 dark:bg-gray-900" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 space-y-6 md:space-y-0 md:space-x-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-2">
                        {search ? `Search results for "${search}"` : category ? `${category} Collection` : 'Explore All Products'}
                    </h1>
                    <p className="text-muted-foreground font-medium">{products.length} premium items found</p>
                </div>
                {/* <div className="flex items-center space-x-3 bg-secondary/50 p-1.5 rounded-2xl border border-border backdrop-blur-sm">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-primary bg-primary/10 rounded-xl">
                        <Grid className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-xl">
                        <ListIcon className="h-5 w-5" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-xl flex items-center font-bold">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div> */}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-muted-foreground mb-2">No products found</h3>
                        <p className="text-muted-foreground/80">Try adjusting your search or filters.</p>
                    </div>
                )}
                {products.map((product) => (
                    <Link key={product.id} href={`/marketplace/${product.slug}`}>
                        <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden h-full flex flex-col rounded-3xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/5">
                            <CardContent className="p-0 flex-1 flex flex-col">
                                {/* Image Container */}
                                <div className="relative aspect-square overflow-hidden bg-secondary/50">
                                    <Image
                                        src={getImageUrl(product.images[0])}
                                        alt={product.name}
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    {product.isRecommended && (
                                        <Badge className="absolute top-4 left-4 bg-linear-to-r from-amber-400 to-orange-500 text-white font-black border-none px-3 py-1 shadow-xl">
                                            FEATURED
                                        </Badge>
                                    )}
                                    {product.isOutOfStock && (
                                        <Badge className="absolute top-4 right-4 bg-red-500 text-white font-black border-none px-3 py-1 shadow-xl">
                                            OUT OF STOCK
                                        </Badge>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <Button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground rounded-xl backdrop-blur-md border border-primary/20 font-bold">
                                            Quick View
                                        </Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-primary tracking-widest uppercase">{product.category.name}</p>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                        </div>
                                        <div className="flex items-center text-amber-500 text-xs font-bold">
                                            <Star className="h-3 w-3 fill-amber-500 mr-1" />
                                            4.9
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 flex-1 font-medium">{product.description}</p>
                                    <div className={`pt-4 flex justify-between items-center border-t border-border mt-auto ${product.isOutOfStock ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex flex-row items-center flex-wrap space-x-2">
                                            <span className="text-2xl font-black text-foreground">${parseFloat(product.price).toLocaleString()}</span>
                                            {product.unit && (
                                                <Badge variant="outline" className="text-[9px] font-black px-2 py-0.5 rounded-lg border-border text-muted-foreground bg-secondary/30 uppercase tracking-tighter">
                                                    {product.unit}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all font-black text-foreground">
                                            {product.isOutOfStock ? '!' : <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function MarketplacePage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    return (
        <Suspense fallback={<div className="min-h-screen p-8 text-center text-cyan-400">CONNECTING...</div>}>
            <ProductGrid />
        </Suspense>
    );
}
