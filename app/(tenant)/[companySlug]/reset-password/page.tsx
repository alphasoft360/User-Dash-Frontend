'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
    const params = useParams();
    const companySlug = params.companySlug as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error("Invalid Request", {
                description: "Missing password reset token.",
            });
            router.push(`/${companySlug}/login`);
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Validation Error", {
                description: "Passwords do not match.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/reset-password', { token, password });
            toast.success("Password Updated", {
                description: "Your password has been reset successfully.",
            });
            router.push(`/${companySlug}/login`);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid or expired token';
            toast.error("Reset Failed", {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="password"
                            placeholder="New Password"
                            className="pl-11"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="relative">
                        <ShieldCheck className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            className="pl-11"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full h-12 text-base rounded-2xl group"
                    isLoading={isLoading}
                    type="submit"
                >
                    Reset Password
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
            </CardFooter>
        </form>
    );
}

export default function ResetPassword({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
            <Card className="w-full max-w-md border-gray-800/50 bg-gray-900/40 backdrop-blur-2xl">
                <CardHeader className="space-y-1 pb-8 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Set New Password
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 text-base">
                        Choose a strong password for your account
                    </CardDescription>
                </CardHeader>
                <Suspense fallback={<CardContent className="text-center py-10 text-gray-400 dark:text-gray-500">Loading...</CardContent>}>
                    <ResetPasswordForm />
                </Suspense>
            </Card>
        </div>
    );
}
