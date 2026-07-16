import { NextResponse, type NextRequest } from "next/server";
import { requiresPasswordChange } from "@/lib/auth-metadata";
import { middlewareRedirect } from "@/lib/supabase/middleware-redirect";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/auth/signin", "/auth/reset-password", "/impressum", "/datenschutz"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && requiresPasswordChange(user.user_metadata)) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.user) {
      user = refreshed.user;
    }
  }

  if (!user && !PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return middlewareRedirect(request, "/login", response);
  }

  if (!user) return response;

  const portal = supabase.schema("portal");
  const { data: isAdminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = Boolean(isAdminRow);
  const { data: clientUser } = await portal.from("client_users").select("client_id").eq("user_id", user.id).maybeSingle();
  const hasClient = Boolean(clientUser?.client_id);
  const mustChangePassword = requiresPasswordChange(user.user_metadata);
  const isPasswordChangeFlow = pathname.startsWith("/auth/reset-password");

  if (mustChangePassword && !isPasswordChangeFlow && pathname !== "/auth/signout") {
    return middlewareRedirect(request, "/auth/reset-password", response);
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return middlewareRedirect(request, "/portal", response);
  }

  if (pathname.startsWith("/portal") && !isAdmin && !hasClient) {
    return middlewareRedirect(request, "/login", response);
  }

  if (
    !isAdmin &&
    !hasClient &&
    !PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath)) &&
    pathname !== "/auth/signout"
  ) {
    return middlewareRedirect(request, "/login", response);
  }

  if (pathname === "/login") {
    if (isAdmin) return middlewareRedirect(request, "/admin", response);
    if (hasClient) return middlewareRedirect(request, "/portal", response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
