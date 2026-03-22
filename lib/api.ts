import axios from 'axios';

const BACKEND_URL = 'https://unique-healthcare.duckdns.org';

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
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${BACKEND_URL}/${cleanUrl}`;
};

// Add a request interceptor to include the JWT token and company context
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

            // Reserved root paths that are NOT company slugs
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
                // If we are in a tenant-specific route, adjust baseURL to /{slug}/api/
                config.baseURL = `${BACKEND_URL}/${firstSegment}/api/`;
            } else {
                // Default baseURL
                config.baseURL = `${BACKEND_URL}/api/`;
            }
        }

        // Ensure that leading slashes in relative URLs don't bypass the baseURL's path.
        // This must be OUTSIDE the 'window' check to work during SSR passes.
        if (config.url?.startsWith('/')) {
            config.url = config.url.substring(1);
        }

        // Final safety check: if url is empty after strip, avoid trailing slash issues
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
