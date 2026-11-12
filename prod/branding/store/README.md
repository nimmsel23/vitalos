# Play-Store-Grafiken

Erzeugt am 2026-11-12. Quellstand beim Lauf: `68a3bb909830058086b9313ded06287805f1970e`.
Produkt-Build aus `prod/`, Edition `store`, lokaler Coach-Modus (`isLocalMode`).
Kein Firebase-Login, kein Emulator-Konto, keine Nutzerdaten. Leerzustände sind die der lokalen Shell.

Play-Vorgaben: Feature Graphic 1024×500, 24-bit PNG ohne Alpha.
Phone-Screenshots 1080×2160 (Seitenverhältnis 2:1, kurze Seite 1080, lange Seite 2160).

| Datei | Pixel | Inhalt |
| --- | --- | --- |
| `feature-graphic.png` | 1024×500 | Wortmarke VitalOS und bestehendes Icon (`prod/public/icon.svg`) |
| `feature-graphic.html` | Quelle | HTML, aus dem die Feature Graphic gerendert wird |
| `phone-fitness.png` | 1080×2160 | Fitness, leeres Training (`#today`) |
| `phone-relax.png` | 1080×2160 | Relax, leerer Tag (`#dash`) |
| `phone-skills.png` | 1080×2160 | Skills, Calisthenics-Liste (`#skills`) |
| `phone-sixpack.png` | 1080×2160 | 6Pack, Tag 1 des mitgelieferten Workouts |

## Neu erzeugen

Im Meta-Repo, nach `pnpm install` und `git submodule update --init`:

```bash
node prod/scripts/store-screenshots.mjs
```

Das Skript braucht Google Chrome, Python 3 mit Pillow (`python3 -m pip install pillow`) und Netz für den öffentlichen Fitness-Katalog `nimmsel23/fitness` (Übungsdaten, nicht im App-Submodul).
Die Fuel-Shared-Module liegen im privaten Repo `nimmsel23/backend`. Fehlt das Checkout, stellt das Skript die letzte im `fuel-app`-Commit `9b017ad^` enthaltene Fassung nur lokal für den Build bereit und verlinkt sie nicht ins Git.
Die Firebase-Datei `prod/.product-config/firebase.config.js` wird für den Lauf durch eine Demo-Konfiguration ersetzt. Lag sie schon vor, schreibt das Skript sie danach zurück, sonst löscht es sie. Es wird nirgends angemeldet.
Fuel-Screenshots fehlen bewusst: ohne den Fuel-Server bleibt die Ansicht auf „FUEL LÄDT…“.
Journal und Habits zeigen ohne Cloud-Anmeldung Fehler- oder Login-Hinweise und werden nicht aufgenommen.
