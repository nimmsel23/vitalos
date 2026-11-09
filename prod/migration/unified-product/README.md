# migration/unified-product — nur Merge-Rest

Dieser Ordner ist **kein** Org- oder Produktkonzept.

Er entstand beim Aufräumen der zwei Produkt-Checkouts
(`~/vitalos-prod` → `~/vitalos/prod`, Nov 2026): Bundle-/Importer-Artefakte
unter `artifacts/` und `files/`.

Die frühere Arbeitsfläche `coordination/` liegt jetzt kanonisch unter:

`~/vitalos/prod/coordination/`

Hier bleibt nur ein Symlink `coordination → ../../coordination`, damit alte
Pfade in Logs/Prompts nicht sofort brechen. Neue Doku und Runner nutzen den
kurzen Pfad.
