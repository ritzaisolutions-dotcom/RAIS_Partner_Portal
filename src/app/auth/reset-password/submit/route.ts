import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import { requiresPasswordChange } from "@/lib/auth-metadata";
import { createAdminClient } from "@/lib/supabase/admin";

function redirectWithAuthCookies(request: NextRequest, pathname: string, source: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url), { status: 303 });
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie.name, cookie.value);
  }
  return redirect;
}

function createSessionClient(request: NextRequest, response: NextResponse) {
  const publicEnv = getPublicEnv();
  return createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
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
}

async function resolvePostPasswordRedirect(supabase: ReturnType<typeof createSessionClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";

  const { data: adminRow } = await supabase.schema("portal").from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return adminRow ? "/admin" : "/portal";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (password.length < 10) {
    const url = new URL("/auth/reset-password", request.url);
    url.searchParams.set("error", "Passwort muss mindestens 10 Zeichen haben.");
    return NextResponse.redirect(url, { status: 303 });
  }

  const cookieCarrier = NextResponse.next();
  const supabase = createSessionClient(request, cookieCarrier);

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  if (!sessionUser) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

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

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(sessionUser.id, {
    user_metadata: {
      ...sessionUser.user_metadata,
      must_change_password: false,
    },
  });

  await supabase.auth.refreshSession();

  const {
    data: { user: refreshedUser },
  } = await supabase.auth.getUser();

  if (refreshedUser && requiresPasswordChange(refreshedUser.user_metadata)) {
    console.error("Password reset metadata still requires change after update");
    const url = new URL("/auth/reset-password", request.url);
    url.searchParams.set(
      "error",
      "Passwort gespeichert, aber Freigabe fehlgeschlagen. Bitte erneut versuchen oder RAIS kontaktieren.",
    );
    return NextResponse.redirect(url, { status: 303 });
  }

  const targetPath = await resolvePostPasswordRedirect(supabase);
  return redirectWithAuthCookies(request, targetPath, cookieCarrier);
}
