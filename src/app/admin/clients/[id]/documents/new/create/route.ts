import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isClientDocumentCategory } from "@/lib/client-document-status";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_SUBMISSION_FILE_BYTES,
  SUBMISSION_EXTENSIONS,
  SUBMISSION_MIME_TYPES,
  validateUploadedFile,
} from "@/lib/upload-validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const portal = admin.schema("portal");
  const { data: adminRow } = await portal.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.redirect(new URL("/portal", request.url), { status: 303 });

  const { data: client } = await portal.from("clients").select("id").eq("id", clientId).maybeSingle();
  if (!client) {
    return NextResponse.redirect(new URL("/admin?error=Partner+nicht+gefunden", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const descriptionMd = String(formData.get("description_md") ?? "").trim();
  const file = formData.get("document_file");

  if (!title || !isClientDocumentCategory(category)) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${clientId}/documents/new?error=Titel+und+gültige+Kategorie+sind+Pflicht.`, request.url),
      { status: 303 },
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${clientId}/documents/new?error=Bitte+eine+Datei+hochladen.`, request.url),
      { status: 303 },
    );
  }

  const validationError = validateUploadedFile(file, {
    maxBytes: MAX_SUBMISSION_FILE_BYTES,
    allowedMimeTypes: SUBMISSION_MIME_TYPES,
    allowedExtensions: SUBMISSION_EXTENSIONS,
  });
  if (validationError) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${clientId}/documents/new?error=${encodeURIComponent(validationError)}`, request.url),
      { status: 303 },
    );
  }

  const documentId = randomUUID();
  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const storagePath = `${clientId}/${documentId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await admin.storage.from("client-documents").upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.redirect(
      new URL(`/admin/clients/${clientId}/documents/new?error=Upload+fehlgeschlagen.`, request.url),
      { status: 303 },
    );
  }

  const { error: insertError } = await portal.from("client_documents").insert({
    id: documentId,
    client_id: clientId,
    uploaded_by: user.id,
    title,
    category,
    description_md: descriptionMd || null,
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type || null,
    byte_size: file.size,
    status: "draft",
  });

  if (insertError) {
    await admin.storage.from("client-documents").remove([storagePath]);
    return NextResponse.redirect(
      new URL(`/admin/clients/${clientId}/documents/new?error=Dokument+konnte+nicht+gespeichert+werden.`, request.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/clients/${clientId}?tab=documents&success=Dokument+hochgeladen+(Entwurf)`, request.url),
    { status: 303 },
  );
}
