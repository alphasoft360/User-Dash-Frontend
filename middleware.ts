import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    const knownSlugs = ['unique-healthcare-solutions', 'acme', 'tesla', 'demo'];

    if (
        pathname === '/' ||
        knownSlugs.includes(firstSegment)
    ) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
