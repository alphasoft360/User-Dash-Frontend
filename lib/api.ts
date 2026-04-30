import axios from 'axios';

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://unique-healthcare.duckdns.org'
    : 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: '/api/proxy',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Utility to get full image URL from backend relative paths
 */
export const getImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1526733170371-33157ae37812?q=80&w=600&auto=format&fit=crop';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${BACKEND_URL}/${cleanUrl}`;
};

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const pathname = window.location.pathname;
            const segments = pathname.split('/').filter(Boolean);
            const firstSegment = segments[0];

            const reserved = [
                'super-admin',
                'login',
                'register',
                'api',
                '_next',
                'static',
                'favicon.ico',
                'images',
                'pdfs',
                'tenants'
            ];

            const isGlobalUrl = config.url?.startsWith('super-admin') || config.url?.startsWith('/super-admin');

            if (firstSegment && !reserved.includes(firstSegment) && !isGlobalUrl) {
                config.baseURL = `${BACKEND_URL}/${firstSegment}/api/`;
            } else {
                config.baseURL = `${BACKEND_URL}/api/`;
            }
        }

        if (config.url?.startsWith('/')) {
            config.url = config.url.substring(1);
        }

        if (!config.url) {
            config.url = '';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
