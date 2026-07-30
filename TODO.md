siehe auch: ./BACKLOG.md && ./.agents/architecture/SCOUT.md
# Architektur & Refactoring (VitalOS vs. Fitness Standalone)
- [ ] **Coach Tab separieren:** Den Coach Tab komplett aus der VitalOS Shell entfernen. Er soll nur noch in der Standalone-Fitness-App verfügbar sein.
- [ ] **Fuel Tab in VitalOS vereinfachen:** Die Fuel-Ansicht in der VitalOS Shell auf das Wesentliche reduzieren. Ziel: Alle relevanten Fuel-Komponenten in einem einzigen Wrapper-Tab bündeln, anstatt die volle Standalone-Tab-Struktur zu nutzen.

# Bugs: Daten-Sync & Firebase
- [ ] **Exercise Approval Sync:** Lokal freigegebene Übungen (Expert Status) werden nicht korrekt in Firebase gespiegelt. Die Inbox bleibt fälschlicherweise voll.
- [ ] **Session Tab Ladefehler:** Vergangene Workouts werden im Haupt-Session-Tab nicht angezeigt (nur in Verlauf/Datumswahl). Die Daten samt Muskel-IDs existieren im Firestore. Fetch-Logik oder State-Management im Tab prüfen.
- [ ] **Muskel Status Diskrepanz:** Das Dashboard Widget und der "Muskeln Tab" zeigen unterschiedliche Werte. Es scheint eine Diskrepanz zwischen lokaler Berechnung und Firebase/Cloud-Daten zu geben.

# Bugs: UI & Logik
- [ ] **Verlauf (Historie) Klassifizierung:** Finisher überschreiben das Haupt-Workout. Wenn ein HIIT-Finisher an ein Krafttraining (z.B. Legs) angehängt wird, zeigt der Verlauf fälschlicherweise nur "HIIT" an. Das Dashboard-Widget macht es bereits richtig.
- [ ] **Review Tab (Wochenreport):** Wochenreport lädt nicht. Keine Fehlermeldung in der Konsole. Vermutlich ein Broken Link/State nach dem letzten Catalog-Rewrite.
- [ ] **Muskel Highlighter:** Klick auf einen Muskel liefert nur bei Gesäß und Beinbeuger passende Übungen. Ein Klick auf die Übungen selbst ist funktionslos (Event Handler prüfen).
- [ ] **Supplement Tab Gemini Error:** Der Button zum Hinzufügen via Gemini wirft einen `JSON error in zeile 1 column 1`. (Agent Info: Vermutlich liefert die API einen HTML-Error-String statt JSON zurück, Error-Handling beim Fetch implementieren).

# Features & UI Enhancements
- [ ] **Catalog Browser & Detail Inspector:** UI festigen. Der Inspector führt aktuell auf eine Dummy-Page ("Coach Sheet"). Hier die korrekte Datenbindung und das UI-Layout für das Coach-Sheet/Exercise-Modal einbauen (inklusive Approve-Funktion für die Inbox).
- [ ] **Fuel Settings (Makros):** Felder für Größe und Gewicht im Profil ergänzen, um die Auto-Makro-Berechnung zu ermöglichen.
- [ ] **Push Reminders verschieben:** Den Push-Reminder-Toggle aus dem Setup-Tab in den "Fuel Micros Tab" umziehen.
- [ ] **Sidebar (VitalOS Shell):** Eingeklappten Zustand der Sidebar überarbeiten (Anzahl und Layout der Icons ist aktuell unübersichtlich).

# Infrastruktur & Firestore Sync (Höchste Priorität)
- [ ] **Systemd-Cleanup:** Alle alten systemd-basierten Push/Pull-Daemons und Skripte endgültig aus der Codebase und den Deploy-Skripten entfernen.
- [ ] **Zentraler Server-Sync:** Den Firestore-Sync (Push/Pull) exklusiv in den Lifecycle eines einzigen Servers (z.B. den Fitness-Dev-Server) integrieren. Dieser agiert als Master-Sync für das gesamte Ökosystem (VitalOS, Fitness, Fuel).
- [ ] **Loop-Prevention (Kritisch):** Im neuen Server-Sync einen strikten Mechanismus gegen Endlosschleifen (Echo-Cancellation) einbauen. Ein lokaler Write darf keinen erneuten Pull triggern, und ein Pull aus Firestore darf keinen lokalen Push auslösen (z.B. durch Abgleich von `updatedAt` Timestamps oder einer `source`-Flag im Payload).
