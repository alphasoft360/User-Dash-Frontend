import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip internal paths and super-admin
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/super-admin') ||
        pathname.startsWith('/tenants') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/pdfs')
    ) {
        return NextResponse.next();
    }

    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    // Known company slugs (this should ideally be fetched or cached, 
    // but for now we can check if it's one of ours or default to Unique Healthcare)
    const knownSlugs = ['unique-healthcare-solutions', 'acme', 'tesla', 'demo'];

    if (knownSlugs.includes(firstSegment)) {
        return NextResponse.next();
    }

    // If no slug, redirect to default company
    const url = request.nextUrl.clone();
    url.pathname = `/unique-healthcare-solutions${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
