import { Construction, Users } from 'lucide-react';

export default function CustomersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
            <div className="bg-primary/10 h-32 w-32 rounded-full flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                <Users className="h-16 w-16 text-primary" />
            </div>

            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-center">
                Customer <span className="text-primary">History Engine</span>
            </h1>

            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm max-w-lg text-center mb-12">
                This powerful module will eventually allow you to track, analyze, and reward your most loyal walk-in customers based on their local POS interactions.
            </p>

            <div className="flex items-center gap-3 bg-secondary/30 px-6 py-3 rounded-full border border-border">
                <Construction className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Future Update Pending</span>
            </div>
        </div>
    );
}
