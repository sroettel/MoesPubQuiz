import type { LieDetectorQuestion, PictureQuestion, ThemedQuestion } from '../../domain/questions'
import { GENERATED_COUNTRIES, type CountryFact } from '../data/countries.generated'

const REGION_LABELS: Record<string, string> = {
  Africa: 'Afrika',
  Americas: 'Amerika',
  Asia: 'Asien',
  Europe: 'Europa',
  Oceania: 'Ozeanien',
}

const eligibleCountries = GENERATED_COUNTRIES

function germanName(country: CountryFact) {
  return country.name
}

function currencyCode(country: CountryFact) {
  return country.currency
}

function wrongRegion(region: string) {
  return REGION_LABELS[{ Africa: 'Asia', Americas: 'Europe', Asia: 'Oceania', Europe: 'Africa', Oceania: 'Americas' }[region] ?? 'Europe']
}

export const COUNTRY_PICTURE_QUESTIONS: PictureQuestion[] = eligibleCountries.slice(0, 100).map((country) => ({
  id: `picture-flag-${country.cca2.toLowerCase()}`,
  type: 'picture',
  prompt: 'Zu welchem Land gehört diese Flagge?',
  answer: germanName(country),
  category: 'Flaggen',
  difficulty: country.unMember ? 2 : 3,
  imageUrl: `https://flagcdn.com/w1280/${country.cca2.toLowerCase()}.png`,
  imageAlt: `Flagge von ${germanName(country)}`,
  source: 'Länderdaten: world-countries (ODbL-1.0), Flagge: Flagcdn / Wikimedia Commons',
}))

export const COUNTRY_LIE_QUESTIONS: LieDetectorQuestion[] = eligibleCountries.slice(0, 100).map((country, index) => {
  const nextCountry = eligibleCountries[(index + 37) % eligibleCountries.length]
  const lieIndex = (index % 3) as 0 | 1 | 2
  const truths: [string, string, string] = [
    `Die Hauptstadt von ${germanName(country)} ist ${country.capital}.`,
    `${germanName(country)} liegt in ${REGION_LABELS[country.region]}.`,
    `Der ISO-Code einer Landeswährung von ${germanName(country)} lautet ${currencyCode(country)}.`,
  ]
  const lies: [string, string, string] = [
    `Die Hauptstadt von ${germanName(country)} ist ${nextCountry.capital}.`,
    `${germanName(country)} liegt in ${wrongRegion(country.region)}.`,
    `Der ISO-Code einer Landeswährung von ${germanName(country)} lautet ${currencyCode(nextCountry)}.`,
  ]
  const statements: [string, string, string] = [...truths]
  statements[lieIndex] = lies[lieIndex]

  return {
    id: `lie-country-${country.cca2.toLowerCase()}`,
    type: 'lie-detector',
    prompt: `Welche Aussage über ${germanName(country)} ist gelogen?`,
    answer: `Aussage ${lieIndex + 1}`,
    category: 'Länder',
    difficulty: (2 + (index % 3)) as 2 | 3 | 4,
    statements,
    lieIndex,
    explanation: `Richtig ist: ${truths[lieIndex]}`,
    source: 'world-countries, ODbL-1.0',
  }
})

const capitalQuestions = eligibleCountries.slice(100, 120).map<ThemedQuestion>((country) => ({
  id: `themed-capital-${country.cca2.toLowerCase()}`,
  type: 'themed',
  prompt: `Wie heißt die Hauptstadt von ${germanName(country)}?`,
  answer: country.capital,
  category: 'Geografie',
  theme: 'Hauptstädte der Welt',
  difficulty: 2,
  source: 'world-countries, ODbL-1.0',
}))

const europeQuestions = eligibleCountries.filter((country) => country.region === 'Europe').slice(0, 20).map<ThemedQuestion>((country) => ({
  id: `themed-europe-${country.cca2.toLowerCase()}`,
  type: 'themed',
  prompt: `Welche Hauptstadt gehört zu ${germanName(country)}?`,
  answer: country.capital,
  category: 'Geografie',
  theme: 'Europa',
  difficulty: 2,
  source: 'world-countries, ODbL-1.0',
}))

const currencyQuestions = eligibleCountries.slice(40, 60).map<ThemedQuestion>((country) => ({
  id: `themed-currency-${country.cca2.toLowerCase()}`,
  type: 'themed',
  prompt: `Wie lautet der ISO-Währungscode von ${germanName(country)}?`,
  answer: currencyCode(country),
  category: 'Wirtschaft',
  theme: 'Währungen',
  difficulty: 3,
  source: 'world-countries, ODbL-1.0',
}))

export const COUNTRY_THEMED_QUESTIONS = [...capitalQuestions, ...europeQuestions, ...currencyQuestions]