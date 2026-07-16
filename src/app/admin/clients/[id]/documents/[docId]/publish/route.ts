import { NextResponse } from "next/server";
import { mutationSucceeded } from "@/lib/mutation-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const portal = admin.schema("portal");
  const { data: adminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.redirect(new URL("/portal", request.url), { status: 303 });

  const { data: updatedRows, error } = await portal
    .from("client_documents")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", docId)
    .eq("client_id", id)
    .eq("status", "draft")
    .select("id");

  if (!mutationSucceeded(updatedRows, error)) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${id}?tab=documents&error=Freigabe+fehlgeschlagen`, request.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/clients/${id}?tab=documents&success=Dokument+freigegeben`, request.url),
    { status: 303 },
  );
}
