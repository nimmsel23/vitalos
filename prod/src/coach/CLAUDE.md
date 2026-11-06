# coach/ — Lokaler Daten-Layer

Kein Firebase-Import. Nur für den lokalen Coach-Build (`npm run build`).

## db.js

Aggregiert alle Daten-Layer der Sub-Repos in einen einzigen `@db` Export:

```js
export * from "@fitness-db/core";      // Sessions, Exercises
export * from "@fitness-db/sessions";
export * from "@fitness-db/kb";        // Knowledge Base
export * from "@fitness-db/analysis";
export * from "@fitness-db/user";
export * from "@fitness-db/utils";
export * from "@journal/lib/db/journal";
export * from "@habits/lib/db/habits";
```

Neue Sub-Repo Daten-Funktionen → hier eintragen, nicht in cloud/db.firestore.js (außer wenn cloud-Support gewünscht).

## api.js

Re-exportiert Utility-Funktionen aus `@db` die in der Shell direkt gebraucht werden (`localToday`, `getWeekDates`, `getDashboardAnalytics`, etc.).

## Wann hier editieren

- Neues Sub-Repo (z.B. relax-dev) → dessen `lib/db/*.js` hier re-exportieren
- Neue coach-only Utility → in `api.js` exportieren
