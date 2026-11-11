# VitalOS Hosting-Targets — Kanon `vos-<app>.web.app`

Stand: 2026-11-11. Owner-Regel: **eine Surface = eine Site = `vos-<slug>.web.app`.**

## Herkunft (warum der Mix existiert)

Kurz die echte Linie — kein Zufall, sondern Folge von Projekt-/Semantik-Korrekturen:

1. **Fuel zuerst `fuel-aos`** — Site-Name passte zum AOS-Muster, landete aber im
   **falschen Firebase-Projekt** → getrennte Firestores gegenüber Fitness/VitalOS.
2. **`fuel-aos` gelöscht** — Korrektur; der Site-Name ist seither **nicht mehr
   verfügbar** (Firebase Recycling). Deshalb kein Zurück auf `fuel-aos`.
3. **Ersatz: `fuel-vos`** — Fuel im richtigen Projekt (`fitness-aos`), Suffix `-vos`.
4. **Fitness blieb `fitness-aos`** — einzige Haupt-App, die die alte `-aos`-URL behielt
   (Projekt-ID und Site fielen hier zusammen).
5. **`vos-fitness` / VitalOS-Wrapper** — später semantisch saubere URL/Produkt-Hülle
   über denselben Fitness-Quellcode (`fitness-aos` als Hosting/Quelle darunter).
6. **Danach Vertauschung bei den anderen Apps** — Minis oft schon `vos-<name>`,
   weitere Hauptflächen als `*-vos` (`journal-vos`, `habit-vos`, `learn-vos`),
   parallel Altflächen (`fuel-os`) und Marke `vitalos`. Auth/OAuth-Listen folgten
   dem Mix nicht sauber → `redirect_uri_mismatch` / iOS-Login-Chaos.

**Konsequenz für den Kanon:** Prefix `vos-<slug>` ist die Zielsemantik (wie
`vos-fitness`-Idee). `fuel-aos` ist tot/gesperrt — Fuel-Hauptziel ist **`vos-fuel`**,
nicht erneut `-aos`. `fitness-aos` bleibt Übergangs-Ist, Soll `vos-fitness`.

## Warum das Auth/Redirect kaputt macht

Google OAuth + Firebase Auth hängen an **exakten** Origins und
`https://<authDomain>/__/auth/handler`. Wir haben drei Namensfamilien gemischt:

| Muster | Beispiele | Folge |
| --- | --- | --- |
| `vos-*` (Prefix) | `vos-skills`, `vos-fuel-log`, `vos-plan` | Mehrheit der Minis; OAuth-URIs oft vergessen |
| `*-vos` (Suffix) | `fuel-vos`, `journal-vos`, `habit-vos`, `learn-vos` | Nach-fuel-aos-Korrektur + Nachahmer |
| Projekt/Alt | `fitness-aos`, `fuel-os`, `vitalos` | Fitness-Erbe; parallele UX-URL; Shell-Marke |

Same-Origin-Login braucht **pro Site** Authorized Domain + OAuth Redirect URI.
Uneinheitliche Slugs → doppelte Listen, vergessene Einträge, `redirect_uri_mismatch`.

## Kanon (Ziel)

Schema: `https://vos-<slug>.web.app`  
Firebase Hosting **site id** = `vos-<slug>` (gleich dem Hostnamen ohne `.web.app`).  
Target-Name im Repo darf kurz bleiben (`client`, `log`, …); die **Site** ist kanonisch.

### Bevorzugte Architektur: eine Site pro Produktfamilie + Subroutes

**Praktisch besser als eine Firebase-Site je Mini-App:**

| Ebene | URL | Auth |
| --- | --- | --- |
| Haupt | `https://vos-fuel.web.app/` | ein Origin |
| Mini (Subroute) | `https://vos-fuel.web.app/mini/log` … `/mini/supplements` … | **derselbe** Origin → **eine** `authDomain`, **eine** OAuth-Redirect-URI |
| Optional Alias | alte `vos-fuel-log.web.app` → 301 auf Subroute | Übergangszeit |

Vorteile:
- OAuth/Authorized Domains skalieren mit **Produktzahl**, nicht mit Mini-Zahl
- Same-Origin-Login (iOS) ohne URI-Wildwuchs
- Offline/PWA: ein Service-Worker-Scope unter `/` (oder bewusst `/mini/<id>/` mit eigenem Manifest, aber gleicher Host)

Grenzen / bewusst entscheiden:
- Home-Bildschirm-Icons: entweder eine Fuel-PWA oder je Mini ein Manifest unter `/mini/<id>/` (weiterhin möglich auf derselben Site)
- Hash-Router (`#/…`) vermeiden — echte Pfade `/mini/…` (Hosting `rewrites` → Mini-`index.html`)
- Solo-Builds bleiben Build-Artefakte; Deploy-Ziel ist die **Familien-Site**, nicht 4 Extra-Sites

**Regel:** Neue Surfaces zuerst als `vos-<familie>.web.app` (+ optional `/mini/<id>`).  
Eigene `vos-<familie>-<mini>.web.app`-Sites nur noch, wenn Store/TWA/Icon wirklich eine **eigene Origin** braucht — dann sofort OAuth-Triplet mit anlegen.

Legacy-Einzelsites (`vos-fuel-log`, …) dürfen als Redirect-Hüllen weiterleben, sind aber nicht mehr Auth-SOT.

| Surface | Kanon-Site | Heute (Ist) | Aktion |
| --- | --- | --- | --- |
| Shell (Meta) | `vos-shell` *oder* Marke `vitalos` behalten | `vitalos` | Marke `vitalos.web.app` als Ausnahme dokumentieren; optional Alias später |
| Fitness Haupt | `vos-fitness` | `fitness-aos` | Neu + Redirect/Alias von `fitness-aos` |
| Fuel Haupt | `vos-fuel` | `fuel-vos` (früher `fuel-aos`, gelöscht/gesperrt) | Site `vos-fuel`; Redirect `fuel-vos`→`vos-fuel`; **nie** wieder `fuel-aos` |
| Fuel OS (Alt/UX) | `vos-fuel` | `fuel-os` | Traffic auf `vos-fuel` |
| Fuel Minis | `vos-fuel` + `/mini/log\|supplements\|mikros\|protokoll` | eigene `vos-fuel-*` Sites | Subroutes auf `vos-fuel`; Alt-Sites → 301 |
| Fitness Haupt | `vos-fitness` | `fitness-aos` | Site `vos-fitness` + Redirect; Minis analog `/mini/…` |
| Journal | `vos-journal` | live + `/mini/{door,voice,game,tent,habits}` | Kanon; Solo-Icons = Manifest unter `/mini/*` |
| Journal Legacy / Solo-Aliase | `vos-journal` (+ Pfad) | `journal-vos` → `/`; `vos-door` → `/mini/door/`; `vos-voice` → `/mini/voice/`; `vos-game` (+ `/frame|freedom|focus|fire/`) → `/mini/game/…`; `vos-tent` → `/mini/tent/`; `habit-vos` → `/mini/habits/` | **live 301-Aliase**, kein eigenes Bundle; Auth-SOT nur `vos-journal` |
| Learn | `vos-learn` | `learn-vos` (unter fitness-dev) | → `vos-learn` |
| Plan | `vos-plan` | `vos-plan` | ok |
| Skills | `vos-skills` | `vos-skills` | ok |
| Relax | `vos-relax` | *(kein Target)* | Site anlegen wenn Deploy |
| 6pack | `vos-6pack` | `vos-6pack` | ok |
| Coach | `vos-coach` | `vos-coach` | ok |
| Training | `vos-training` | `vos-training` | ok |
| Atlas | `vos-atlas` | `vos-atlas` | ok |
| Logbuch | `vos-logbuch` | `vos-logbuch` | ok |
| Review | `vos-review` | `vos-review` | ok |
| Touren | `vos-touren` | `vos-touren` | ok |
| Setup | `vos-setup` | `vos-setup` | ok |
| Anamnese | `vos-anamnese` | `vos-anamnese` | ok |
| Fokus | `vos-fokus` | `vos-fokus` | ok |
AlphaOS (`game-aos`, `door-aos`, …) bleibt **außerhalb** dieses Vertrags (Projekt `core4-aos`).

## OAuth-Verifizierung & 10-URI-Limit (Owner-Gate)

Google blockiert **>10 Redirect-URIs**, solange der OAuth-Zustimmungsbildschirm
nicht verifiziert ist (bereits vor ~2 Wochen aufgelaufen). Deshalb:

1. **Kurzfristig:** Familien-Sites + `/mini/*` → wenige Origins (unter die 10).
2. **Danach:** Branding/Consent erneut einreichen mit **eigener Domain** +
   öffentlicher Datenschutzerklärung auf dieser Domain.
3. **Dann erst:** beliebig viele `vos-*`-URIs + Credentials-API-Zugang.

**Marken-/OAuth-Domain = Firebase Landing, nicht ChatGPT-Sites.**

| | Ziel |
|---|---|
| Host | Firebase-Projekt `daniel-vitaltrainer`, Site `daniel-vitaltrainer` |
| Quellrepo | `~/dev/coach-dev/website` (`nimmsel23/daniel-vitaltrainer-firebase`) |
| Parallel-URL | `https://daniel-vitaltrainer.web.app` (gleiche Inhalte) |
| Nicht | `vitalos.nimmdaniel.chatgpt.site`, Shell `vitalos.web.app` als Domain-Anker |

Vorhanden (Stand 2026-11-11):
- Custom Domains in Firebase angelegt: `vitalos.at`, `www.vitalos.at` (Cert/DNS noch pending)
- Legal live auf Firebase: `/datenschutz`, `/impressum`, `/vitalos`
- Shell-Spiegel: `https://vitalos.web.app/datenschutz` und `/konto-loeschen` (HTTP 200)
- Inhalt noch mit Kontakt-Platzhalter (`KONTAKT-FOLGT@example.invalid`, C-014)

Noch Owner (DNS bei atdomain/hostdomains — CF-Sites-A-Records ersetzen):

| Name | Typ | Wert |
|---|---|---|
| `@` / `vitalos.at` | A | `199.36.158.100` |
| `_acme-challenge.vitalos.at` | TXT | `IQUUmVD_c7vvt2d6mzlRIdhJJR_kMiIAs7DtdwtOJR4` |
| `www` | A | `199.36.158.100` |
| `_acme-challenge.www.vitalos.at` | TXT | `FNg5KejKt7IBJZu-Utl-2GKh4g8oPVi3HbWR2cJJlNE` |

Alte Cloudflare-Sites-IPs (`162.159…` / `172.66…`) entfernen. Nach Propagierung:
`https://vitalos.at/datenschutz`, `/impressum`, `/vitalos` prüfen → Consent-Screen
auf `vitalos.at` → Verifizierung einreichen → OAuth-URI-Batch + Credentials-API.

## Auth-Contract (gilt für jede Kanon-Site)

Für jede Live-Site `vos-<slug>.web.app` (nach Verifizierung bzw. innerhalb des 10er-Kontingents):

1. Firebase Auth → Authorized domains: `vos-<slug>.web.app` (+ optional `.firebaseapp.com`)
2. GCP OAuth Web-Client → JS origin `https://vos-<slug>.web.app`
3. Redirect URI `https://vos-<slug>.web.app/__/auth/handler`
4. App-`authDomain` = Seitenhost (same-origin) **oder** bewusst project-domain — aber dann einheitlich und dokumentiert
5. Eintrag in Dev-Dashboard / `portal/dev-status.json`

## Migrations-Reihenfolge (ohne Big-Bang)

1. **Dokument & Dashboard** (diese Datei) — Ist/Soll sichtbar  
2. **OAuth-Liste** einmalig aus Kanon generieren (nicht aus Ist-Mix)  
3. Neue Sites nur noch als `vos-<slug>` anlegen  
4. Suffix-Hauptapps (`fuel-vos`, `journal-vos`, `habit-vos`, `learn-vos`, `fitness-aos`) nacheinander: neue Site → Deploy → Redirect alt→neu → Overlay/Portal → OAuth  
5. `fuel-os` nicht weiter als parallele Prod-Haupt-URL

## Ownership

- **CTO:** Kanon durchsetzen, `.firebaserc`/Deploy-Targets, Dashboard, OAuth-Checkliste  
- **PM:** Surfaces nur über Kanon-Namen kommunizieren (keine `fuel-vos`-Sprache in Produkttexten)  
- **Owner:** Firebase Site anlegen / Custom-Redirects / OAuth-Client speichern (Console)

## Generator

`vos-portal` / `docs/apps.html` zeigen Ist-Sites. Soll-Spalte: diese Datei + optional
`portal/hosting-targets.json` (Spiegel der Tabelle oben).
