# RAIS Ship Audit Checklist (Portal)

- [x] `portal` Schema + RLS aktiv, anon hat keinen Zugriff
- [x] Auth Signups deaktiviert
- [x] Admin-Only Zugriff auf `/admin/*` geprüft
- [x] Kunde sieht nur eigene Status-Reports und Input-Anfragen (IDOR-Check)
- [x] n8n Webhooks prüfen Secret-Header und blocken ungültige Requests
- [x] Entwürfe von Reports/Requests lösen keine Kundenmails aus
- [x] `/datenschutz` und `/impressum` veröffentlicht
- [x] Deployment Protection für Previews aktiv
- [ ] Login Rate-Limits in Supabase dokumentiert
- [x] Löschkonzept inklusive Storage-Cleanup dokumentiert
- [ ] Domain `portal.ritz-ai.solutions` auf produktives Deployment gesetzt (DNS-Verifikation noch offen)
- [ ] Haller Seed-Daten angelegt und mit Thomas abgestimmt
- [ ] Impressum mit finalen Stammdaten ergänzt (Anschrift, Vertretungsberechtigte, Registerangaben)
