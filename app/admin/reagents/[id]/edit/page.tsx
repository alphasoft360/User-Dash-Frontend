'use client';

import { useEffect, useState, use } from 'react';
import ReagentForm from '../../ReagentForm';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
    isRecommended: boolean;
    isActive: boolean;
    category: { id: number, name: string };
    companyName?: string;
    packSize?: string;
    purchasePrice?: string;
    expiryDate?: string;
    batchNumber?: string;
    minimumStock: number;
}

export default function EditReagentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [reagent, setReagent] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReagent = async () => {
            try {
                const response = await api.get(`/admin/products/${id}`);
                setReagent(response.data);
            } catch (err) {
                console.error("Failed to load reagent", err);
                toast.error("Failed to load reagent data");
            } finally {
                setLoading(false);
            }
        };
        fetchReagent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!reagent) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Reagent not found</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <ReagentForm initialData={reagent} isEditing={true} />
        </div>
    );
}
