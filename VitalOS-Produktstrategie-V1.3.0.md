# VitalOS V1.3.0 · Produkt- und Erlösstrategie

Stand 7. November 2026 · Strategieentwurf

> **Status:** Empfehlung zur Prüfung. V1.2.1 bleibt bis zur Owner-Abnahme
> die freigegebene Produkt-SOT. Dieser Entwurf ändert weder Produktcode noch
> Store-Veröffentlichung, Zahlungen oder Ausgaben.

## Produktidee

Menschen wollen im Alltag regelmäßig etwas für ihre Gesundheit und ihre
größeren Vorhaben tun. Viele verlieren den Überblick oder geben auf, wenn
sie dafür mehrere umständliche Logger bedienen müssen. VitalOS setzt beim
kurzen Freitext an: Der Nutzer schreibt, was sein Tag gebracht hat. Das
Journal hilft, daraus tägliche Einträge in den vier Lebensbereichen zu
ordnen. Ein Eintrag kann mehrere Bereiche berühren; der Nutzer entscheidet,
was davon stimmt.

Der tägliche Kern ist ein Deposit pro Bereich: **Body, Business, Balance
und Being**. Es geht nicht darum, jeden Bereich mit einem eigenen Formular
abzufragen. Freitext hält die Hürde niedrig. Habit-Tracker und spezialisierte
Bereiche stehen bereit, wenn jemand gezielt damit arbeiten möchte.

Was sich durch regelmäßige Nutzung verändert, soll der Nutzer selbst
erfahren: Gewohnheiten werden sichtbarer, Aufmerksamkeit richtet sich neu
aus, und tägliche Handlungen verbinden sich mit eigenen Zielen. Das ist die
beabsichtigte Wirkung, keine vorweggenommene Erfolgsgarantie. Die App soll
sie durch Nutzung und passende Rückblicke erkennbar machen.

## Produktablauf und Portfolio

1. Im Home Hub landet der Nutzer beim Journal und schreibt den Tag in
   eigenen Worten.
2. Die Smart-Log-Analyse schlägt passende strukturierte Einträge vor,
   beispielsweise Mahlzeiten mit geschätzten Makros, Training, Entspannung
   oder erledigte Habits. Der Nutzer kann die Vorschläge prüfen und ändern.
3. Bestätigte Einträge fließen in die passenden Fachbereiche. Fitness,
   Fuel, Relax und Habits bieten dort ihre spezialisierten Funktionen.
4. Wenn der Nutzer einen Änderungsversuch oder ein wiederkehrendes Muster
   bearbeiten möchte, kann er aus dem Journalkontext in eine geführte
   Reflexion und zu einem nächsten Schritt wechseln.
5. Mit der Zeit können Rückblicke zeigen, welche Handlungen regelmäßig
   stattfinden und wie sie zu selbst gewählten Zielen passen.

Die vorhandene Shell verbindet Journal und Fach-Apps. Der gemeinsame Hub
bleibt der einfache Einstieg; einzelne Fach-Apps können jeweils mit einem
konkreten Nutzen vorgestellt werden. Eine separate neue App wird erst dann
gebaut, wenn ein eigener Bedarf und ein tragfähiger Vertriebsweg belegt
sind.

**Beleggrenze:** Der aktuelle Code zeigt Freitextanalyse und bestätigbare
Vorschläge für die genannten Bereiche sowie den kontextuellen
Reflexionsfluss. Automatische Erkennung von Änderungsversuchen und
langfristige zielbezogene KI-Musteranalyse sind keine belegten
Produktversprechen. Sie bleiben Ausbauhypothesen.

## Erstes Angebot

**Einstieg:** Ein Tag, ein Freitext, möglichst wenig Logger-Aufwand.

**Nutzenversprechen zur Prüfung:** „Schreib kurz, was dein Tag gebracht
hat. VitalOS hilft dir, deine täglichen Schritte festzuhalten und mit der
Zeit wiederkehrende Gewohnheiten und deinen Fokus zu erkennen.“

Die erste Vermarktung prüft den täglichen Journal-Ablauf im bestehenden
Produkt. Sie soll zeigen, ob Menschen ihn tatsächlich wiederholt nutzen,
ob er ihre tägliche Erfassung leichter macht und ob sie darin einen
persönlichen Fortschritt erkennen. Die Wirkung auf Ziele und Routinen wird
nicht vorab behauptet.

Der Habit-Tracker bleibt für feste, selbst gewählte Habits verfügbar.
Fach-Apps bleiben für tiefergehende Aufgaben nutzbar. Die Nutzer müssen
weder alle Bereiche verwenden noch eine bestimmte Methode lernen.

## Verkauf und Validierung

- Mit einer kleinen Pilotgruppe aus dem Vitaltrainer-Umfeld beginnen.
- Den echten Ablauf zeigen: Freitext, prüfbare Vorschläge, Bestätigung und
  passende Fachansicht.
- Eine Kampagne und eine Einstiegsseite jeweils auf einen verständlichen
  Alltagsnutzen ausrichten. LinkedIn und Instagram sind die vorhandenen
  Kanäle; echte Anwendungsbeispiele zählen mehr als Reichweite.
- Wiederkehrende Nutzung, freiwillige Rückkehr, wahrgenommene Veränderung
  und Zahlungsbereitschaft messen. Downloads allein sind kein Nachweis.
- Coaching, etwa ein Personal-Training-10er-Block, als separates Angebot
  und separat vom App-Umsatz ausweisen.
- Erst nach belegter Nutzung und positivem variablem Deckungsbeitrag
  bezahlte Reichweite erwägen.

Als erste interne Testhypothese können 20 passende Personen angesprochen,
10 zur Nutzung und mindestens fünf zu Rückkehr, konkreter Preisabsicht und
einem selbst wahrgenommenen Alltagsnutzen bewegt werden. Das sind
veränderbare Startwerte, keine Marktprognose. Testpersonen, Zeitraum und
Freigaben folgen dem bestehenden M2-Testuser-Gate.

## Angebot und Erlös

Observe soll den manuellen Kernablauf sinnvoll nutzbar halten. Operate
kann mehr Smart-Log-Nutzung und später belegte, hilfreiche Rückblicke
enthalten. Ein Abo ist nur passend, wenn der Nutzen wiederkehrt; Preis,
Kontingente und Zahlungsweg bleiben offen, bis Nutzung, Kosten und
Zahlungsbereitschaft geprüft sind. Keine künstliche Abo-Pflicht und keine
Werbung oder Verwertung persönlicher Gesundheitsdaten.

Der aktuelle Release-Pfad bleibt **M1-RC → M2-Testuser → Premium**. Ein
Strategieentwurf ist keine Release-Freigabe. Premium-Erlöse, echte
Zahlungskosten und vollständige Betriebskosten müssen separat belegt
werden.

## Wirtschaftlichkeit

Ziel eins ist, dass der zusätzliche monatliche Deckungsbeitrag die
tatsächliche Mehrbelastung für das Codex-Upgrade und die dadurch
entstehenden Produktkosten trägt. Danach soll VitalOS alle laufenden
Produktkosten decken. Erst wenn auch Support, Akquise und Daniels
Arbeitszeit berücksichtigt sind, sprechen wir von echtem Gewinn.

`Deckungsbeitrag je Zahler = tatsächliche Auszahlung - variable Kosten`

`benötigte Zahler = aufrunden((Upgrade-Mehrbetrag + fixe Produktkosten + Gewinnziel) / Deckungsbeitrag je Zahler)`

Einzubeziehen sind tatsächliche Auszahlungen nach Plattform- und
Zahlungsgebühren, Rückerstattungen, KI- und Hostingkosten, Support,
Akquise, Steuern/Abgaben sowie Arbeitszeit. Umsatz ist nicht Gewinn.
Codex- und Infrastrukturkosten sind aus den realen Abrechnungen zu nehmen;
bis diese Zahlen vorliegen, gibt es keine belastbare Zahler-Schwelle.

**Upgrade-Gate:** Der Netto-Deckungsbeitrag trägt die tatsächlichen
Upgrade-Mehrkosten und neuen Fixkosten drei Monate in Folge; zusätzlich
liegt eine Reserve von zwei Monatsbeträgen vor.

**Gewinn-Gate:** Nach sämtlichen Betriebs- und Arbeitskosten bleibt drei
Monate in Folge ein positiver Überschuss.

## Nächste Schritte

1. M1-RC und M2-Testuser-Woche entlang des bestehenden Freitext-Ablaufs
   abnehmen.
2. Pilotdaten zu Einstieg, wiederholter Nutzung und erlebtem Nutzen
   sammeln; erst danach Preis und Premium-Umfang festlegen.
3. Reale monatliche Upgrade-, Modell-, Hosting-, Store- und Supportkosten
   erfassen und die Deckungsbeitragsrechnung befüllen.
4. Den nächsten Produkt- oder Ausbau-Schritt anhand dieser Daten wählen.

Bis Umsatz und Kosten geprüft sind, ist VitalOS eine Produkt- und
Erlöshypothese; Kostendeckung oder Gewinn sind nicht belegt.
