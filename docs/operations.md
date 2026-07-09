# RAIS Client Portal Operations

## Deployment checklist

1. Vercel Projekt `rais-portal` mit Root `rais-portal/` verbinden.
2. Region auf `fra1` setzen.
3. Deployment Protection für Preview aktivieren.
4. Env-Variablen setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `N8N_WEBHOOK_SECRET`
5. Domain `portal.ritz-ai.solutions` an das Vercel-Projekt binden.

## Supabase setup

1. Migration `supabase/migrations/20260708222000_portal_schema_rls.sql` anwenden.
2. API Exposed Schemas um `portal` ergänzen.
3. Auth: Self-Signup deaktivieren.
4. Rate-Limits prüfen und dokumentieren:
   - `Auth > Rate Limits > Email sent` und `Auth > Rate Limits > Sign in / Sign up`
   - Test: 6 schnelle Login-Versuche mit falschem Passwort aus gleicher IP
   - Erwartung: Supabase blockt weitere Versuche (429 oder temporäre Sperre)
   - Ergebnis mit Datum in `docs/ship-audit-checklist.md` ergänzen

## n8n and E-Mail Node

1. Die drei Workflows aus `n8n/workflows/*.json` importieren.
2. Im Webhook-Node den Response Mode auf `Using Respond to Webhook Node` setzen.
3. In jedem Workflow zuerst Secret-Check ausführen; bei mismatch muss der `Unauthorized 401`-Node antworten.
4. In n8n SMTP-Credentials für den Node `Email Send` hinterlegen.
5. `fromEmail` auf `portal@mail.ritz-ai.solutions` setzen und Testmail versenden.
6. In `report_published` und `input_requested` den Supabase-Credential für den Node `Load Client Email` hinterlegen.
7. Workflows geben explizit zurück:
   - `Success 200` bei Erfolg
   - `Unauthorized 401` bei falschem Secret
   - `Missing Recipient 422` bei fehlender Kunden-E-Mail
8. Supabase Database Webhooks auf die n8n Webhook-URLs setzen (nur auf `published`/`open`/`insert` Events).
9. Secret-Rotation bei Verdacht auf Leak:
   - Neues Secret generieren (mindestens 32 zufällige Zeichen).
   - `N8N_WEBHOOK_SECRET` in n8n und Vercel aktualisieren.
   - In allen Supabase Database Webhooks den Header `x-portal-secret` auf den neuen Wert setzen.
   - Danach alten Secret-Wert nicht mehr verwenden.
10. Nach jeder Rotation Smoke-Test ausführen:
    - POST ohne Header erwartet `401`
    - POST mit korrektem Header erwartet `200` oder `422` (je nach Workflowzweig)

## Storage cleanup concept

Beim Löschen eines Kunden:
- DB Daten per Cascade entfernen.
- Danach Storage-Pfade `client_id/*` aus Buckets `report-images` und `submissions` löschen.
- Optional als Edge Function oder n8n Job ausführen.
