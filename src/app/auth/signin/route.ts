import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Keine Klartext-Personendaten (E-Mail) in Server-/Vercel-Logs schreiben.
    console.error("Sign-in failed", { message: error.message });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Login fehlgeschlagen");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
