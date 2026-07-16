import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", _request.url), { status: 303 });

  const portal = admin.schema("portal");
  const { data: adminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.redirect(new URL("/portal", _request.url), { status: 303 });

  const { data: document } = await portal
    .from("client_documents")
    .select("storage_path,file_name,mime_type")
    .eq("id", docId)
    .eq("client_id", id)
    .maybeSingle();

  if (!document) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${id}?tab=documents&error=Dokument+nicht+gefunden`, _request.url),
      { status: 303 },
    );
  }

  const { data: signed, error } = await admin.storage
    .from("client-documents")
    .createSignedUrl(document.storage_path, 60);

  if (error || !signed?.signedUrl) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${id}?tab=documents&error=Download+fehlgeschlagen`, _request.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(signed.signedUrl, { status: 303 });
}
