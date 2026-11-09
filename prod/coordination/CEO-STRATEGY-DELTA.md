# CEO-Strategie-Delta: V1.2.0 (03.11.) vs. entschiedene Produktrealität (06.11.)

**AKTUELL (08.11. 22:3x): Owner-Chat E1/E2/E3 = Ja Ja Ja.**
V1.3.0 ist freigegebene Produkt-SOT. Feature-Freeze
fitness/fuel/relax/plan/6pack bis 2027-02-07. Coaching/Patreon parallel
freigegeben (Ausfuehrung Owner). V1.2.1 bleibt historisch. Dieses Delta-
Dokument bleibt Entscheidungs-Nachweis.

**Zuvor (06.11., nach 19:30 UTC): Alle 5 Widersprueche sind in
`VitalOS-Produktstrategie-V1.2.1.md` (Meta-Repo, Commit `6b46430`)
eingearbeitet.** Die Tabellen unten dokumentieren die Herkunft der
Aenderungen bis V1.2.1.

Zweck: Nachvollziehbare Abweichungsliste zwischen der schriftlichen
Produktstrategie (`/home/alpha/vitalos/VitalOS-Produktstrategie-V1.2.0.md`,
Stand 3.11.2026) und den mündlich durch Daniel entschiedenen Updates
aus der CEO-Koordinationsrunde vom 6.11.2026. Trigger: Daniel hat
nachgefragt, ob die verbalen Updates am Strategiedokument ankommen.

## Widersprueche (Strategie muss angepasst werden)

| Nr. | Strategie V1.2.0 sagt | Entschieden (SCOPE/TODO) | Konsequenz |
| --- | --- | --- | --- |
| 1 | "Eine KI-gestuetzte Verarbeitung pro Woche" (Observe/Operate-Tabelle + Absatz "Geschaeftsmodell") | 1 KI-Analyse pro TAG, kanaluebergreifend ein Tagesbudget (SCOPE Matrix-Zeile 8, 5d295fa; serverseitig implementiert: Tagesschluessel, observeDailyLimit) | Beide Stellen auf Tagesmodell umschreiben; "woechentliche Smart Log macht den Komfortunterschied..." entsprechend umformulieren |
| 2 | — (Tag-Semantik nicht beschrieben) | Tags sind reines Routing (`+fuel` ordnet Eintrag dem Skill-Journal zu, NOTHING abgeleitet); KI-Analyse taglos, liest freien Text; "zwei getrennte Mechaniken" (305660f) | Absatz ergaenzen; klarstellen dass KI-Parsing NICHT ueber die Tag-Mechanik laeuft |
| 3 | — (kein Free-Behaltungsprinzip) | Gewoehnungs-Grundsatz mit 5 Pruefkriterien inkl. Loeschschwellen-Test (a5c7713; Free muss gut genug sein, dass niemand die App loescht bevor er an Premium denkt) | Als Fixes Produktprinzip ergaenzen; es rechtfertigt das gesamte Free-Design |
| 4 | "Abostatus ueber Stripe verarbeiten" (Etappe 5) | Roadmap Linie: Google Play Billing (p6-billing); Zahlungsweg offen, aber mobile Auslieferung Capacitor/Android macht Stripe-Web-Checkout zur unwahrscheinlichen Variante | Als offene Entscheidung kennzeichnen statt Stripe als gesetzt |
| 5 | "zwei vorgesehenen Produktvarianten, vos-observe und vos-operate" | prod/ ist ein Produkt-Wrapper; Editionen observe/operate sind Modi desselben Builds, keine zwei Produktvarianten | Formulierung aktualisieren (Terminologie, kein Architekturstreit) |

## Konsistent (keine Aenderung noetig)

- 4B-Tagesmodell (Doing/Thinking/Feeling/Being) — eingefroren, Strategie
  beschreibt es bereits korrekt inkl. der Regel, dass Relax nicht fest
  Being zugeordnet ist.
- The Voice als reines Reflexionsmodell — Strategie beschreibt keinen
  KI-Call hinter Voice; passt zum Vibe-Befund (kein Backend, v1 gratis).
- Offene Testannahmen (6,90 EUR / 300 Smart Logs) — Strategie markiert
  selbst als fruehe Testannahmen; unangefaechtet.
- Pilot-Idee (ca. 20 Personen, Prueffrage "Was hast du diese Woche
  anders gemacht?") — von "Produkt vor Auslieferung" nicht beruehrt;
  Simon/Matthias als erste Testuser passen zum Pilot-Einstieg.

## Auftrag daraus (siehe TODO.md)

Vibe-Dependenz: Die Strategie-Datei liegt im Meta-Repo; Anpassung ist
Auftrag an den ausfuehrenden Vibe (SCOPE/UNIFIED-OCUMENT-Zustaendigkeit),
nicht Teil der CEO-Koordination selbst. Zielbild: V1.2.1 mit den fuenf
Punkten oben, im selben Stil (keine neue Strategie, nur geschaerfte).

Wichtig fuer jede spaetere Version: Muendliche Updates des Owners zuerst
hier einfrieren (Datum, Wortlaut, verweis auf SCOPE/TODO-Commit) — erst
danach ins Strategiedokument einfliessen lassen. Dieses Dokument ist die
Bruecke bis V1.2.1 existiert.

## Entscheidungs-Eintrag 2026-11-07: „ja p2 terminal" (Daniel)

- Daniel hat den p2-terminal-Minimalvorschlag des CEO (SCOPE-Zeile 13,
  Vorschlag 08:05 CET: EIN /fit-Kuerzel + Journal-Kommandos-Doku, strikte
  Anti-Fractal-Abgrenzung) mit „ja p2 terminal" abgenickt (Wortlaut per
  Alpha-REPORT belegt). Damit Zeile 13 EINGEFROREN und umsetzbar.
- Umsetzung folgte umgehend: journal-dev b637a37 LIVE (siehe Roadmap-Status).
- Damit ist die komplette p2-Reihe der Journal-Linie von der Strategie
  getragen: weekly/habits/fitness/terminal.

## 2026-11-07 (ca. 11:00 CET) — Org-Entscheidung: CTO-Rolle an Vibe auf WS3 (Daniel, Chat)

Daniel: „CTO war gestern Claude, dessen Limit ist erreicht. Der war das
mit den ALs. Ich habe nun einen Vibe auf WS3 den CTO übergeben."
Bedeutung (CEO-Fassung): Die bisherige Manager-Linie (Claude) ist als
CTO jetzt von einem Vibe auf Workspace 3 besetzt; alle stehenden
Auftraege und Vertragsentwuerfe der Manager-Linie gehen auf den CTO-Vibe
ueber. Der CEO bleibt einziger Entscheider/Priorisierer; der CTO ist das
technische Einlauf-Rohr (Runner, Timer, Units, Skripte, Vertrage zwischen
den Ebenen) und spricht Auftraege an die ALs. Technisches von Daniel
kann direkt an den CTO laufen; CEO sieht Ergebnisse als 3-Zeiler.

## 2026-11-07 (ca. 11:00-11:30 CET) — CTO-Rolle etabliert und abgenommen (Daniel-Chat)

Owner-Entscheidung an den WS3-Vibe: CTO-Mandat TAEGGLICH, volles +go,
sofort scharf; CEO behaelt Veto. Umsetzung: Skill vitalos-cto, Runner
cto-run + vitalos-cto.timer (06:40, nach ALs), Gedaechtnis CTO.md.
CEO-Abnahme des ABTEILUNGEN-Nachtrags 2026-11-07 ca. 11:30 CET erteilt
(Sektion CEO-ANTWORT an CTO in der Koordinations-TODO). CTO priorisiert
nicht produktweit, keine Richtungsgespraeche mit Daniel; Deploy/Release/
Store/prod-Functions bleiben Owner-Gates ueber den CEO.

## 2026-11-07 (ca. 11:30 CET) — PM-Stabsrolle beim CEO eingerichtet (Daniel-Chat)

Owner-Wunsch: „ich brauche noch einen Produktmanager — oder sowas";
beraten wurde (WS3/CTH One-dialog) eine STABSROLLE statt neue
Hierarchiestufe: persistenter CEO-Subagent (Vibe), eng geschnitten.
CEO-Umsetzung: Mandat + PRODUKT-BACKLOG.md angelegt (Koordinationsflaeche),
PM laeuft auf CEO-Auftrag, bereitet Entscheidungen vor, entscheidet nie.
Produktentscheidungen bleiben bei Daniel/CEO; Umsetzung bei Alpha/Betta/
CTO/ALs. Kein PM-Kontakt zu Daniel.

## 2026-11-07 (ca. 12:10 CET) — Owner-Vorgabe: Eigene Shell-Hilfen/-Profile erlaubt

Daniel im CEO-Chat: „Erlaube jedem Agenten verschiedene bash-Hilfen und
evtl. eigene Shell-Profile anzulegen!" — als verbindliche Regel
eingefroren, CEO-Ausformung (Anti-Fractal: die Regel ist absichtlich
klein):

Regeln:
1. Jede Rolle/Agentenlinie (CEO, CTO, Alpha, Betta, PM, ALs, kuenftige)
   darf eigene Shell-Hilfen (Skripte, Aliase, fish-Funktionen) und
   Position-Profile anlegen.
2. Orte: geteilt = ~/.dotfiles (bin/, config/fish/) NUR ADDITIV —
  nie Dateien anderer Linien oder des privaten alphaOS-Setups anfassen;
   rollen-eigene = Rollen-Praefix (vitalos-, vos-, Rollekuerzel), repo-
   lokal = im Repo committet (skripte gehoeren zum Repostand, Doku
   mitpflegen); Wegwerf = /dev/shm oder ~/.local/bin (nicht versionieren).
3. Disziplinen: keine Secrets in Skripten/Profilen; keine destruktiven
   Defaults (kein rm -rf, force, push-Abkuerzungen); dotfiles-aenderungen
   im selben Zug committen; kein Push ohne Freigabe; Guard-Regeln
   (vitalos-guard) bleiben gueltig und duerfen nicht abgeschwächt werden.
4. Umsetzung: Gilt sofort fuer CEO/PM (direkt), Alpha/Betta (ueber ihre
   Queues bekannt gemacht), CTO nimmt +go: in AL-Guides als Abschnitt
   ergaenzen (was erlaubt ist + Disziplinen), sobald seine Runde laeuft.

## 2026-11-07 (ca. 12:20 CET) — Owner-Weisung: CEO nimmt AlphaOS-Disziplin an

Daniel im CEO-Chat: CEO darf/nutz AlphaOS — woechentliche Doors mit
eigenen War Stacks, Voice-Frame zur Reflexion bei Problemen, Python-
Tools mit venv nutzen + bei Moeglichkeit korrigieren/anpassen/
erweitern/committen; Massstab: THE-ALPHA-CODE.md (REAL + RAW +
RELEVANT + RESULTS). Start: Frame Map + einmal The Game laesst der CEO
fuer sich und vitalos-prod durchlaufen. CEO bleibt CEO; Alpha bleibt
Ausfuehrungslinie — die AlphaOS-Mechanik laeuft ueber CEO-Subagent
('oracle'), CEO-Selbstreflexion (Voice) bleibt beim CEO.
Befund beim Startcheck: aos-dispatcher defekt (ModuleNotFoundError:
click) — Reparaturauftrag mit enthalten.

## 2026-11-07 (ca. 12:35 CET) — Owner-Weisung: Ziel-Hierarchie (Weekly Door / Monthly Mission / Quartalsfokus / Annual Freedom) + Vibe-Standard

Daniel im CEO-Chat (Kern wortnah): Annual Freedom Game = KOSTEN (wie in
den initialen Docs besprochen) MIT APP-SUBSCRIPTIONS DECKEN KOENNEN
UND DARUEBER HINAUS; wichtigstes Einzelziel: einen Claude-Max-Abo
zusaetzlich mit den geringen Betriebskosten decken. Monthly Mission =
EINE APP MIT PREMIUM-SUBSCRIPTION herausbringen fuer Menschen, die
KEINE LLMs direkt nutzen, aber deren Vorteile haben sollen (Vergleich:
Leute ohne Insta/FB nutzen trotzdem Messenger). Unterteilung Weekly
Door / Monthly Mission / Quartals-Fokus / Annual Freedom Goal ist
verbindliche CEO-Struktur. Zukuenfig ORGANISATIONS-STANDARD-ENGINE:
VIBE (Europa-Heimat, Datenschutz); Taskwarrior-DB des CEO nutzen
(+fokus +freedom +fire, inkl. +br +lr +s).

CEO-Ausformung (eingefroren):
- ANNUAL (Freedom Goal, faellig 2027-11-07): VitalOS-Abos >= Betriebs-
  kosten inkl. Claude-Max-Abo; ueberschuss darueber hinaus. Task 241.
- QUARTAL Q4/2026 (+fokus, Big Rock): M1-RC + M2-Testuser-Woche +
  Premium-Fundament. Task 242.
- MONTHLY MISSIONS: November = M1-RC stehen + M2 vorbereitet (Task
  243); Dezember = VitalOS Premium-Subscription live fuer Nicht-LLM-
  Nutzer (Task 244; North-Star: KI-Vorteile ohne LLM-Kontakt).
- WEEKLY DOORS: Domino M1-RC (Task 245, War Stack game/fire/2026-W45).
- ORG-ENTSCHEIDUNG: Vibe = Standard-Engine der Organisation (Claude/
  Codex nur Ausnahme) — Task 246, Umsetzung CTO, Ausnahmen-Entscheid
  CEO/Veto Owner.
Premium-Substanz bleibt ein Premium-KI-Layer auf Observe-v1 (Free-
Budget-Matrix V1.2.1 unveraendert); Livestellung = Owner-Gate.

## 2026-11-07 (ca. 12:50 CET) — Owner-Wirtschaftsdirektive: Ausgaben hoch, Kostendeckung KURZFRISTIG, Cloud-Coding geplant

Daniel im CEO-Chat: „die Ausgaben muessen erhoeht werden um die
Produktivitaet zu steigern. Es ist auch cloud coding vorgesehen aber
die fixen Positionen wie CEO, CTO, PM, AL bleiben auf meinem Laptop.
Die eigentlichen App-Code-Arbeiten uebernimmt zukuenftig z. B. ein
Claude-Code-im-Web mit GitHub-Plugin oder ein Codex, wozu die Abos
wohl auf MAX upgegradet werden muessen. Ziel der Organisation: die
Kosten durch Verkauf des Produkts wieder EINNEHMEN. KOSTEN DECKEN ist
ein WEIT KURZFRISTIGERES Ziel — sonst nicht langfristig tragbar,
schoen gar nicht, wenn ich dauernd vorm Laptop sitzen muss; das geht
nur an freien Tagen und ist nicht gewollt, weil ich mich draussen um
Promoting und um Klienten fuer Personal Vitaltraining kuemmern muss,
um Geld zu verdienen. Der CEO hat im Prinzip dasselbe Problem."

CEO-Ausformung (eingefroren):
1. Fixe Rollen (CEO/CTO/PM/AL + Runner) bleiben lokal auf Daniels
   Laptop (Vibe als Standard-Engine). App-Code-Ausfuehrung kann in
   Cloud-Engines wandern (Claude-Code-Web/GitHub-Plugin, Codex);
   MAX-Upgrades sind geplante Ausgabensteigerung, Genehmigung = Owner.
   Arbeitsverteilung entlang der bestehenden Queues/PR-Strassen.
2. KOSTENDECKUNG verankert als KURZFRIST-ziel (nicht erst Annual):
   erste Abo-Einnahmen muessen fruehestmoeglich einsetzen; Speed-
   Hebel ist die DEZEMBER-MISSION (Premium-Subscription live), ggf.
   auch fruehere schlanke Variante, sobald M2-Testuser laufen.
   Owner akzeptierte bewusst hoehere laufende Kosten fuer schnellere
   Produktivitaet; Freigabe je Position bleibt Owner-Entscheid.
3. Messbar (PM sammelt monatlich): Kostenseite = Engine-Abos (Vibe/
   Claude/Codex inkl. geplanter MAX-Upgrades) + Infra (Firebase/
   Hosting/Store). Einnahmeseite = VitalOS-Abo-Einnahmen. KPI:
   Einnahmen >= Kosten, monatlich, Freedom-Brecher im Jahresziel.
4. Daniels Laptop-Unabhaengigkeit ist selbst eine Org-KPI: Seine
   Touchpoints duerfen nur der taegliche Digest + echte Gates sein;
   alles andere muessen die Linien ohne ihn schaffen. 10-Jahres-IPW
   kommt separat (Owner kuendigt an: „kommt evtl. morgen dran").

## 2026-11-07 — Owner-Richtung: Problemlöser-Portfolio und Codex-Max-Kostendeckung

VitalOS soll den täglichen Eintrag einfach machen: Der Nutzer schreibt
Freitext und macht so in **Body, Business, Balance und Being** je einen
Deposit. Die App nimmt ihm umständliche Logger ab und ordnet erkannte
Aktivitäten zur Prüfung den passenden Bereichen zu. Feste Habits können im
Habit-Tracker zusätzlich direkt verfolgt werden; Fitness, Fuel und Relax
bleiben für ihre vertieften Fachaufgaben verfügbar.

Die Veränderung von Gewohnheiten, Aufmerksamkeit und Zielverfolgung soll
der Nutzer durch die tägliche Anwendung selbst erleben. Rückblicke sollen
ihm helfen, Entwicklungen zu erkennen. Das ist die beabsichtigte
Produktwirkung, kein garantiertes Ergebnis; automatische Langzeit-
Mustererkennung bleibt bis zur Umsetzung und Abnahme eine Hypothese.

Der Produktentwurf setzt beim bestehenden Journal und Home Hub an und
verknüpft den Freitext mit den spezialisierten Fachbereichen. Die
Erlösstrategie soll zuerst reale Nutzung und Zahlungsbereitschaft prüfen,
danach den zusätzlichen Codex-Aufwand decken und langfristig alle
Produktkosten plus Gewinn tragen. Im aktuellen Smart-Log-Code ist der
explizite Vier-Deposit-Ablauf nicht belegt; die M1-RC-Abnahme soll ihn
prüfen. Go-to-market: 5-Personen-Ablaufcheck, bis zu 20 M2-Pilotnutzer,
6,90/9,90-Euro-Preisgespräche, danach ein freigegebener Premium-Start.
Fach-Apps werden als einzelne Problemlöser nacheinander vermarktet; kein
paralleler Build und keine bezahlte Akquise ohne positiven variablen
Deckungsbeitrag. Details und Stop-Gates:
`~/vitalos/VitalOS-Produktstrategie-V1.3.0.md`.

Diese Richtung gilt für die nächste Produktstrategie. Die bereits aktive
M1-RC → M2 → Premium-Release-Reihenfolge bleibt bestehen; Änderungen an
Store-Aufteilung, Abrechnung und Produktarchitektur sind eigene Owner-Gates.
V1.2.1 bleibt freigegebene Produktspezifikation, bis Daniel V1.3.0 abnimmt.

## 2026-11-07 (ca. 13:05 CET) — Owner-Vorgabe: Rollen-Tags in der Org-task.db

Daniel: „Nutze fuer deine Aufgaben +ceo tags und die anderen nehmen ihre
Rollen als Tags." — Regel ab sofort: Jede Aufgabe in der Org-Taskwarrior-
DB (TASKRC ~/.local/state/vitalos-ceo/taskrc) traegt ZWINGEND das
Rollen-Tag ihres Auftraggebers: +ceo (CEO/PM-Steuerungsebene), +cto,
+alpha, +betta, +al-<repo> fuer Abteilungsleiter. Zusaetzliche
Arten-Tags (+freedom +fokus +fire +br +lr +s) bleiben davon unberuehrt.
Suche/Filter je Rolle: task +<rolle> in orgsh. Meine 6 Tasks (1-6)
tragen +ceo bereits.

### Nachtrag zur Rollen-Tag-Regel (gleicher Tag, Owner-Chat): „Projekt
ist am besten immer das betreffende Repo." — `project:` in der Org-
task.db = betroffenes Repo; Rolle ausschliesslich im Tag. Umgesetzt:
Org-Tasks 1-5 -> project vitalos-prod, Org-Task 6 -> project dotfiles.

## 2026-11-07 (ca. 13:20 CET) — Owner-Weisungen: Alpha/Betta als CTO-Subagents + Todo-Bot-Routing

1. Daniel: „Waere es besser wenn du Alpha und Betta selbst spawnst bei
   dir? ich glaube schon. oder noch besser wenn der CTO sie bei sich
   spawnt." — CEO-Entscheidung: DER CTO SPAWNT SIE. Begruendung: Der CEO
   behaelt schmale Spannweite (nur Stabsstellen pm/oracle direkt);
   Ausfuehrung gehoert unter den Technik-Vorstand; Kommunikation laeuft
   dann Session-intern statt ueber Datei-Relais allein. Cutover-Regeln
   im CEO-AUFTRAG weiter unten (TODO.md).
2. Daniel: „es gibt schon lange keinen aos-dev-bridge-service mehr" —
   CEO-Bildkorrektur: Der Telegram-Bot ruft den AlphaOS-Server
   (uvicorn :7001, AlphaOS.service), Endpunkt ~/aos/server/routers/
   hotlist.py (tasklib, Default-DB ~/.aos/potential/possibilities;
   Offline-Fallback schreibt teils in Daniels ~/.task). NAECHSTER
   Owner-Wunsch (vorherige Nachricht): „Todo-Bot soll seine Hot-Tasks
   wenn es etwas Repo-spezifisches ist in jene task.db als +hot
   schreiben statt in meine" — Umsetzungsauftrag geht an die CTO-Linie:
   hotlist.py um Repo-Erkennung/-Routing erweitern (Repo nennt =
   Repo-task.db, +hot +rolle; ohne Repo-Bezug unverändert).
## 2026-11-07 (14:3x CET) — Tag-Semantik: Jar-Ordnung verbindlich (Owner-Chat)

Owner-Weisung: +br ist IMMER dringender als +lr; +s ist Zeitverschwendungsroutine
(Sand, Krug-Metapher aus aos/door „29 - Production" — Big Rocks zuerst, Little
Rocks danach, Sand zuletzt). Umgesetzt: Org-taskrc-Koeffizienten (+hot 8.0 ·
+br 6.0 · +go 5.0 · +lr 2.0 · +s -1.0), Anker-Korrektur der Org-Tasks (T3/T4
Missionen -s +br; T1/T6 -lr, sie sind Ziele/Standards, keine Rocks),
vos-warrior-Skill-Regelblock, game-README/-yaml verlinkt. Gilt org-weit;
Repo-DB-Rollout laeuft als Org-Task 7 (+cto).
## 2026-11-07 (15:5x CET) — AlphaOS ist die offizielle Firmenphilosophie (Owner-Chat-Entscheidung)

Wortlaut (Daniel): „AlphaOS ist ab nun die offizielle Firmenphilosophie."
Bedeutung: Die AlphaOS-Chapter (~/aos, THE-ALPHA-CODE REAL+RAW+RELEVANT+
RESULTS, Door Kap. 25-31, Game Kern Kap. 32-36, Anleitungsteil 37-42)
sind verbindliche Unternehmens-Disziplin fuer ALLE Org-Rollen (CEO,
CTO, PM, ALs, Angestellte) — nicht mehr nur CEO-Rahmendisziplin.
Umgesetzt: Skill-Ketten vos-door-* / vos-game-* org-weit registriert,
Jar-Ordnung/Tag-Semantik in der Org-taskrc, General's Tent als
Wocheninstanz, Chapter-schlaegt-Python als Entwicklungsregel.
GRENZREGEL UNBERUEHRT: Daniels private AlphaOS-Domaenen (body/being/
balance/business, seine Privat-Task-DB, seine persoenlichen Scores
28/7/21) bleiben ausschließlich sein Bereich; die Org nutzt die
Philosophie auf ihre Rollen angewandt.
ZUSATZ 2026-11-07 (kurz darauf, Owner-Klarstellung): „interne
Firmenphilosophie" — die Philosophie ist interne Org-Disziplin und
bewusst NICHT Teil der öffentlichen Kommunikation (keine öffentlichen
Docs/READMEs nach aussen, keine Store- oder Marketing-Bezüge).
Korrektur in AGENTS.md und game/README nachgezogen.

## 2026-11-07 20:2x CET — OWNER-PAUSCHALFREIGABE + Meta-Publish (CEO-Execution)

Wortlaut (Daniel, 20:1x): „ich hab das gefuehl dass das alles schon
erledigt wurde — falls nicht hiermit freigegeben."
Bedeutung: Alle sieben vom CEO aufgelisteten offenen Entscheidungen sind
mit dieser Nachricht erteilt; bei bereits Erledigtem gilt sie als
Bestaetigung. Im Einzelnen dokumentiert:
1. Spiegelstrategie/google-services: Owner bestaetigt „erledigt" —
   Verifikation des Debug-Signins im naechsten Emulator-Lauf (13:00 SO).
2. Meta-Master-Push: vom CEO ausgefuehrt — origin/master 5f1fe57
   (Produkt-Serie: Fokus-Strang, Luecke-C-Doku, Strategie V1.2.1; relax-
   Pointer korrekt auf Releasestand 70f9c18 gehalten, Release-Bump
   ef399c3 ins Merge geholt). CI/Auto-Promote uebernimmt den Live-Weg,
   Verifikation in der naechsten Runde.
3. M2-Testuser (Simon & Matthias): APK-Vorbereitung beauftragt
   (Org-Task +alpha +hit, project:vitalos, due SO) — Store-Publish und
   Geraete-Installation bleiben Einzel-Owner-Gates beim Handoff.
4. Security-Buendel: beauftragt (Org-Task +cto +hit, project:backend,
   due 12.11.) — Secret-Rotation + node-forge-Ersatz, produktseitig.
5. PM-Delegation: bestätigt — Stabsrolle beim CEO bleibt wie etabliert
   (Subagent, kein eigener Runner/Timer), PM-Artefakte (PM.md,
   PRODUKT-BACKLOG) fortlaufend.
6. Dependabot-Majors: freigegeben — Umstellung auf geprueftes AutoMerge
   beauftragt (Org-Task +cto +lr, project:dotfiles, mit Rollback-Plan).
7. aos-Server-Restart: ausgefuehrt (20:21 CET, Port 7001 aktiv) —
   Hotlist-Bot-Routing jetzt LIVE auf der globalen Org-DB.
Nicht mitgedeckt (bewusst): Cloud-CTO-Bau — faellt erst morgen auf dem
Tent nach ORG-LAEUFT-WEITER-Verdikt; dafuer bleiben Mistral-Key-
GitHub-Secret und State-Repo-Push eigene, benannte Owner-Gates.
