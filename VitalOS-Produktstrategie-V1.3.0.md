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

Der tägliche Kern soll ein Deposit pro Bereich ermöglichen: **Body,
Business, Balance und Being**. Es geht nicht darum, jeden Bereich mit einem
eigenen Logger abzufragen. Der Nutzer soll den Tag frei beschreiben können;
das Journal hilft ihm, den Eintrag den vier Bereichen zuzuordnen und Lücken
sichtbar zu machen. Habit-Tracker und spezialisierte Bereiche stehen bereit,
wenn jemand gezielt damit arbeiten möchte.

Was sich durch regelmäßige Nutzung verändert, soll der Nutzer selbst
erfahren: Gewohnheiten werden sichtbarer, Aufmerksamkeit richtet sich neu
aus, und tägliche Handlungen verbinden sich mit eigenen Zielen. Das ist die
beabsichtigte Wirkung, keine vorweggenommene Erfolgsgarantie. Die App soll
sie durch Nutzung und passende Rückblicke erkennbar machen.

## Produktablauf und Portfolio

1. Im Home Hub landet der Nutzer beim Journal und beschreibt den Tag in
   einem Freitext.
2. VitalOS soll daraus die vier Tages-Deposits unterstützen und die
   erkannten Handlungen den passenden Bereichen zuordnen. Die Smart-Log-
   Analyse schlägt außerdem passende strukturierte Einträge vor,
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
Vorschläge für Ernährung, Fitness, Relax, Habits und Aufgaben sowie den
kontextuellen Reflexionsfluss. Ein fertiger täglicher Deposit-Ablauf für
alle vier Bereiche ist damit noch nicht belegt. Automatische Erkennung von
Änderungsversuchen und langfristige zielbezogene KI-Musteranalyse sind
ebenfalls Ausbauhypothesen.

## Erstes Angebot

**Einstieg:** Ein Tag, ein Freitext, die vier täglichen Deposits sichtbar —
möglichst wenig Logger-Aufwand.

**Nutzenversprechen zur Prüfung:** „Schreib kurz, was dein Tag gebracht
hat. VitalOS hilft dir, deine täglichen Schritte festzuhalten und mit der
Zeit wiederkehrende Gewohnheiten und deinen Fokus zu erkennen.“

Die erste Zielgruppe sind Menschen, die im Alltag regelmäßiger handeln
und ihren Fokus halten wollen, ohne erst ein eigenes KI-System oder eine
komplizierte Tracking-Routine einzurichten. Der Einstieg erfolgt über das
Vitaltrainer-Umfeld und Menschen, die Bewegung, Ernährung und Erholung
verlässlicher in ihren Alltag bringen wollen. Die Person kauft nicht
„KI“, sondern einen einfachen täglichen Rhythmus, der mit der Nutzung
mehr Klarheit über Gewohnheiten und Ziele schaffen soll.

Vor breiter Vermarktung muss der Journalablauf alle vier Deposits
verständlich abbilden: ein Freitext, erkennbare Zuordnung zu Body,
Business, Balance und Being, einfache Korrektur und Tagesrückblick. Der
Pilot prüft, ob Menschen ihn wiederholt nutzen, ob er ihre Erfassung
leichter macht und ob sie darin persönlichen Fortschritt erkennen. Die
Wirkung auf Ziele und Routinen wird nicht vorab garantiert.

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

Observe soll den manuellen Kernablauf sinnvoll nutzbar halten; aktuell ist
für Smart Logging ein kostenloses Tagesbudget von einer Analyse
dokumentiert. Operate braucht einen klaren wiederkehrenden Vorteil. Mehr
KI-Analysen allein sind als Premium-Nutzen zu prüfen, weil das Kernverhalten
ein täglicher Freitext ist. Eine frühere Arbeitshypothese lag bei 6,90 Euro
monatlich und 300 Smart Logs; das Volumen passt nicht automatisch zum
einfachen Tagesablauf und ist kein gesetzter Preis. Für den ersten
Zahlungsbereitschaftstest ist 6,90 Euro monatlich höchstens ein zu prüfender
Anker. Premium darf nur Kontingente versprechen, deren Modell- und
Storekosten bekannt sind. Rückblicke oder weitere Premium-Nutzen erst
verkaufen, wenn sie existieren und belegt sind. Keine künstliche
Abo-Pflicht, Werbung oder Verwertung persönlicher Gesundheitsdaten.

Die aktuelle Backendfunktion nutzt `gemini-2.5-flash`, speichert aber im
Ergebnisdatensatz keine Provider-Tokenmetrik. Google weist für den Paid-Tier
derzeit 0,30 USD je Million Text-Input-Tokens und 2,50 USD je Million
Output-Tokens aus. Diese Liste ersetzt keine Messung der tatsächlichen
Analysen und Prüfung des verwendeten Billing-Tiers. Die Google-Play-Gebühren
hängen vom Markt und Programm ab; für EWR-Auto-Renew-Abos nennt Google
aktuell eine Kombination aus Service- und Billing-Gebühr. Beide Werte vor
der Margenrechnung live bestätigen:
[Gemini API: Preisübersicht](https://ai.google.dev/gemini-api/docs/pricing),
[Google Play: Servicegebühren](https://support.google.com/googleplay/android-developer/answer/112622).

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

Zur Planung eine reine Sensitivitätsrechnung bei angenommenen 4,50 Euro
Netto-Deckungsbeitrag pro aktivem Zahler: 50 Euro monatliche Kosten brauchen
12 Zahler, 100 Euro brauchen 23 und 200 Euro brauchen 45. Diese Werte sind
keine VitalOS-Kostenprognose; sie zeigen nur, wie der Break-even mit der
Zahl der Zahler wächst. Die echte Rechnung nutzt die tatsächliche
Store-Auszahlung und Kosten je Analyse.

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

1. Im M1-RC prüfen, ob ein einziger Freitext die Deposits in allen vier
   Bereichen erfassen und korrigieren lässt; andernfalls diese Lücke
   zuerst schließen.
2. M2-Testuser-Woche mit Fokus auf tägliche Nutzung, Rückkehr und selbst
   wahrgenommene Veränderung durchführen.
3. Zwei klar markierte Preisvarianten — 6,90 und 9,90 Euro monatlich — in
   Gesprächen testen, bevor Billing und Kontingent festgelegt werden.
4. Reale monatliche Upgrade-, Modell-, Hosting-, Store- und Supportkosten
   erfassen; Deckungsbeitrag pro zahlendem Nutzer berechnen.
5. Premium nur dann auf mehr KI-Analysen stützen, wenn die Pilotdaten
   zeigen, dass Nutzer diese zusätzlich zum Tageskern regelmäßig brauchen.

Bis Umsatz und Kosten geprüft sind, ist VitalOS eine Produkt- und
Erlöshypothese; Kostendeckung oder Gewinn sind nicht belegt.
