import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const portal = supabase.schema("portal");
  const { data: clientUser } = await portal
    .from("client_users")
    .select("client_id,can_view_documents")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!clientUser?.client_id || !clientUser.can_view_documents) {
    return NextResponse.redirect(new URL("/portal/no-access", request.url), { status: 303 });
  }

  const { data: document } = await portal
    .from("client_documents")
    .select("storage_path,file_name")
    .eq("id", id)
    .eq("client_id", clientUser.client_id)
    .eq("status", "published")
    .maybeSingle();

  if (!document) {
    return NextResponse.redirect(
      new URL("/portal/documents?error=Dokument+nicht+gefunden+oder+nicht+freigegeben.", request.url),
      { status: 303 },
    );
  }

  const { data: signed, error } = await supabase.storage
    .from("client-documents")
    .createSignedUrl(document.storage_path, 60);

  if (error || !signed?.signedUrl) {
    return NextResponse.redirect(
      new URL("/portal/documents?error=Download+fehlgeschlagen.", request.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
