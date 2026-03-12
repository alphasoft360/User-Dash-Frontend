'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/marketplace?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link href="/marketplace" className="flex items-center shrink-0">
                        <img src="/images/logo.png" alt="Logo" className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-primary/20" />
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search high-end electronics..."
                            className="w-full bg-secondary/50 border-border pl-12 pr-4 h-11 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground"
                        />
                    </form>

                    {/* Nav Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative hover:bg-secondary rounded-xl transition-all">
                                <ShoppingCart className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                                    0
                                </span>
                            </Button>
                        </Link>
                        <Link href="/profile/settings">
                            <Button variant="ghost" size="icon" className="hover:bg-secondary rounded-xl transition-all">
                                <User className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                            </Button>
                        </Link>
                        <Link href="/marketplace/post-ad">
                            <Button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 rounded-xl shadow-lg shadow-primary/20 transition-all">
                                Post Ad
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
                        {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </div>

                {/* Categories Bar */}
                <div className="bg-secondary/30 border-t border-border overflow-x-auto scrollbar-hide">
                    <div className="max-w-7xl mx-auto px-4 flex items-center py-3 space-x-8 whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {['Laptops', 'Smartphones', 'Consoles', 'Headphones', 'Cameras', 'Accessories', 'Components'].map((cat) => (
                            <Link
                                key={cat}
                                href={`/marketplace?category=${cat.toLowerCase()}`}
                                className="hover:text-primary transition-colors flex items-center group"
                            >
                                {cat}
                                <ChevronRight className="h-3 w-3 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border animate-in slide-in-from-top duration-300 z-40 overflow-hidden shadow-2xl">
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl group active:scale-[0.98] transition-all">
                                    <div className="flex items-center space-x-4">
                                        <ShoppingCart className="h-6 w-6 text-primary" />
                                        <span className="font-bold">My Cart</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/profile/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl group active:scale-[0.98] transition-all">
                                    <div className="flex items-center space-x-4">
                                        <User className="h-6 w-6 text-primary" />
                                        <span className="font-bold">Account</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/marketplace/post-ad" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-2xl group active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                                    <span className="font-black italic">POST AD</span>
                                    <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="pt-6 border-t border-border flex items-center justify-between">
                                <span className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Interface Appearance</span>
                                <ThemeToggle />
                            </div>

                            <div className="pt-2">
                                <span className="block font-bold text-muted-foreground uppercase text-[10px] tracking-widest mb-4">Categories</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Laptops', 'Smartphones', 'Consoles', 'Headphones', 'Cameras', 'Accessories', 'Components'].map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/marketplace?category=${cat.toLowerCase()}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-3 bg-secondary/30 rounded-xl text-sm font-bold hover:text-primary transition-colors text-center"
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-secondary/50 border-t border-border py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/marketplace" className="flex items-center mb-6">
                            <img src="/images/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain shadow-lg shadow-primary/20" />
                        </Link>
                        <p className="text-muted-foreground max-w-sm mb-6 font-medium">The ultimate destination for premium electronics. Verified sellers, secure payments, and worldwide shipping.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm font-medium">
                            <li><Link href="/marketplace" className="hover:text-primary transition-colors">Browse Ads</Link></li>
                            <li><Link href="/marketplace/post-ad" className="hover:text-primary transition-colors">Sell Something</Link></li>
                            <li><Link href="/profile/my-ads" className="hover:text-primary transition-colors">My Ads</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-4">Support</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm font-medium">
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-muted-foreground text-xs font-semibold">
                    &copy; {new Date().getFullYear()} ELECTRO Marketplace. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
