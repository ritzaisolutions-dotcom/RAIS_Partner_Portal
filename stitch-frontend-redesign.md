# RAIS Portal — Frontend-Redesign (Stitch → Code)

> Ausführbare Roadmap, um Admin- **und** Partner-Ansicht an die gelieferten
> Stitch-Mockups und die `stitch_onboarding_dashboard_redesign/.../DESIGN.md`
> anzugleichen. **Nur Frontend** (Styles, Layout, Komponenten-Markup) — keine
> Änderungen an Datenzugriff, Routen, RLS oder Auth.

## 0. Ausgangslage
Die Design-Migration ist bereits **~90 %** umgesetzt: Ein geteiltes `AppShell`
(`src/components/app-shell.tsx`, `variant: "admin" | "portal"`) versorgt beide
Ansichten; Sidebar, Header, `PortalPageHeader`, KPI-Cards und die meisten Seiten
nutzen bereits das RAIS-`portal-*`-System.

Es existiert aber noch ein **zweites, generisches System** in `globals.css`
(slate `--grey-*`, `.card*` mit Schatten, `.stat-highlight` mit Gradient-Kreisen,
Grain-Textur, Liquid-Glass-Header). Dieses widerspricht `DESIGN.md` und lässt v. a.
die Admin-Seite generisch wirken. Kern des Redesigns ist daher **Konsolidierung auf
ein einziges editoriales System** plus gezielte Seiten-Politur.

---

## A. Design North Star
Aus `DESIGN.md` — **High-Contrast Modernism** / "premium financial broadsheet":

| Achse | Entscheidung |
|---|---|
| Fläche ("Papier") | Linen `#FBF8F3` Basis, Linen-Soft `#F5F0E8` für Insets |
| Tinte | Charcoal `#2F2A24` für Text & Anker |
| Display | **Playfair Display** — nur für Titel/Content, tight tracking `-0.02em`; **nie** für Buttons/Nav |
| UI/Daten | **Inter** — Tabellen, Formulare, Navigation |
| Labels | Inter, uppercase, semibold, `letter-spacing 0.05em` |
| Action | siehe Abschnitt B.3 (Rust/Charcoal solid, Orange nur Akzent) |
| Tiefe | **keine Schatten, keine Gradients** → Tonal Layering + 1px-Stone-Borders (30 % Opazität) |
| Radius | **4px** (institutionell-präzise) |
| Rhythmus | 8px-Raster; Card-Padding 32–40px |
| Ausrichtung | strikt linksbündig; Zentrierung nur in Empty-States |

**Grundregel:** Boldness an genau einer Stelle ausgeben. Serif-Titel + eine Rust-CTA
tragen die Persönlichkeit; alles andere bleibt ruhig und diszipliniert.

---

## B. Token-Ebene — `src/app/globals.css`

### B.1 Farb-Tokens
- **Neu:** `--color-rust: #b0300a;` (AA-konform mit weißem Text).
- Neutrale Skala **von slate lösen**: `--grey-*` auf Linen/Stone-Basis remappen
  (bzw. Verwendungen auf `--color-linen`, `--color-linen-soft`, `--color-stone`,
  `--border` umstellen). Ziel: kein kühles Slate mehr auf Admin-Seiten.
- `--background` bleibt Linen; `body`-Hintergrund von `--grey-100` auf Linen ändern.

### B.2 Geometrie & Textur
- `--radius: 8px → 4px`.
- **Entfernen:** `body::before` Grain-Textur. Der Canvas-Look kommt stattdessen aus
  `.portal-content` (dezentes 24px-Dot-Grid, bereits vorhanden) als Standard.
- **Entfernen:** `--shadow-z1/-z8` Nutzung in `.card-hover` (schattenloses Hover =
  Background-Shift auf Linen-Soft, wie `.portal-card-hover`).
- **Entfernen:** `.stat-highlight` Gradient-Kreise (`::before/::after`) → flache
  Charcoal- bzw. Dark-Pistachio-Fläche.

### B.3 Button-System
Faithful zu den Mockups, AA-geprüft (weißer Text nur auf Rust/Charcoal):

- `.btn` — Radius 4px, `text-transform` **weg von** `capitalize` (normale
  Schreibweise), `font-weight 600`.
- `.btn-primary` — **Rust `#b0300a`** Hintergrund, **weißer** Text. Genau **eine**
  Primär-CTA pro Seite (z. B. "Neuer Kunde", "Vorlage hochladen", "Kunde anlegen").
- `.btn-charcoal` (**neu**) — solides Charcoal, weißer Text. Für Utility-Aktionen
  (z. B. "Filtern").
- `.btn-secondary` — transparent + 1px Charcoal-Border, Charcoal-Text (z. B.
  "Abbrechen", "Abmelden").
- `.btn-ghost` / `.btn-destructive` — bleiben, Radius 4px, keine Schatten.
- Optional `.btn-uppercase` — Label-Variante (uppercase, tracked) für Formular-CTAs
  im Mockup-Stil ("FILTERN", "KUNDE ANLEGEN").
- **Orange `#EC6A37`** erscheint **nicht** als Solid-Button-Fläche mit weißem Text,
  sondern nur als Akzent: Progress-Bars, aktive Nav-Border, Focus-Ring, Chips.

### B.4 Card-Konsolidierung
- `.card` → visuell identisch zu `.portal-card` (Surface, 1px Stone-Border 30 %,
  4px Radius, **kein** Schatten). `.card-header` = 1px Divider unten; `.card-content`
  = Padding 32px.
- Nach Migration der Legacy-Seiten (Abschnitt E) die alten Regeln entfernen.

### B.5 Header (flach)
- `.glass-header*` (Blur/Transparenz/margin/border-radius im Scroll-Zustand)
  **entfernen**. Header ist fest, deckend (Surface), 1px-Stone-Border unten,
  kein Blur, kein Shadow. `prefers-reduced-motion` bleibt trivial erfüllt.

---

## C. Komponenten-Ebene

### C.1 `src/components/portal-header.tsx`
- Glass-Verhalten entfernen (fester deckender Header).
- Admin/Partner-Branding vereinheitlichen: Wortmarke "RAIS" + Console-/Portal-Label.
- Rechts **Identitätsblock** wie Mockup: Avatar-Kreis + Name + Rolle
  (z. B. "Admin User / SUPERADMINISTRATOR"), daneben "Abmelden" als `.btn-secondary`.
- Optionales globales Suchfeld nur, falls Funktion vorhanden — **kein** Dummy-Feld
  (Mockup zeigt Suche, Backend-Funktion prüfen; sonst weglassen).

### C.2 `src/components/portal-sidebar.tsx`
- Logo-Mark + Console-Label (vorhanden lassen).
- Aktive Zeile: Orange-Rechts-Border + Linen-Soft-Fläche (vorhanden).
- **Logout-Zeile am unteren Sidebar-Rand** ergänzen (Mockups zeigen "Logout" unten),
  konsistent zwischen Admin & Partner.

### C.3 `src/components/portal-page-header.tsx`
- Optionales **Uppercase-Eyebrow** (Breadcrumb/Kontext, z. B. "Kundenverwaltung").
- Titel als großer Playfair-Display: `text-3xl md:text-4xl`, `tracking-[-0.02em]`.
- Description (Stone) + Action-Slot (rechts, eine Rust-CTA).

### C.4 KPI-Cards
- Accent-Variante (`.portal-kpi-card-accent`) auf **flaches** Charcoal bzw.
  Dark-Pistachio umstellen (Gradient/Overlay entfällt) — Mockup-Dashboard zeigt zwei
  dunkle Kacheln (Pistachio + Charcoal) und zwei helle weiße Kacheln.

### C.5 Empty-States (wiederverwendbar)
Mockups ("Keine Anfragen gefunden", "Noch keine Vorlagen vorhanden") folgen einem
Muster: zentrierte **Icon-Tile** (Linen-Soft, 4px) + Serif-Heading + Stone-Hilfetext +
eine Action. Als `PortalEmptyState`-Komponente extrahieren und überall einsetzen
(ersetzt heutige schlichte `.portal-empty`-Texte).

### C.6 Tabellen / Listen
- Spaltenlabels: Inter uppercase, tracked (`.portal-kpi-label`/`.login-label`-Stil).
- Zeilen-Divider 1px Stone; Hover = Linen-Soft (vorhanden). Optionales Zebra-Striping
  mit Linen-Soft für dichte Tabellen.

---

## D. Seiten-Politur (Markup an bestehende Primitives angleichen)

**Admin**
- `admin/page.tsx` — KPI-Grid (2 dunkel / 2 hell) + Projektliste; Progress-Bar in
  Orange; Status-Chips.
- `admin/requests/page.tsx` — Filterpanel (`stitch-filter-panel.tsx`) + Ergebnisliste;
  "Filtern" = `.btn-charcoal`, "Exportieren" = `.btn-primary` (Rust); Empty-State.
- `admin/documents/page.tsx` — Header mit Rust-CTA "Vorlage hochladen"; Empty-State;
  optionaler "Hilfecenter"-Inset (Linen-Soft) + Speicher/Downloads-Zeile wie Mockup.
- `admin/clients/new/page.tsx` — 2-Spalten-Layout: links "Mandantendetails" +
  "Kontaktinformationen", rechts "Branding" (Dropzone) + "Zusammenfassung"-Card mit
  Status-Chip und Rust-CTA "Kunde anlegen".
- `admin/users/page.tsx` (Benutzer & Rechte) — Tabellen-/Chip-Politur.

**Partner**
- `portal/page.tsx`, `portal/reports`, `portal/inputs`, `portal/documents`,
  `portal/requests` — KPI-/Card-/Empty-State-Politur analog Admin.
- `login/page.tsx` — Linen-Karte, Playfair-Titel, Uppercase-Labels (`.login-label`),
  Rust-CTA.

---

## E. Legacy-Retirement (Reihenfolge)
1. Diese 5 Seiten von `.card card-content` auf `portal-card` (+ Padding-Utility)
   migrieren:
   - `src/app/admin/clients/new/page.tsx`
   - `src/app/admin/documents/new/page.tsx`
   - `src/app/admin/documents/[id]/generate/page.tsx` (2 Vorkommen)
   - `src/components/admin/report-editor-form.tsx`
   - `src/app/portal/no-access/page.tsx`
2. Danach aus `globals.css` entfernen: `.card`, `.card-header`, `.card-content`,
   `.card-hover`, `.stat-highlight`, `.content-panel`, generische `.sidebar-link*`,
   `.glass-header*`, `body::before`-Grain, sowie ungenutzte `--grey-*`/`--shadow-*`.
3. Grep-Check: keine Referenzen auf entfernte Klassen mehr im Code.

---

## F. Guardrails
- **Nur Frontend.** Keine Änderungen an Server-Routen, Supabase-Queries, RLS, Auth.
- `brand.md` einhalten: **kein Dark Mode, keine Gradients** (das Removal erfüllt das),
  hoher Kontrast auf hellem Grund.
- **AA-Kontrast:** weißer Text nur auf Rust/Charcoal; Orange-Fläche nie mit weißem
  Text. Focus-States sichtbar; `prefers-reduced-motion` respektieren.
- Responsive bis Mobile (Sidebar → Chip-Nav vorhanden; Cards stapeln; Tabellen
  horizontal scrollbar).

---

## G. Verifikation (für die Umsetzung)
1. `npm run dev` starten.
2. Jede Route visuell gegen das zugehörige Mockup prüfen:
   - `/admin` → `dashboard_bersicht`
   - `/admin/requests` → `kundenanfragen`
   - `/admin/documents` → `dokumentvorlagen`
   - `/admin/clients/new` → `neuen_kunden_anlegen`
   - `/admin/users` → `benutzer_rechte`
3. `npm run lint`.
4. Grep-Check auf entfernte Legacy-Klassen (`glass-header`, `stat-highlight`,
   `card-hover`, `\.card\b`, `content-panel`).

---

## Kritische Dateien
- **Tokens/Styles:** `src/app/globals.css`
- **Layout-Komponenten:** `src/components/portal-header.tsx`, `portal-sidebar.tsx`,
  `portal-page-header.tsx`, `app-shell.tsx`
- **Legacy-Seiten:** siehe Abschnitt E
- **Referenz (nicht ändern):**
  `stitch_onboarding_dashboard_redesign/stitch_onboarding_dashboard_redesign/**`,
  `brand.md`
