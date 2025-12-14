import { NextRequest, NextResponse } from 'next/server';

// This function runs before every request
export function middleware(request: NextRequest) {
  // Define protected routes (admin routes)
  const protectedPaths = ['/admin', '/(admin)'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If the user is accessing a protected route
  if (isProtectedPath) {
    // Check if the user has a JWT cookie
    const token = request.cookies.get('token');

    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/(full-width-pages)/auth', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Include the admin routes that need protection
    '/(admin)/:path*',
  ],
};