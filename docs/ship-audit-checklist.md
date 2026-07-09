# RAIS Ship Audit Checklist (Portal)

- [x] `portal` Schema + RLS aktiv, anon hat keinen Zugriff
- [x] Auth Signups deaktiviert
- [x] Admin-Only Zugriff auf `/admin/*` geprüft
- [x] Kunde sieht nur eigene Status-Reports und Input-Anfragen (IDOR-Check)
- [ ] n8n Webhooks prüfen Secret-Header und blocken ungültige Requests
- [x] Entwürfe von Reports/Requests lösen keine Kundenmails aus
- [x] `/datenschutz` und `/impressum` veröffentlicht
- [x] Deployment Protection für Previews aktiv
- [ ] Login Rate-Limits in Supabase dokumentiert
- [x] Löschkonzept inklusive Storage-Cleanup dokumentiert
- [ ] Domain `portal.ritz-ai.solutions` auf produktives Deployment gesetzt (DNS-Verifikation noch offen)
- [ ] Haller Seed-Daten angelegt und mit Thomas abgestimmt
- [ ] Impressum mit finalen Stammdaten ergänzt (Anschrift, Vertretungsberechtigte, Registerangaben)
- [ ] n8n Smoke-Test 2026-07-09: Alle drei Production-Endpunkte antworten aktuell mit `404` (`rais-report-published`, `rais-input-requested`, `rais-input-submitted`). Nach Re-Import/Aktivierung der Workflows erneut mit `401` (ohne Secret) und `200/422` (mit Secret) verifizieren.
