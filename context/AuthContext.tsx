'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface User {
    email: string;
    roles: string[];
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, redirectTo?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

interface JWTPayload {
    email?: string;
    username?: string;
    name?: string;
    roles?: string[];
    exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const getCompanySlug = useCallback(() => {
        const segments = pathname.split('/').filter(Boolean);
        const knownSlugs = ['unique-healthcare-solutions', 'acme', 'tesla', 'demo'];
        return knownSlugs.find(slug => segments.includes(slug));
    }, [pathname]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        const slug = getCompanySlug();
        router.push(slug ? `/${slug}/login` : '/login');
    }, [router, getCompanySlug]);

    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    // Quick check if it looks like a JWT (3 parts separated by dots)
                    if (storedToken.split('.').length !== 3) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                    const decoded = jwtDecode<JWTPayload>(storedToken);
                    // Check if token is expired
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setToken(storedToken);
                        setUser({
                            email: decoded.email || decoded.username || '',
                            name: decoded.name || decoded.username || decoded.email || 'User',
                            roles: decoded.roles || [],
                        });
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        const timeout = setTimeout(checkToken, 0);
        return () => clearTimeout(timeout);
    }, [logout]);

    const login = useCallback((newToken: string, redirectTo?: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        const decoded = jwtDecode<JWTPayload>(newToken);
        setUser({
            email: decoded.email || decoded.username || '',
            name: decoded.name || decoded.username || decoded.email || 'User',
            roles: decoded.roles || [],
        });

        if (redirectTo) {
            router.push(redirectTo);
        } else {
            const roles = decoded.roles || [];
            const companySlug = getCompanySlug();
            
            if (companySlug) {
                // If logging in from a company-specific page
                if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) {
                    router.push(`/${companySlug}/admin/dashboard`);
                } else {
                    router.push(`/${companySlug}`);
                }
            } else {
                // If logging in from the root /login page
                if (roles.includes('ROLE_SUPER_ADMIN')) {
                    router.push('/super-admin');
                } else if (roles.includes('ROLE_ADMIN')) {
                    // If an admin logins at root, we don't have a company context in URL
                    // Fallback to a default or show error, but here we'll try to redirect 
                    // to a default if they are ROLE_ADMIN
                    router.push('/unique-healthcare-solutions/admin/dashboard');
                } else {
                    router.push('/');
                }
            }
        }
    }, [router, getCompanySlug]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
