import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl;

  if (nextUrl.pathname.startsWith('/uploads/')) {
    return NextResponse.next();
  }

  if (nextUrl.href.indexOf('/auth/logout') > -1) {
    return NextResponse.redirect(new URL('/', nextUrl.href));
  }

  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(
      new URL(
        !!process.env.IS_GENERAL ? '/launches' : `/analytics`,
        nextUrl.href
      )
    );
  }

  const next = NextResponse.next();

  if (
    nextUrl.pathname === '/marketplace/seller' ||
    nextUrl.pathname === '/marketplace/buyer'
  ) {
    const type = nextUrl.pathname.split('/marketplace/')[1].split('/')[0];
    next.cookies.set('marketplace', type === 'seller' ? 'seller' : 'buyer', {
      path: '/',
      sameSite: false,
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  return next;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
};
