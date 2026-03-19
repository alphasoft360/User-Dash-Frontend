'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Package, DollarSign, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

export default function PostAdPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '1',
        unit: '',
        category_id: '',
        images: [''],
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (val: string) => {
        setFormData({ ...formData, category_id: val });
    };

    const handleImageUrlChange = (index: number, val: string) => {
        const newImages = [...formData.images];
        newImages[index] = val;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const removeImageField = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanImages = formData.images.filter(img => img.trim() !== '');
            await api.post('/products', {
                ...formData,
                images: cleanImages,
                price: parseFloat(formData.price).toString(),
                stock: parseInt(formData.stock),
                category_id: parseInt(formData.category_id),
                unit: formData.unit.trim(),
            });
            toast.success("Ad Published!", { description: "Your product is now live on the marketplace." });
            router.push('/marketplace');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong.";
            toast.error("Submission Failed", { description: message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">AUTHENTICATING...</div>;

    return (
        <div className="py-12 px-4 max-w-4xl mx-auto">
            <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary font-bold px-4 py-1">SELLER PORTAL</Badge>
                <h1 className="text-5xl font-black text-foreground mb-4 tracking-tight flex items-center justify-center">
                    <Sparkles className="mr-4 h-10 w-10 text-primary animate-pulse" />
                    POST YOUR <span className="text-primary">AD</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg">Reach thousands of tech enthusiasts with your premium products.</p>
            </div>

            <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="bg-linear-to-b from-secondary/30 to-transparent p-10 border-b border-border">
                    <CardTitle className="text-2xl font-bold flex items-center text-foreground">
                        <Package className="mr-3 h-7 w-7 text-primary" />
                        Product Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Product Name */}
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Product Title</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. MacBook Pro M3 Max"
                                    className="h-14 bg-secondary/50 border-border rounded-2xl focus:ring-primary/20 px-6 font-medium"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-3">
                                <Label className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Category</Label>
                                <Select onValueChange={handleCategoryChange} required>
                                    <SelectTrigger className="h-14 bg-secondary/50 border-border rounded-2xl px-6">
                                        <SelectValue placeholder="Select a Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id.toString()} className="focus:bg-primary/10 focus:text-primary">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price */}
                            <div className="space-y-3">
                                <Label htmlFor="price" className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Price (USD)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6 font-bold text-lg text-primary"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="stock" className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Available Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    className="h-14 bg-secondary/50 border-border rounded-2xl px-6"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="unit" className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Unit (e.g. kg, gram, pcs)</Label>
                                <Input
                                    id="unit"
                                    name="unit"
                                    placeholder="Enter unit name"
                                    className="h-14 bg-secondary/50 border-border rounded-2xl px-6"
                                    value={formData.unit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <Label htmlFor="description" className="text-muted-foreground font-bold uppercase text-xs tracking-widest pl-1">Product Narrative</Label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe the item in detail, its condition, box contents, etc..."
                                className="w-full h-40 bg-secondary/50 border border-border rounded-3xl p-8 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground scrollbar-hide"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-6 pt-4 border-t border-border">
                            <div className="flex justify-between items-center px-1">
                                <Label className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Image URLs</Label>
                                <Button type="button" variant="ghost" className="text-primary hover:text-primary/80 text-xs font-bold" onClick={addImageField}>
                                    <Plus className="mr-2 h-4 w-4" /> ADD IMAGE
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="relative flex-1">
                                            <Camera className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <Input
                                                placeholder="https://example.com/image.jpg"
                                                className="h-14 bg-secondary/50 border-border rounded-2xl pl-14 pr-6"
                                                value={img}
                                                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                            />
                                        </div>
                                        {formData.images.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-14 w-14 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                                onClick={() => removeImageField(idx)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full h-16 bg-primary hover:opacity-90 text-primary-foreground font-black text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                ) : (
                                    <Plus className="mr-3 h-6 w-6" />
                                )}
                                PUBLISH AD
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

