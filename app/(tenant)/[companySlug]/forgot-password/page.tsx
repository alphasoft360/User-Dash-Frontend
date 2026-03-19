'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Lock, Fingerprint } from 'lucide-react';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD';

export default function ForgotPassword({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = use(params);
    const router = useRouter();
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/forgot-password', { email });
            toast.success("Code Sent", {
                description: "Check your email for the 6-digit code.",
            });
            setStep('OTP');
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message?: string }>;
            if (axiosError.response?.status === 404) {
                toast.error("Account Not Found", {
                    description: "No account exists for this email. Redirecting to register...",
                });
                setTimeout(() => {
                    router.push(`/${companySlug}/register`);
                }, 2500);
            } else {
                toast.error("Request Failed", {
                    description: axiosError.response?.data?.message || 'Something went wrong',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/verify-code', { email, code });
            toast.success("Code Verified", {
                description: "Now set your new password.",
            });
            setStep('PASSWORD');
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message || 'The code you entered is invalid or expired.';
            toast.error("Invalid Code", {
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Validation Error", {
                description: "Passwords do not match.",
            });
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/reset-password', { email, code, password });
            toast.success("Success!", {
                description: "Your password has been reset successfully.",
            });
            window.location.href = `/${companySlug}/login`;
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const message = axiosError.response?.data?.message || 'Something went wrong';
            toast.error("Reset Failed", {
                description: message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
            <Card className="w-full max-w-md border-gray-800/50 bg-gray-900/40 backdrop-blur-2xl">
                <CardHeader className="space-y-1 pb-8 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {step === 'EMAIL' && "Reset Password"}
                        {step === 'OTP' && "Verify Code"}
                        {step === 'PASSWORD' && "New Password"}
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 text-base">
                        {step === 'EMAIL' && "Enter your email to receive a 6-digit code"}
                        {step === 'OTP' && `We sent a code to ${email}`}
                        {step === 'PASSWORD' && "Choose a strong password for your account"}
                    </CardDescription>
                </CardHeader>

                {step === 'EMAIL' && (
                    <form onSubmit={handleRequestCode}>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-12 text-base rounded-2xl group" isLoading={isLoading} type="submit">
                                Send Code
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </Button>
                            <Link href={`/${companySlug}/login`} className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-400 transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                            </Link>
                        </CardFooter>
                    </form>
                )}

                {step === 'OTP' && (
                    <form onSubmit={handleVerifyCode}>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Fingerprint className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="6-digit Code"
                                    className="pl-11 tracking-widest text-center text-xl font-bold font-mono"
                                    required
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full h-12 text-base rounded-2xl group" isLoading={isLoading} type="submit">
                                Verify Code
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep('EMAIL')}
                                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-400 transition-colors"
                            >
                                Change Email
                            </button>
                        </CardFooter>
                    </form>
                )}

                {step === 'PASSWORD' && (
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full h-12 text-base rounded-2xl group" isLoading={isLoading} type="submit">
                                Update Password
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
