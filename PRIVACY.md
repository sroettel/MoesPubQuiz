# Datenschutzhinweise

Stand: 25. August 2026

## Verantwortlicher und Kontakt

Verantwortlich für Moe`s PubQuiz ist der Betreiber des öffentlichen
[GitHub-Repositories](https://github.com/sroettel/MoesPubQuiz). Eine
Kontaktaufnahme ist über das zugehörige GitHub-Profil möglich.

Vor einer Nutzung außerhalb des persönlichen Umfelds sollten hier der
vollständige Name, eine ladungsfähige Anschrift und ein direkter Kontakt des
Verantwortlichen ergänzt und die Erforderlichkeit eines Impressums geprüft
werden.

## GitHub Pages

Die Anwendung wird über GitHub Pages bereitgestellt. Beim Abruf verarbeitet
GitHub technisch erforderliche Verbindungsdaten, insbesondere IP-Adresse,
Zeitpunkt, angeforderte Datei, übertragene Datenmenge, Referrer und
Browserinformationen. Informationen zur Verarbeitung durch GitHub stehen in
der [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Lokale Speicherung und Offline-Funktion

Die Anwendung speichert den Fragenpool, die Spielhistorie und
Auswahlstatistiken lokal im Browser mittels IndexedDB. Der Service Worker kann
Anwendungsdateien, Audiodateien und Flaggen im Browsercache speichern, damit
der Standardpool offline funktioniert. Diese Daten werden nicht durch Moe`s
PubQuiz an einen eigenen Server übertragen. Browserdaten können über die
Website-Einstellungen des Browsers gelöscht werden.

## OpenRouter

Nur wenn "KI live" ausgewählt und ein eigener API-Key eingegeben wird, sendet
der Browser den API-Key, die gewählte Spielart, das optionale Thema und die zur
Fragenerzeugung benötigten Inhalte direkt an OpenRouter. Es gelten die
[Datenschutzinformationen von OpenRouter](https://openrouter.ai/privacy). Der
API-Key bleibt im laufenden React-Zustand und wird weder in IndexedDB noch im
Repository gespeichert.

## Externe Inhalte

Flaggen und Audiodateien werden von derselben GitHub-Pages-Website ausgeliefert.
Beim Spielen werden daher keine Inhalte von FlagCDN, Wikimedia Commons oder
Freesound nachgeladen. Externe Verbindungen entstehen erst, wenn ein
Quellen-, Lizenz- oder Rechtshinweis angeklickt oder "KI live" verwendet wird.

Die Anwendung verwendet keine Analyse-, Werbe- oder Trackingdienste und setzt
selbst keine Cookies.