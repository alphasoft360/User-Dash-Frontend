'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function Login({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || undefined;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();
        setIsLoading(true);
        try {
            const response = await api.post('/login', {
                email,
                password,
                remember_me: rememberMe
            });
            login(response.data.token, redirectTo);
            toast.success("Welcome back!", {
                description: "Logging you in safely...",
            });
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Invalid credentials';
            toast.error("Authentication failed", {
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

            <Card className="w-full max-w-md border-border bg-card shadow-2xl shadow-primary/5 relative z-10">
                <CardHeader className="space-y-1 pb-8 text-center border-b border-border/50 mb-6">
                    <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                        Sign In
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 text-base">
                        Access your administrative dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    className="pl-11"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-11"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="remember_me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label
                                        htmlFor="remember_me"
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <Link
                                    href={`/${companySlug}/forgot-password`}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            className="w-full h-12 text-base rounded-2xl group"
                            isLoading={isLoading}
                            type="submit"
                        >
                            Sign In
                            {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                        </Button>
                        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href={`/${companySlug}/register`} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                Register now
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
