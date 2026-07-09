import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Wird vom Client einmalig nach dem Anzeigen des Temp-Passworts aufgerufen,
// damit der Flash-Cookie sofort gelöscht wird statt auf sein maxAge zu warten.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("temp_password_flash");
  return NextResponse.json({ ok: true });
}
