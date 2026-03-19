import { NextRequest, NextResponse } from "next/server";

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (shouldBypass(pathname)) return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 2) {
    const [owner, repo] = segments;
    const url = request.nextUrl.clone();
    url.pathname = `/${encodeURIComponent(`${owner}/${repo}`)}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  if (segments.length === 4 && segments[2] === "status") {
    const [owner, repo, _status, deploymentId] = segments;
    const url = request.nextUrl.clone();
    url.pathname = `/${encodeURIComponent(`${owner}/${repo}`)}/status/${deploymentId}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"]
};
