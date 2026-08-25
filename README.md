# Moe`s PubQuiz

Moe`s PubQuiz ist ein deutschsprachiger, für iPad und Desktop optimierter PubQuiz-Spielleiter. Die App kombiniert einen lokalen Fragenpool mit optional live über OpenRouter generierten Fragen, Teamwertung und einem installierbaren Offline-Modus.

Die veröffentlichte App ist unter <https://sroettel.github.io/MoesPubQuiz/> erreichbar.

## Spielarten

| Spielart | Inhalt |
| --- | --- |
| Picture Quiz | Länderflaggen erkennen |
| Who Am I? | Personen anhand zunehmend konkreter Hinweise erraten |
| Themed Rounds | Fragen zu einem gemeinsamen Thema |
| Lie Detector | Unter drei Aussagen die erfundene finden |
| Guess the Sound | Lokal bereitgestellte Geräusche erkennen |
| Emoji Quiz | Filme und Serien anhand von Emojis erraten |

Der lokale Startpool enthält 600 Aufgaben, jeweils 100 pro Spielart. Gespielte Fragen werden in einer lokalen Historie erfasst, damit selten gespielte Aufgaben bevorzugt ausgewählt werden.

## KI live mit OpenRouter

Im Setup jeder Spielart kann zwischen dem lokalen Standardpool und **KI live** gewählt werden. Die App unterstützt zwei Modellmodi:

- **Kostenlos:** `z-ai/glm-5.2:free` mit `openrouter/free` als Fallback
- **Bezahlt:** `openai/gpt-5.4-mini`

Für KI live wird ein eigener OpenRouter API-Key im Setup eingegeben. Der Key bleibt nur im aktuellen React-Zustand des Browsers und wird weder in IndexedDB noch im Repository gespeichert.

Für das bezahlte Modell benötigt das OpenRouter-Konto Guthaben. Zusätzlich muss das Kreditlimit des verwendeten API-Keys die Anfrage erlauben. Guthaben kann unter [openrouter.ai/credits](https://openrouter.ai/credits) verwaltet werden.

### Mediengebundene KI-Fragen

Picture- und Sound-Fragen verwenden ausschließlich geprüfte Assets aus dem lokalen Medienpool. Die KI darf passende Assets auswählen, kann aber keine neuen Bilder oder Audiodateien erzeugen.

Der aktuelle Picture-Pool enthält nur Länderflaggen. Ein Schwerpunkt wie "Politiker" erzeugt daher keine Personenbilder; Frage, Antwort und Bild bleiben immer an dasselbe geprüfte Flaggen-Asset gebunden.

## Offline und PWA

Die App ist als Progressive Web App konfiguriert und kann auf unterstützten Geräten installiert werden.

- App-Bundle, Hintergrundbild und lokale Audiodateien werden vorab gecacht.
- Flaggen von Flagcdn werden nach dem ersten Laden im Runtime-Cache gespeichert.
- Standardpool, Spielhistorie und Auswahlstatistik liegen lokal in IndexedDB via Dexie.
- KI live benötigt weiterhin eine Internetverbindung.

## Technik

- React 19 und TypeScript 6
- Vite 8
- Dexie / IndexedDB
- Zod zur Validierung von KI-Antworten
- Vitest und ESLint
- `vite-plugin-pwa` / Workbox
- Lucide React Icons

## Lokale Entwicklung

Voraussetzung: Node.js `^20.19.0` oder `>=22.12.0` und npm.

```bash
git clone https://github.com/sroettel/MoesPubQuiz.git
cd MoesPubQuiz
npm install
npm run dev
```

Vite zeigt anschließend die lokale URL an, standardmäßig `http://localhost:5173/`.

## GitHub Pages

Pushes auf `main` werden über `.github/workflows/deploy-pages.yml` geprüft,
gebaut und auf GitHub Pages veröffentlicht. Im Repository muss unter
**Settings > Pages > Build and deployment** einmalig **GitHub Actions** als
Quelle ausgewählt werden.

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | TypeScript prüfen und Produktionsbuild erzeugen |
| `npm run preview` | Produktionsbuild lokal anzeigen |
| `npm test` | vollständige Vitest-Suite ausführen |
| `npm run lint` | ESLint ausführen |
| `npm run content:generate` | Länderdaten und Länderfragen neu generieren |
| `npm run content:sounds` | ESC-10-Sounds herunterladen/aufbereiten |
| `npm run content:sounds:commons` | Wikimedia-Commons-Sounds herunterladen/aufbereiten |

## Qualitätssicherung

Vor einem Push sollten alle Prüfungen erfolgreich sein:

```bash
npm test
npm run lint
npm run build
```

## Daten und Quellen

- Länder- und Flaggenfragen basieren auf `world-countries`; Flaggen werden über Flagcdn/Wikimedia Commons geladen.
- Audiodateien enthalten ihre jeweilige Quelle, Urheberangabe und Lizenz im generierten Sound-Manifest.
- KI-generierte Fragen zeigen das tatsächlich von OpenRouter verwendete Modell in der Quellenangabe an.
- Das maritime Hintergrundbild wurde vom Projekteigner mit GitHub Copilot erstellt und nicht aus einer externen Bildquelle übernommen.

Die konkreten Quellenangaben werden bei jeder Frage zusammen mit der Lösung angezeigt.
Vollständige Lizenz- und Urheberhinweise stehen in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).