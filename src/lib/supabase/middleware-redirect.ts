import { NextResponse, type NextRequest } from "next/server";

export function middlewareRedirect(request: NextRequest, pathname: string, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  for (const cookie of sessionResponse.cookies.getAll()) {
    redirect.cookies.set(cookie.name, cookie.value);
  }
  return redirect;
}
