# Compliance Record

Review date: 25 August 2026

This record documents the technical provenance review for the publicly hosted,
non-commercial Moe`s PubQuiz application. It is not legal advice.

## Country database

- Source: `world-countries` 5.1.0, derived from <https://github.com/mledoze/countries>
- License reviewed: ODbL 1.0, <https://opendatacommons.org/licenses/odbl/1-0/>
- Transformations: independent entries with a capital, German translation, and
  currency; sorted by German common name; quiz fields retained
- Public offer: `public/data/countries.generated.json`
- Generator: `scripts/generate-country-content.mjs`

## Flags

- Download source: <https://flagcdn.com/>
- Provider: FlagCDN / Flagpedia
- Stated provenance basis: Wikimedia Commons country flag category
- Local files: `public/media/images/flags/`
- Per-file evidence: exact download URL, country, byte count, SHA-256 checksum,
  provenance URL, and jurisdiction caveat in
  `src/content/data/flags.generated.json`
- Modification status: downloaded SVG bytes are served without modification
- Generator: `scripts/download-flags.mjs`

National flags can remain subject to copyright, trademark, protocol, or emblem
rules that vary by jurisdiction. The manifest therefore does not make a blanket
public-domain claim.

## Audio

- Sources: Wikimedia Commons and the ESC-10 subset of ESC-50
- Local files: `public/media/sounds/`
- Per-file evidence: title, creator, source URL, license, supplied credit, byte
  count, SHA-256 checksum, and source provenance in
  `src/content/data/sounds.generated.json`
- Modification status: Commons originals and ESC-10 five-second files are used
  without further audio editing
- Generators: `scripts/download-commons-sounds.mjs` and
  `scripts/download-esc10-sounds.mjs`

The 25 August 2026 review found only Public Domain, CC0, CC BY, and CC BY-SA
entries in the selected catalog. No CC BY-NC, CC BY-ND, or Sampling+ entry was
found. The compliance test rejects unexpected license labels.

## Verification

Run after any media or data update:

```bash
npm run content:generate
npm run content:flags
npm test
npm run lint
npm run build
```

The tests verify local file existence, byte counts, SHA-256 checksums, recognized
sound licenses, required CC attribution fields, source/license URLs, flag
provenance fields, and the public ODbL offer.