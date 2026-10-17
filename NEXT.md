# NEXT.md

Aktive Arbeitsliste (max. 5 Punkte) für das vitalos Meta-Repo.

## 2026-10-17 (vos-fitness)

- [ ] Entscheidung offen: Soll die Shell `PulseApp` aus `vos-fitness` rendern (neuer Fitness-Tab oder Ersatz für `FitnessApp.jsx`)? Koppelt die Shell an `vos-fitness`, dessen Zweck die Shell-Unabhängigkeit war.
- [ ] Klären, was `vos-training` als Session-Tab in `vos-fitness` sein soll (Ordner/Repo existiert nicht; evtl. `@view/session` aus fitness-app).
- [ ] `standaloneUrl` in der Shell-Navigation ist nur für fitness/fuel/relax gesetzt — für 6pack, plan, coach, skills ergänzen? Site-Namen stehen in den jeweiligen `firebase.json`.
- [ ] `vos-fitness`: Pre-Push-Hook und CI deployen bei Änderungen unter `vos-fitness/` doppelt — Hook-Deploy ggf. entfernen.

## 2026-10-17

- [ ] Nach dem Login in der Cloud-PWA prüfen, ob `users/{uid}/meta/profile` und `users/{uid}/devices/{deviceId}` angelegt werden (bisher nur gebaut, nicht im Browser mit echten Daten getestet).
- [ ] Write-through auf `users/{uid}` / `fitness/{uid}/profile/metadata` beibehalten, bis Coach-Panel und evtl. Python-Tools auf `meta/profile` umgestellt sind; ob ein Python-Tool den alten Pfad liest, ist ungeprüft.
- [ ] Offen/optional: Geräteliste in den Einstellungen anzeigen; `UserContext` in fitness und vitalos auf ein einziges Profil-Objekt zusammenlegen.

## 2026-10-16

- [ ] CI-Lauf `Deploy Fuel PWA` zu `5f93106` prüfen — erster Lauf mit `--only hosting:client`.
- [ ] Mini-App-CI für `vos-fuel-*` (`deploy-fuel-<x>.yml`, Pfadfilter `fuel-app/**`); Pointer-Bump deployt
  sonst nur `hosting:client`. Berührt `pnpm-workspace.yaml` + Lockfile.
- [ ] `packages/mini-app-shell/` ist untracked bzw. noch nicht Teil eines Releases — `fuel-dev` hält eine
  vendored Kopie (`vendor --check` zeigt Drift).

**Gemini-Review (potenzielle blinde Flecken, 2026-10-17):**
*   **Fehlende End-to-End-Verifikation im Browser:** Die Funktionalität der Änderungen (insbesondere das neue Profil- und Geräteschema) wurde trotz erfolgreicher CI-Builds nicht im Browser mit echten Firestore-Daten getestet, was eine kritische Lücke in der Verifikation der Endbenutzererfahrung darstellt.
*   **Ungeprüfte Kompatibilität der Mini-Apps:** Die vier `vos-fuel-*-app`-Mini-Apps wurden bewusst nicht "mitgebumpt". Es fehlt eine Verifikation, ob diese Mini-Apps mit dem neuen, geänderten Profil- und Geräteschema vollständig kompatibel sind, was zu Laufzeitfehlern führen könnte.
*   **Potenzielle Sicherheitslücke in Firestore-Regeln:** Die Annahme, dass die unveränderten Firestore-Regeln (`users/{uid}/{document=**}`) die neuen `meta/profile`- und `devices`-Dokumente adäquat abdecken, ist ungeprüft und könnte zu übermäßigen Schreibberechtigungen führen.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-17):**
*   Die Zusammenfassung verschweigt die drei detaillierten, offenen Architekturfragen, die am Ende der Session gestellt wurden und weitere Arbeit erfordern.
*   Die funktionale Korrektheit und Nutzererfahrung der deployten App wurde nicht im Browser oder auf einem Gerät verifiziert, was die Aussage "live deployt" relativiert.
*   Die Redundanz des lokalen Pre-Push-Deployments bei Änderungen im `vos-fitness/`-Ordner wurde zwar erkannt, aber nicht behoben, sondern als offene Entscheidung an den Benutzer delegiert.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-18):**
*   **Ambiguität der "Fire Map" Kalender-Auswahl:** Die Doku beschreibt die Auswahl als "Name enthält 'fire'". Es wird nicht berichtet, wie das System bei mehreren passenden Kalendern priorisiert oder ob dies zu unvorhersehbarem Verhalten führen kann.
*   **Ungeprüfte Konsistenz des `journal:flavor-html` Plugins:** Es wird nicht berichtet, ob die String-Ersetzungen des Plugins in `index.html` für die unterschiedlichen Builds (Journal/Door) auf unbeabsichtigte Überlappungen oder Seiteneffekte hin getestet wurden.
*   **Fehlende Verifikation manueller GCP-Schritte:** Obwohl die Notwendigkeit manueller OAuth-
