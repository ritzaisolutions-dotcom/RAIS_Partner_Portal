import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

function redirectWithSessionCookies(request: NextRequest, targetPath: string) {
  const url = new URL(targetPath, request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  const publicEnv = getPublicEnv();

  const supabase = createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (password.length < 10) {
    const url = new URL("/auth/reset-password", request.url);
    url.searchParams.set("error", "Passwort muss mindestens 10 Zeichen haben.");
    return NextResponse.redirect(url, { status: 303 });
  }

  const { supabase, response } = redirectWithSessionCookies(request, "/portal");
  const { error } = await supabase.auth.updateUser({
    password,
    data: {
      must_change_password: false,
    },
  });

  if (error) {
    console.error("Password reset failed", { message: error.message });
    const url = new URL("/auth/reset-password", request.url);
    url.searchParams.set("error", "Passwort konnte nicht gesetzt werden.");
    return NextResponse.redirect(url, { status: 303 });
  }

  return response;
}
