'use client';

import React, { useState, use } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Register({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();

        // Basic domain validation
        const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
        const emailDomain = formData.email.split('@')[1];
        if (!allowedDomains.includes(emailDomain)) {
            toast.error("Invalid email domain", {
                description: "Only Gmail, Outlook, and Yahoo emails are allowed."
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/register', formData);
            toast.success("Account created successfully!", {
                description: "Redirecting you to login page...",
            });
            setTimeout(() => router.push(`/${companySlug}/login`), 2000);
        } catch (err: unknown) {
            let errorMessage = 'Registration failed';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as any;
                errorMessage = axiosError.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            toast.error("Registration failed", {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <Card className="w-full max-w-md border-border bg-card shadow-2xl shadow-primary/5 relative z-10">
                <CardHeader className="space-y-1 pb-8 text-center border-b border-border/50 mb-6">
                    <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                        Create an account
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                        Join the premium admin experience
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    name="name"
                                    placeholder="Full Name"
                                    className="pl-11"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className="pl-11"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                                Accepted: gmail.com, outlook.com, yahoo.com
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="pl-11 pr-11"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <CheckCircle2 className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="pl-11 pr-11"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-3 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            className="w-full h-12 text-base rounded-2xl"
                            isLoading={isLoading}
                            type="submit"
                        >
                            Register Now
                        </Button>
                        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                            Already have an account?{' '}
                            <Link href={`/${companySlug}/login`} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
