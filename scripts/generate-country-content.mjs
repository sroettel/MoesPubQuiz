import { mkdir, writeFile } from 'node:fs/promises'
import countries from 'world-countries'

const distilledCountries = countries
  .filter((country) => (
    country.independent
    && country.capital.length > 0
    && country.translations.deu
    && Object.keys(country.currencies).length > 0
  ))
  .sort((left, right) => left.translations.deu.common.localeCompare(right.translations.deu.common, 'de'))
  .map((country) => ({
    cca2: country.cca2,
    name: country.translations.deu.common,
    capital: country.capital[0],
    region: country.region,
    currency: Object.keys(country.currencies)[0],
    unMember: country.unMember,
  }))

const output = `export interface CountryFact {
  cca2: string
  name: string
  capital: string
  region: string
  currency: string
  unMember: boolean
}

export const GENERATED_COUNTRIES: CountryFact[] = ${JSON.stringify(distilledCountries, null, 2)}
`

await mkdir(new URL('../src/content/data/', import.meta.url), { recursive: true })
await writeFile(new URL('../src/content/data/countries.generated.ts', import.meta.url), output, 'utf8')

console.log(`Generated ${distilledCountries.length} compact country records.`)