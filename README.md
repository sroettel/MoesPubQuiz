# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Moe`s PubQuiz

  Ein lokaler PubQuiz-Spielleiter mit sechs Spielarten, Teamwertung und optional live generierten Fragen über OpenRouter.

  ## Funktionen

  - Picture Quiz mit Länderflaggen
  - Who Am I, Themed Rounds, Lie Detector, Sound- und Emoji-Quiz
  - Lokaler Fragenpool mit Offline-Unterstützung als PWA
  - KI live über OpenRouter
    - Kostenlos: GLM mit OpenRouter-Free-Fallback
    - Bezahlt: `openai/gpt-5.4-mini`

  Der OpenRouter API-Key wird nur im aktuellen Browserzustand gehalten und nicht in der Datenbank gespeichert. Für das bezahlte Modell benötigt das OpenRouter-Konto Guthaben.

  ## Entwicklung

  Voraussetzung: Node.js 24 oder neuer.

  ```bash
  npm install
  npm run dev
  ```

  ## Qualitätssicherung

  ```bash
  npm test
  npm run lint
  npm run build
  ```
import reactX from 'eslint-plugin-react-x'
