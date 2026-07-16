import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requiresPasswordChange } from "@/lib/auth-metadata";
import { getPublicEnv } from "@/lib/env";

function redirectWithAuthCookies(request: NextRequest, pathname: string, source: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url), { status: 303 });
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie.name, cookie.value);
  }
  return redirect;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const cookieCarrier = NextResponse.next();
  const publicEnv = getPublicEnv();

  const supabase = createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieCarrier.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Sign-in failed", { message: error.message });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Login fehlgeschlagen");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetPath = user && requiresPasswordChange(user.user_metadata) ? "/auth/reset-password" : "/";
  return redirectWithAuthCookies(request, targetPath, cookieCarrier);
}
