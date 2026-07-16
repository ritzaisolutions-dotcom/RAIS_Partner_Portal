import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Impressum und Datenschutzerklaerung muessen laut Impressumspflicht (§5 DDG)
// jederzeit ohne Hindernis (also auch ohne Login) erreichbar sein.
const PUBLIC_PATHS = ["/login", "/auth/signin", "/auth/reset-password", "/impressum", "/datenschutz"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) return response;

  const portal = supabase.schema("portal");
  const { data: isAdminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const isAdmin = Boolean(isAdminRow);
  const { data: clientUser } = await portal.from("client_users").select("client_id").eq("user_id", user.id).maybeSingle();
  const hasClient = Boolean(clientUser?.client_id);
  const mustChangePassword = Boolean(user.user_metadata?.must_change_password);
  const isPasswordChangeFlow = pathname.startsWith("/auth/reset-password");

  if (mustChangePassword && !isPasswordChangeFlow && pathname !== "/auth/signout") {
    return NextResponse.redirect(new URL("/auth/reset-password", request.url));
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (pathname.startsWith("/portal") && !isAdmin && !hasClient) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isAdmin && !hasClient && !PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath)) && pathname !== "/auth/signout") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    if (hasClient) return NextResponse.redirect(new URL("/portal", request.url));
  }

  return response;
}

export const config = {
  // Zusaetzlich zu den Next-internen Pfaden auch alle statischen Dateien
  // (alles mit einer Dateiendung, z.B. /rais-logo.svg, Kundenlogos) von der
  // Auth-Middleware ausnehmen. Sonst leitet die Middleware unautorisierte
  // Anfragen auf solche Assets faelschlich auf /login um, und z.B. das
  // RAIS-Logo auf der Login-Seite selbst laedt nicht.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
