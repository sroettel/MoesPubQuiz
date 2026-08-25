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

const publicOutput = {
  name: 'Moe`s PubQuiz derived country database',
  source: 'https://github.com/mledoze/countries',
  sourcePackage: 'world-countries 5.1.0',
  license: 'Open Database License (ODbL) 1.0',
  licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
  transformations: 'Independent countries with a capital, German translation, and currency; sorted by German common name; selected fields only.',
  countries: distilledCountries,
}

await mkdir(new URL('../src/content/data/', import.meta.url), { recursive: true })
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(new URL('../src/content/data/countries.generated.ts', import.meta.url), output, 'utf8')
await writeFile(new URL('../public/data/countries.generated.json', import.meta.url), `${JSON.stringify(publicOutput, null, 2)}\n`, 'utf8')

console.log(`Generated ${distilledCountries.length} compact country records and the public ODbL JSON offer.`)