# VitalOS V1.3.0 · Produkt- und Erlösstrategie

Stand 7. November 2026 · CEO-Empfehlung als Entwurf

> **Status:** Diese Fassung setzt die neue Owner-Richtung „mehrere einfache
> Apps, je App ein klar gelöstes Problem“ in eine prüfbare Strategie um.
> V1.2.1 bleibt bis zur Owner-Abnahme die freigegebene Produkt-SOT. Diese
> Empfehlung autorisiert weder Produktcode noch Store-Veröffentlichung,
> Zahlungen oder Ausgaben.

## Ziel

VitalOS ist Daniels Adaption der WarriorOS-Idee für präventive Vitalität.
Der gemeinsame Ablauf führt vom Wahrnehmen und Protokollieren über
Reflexion zu einer umsetzbaren nächsten Handlung und Rückblick. Die
Nutzererfahrung startet im Home Hub mit dem Journal. Sein Smart-Freitext-Log
versteht den beschriebenen Tag und schlägt passende Einträge für Fitness,
Fuel, Relax und feste Habits vor. Die dahinterliegenden Fach-Apps bleiben
auf ihre spezialisierten Aufgaben ausgerichtet.

Verkauft wird diese Breite über klare, problembezogene Einstiege: eine
Aufgabe und ein sichtbares Ergebnis pro App oder Landingpage. Der Hub
verbindet die Angebote für Nutzer, die mehrere Bereiche brauchen. Gemeinsame
Technik darf Login, Datenschutz, Abrechnung und Pflegekosten senken; ein
Kunde muss für eine einzelne Lösung nicht erst das ganze System lernen.

Das Geschäftsziel hat drei getrennte Stufen:

1. Der monatliche Netto-Deckungsbeitrag aus VitalOS deckt den **zusätzlichen
   Monatsbetrag für Codex Max** und die durch den Ausbau verursachten
   Produktkosten.
2. Die wiederkehrenden Nettoerlöse decken alle laufenden Kosten der
   Produktlinie.
3. Danach bleibt nach Kosten und bewerteter Arbeitszeit ein beständiger
   Überschuss.

Downloads, Bruttoumsatz und eingesparte Entwicklungszeit allein belegen
keine dieser Stufen.

## Portfolio-Prinzip

- **Eine App, ein Problem, ein Versprechen.** Eigener Name, Einstiegsseite,
  Demo und Handlungsaufruf je Produkt. Jeder Einstieg funktioniert ohne
  Kenntnis der übrigen VitalOS-Angebote.
- **Gemeinsame Methode, klare Oberfläche.** Die WarriorOS-Adaption ist der
  rote Faden. Öffentlich erklärt Daniel den jeweiligen Nutzen, nicht
  interne Systembegriffe.
- **Journal als Schaltstelle.** Ein freier Tageseintrag kann nach der
  Analyse editierbare Vorschläge für Mahlzeiten und geschätzte Makros,
  Fitness-Sessions, Relax-Praxis und passende Habits liefern. Der Nutzer
  prüft und bestätigt sie. Die Fach-Apps halten ihre spezialisierten
  Abläufe und Daten.
- **Home Hub und fokussierte Einstiege ergänzen sich.** Das Home Hub bleibt
  der zusammenhängende Ort für Nutzer, die mehrere VitalOS-Bereiche
  verwenden. Jede Fach-App wird mit einer einzelnen Aufgabe erklärt und
  kann über ihren passenden Einstieg direkt geöffnet werden.
- **Technik teilen, Angebote fokussieren.** Login, Abrechnung, Datenschutz,
  Hosting und geprüfte UI-Bausteine dürfen gemeinsam genutzt werden, wenn
  das Entwicklungs- oder Betriebskosten senkt.
- **Nacheinander validieren und bauen.** Erst ein Produkt im Alltag und bei
  Zahlungsbereitschaft belegen, dann den nächsten Problemlöser prüfen.
  Gemeinsame Plattformarbeit beginnt erst, wenn mindestens zwei Produkte
  denselben Bedarf daran zeigen.
- **Abo nur bei wiederkehrendem Nutzen.** Wenn ein Produkt ein einmaliges
  Ergebnis liefert, zuerst Einmalkauf oder klar befristetes Angebot prüfen.
  Keine künstliche Abo-Pflicht.
- **Free löst den Kernfall.** Premium verkauft dauerhaft zusätzlichen
  Nutzen oder Komfort, nicht die Rücknahme einer bereits gelernten
  Grundfunktion. Keine Werbung und kein Verkauf persönlicher Gesundheits-
  oder Nutzungsdaten.

## Methode und Zielgruppe

Die Zielhypothese sind Menschen, die bereits ChatGPT oder andere LLMs im
Browser verwenden, aber ihre Gespräche nicht in ein dauerhaftes, persönliches
System für Routinen und Fortschritt übersetzen. VitalOS soll dafür keine
Prompt-Kenntnisse verlangen: Die Person beschreibt den Tag, das Journal
ordnet Einträge den Fachbereichen zu, und die App hilft mit der Zeit,
wiederkehrende Gewohnheiten mit größeren Zielen zu verbinden. Ob diese
Zielgruppe bezahlt, wird im Pilot geprüft.

Der Tag wird durch vier Perspektiven verstanden, die zugleich den vier
Archetypen zugeordnet sind:

| Stabiler Slot | Perspektive | Archetyp-Linse | Lebensbereich | Produktfrage |
|---|---|---|---|---|
| 1 | Doing | Warrior | Body | Was habe ich getan, trainiert oder umgesetzt? |
| 2 | Thinking | Magician | Business | Was habe ich gedacht, gelernt oder geplant? |
| 3 | Feeling | Lover | Balance | Was habe ich gefühlt und in Beziehung erlebt? |
| 4 | Being | King | Being | In welchem Zustand war ich, und wie habe ich mich ausgerichtet? |

Die vier Slots bilden die feste Struktur. Doing/Thinking/Feeling/Being,
Warrior/Magician/Lover/King und Body/Business/Balance/Being sind
Beschriftungen aus unterschiedlichen Deutungsrahmen derselben vier
Positionen. Andere Begriffe, auch aus Myers-Briggs oder einem eigenen
Vokabular, können als optionale Anzeige dienen; VitalOS behauptet damit
keine psychometrische Gleichwertigkeit. Daten und Nutzergewohnheiten
bleiben an den vier stabilen Slots, nicht an einem Persönlichkeitstyp.
Nutzer wählen ihre eigenen Habits und Routinen. VitalOS vergibt keine
Persönlichkeitsdiagnosen und ordnet keine Handlung verpflichtend einer
Archetypenrolle zu.

Der zentrale Smart-Log-Ablauf ist bereits als Produktcode sichtbar:
Journalvorschau und Datenmodell umfassen Mahlzeiten mit geschätzten
Makros, Fitness-Sessions, Relax-Praxis und Habits
(`journal-app/src/views/v2/JournalV2View.jsx`,
`journal-app/src/lib/smartJournalApplyCore.js`); die gemeinsame Shell
routet zu Journal, Fitness, Fuel, Relax und Habits
(`prod/src/shell/ShellAppRouter.jsx`). Wenn ein Eintrag einen
Veränderungsversuch sichtbar macht, kann der Nutzer aus dem Journalkontext
The Voice starten. Der Quelltext bleibt dort als Kontext erhalten; die
Session führt durch STOP (Muster unterbrechen), SUBMIT (Wahrheit ansehen),
STRUGGLE (alte Erzählung prüfen/erneuern) und STRIKE (nächsten Schritt
wählen). Der STRIKE kann in den Planner übernommen werden
(`journal-app/src/main.jsx`, `journal-app/src/views/voice/VoicePanel.jsx`).
Das belegt die code-seitige Journaleingabe, strukturierte Übernahme und
Reflexionsführung, nicht den abgeschlossenen M1-RC, den Store-Release oder
eine automatische KI-Klassifikation von Veränderungsversuchen.

Die längerfristige Operate-Chance liegt im Wochen- und Verlaufskontext:
bestätigte Einträge und feste Habits nach Doing/Thinking/Feeling/Being
zusammenfassen, wiederkehrende Muster sichtbar machen und mit dem Nutzer
eine kleine nächste Routine zu einem selbst gewählten größeren Ziel
ableiten. Das ist ein Ausbauziel. Es wird nur mit nachvollziehbaren
Datenbelegen und Nutzerbestätigung eingeführt; ein generischer Chatbot
oder automatische Zielvorgaben sind kein Ersatz.

## Reihenfolge der Produktwetten

### 1. Smart Day Log — bevorzugter erster Verkaufseinstieg

**Problemhypothese:** Wer Training, Essen, Erholung und Gewohnheiten
festhalten möchte, füllt oft mehrere Formulare aus und wiederholt Angaben.
Im VitalOS-Journal beschreibt die Person den Tag einmal in Freitext. Der
Analyzer macht daraus prüfbare Vorschläge für passende Fitness-, Fuel-,
Relax- und Habit-Daten. Der Erfolg ist: ein bestätigter Tageseintrag landet
in den passenden Fachbereichen, ohne den Tag mehrfach zu erfassen.

**Kundensatz:** „Schreib deinen Tag einmal. VitalOS sortiert Training,
Essen, Entspannung und deine Habits. Wenn du ein Muster ändern willst,
begleitet dich die Reflexion vom STOP bis zum nächsten STRIKE.“ So werden
Alltagsdaten und ein konkreter Handlungsschritt mit den größeren,
selbstgewählten Zielen verbunden. Die Tagesanalyse und der kontextbezogene
Voice-Fluss sind im Produktcode sichtbar; eine automatische Erkennung,
langfristige Wochenmuster und zielbezogene KI-Synthese brauchen jeweils
eigene Abnahme und Belege.

**Warum zuerst:** Das Journal ist bereits der Einstieg im Home Hub und
Smart Logging besteht als Produktfähigkeit. Die Strategie kann zuerst
deren Nutzen und Zahlungsbereitschaft verkaufen, statt eine redundante App
zu erfinden. Entwicklungs- und Release-Stand bleiben getrennt zu belegen;
die aktive Abnahmefolge lautet M1-RC → M2 → Premium.

**Preis-Hypothese:** Observe bleibt für den manuellen Tagesablauf nützlich.
Operate verkauft zunächst mehr KI-Tiefe und häufigere strukturierte
Übernahme. Kontextbezogene Wochenreflexion kann den wiederkehrenden
Premium-Nutzen erweitern, sobald sie gebaut und nachgewiesen ist. Preis und
Kontingente folgen aus tatsächlicher Nutzung, Kosten je erfolgreicher
Analyse und Zahlungsbereitschaft.

**Erste Erlösverpackung:** Zunächst ein gemeinsames Operate-Abo für die
höhere Smart-Log-Nutzung und später belegte Wochenreflexion. Keine
separaten Abos je Fach-App in der ersten Verkaufsrunde. Die einzelnen
Fach-Apps dienen als eigenständige Einstiege; ein Bundle oder zusätzliche
Tarife kommen erst nach Nutzungs- und Zahlungsdaten.

### 2. Die vorhandenen Fach-Apps als Problemlöser vermarkten

Die Fachprodukte sind bereits in der VitalOS-Shell verbunden. Jede
Kampagne erklärt eines davon mit einem konkreten Ergebnis:

| Einstieg | Problem, das er löst | Beleg vor Ausbau |
|---|---|---|
| Fitness | Training planen, festhalten und gezielt fortsetzen | Nutzer kommen für die nächste Einheit zurück und speichern eine Session |
| Fuel | Essen und Makros mit wenig Erfassungsaufwand überblicken | Nutzer erfassen wiederholt Mahlzeiten und sehen Schätzungen klar markiert |
| Relax | Eine passende Entspannungs- oder Meditationspraxis starten und dokumentieren | Nutzer schließen Sitzungen ab und kommen freiwillig wieder |
| Habits | Wenige selbst gewählte, feste Gewohnheiten täglich abhaken | Nutzer richten Habits ein und führen sie ohne Journal-Pflicht fort |

Diese Einstiege haben jeweils ein eigenes Vertriebsversprechen. Der Smart
Day Log verbindet sie, wenn jemand seinen Tag zusammenhängend erfassen und
verstehen lassen möchte. Die gemeinsame Methode ist Zusatznutzen, keine
Pflicht, alle Fach-Apps zu verwenden.

### 3. Scroll Reset — Brainrot/Endlos-Scrollen

**Problemhypothese:** Wer in einer Scroll-Schleife steckt, braucht einen
kurzen Übergang von Wahrnehmung zu einer selbst gewählten Offline-Handlung.
Eine WarriorOS-inspirierte Mikro-App könnte unterbrechen, eine kurze
Reflexion anstoßen und einen konkreten nächsten Schritt anbieten. Das ist
eine neue Wette, kein vorhandenes VitalOS-Feature.

Der Bereich hat bereits etablierte Produkte: one sec bietet laut eigener
Hilfe einen kostenlosen Eingriff für eine Ziel-App und weitere Funktionen
in Pro; Opal positioniert sich ebenfalls als Screen-Time-Kontrolle.
Quellen: [one sec Pro-Funktionen](https://tutorials.one-sec.app/en/articles/3036418),
[Opal im App Store](https://apps.apple.com/us/app/opal-screen-time-control/id1497465230).
Vor Entwicklungsbeginn müssen Zielgruppe, klare Abgrenzung und ein
erreichbarer Vertriebskanal bestätigt sein. Ein System-Blocker für mehrere
Betriebssysteme ist kein MVP-Ziel.

Eine neue Fuel-App wird nicht parallel gebaut. Zuerst wird die bestehende
Fuel-PWA mit ihrem eigenen Nutzenversprechen getestet. Ein späterer
Einmal-Einstieg „Mahlzeit schnell festhalten“ wird nur dann ein eigenes
Produkt, wenn Nutzer ihn nicht bereits mit Fuel oder Smart Day Log lösen.

## Verkauf und Markteintritt

1. **Warm starten:** Eine klar begrenzte Pilotgruppe aus Daniels
   Vitaltrainer-Umfeld testen lassen. Ziel ist ein echter Nutzungsmoment,
   keine Downloadzahl. Klienten werden nicht ohne passenden Anlass oder
   Einwilligung beworben.
2. **Angebot am vorhandenen Ablauf prüfen:** Für Smart Day Log eine kurze
   Demo zeigen: ein Freitext, eine Analyse, eine Vorschau und bestätigte
   Einträge in den passenden Bereichen. Eine Seite mit einem Problem,
   einem kurzen Ablauf und einer Preisfrage veröffentlichen.
   Zunächst Preisinteresse bei zwei ausdrücklich als Test markierten
   Monatsbeträgen vergleichen; daraus keinen endgültigen Preis ableiten.
   Geld erst annehmen, wenn Zahlungsweg und Abwicklung freigegeben sind.
3. **Direkt vorführen:** Im passenden Kundengespräch die 30-Sekunden-Demo
   zeigen. Das Produkt muss ohne VitalOS-Schulung verständlich sein.
4. **Inhalte mit einem CTA:** LinkedIn mit zwei Beiträgen pro Woche und
   Instagram mit drei bis vier Posts/Reels pro Woche bedienen. Jede
   Kampagne bewirbt genau einen Problemlöser und führt auf dessen eigene
   Einstiegsseite. Qualität und echte Anwendungsbeispiele haben Vorrang
   vor Reichweitenkauf.
5. **Coaching getrennt messen:** Der Personal-Training-10er-Block kann ein
   passendes Folgeangebot sein. Sein Erlös wird getrennt vom App-MRR
   ausgewiesen, damit Serviceumsatz fehlende Produktökonomie nicht
   verdeckt.
6. **Keine bezahlte Akquise vor Beleg:** Erst nach nachgewiesener
   Aktivierung, Wiederkehr und positivem Deckungsbeitrag bezahlte
   Reichweite testen.

## Nachfrage- und Entwicklungs-Gates

### Vor dem nächsten Ausbau oder einer neuen App

- 20 passende Personen sehen dasselbe konkrete Angebot. Simon und Matthias
  sind die zuerst vorgesehenen M2-Testnutzer; Verteilung und Gerätezugang
  bleiben am bestehenden Owner-Gate.
- Mindestens 10 probieren den Smart Day Log Kernablauf in einer einwöchigen
  Demo aus, sobald die Testuser-Freigabe vorliegt.
- Mindestens 5 wählen bei einer transparenten Preisfrage ein konkretes
  Monatsangebot und erklären, warum sie es nutzen würden.
- Mindestens 5 kommen in der Woche freiwillig ein zweites Mal zurück.
- Mindestens 5 benennen einen konkreten Zusammenhang zwischen einem
  bestätigten Eintrag, einer Habit/Routine und einem selbst gewählten Ziel.

Das sind interne Startschwellen für einen ersten Test, keine Prognose und
kein Beweis für langfristige Nachfrage. Werden sie verfehlt, ändern wir
Problem, Zielgruppe oder Angebot, bevor wir weitere Funktionen bauen.

### Grenze für die nächste Lieferrunde

- den vorhandenen Journal-/Analyzer-Ablauf abnehmen und verständlich
  verkaufen; keinen zweiten Smart-Log-Stack bauen;
- jeden Fach-App-Einstieg auf einen Kernjob und eine kurze Demo zuspitzen;
- KI-Vorschläge bleiben sichtbar, editierbar und bestätigungspflichtig;
- Kosten je erfolgreicher Smart-Log-Analyse messen und Tageskontingente
  serverseitig begrenzen; manuelles Logging bleibt intakt;
- bestehende Journal→Voice-Führung als Produktdemo zeigen; eine
  automatische KI-Erkennung von Veränderungsversuchen erst behaupten,
  wenn Klassifikation, Nutzerkontrolle und Fehlerrate belegt sind;
- Wochenreflexion erst als Operate-Mehrwert vermarkten, wenn sie anhand
  gespeicherter Einträge und Habits nachvollziehbar belegt ist;
- Scroll Reset erst nach eigenem Nachfragebeleg starten.

Die bestehende Produktlinie hat weiterhin den belegten Arbeitsstand
M1-RC → M2-Testuser-Woche → Premium-Fundament. Neue App-Arbeit wird so
geplant, dass sie diesen freigegebenen Release-Weg nicht unbemerkt
verdrängt. Eine Architekturänderung von einer gemeinsamen Shell zu
mehreren Store-Apps braucht einen eigenen technischen Entwurf und einen
Owner-Releaseentscheid.

## Messmodell: Upgrade und echter Gewinn

Die Kostenerhebung muss echte Rechnungen und tatsächliche Auszahlungen
verwenden. Aktuell sind VitalOS-Aboerlöse mit 0 dokumentiert; Engine-,
Firebase- und Storebeträge sind im Backlog noch nicht vollständig
eingetragen. Aus diesen offenen Zahlen wird keine Gewinnbehauptung
abgeleitet.

Für jeden Zahler gilt:

`Monatsbeitrag je Zahler = tatsächliche Auszahlung - variable App-, KI-, Support- und Rückerstattungskosten`

`Upgrade-Schwelle = Codex-Max-Monatsbetrag zusätzlich zur aktuellen Engine-Rechnung + neue feste Produktkosten`

`benötigte Zahler = aufrunden(Upgrade-Schwelle / Monatsbeitrag je Zahler)`

Die tatsächliche Store-Auszahlung ist nach Steuern/Abgaben, Plattform- und
Zahlungsgebühren zu verwenden. Kundengewinnung, Support und Daniels
Arbeitszeit werden als Kosten mitgeführt. Der zusätzliche Upgradebetrag
ist die Differenz zur aktuellen Codex-fähigen Rechnung, sofern es ein
Upgrade ist; kein öffentlicher Listenpreis wird als private Kontorechnung
unterstellt.

**Codex-Upgrade-Gate:** erst upgraden, wenn der Produkt-Deckungsbeitrag den
zusätzlichen Codex-Max-Monatsbetrag inklusive neuer fixer Produktkosten
drei Monate hintereinander deckt und mindestens zwei Monatsbeträge als
Liquiditätsreserve vorliegen.

**Vollkosten-Gate:** „Gewinn“ melden wir erst, wenn alle wiederkehrenden
Engine-, Hosting-, Store-, Zahlungs-, Modell-, Marketing-, Support- und
Arbeitszeitkosten abgezogen sind. Ziel ist ein positiver Vollkostenüberschuss
über drei aufeinanderfolgende Monate; bis dahin sprechen wir von
Kostendeckung, Deckungsbeitrag oder Testumsatz.

Die aktuelle OpenAI-Hilfe beschreibt Codex-Nutzung über ChatGPT-Pläne und
führt unter anderem Pro 200 mit 200 USD monatlich auf. Das belegt nicht,
welche Upgradeoption oder welcher Betrag Daniels Konto aktuell anbietet;
vor der Schwellenrechnung ist die Kontorechnung maßgeblich:
[OpenAI: Pro-Tiers und Codex-Nutzung](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers).

## Token- und Kostenkontrolle

- Die bestehende Smart-Log-KI gezielt für den Premium-Mehrwert verwenden.
  Wiederkehrende Summen und einfache Muster zunächst deterministisch
  bilden; zusätzliche Modellaufrufe für Interpretation nur bei belegtem
  Kundennutzen.
- Kein paralleler Bau mehrerer Apps. Jede Code-Runde endet mit einer
  Nutzungs- oder Zahlungsentscheidung; Features ohne Einfluss auf
  Aktivierung, Wiederkehr, Bezahlung oder Betriebskosten werden gestrichen.
- Für jeden KI-Aufruf gibt es vor Freigabe ein maximales Kostenbudget pro
  Nutzer und Monat sowie eine serverseitige Nutzungsgrenze.
- Keine bezahlte Werbung und keine Plattform-Generalisierung, solange eine
  Einzel-App keinen positiven variablen Deckungsbeitrag zeigt.
- Ein zweites Produkt startet erst, wenn das erste den Kernablauf belegt
  hat und die nächste Problemhypothese separat den Nachfrage-Gate passiert.

## Erfolgskriterien

1. Nutzer können das Problem und die Lösung in einem Satz wiedergeben.
2. Die Kernhandlung wird wiederholt und ohne persönliche Betreuung
   abgeschlossen.
3. Ein messbarer Anteil akzeptiert den transparenten Preis und erneuert.
4. Netto-Deckungsbeitrag, Kündigungen, CAC, Supportzeit und Kosten je
   Analyse sind monatlich sichtbar.
5. Der Codex-Upgrade-Gate und danach der Vollkosten-Gate sind erreicht.

V1.2.1 bleibt bis zur Owner-Abnahme die freigegebene Fachstrategie für
Observe/Operate und den aktuellen Release-Pilot. Dieser Entwurf beschreibt
die vorhandene Journal-/Fach-App-Struktur als WarriorOS-inspiriertes
Problemlöser-Portfolio und schlägt den Geschäftsweg vor.
