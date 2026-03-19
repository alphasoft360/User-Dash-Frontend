'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Lock, Save, Loader2, Sparkles, LogOut } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        } else if (user) {
            setFormData(prev => ({ ...prev, name: user.name || '' }));
        }
    }, [authLoading, isAuthenticated, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.put('/profile/update', {
                name: formData.name,
                password: formData.password,
            });
            toast.success("Profile updated successfully", { description: "Your changes have been saved." });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Something went wrong.";
            toast.error("Update failed", { description: message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-black uppercase tracking-widest">CONNECTING...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="py-20 px-4 max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <div className="inline-block p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6">
                        <User className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black text-foreground mb-4 tracking-tighter">
                        ACCOUNT <span className="text-primary font-black">SETTINGS</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage your identity and security preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Nav */}
                    <div className="md:col-span-1 space-y-4">
                        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm">
                            <CardContent className="p-4 space-y-2">
                                <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10 rounded-2xl font-black h-12">
                                    <User className="mr-3 h-5 w-5" /> Account Details
                                </Button>
                                <Link href="/profile/my-ads">
                                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground rounded-2xl h-12 font-bold">
                                        <Sparkles className="mr-3 h-5 w-5" /> My Listings
                                    </Button>
                                </Link>
                                <div className="pt-4 border-t border-border mt-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-500 hover:bg-red-500/10 rounded-2xl h-12 font-bold"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-3 h-5 w-5" /> Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                                <CardHeader className="p-10 border-b border-border pb-8">
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Personal Information</CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium">Update your public profile details.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="h-16 bg-secondary/50 border-border rounded-2xl pl-16 pr-6 focus:ring-primary/20 text-foreground font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">Email Address</Label>
                                        <Input
                                            disabled
                                            value={user?.email || ''}
                                            className="h-16 bg-secondary/30 border-border rounded-2xl px-6 text-muted-foreground cursor-not-allowed font-medium"
                                        />
                                        <p className="text-[10px] text-muted-foreground/60 font-medium pl-1 italic">Email cannot be changed for security purposes.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                                <CardHeader className="p-10 border-b border-border pb-8">
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Security</CardTitle>
                                    <CardDescription className="text-muted-foreground font-medium">Change your password to keep your account safe.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Leave blank to keep current"
                                                className="h-16 bg-secondary/50 border-border rounded-2xl pl-16 pr-6 focus:ring-primary/20 text-foreground font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="confirmPassword" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest pl-1">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Repeat new password"
                                                className="h-16 bg-secondary/50 border-border rounded-2xl pl-16 pr-6 focus:ring-primary/20 text-foreground font-bold"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="submit"
                                    className="h-16 bg-primary hover:opacity-90 rounded-2xl font-black text-primary-foreground px-12 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
                                    SAVE CHANGES
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
