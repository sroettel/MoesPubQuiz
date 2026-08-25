import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import countries from 'world-countries'

const outputDirectory = new URL('../public/media/images/flags/', import.meta.url)
const manifestUrl = new URL('../src/content/data/flags.generated.json', import.meta.url)

const selectedCountries = countries
  .filter((country) => (
    country.independent
    && country.capital.length > 0
    && country.translations.deu
    && Object.keys(country.currencies).length > 0
  ))
  .sort((left, right) => left.translations.deu.common.localeCompare(right.translations.deu.common, 'de'))
  .slice(0, 100)

await mkdir(outputDirectory, { recursive: true })

const manifest = []
for (const country of selectedCountries) {
  const code = country.cca2.toLowerCase()
  const sourceUrl = `https://flagcdn.com/${code}.svg`
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`Could not download ${sourceUrl}: ${response.status}`)

  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.toString('utf8', 0, 500).includes('<svg')) throw new Error(`${sourceUrl} is not an SVG file`)

  await writeFile(new URL(`${code}.svg`, outputDirectory), bytes)
  manifest.push({
    cca2: country.cca2,
    country: country.translations.deu.common,
    file: `/media/images/flags/${code}.svg`,
    sourceUrl,
    provider: 'FlagCDN / Flagpedia',
    provenanceUrl: 'https://commons.wikimedia.org/wiki/Category:SVG_flags_by_country',
    rightsNote: 'National flag; copyright, trademark, and emblem restrictions vary by jurisdiction.',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  })
}

await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Downloaded and recorded ${manifest.length} local flag files.`)