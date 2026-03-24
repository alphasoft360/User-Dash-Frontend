'use client';

import StockInForm from '../StockInForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NewStockEntryPage() {
    const { companySlug } = useParams();
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 uppercase italic">
                        NEW <span className="text-primary not-italic">Stock Entry</span>
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                        Add inventory volume for laboratory reagents.
                    </p>
                </div>
                <Link href={`/${companySlug}/admin/stock`}>
                    <Button variant="ghost" className="flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Manager
                    </Button>
                </Link>
            </div>

            <Card className="bg-card border-border rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="p-10 border-b border-border bg-secondary/5">
                    <CardTitle className="text-2xl font-black flex items-center gap-4 italic uppercase">
                        <PlusCircle className="h-8 w-8 text-primary" />
                        Restock Inventory
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Select a reagent and enter the newly received stock details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <StockInForm />
                </CardContent>
            </Card>
        </div>
    );
}
