'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import CustomerForm from '../../CustomerForm';
import { Loader2 } from 'lucide-react';

export default function EditCustomerPage() {
    const params = useParams();
    const id = params.id as string;
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await api.get(`/admin/labs/customers/${id}`);
                setCustomer(response.data);
            } catch (err) {
                console.error("Failed to fetch customer", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCustomer();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="h-[60vh] flex items-center justify-center font-bold text-muted-foreground">
                Customer not found.
            </div>
        );
    }

    return (
        <div className="py-6">
            <CustomerForm initialData={customer} isEditing={true} />
        </div>
    );
}
