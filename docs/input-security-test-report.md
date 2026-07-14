# Input Security & Functionality Test Report

**Datum:** 14.07.2026  
**Umgebung:** Live — `https://portal.ritz-ai.solutions` / Supabase `qdywaenmojdxhfxqbvun`  
**Scope:** Kunden-Input-Einreichung, Berechtigungen, Mandantentrennung, Storage

---

## Executive Summary

| Kategorie | Ergebnis |
|-----------|----------|
| Seed-Logins (3 Testkunden) | **PASS** |
| Cross-Tenant RLS (`test:rls`) | **PASS** (33/33) |
| Input Security S1–S6 (initial) | **4 LEAKs** gefunden |
| Nach RLS-Hardening-Migration | **11/11 PASS** |
| Portal HTTP/Browser-Äquivalent F1–F6, B1–B4 | **9/9 PASS** (F5 siehe unten) |

**Gesamtbewertung:** Nach den Fixes ist die Input-Einreichung für den Live-Betrieb **sicher und funktional**. Vor dem Fix bestanden **3 mittel/hohe RLS-Lücken** (request_id-Mismatch, Duplikat-Submit via API, Storage ohne `can_view_inputs`).

---

## Testkonten

| Slug | E-Mail | Passwort |
|------|--------|----------|
| test-vollzugriff | test-vollzugriff@rais.invalid | `RAIS-test-test-vollzugriff` |
| test-nur-reports | test-nur-reports@rais.invalid | `RAIS-test-test-nur-reports` |
| test-nur-inputs | test-nur-inputs@rais.invalid | `RAIS-test-test-nur-inputs` |

---

## Automatisierte Security-Tests (S1–S6)

Ausführung: `npm run test:input-security`

| ID | Szenario | Initial | Nach Fix | Severity (initial) |
|----|----------|---------|----------|-------------------|
| S1 | Eigene `client_id` + fremde `request_id` INSERT | **LEAK** | **PASS** | High |
| S2 | INSERT bei `status=submitted` (Duplikat) | **LEAK** | **PASS** | Medium |
| S3 | `test-nur-reports`: SELECT/INSERT inputs | PASS | PASS | — |
| S4 | Storage INSERT/SELECT ohne `can_view_inputs` | **LEAK** | **PASS** | Medium |
| S5 | Fremder Storage-Prefix | PASS | PASS | — |
| S6 | `submitted_by != auth.uid()` | PASS | PASS | — |

### Angewendeter Fix

Migration [`20260714193000_input_submission_rls_hardening.sql`](../supabase/migrations/20260714193000_input_submission_rls_hardening.sql) (live angewendet):

- `input_submissions` INSERT: `request_id` muss zum eigenen Mandanten gehören **und** Status `open`/`reopened` haben
- `submissions` Storage: SELECT/INSERT nur mit `portal.can_view_inputs()`

---

## Cross-Tenant RLS

Ausführung: `npm run test:rls`

- **PASS:** 33 | **LEAK:** 0 | **ERROR:** 0
- Getestet über alle 4 Mandanten (Haller + 3 Testkunden)
- SELECT/UPDATE/INSERT auf fremde `input_requests` / `input_submissions` blockiert

---

## Portal-Funktionalität & Browser-Äquivalent (F / B)

Ausführung: `npm run test:portal-http` (HTTP mit Session-Cookies gegen Live-Portal)

| ID | Szenario | Ergebnis |
|----|----------|----------|
| F1 | Vollzugriff: Freetext einreichen → „Daten übermittelt. Vielen Dank!“ | **PASS** |
| F2 | Nur-Inputs: Landing `/portal/inputs` | **PASS** |
| F3 | Nur-Reports: kein Inputs-Zugriff | **PASS** |
| F4 | Leeres Formular → Fehlermeldung | **PASS** |
| F5 | Datei >10 MB / `.exe` abgelehnt | **Nicht live getestet** — abgedeckt durch `test/upload-validation.test.ts` |
| F6 | Doppel-Submit nach Erfolg → „nicht offen“ | **PASS** |
| B1 | Unauthenticated → Login-Redirect | **PASS** |
| B2 | Nur-Reports: direkte Inputs-URL | **PASS** |
| B3 | Kunde → `/admin` blockiert | **PASS** |
| B4 | Nach Logout → Login nötig | **PASS** |

### UI-Fix (Code, Deploy ausstehend)

[`src/app/portal/inputs/[id]/page.tsx`](../src/app/portal/inputs/[id]/page.tsx): Submit-Formular nur bei `open`/`reopened`; sonst Hinweistext + Erfolgsbanner.

---

## Bekannte Rest-Risiken (Low)

| Risiko | Severity | Status |
|--------|----------|--------|
| MIME-Validierung nur client-declared `file.type` | Low | Offen — kein Magic-Byte-Check |
| Dateiname ungefiltert im Storage-Pfad | Low | Offen |
| Kein CSRF-Token (Session-Cookie-basiert) | Low | Akzeptiert für Supabase SSR |
| Client kann hochgeladene Dateien bei Validierungsfehler nicht löschen (kein DELETE) | Low | Verwaiste Dateien möglich |

---

## Test-Skripte (Wiederholung)

```bash
npm run test:input-security   # S1–S6 + Seed-Logins (Live Supabase)
npm run test:rls              # Cross-Tenant-Isolation
npm run test:portal-http      # Live-Portal HTTP-Flows
npm run test:unit             # upload-validation, portal-queries
```

---

## Empfehlung

1. **Deploy** der UI-Änderung (geschlossene Anfragen ohne Submit-Button)
2. **Commit + Push** der Migration, Test-Skripte und dieses Report
3. Optional: F5 als E2E mit Mock-Datei in `portal-http-test.ts` ergänzen
