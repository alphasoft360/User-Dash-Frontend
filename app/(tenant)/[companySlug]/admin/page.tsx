'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminIndexPage() {
    const router = useRouter();
    const params = useParams();
    const companySlug = params.companySlug as string;

    useEffect(() => {
        router.replace(`/${companySlug}/admin/dashboard-lab`);
    }, [router, companySlug]);

    return (
        <div className="flex min-h-[50vh] items-center justify-center font-black uppercase text-[10px] tracking-widest italic opacity-50">
            Redirecting to dashboard...
        </div>
    );
}
