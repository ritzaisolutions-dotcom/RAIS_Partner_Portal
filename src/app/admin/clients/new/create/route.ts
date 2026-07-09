import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const admin = createAdminClient();
  const portal = admin.schema("portal");
  const { data: adminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.redirect(new URL("/portal", request.url), { status: 303 });

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const primaryContactEmail = String(formData.get("primary_contact_email") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const logo = formData.get("logo");

  let logoPath: string | null = null;
  if (logo instanceof File && logo.size > 0) {
    const extension = logo.name.includes(".") ? logo.name.split(".").pop() : "png";
    logoPath = `${slug}-${Date.now()}.${extension}`;
    const { error: logoError } = await admin.storage.from("logos").upload(logoPath, logo, {
      contentType: logo.type,
      upsert: true,
    });
    if (logoError) {
      return NextResponse.redirect(new URL("/admin/clients/new?error=Logo-Upload+fehlgeschlagen", request.url), { status: 303 });
    }
  }

  const { data: client, error: clientError } = await portal
    .from("clients")
    .insert({
      name,
      slug,
      logo_path: logoPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${logoPath}` : null,
      primary_contact_email: primaryContactEmail,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return NextResponse.redirect(new URL("/admin/clients/new?error=Kunde+konnte+nicht+angelegt+werden", request.url), { status: 303 });
  }

  const tempPassword = `RAIS-${crypto.randomBytes(8).toString("hex")}`;
  const { data: createdUser, error: authError } = await admin.auth.admin.createUser({
    email: primaryContactEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      must_change_password: true,
    },
  });

  if (authError || !createdUser.user) {
    return NextResponse.redirect(new URL("/admin/clients/new?error=Benutzer+konnte+nicht+angelegt+werden", request.url), { status: 303 });
  }

  const { error: clientUserError } = await portal.from("client_users").insert({
    user_id: createdUser.user.id,
    client_id: client.id,
    display_name: displayName,
  });

  if (clientUserError) {
    return NextResponse.redirect(new URL("/admin/clients/new?error=Zuordnung+des+Benutzers+fehlgeschlagen", request.url), { status: 303 });
  }

  const successUrl = new URL("/admin/clients/new", request.url);
  successUrl.searchParams.set("success", "Kunde+und+Client-User+wurden+angelegt");
  const response = NextResponse.redirect(successUrl, { status: 303 });
  // Temp password wird bewusst NICHT als URL-Parameter uebergeben (landet sonst in
  // Server-/Vercel-Logs, Browser-Verlauf und Referrer-Headern). Stattdessen kurzlebiger,
  // httpOnly Cookie, der nur auf dieser Seite lesbar ist und nach 2 Minuten automatisch verfaellt.
  response.cookies.set("temp_password_flash", tempPassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 120,
    path: "/admin/clients/new",
  });
  return response;
}
