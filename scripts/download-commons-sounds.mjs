import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const API_URL = 'https://commons.wikimedia.org/w/api.php'
const USER_AGENT = 'PubQuizSoundCurator/1.0 (offline quiz content; local development)'
const TARGET_COUNT = 100
const MAX_FILE_BYTES = 2_000_000
const MAX_DURATION_SECONDS = 35
const API_REQUEST_INTERVAL_MS = 900
const MEDIA_REQUEST_INTERVAL_MS = 2_000
const MEDIA_DIRECTORY = path.resolve('public/media/sounds')
const MANIFEST_PATH = path.resolve('src/content/data/sounds.generated.json')
const executeFile = promisify(execFile)

const soundClasses = [
  ['dog barking', 'Hundebellen', 'Tierstimmen'],
  ['cat meowing', 'Miauen einer Katze', 'Tierstimmen'],
  ['cow mooing', 'Muhen einer Kuh', 'Tierstimmen'],
  ['sheep bleating', 'Blöken eines Schafs', 'Tierstimmen'],
  ['horse neighing', 'Wiehern eines Pferdes', 'Tierstimmen'],
  ['rooster crowing', 'Krähen eines Hahns', 'Tierstimmen'],
  ['chicken clucking', 'Gackern eines Huhns', 'Tierstimmen'],
  ['duck quacking', 'Quaken einer Ente', 'Tierstimmen'],
  ['owl hooting', 'Ruf einer Eule', 'Tierstimmen'],
  ['crow cawing', 'Ruf einer Krähe', 'Tierstimmen'],
  ['frog croaking', 'Quaken eines Froschs', 'Tierstimmen'],
  ['cricket chirping', 'Zirpen einer Grille', 'Tierstimmen'],
  ['bee buzzing', 'Summen einer Biene', 'Tierstimmen'],
  ['lion roaring', 'Brüllen eines Löwen', 'Tierstimmen'],
  ['wolf howling', 'Heulen eines Wolfs', 'Tierstimmen'],
  ['elephant trumpeting', 'Trompeten eines Elefanten', 'Tierstimmen'],
  ['seagull call', 'Ruf einer Möwe', 'Tierstimmen'],
  ['pigeon cooing', 'Gurren einer Taube', 'Tierstimmen'],
  ['woodpecker drumming', 'Klopfen eines Spechts', 'Tierstimmen'],
  ['goat bleating', 'Meckern einer Ziege', 'Tierstimmen'],
  ['applause sound', 'Applaus', 'Menschen'],
  ['human laughter sound', 'Menschliches Lachen', 'Menschen'],
  ['baby crying sound', 'Weinen eines Babys', 'Menschen'],
  ['sneeze sound', 'Niesen', 'Menschen'],
  ['cough sound', 'Husten', 'Menschen'],
  ['footsteps sound', 'Schritte', 'Alltag'],
  ['door knock sound', 'Klopfen an einer Tür', 'Alltag'],
  ['doorbell sound', 'Türklingel', 'Alltag'],
  ['telephone ringing sound', 'Telefonklingeln', 'Alltag'],
  ['clock ticking sound', 'Ticken einer Uhr', 'Alltag'],
  ['keyboard typing sound', 'Tippen auf einer Tastatur', 'Alltag'],
  ['camera shutter sound', 'Kameraauslöser', 'Alltag'],
  ['paper tearing sound', 'Zerreißendes Papier', 'Alltag'],
  ['zipper sound', 'Reißverschluss', 'Alltag'],
  ['coins sound', 'Klimpernde Münzen', 'Alltag'],
  ['glass breaking sound', 'Zerbrechendes Glas', 'Alltag'],
  ['vacuum cleaner sound', 'Staubsauger', 'Alltag'],
  ['toilet flush sound', 'Toilettenspülung', 'Alltag'],
  ['water tap sound', 'Fließender Wasserhahn', 'Alltag'],
  ['heartbeat sound', 'Herzschlag', 'Alltag'],
  ['rain sound', 'Regen', 'Natur'],
  ['thunder sound', 'Donner', 'Natur'],
  ['wind sound', 'Wind', 'Natur'],
  ['ocean waves sound', 'Meereswellen', 'Natur'],
  ['fire crackling sound', 'Knisterndes Feuer', 'Natur'],
  ['train horn sound', 'Zughorn', 'Verkehr'],
  ['car horn sound', 'Autohupe', 'Verkehr'],
  ['motorcycle sound', 'Motorrad', 'Verkehr'],
  ['ambulance siren sound', 'Sirene eines Rettungswagens', 'Verkehr'],
  ['airplane sound', 'Flugzeug', 'Verkehr'],
  ['bicycle bell sound', 'Fahrradklingel', 'Verkehr'],
  ['church bell sound', 'Kirchenglocke', 'Instrumente'],
  ['piano sound', 'Klavier', 'Instrumente'],
  ['violin sound', 'Violine', 'Instrumente'],
  ['guitar sound', 'Gitarre', 'Instrumente'],
  ['trumpet sound', 'Trompete', 'Instrumente'],
  ['drum sound', 'Trommel', 'Instrumente'],
  ['flute sound', 'Flöte', 'Instrumente'],
  ['pig oinking', 'Grunzen eines Schweins', 'Tierstimmen'],
  ['donkey braying', 'Schreien eines Esels', 'Tierstimmen'],
  ['turkey gobbling', 'Kollern eines Truthahns', 'Tierstimmen'],
  ['goose honking', 'Schnattern einer Gans', 'Tierstimmen'],
  ['snake hissing', 'Zischen einer Schlange', 'Tierstimmen'],
  ['peacock calling', 'Ruf eines Pfaus', 'Tierstimmen'],
  ['door closing sound', 'Schließende Tür', 'Alltag'],
  ['microwave beep sound', 'Mikrowellensignal', 'Alltag'],
  ['can opening sound', 'Öffnen einer Getränkedose', 'Alltag'],
  ['water pouring sound', 'Eingießen von Wasser', 'Alltag'],
  ['hair dryer sound', 'Haartrockner', 'Alltag'],
  ['blender sound', 'Standmixer', 'Alltag'],
  ['washing machine sound', 'Waschmaschine', 'Alltag'],
  ['electric drill sound', 'Bohrmaschine', 'Alltag'],
  ['hammering sound', 'Hämmern', 'Alltag'],
  ['hand saw sound', 'Sägen', 'Alltag'],
  ['printer sound', 'Drucker', 'Alltag'],
  ['scissors cutting sound', 'Schneiden mit einer Schere', 'Alltag'],
  ['match striking sound', 'Anzünden eines Streichholzes', 'Alltag'],
  ['food frying sound', 'Braten in einer Pfanne', 'Alltag'],
  ['waterfall sound', 'Wasserfall', 'Natur'],
  ['leaves rustling sound', 'Raschelnde Blätter', 'Natur'],
  ['helicopter sound', 'Hubschrauber', 'Verkehr'],
  ['boat horn sound', 'Schiffshorn', 'Verkehr'],
  ['basketball bounce sound', 'Prellender Basketball', 'Sport'],
  ['bowling sound', 'Umfallende Bowlingpins', 'Sport'],
  ['referee whistle sound', 'Schiedsrichterpfeife', 'Sport'],
]

const allowedLicensePattern = /^(CC0|Public domain|CC BY(?:-SA)?(?: \d\.\d)?)$/i
const supportedExtensionPattern = /\.(ogg|oga|wav|mp3|webm|opus)(?:\?.*)?$/i
const rejectedTitles = new Set([
  'Small rooster crowing.ogg',
  'Man howls like wolf.ogg',
  'En-au-quack like a duck.ogg',
  'En-us-if it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck.ogg',
  "European Jackdaw's croaking.ogg",
  'En-us-ribbit.ogg',
  'Jonathan Tweet Audio.ogg',
  'WWS Portionofchipsinadrainer.ogg',
  'WWS Shoemakerspecializinginshoeuppersstretchingtheshoeupper.ogg',
  'Sawing or winding something.ogg',
  'Shampooing hair.ogg',
  'Dull thud.ogg',
  'WWS Carpetbeater.ogg',
  'Vacuum and trumpet.ogg',
  'Testimonio oral que describe la relación con las abejas en el Barrio de la Tosca (Tejeda) Avete. Unión de Asociaciones de la Reserva de la Biosfera de Gran Canaria.ogg',
  'WWS Bloweroftheforge.ogg',
])

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

let lastApiRequestAt = 0
let lastMediaRequestAt = 0

async function curlBuffer(url, throttleApi = false) {
  if (throttleApi) {
    const waitTime = Math.max(0, API_REQUEST_INTERVAL_MS - (Date.now() - lastApiRequestAt))
    if (waitTime > 0) await sleep(waitTime)
    lastApiRequestAt = Date.now()
  } else {
    const waitTime = Math.max(0, MEDIA_REQUEST_INTERVAL_MS - (Date.now() - lastMediaRequestAt))
    if (waitTime > 0) await sleep(waitTime)
    lastMediaRequestAt = Date.now()
  }
  const { stdout } = await executeFile('curl.exe', [
    '--silent', '--show-error', '--location', '--fail',
    '--connect-timeout', '6', '--max-time', '12',
    '--user-agent', USER_AGENT, String(url),
  ], { encoding: 'buffer', maxBuffer: 5_000_000 })
  return stdout
}

function plainText(value = '') {
  return value.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

function safeName(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function cleanMediaUrl(value) {
  const url = new URL(value)
  url.search = ''
  return url.toString()
}

async function requestJson(parameters) {
  const url = new URL(API_URL)
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, String(value))
  return JSON.parse((await curlBuffer(url, true)).toString('utf8'))
}

async function searchCandidates(query) {
  const details = await requestJson({
    action: 'query', generator: 'search', gsrnamespace: 6, gsrlimit: 12,
    gsrsearch: `filetype:audio ${query}`, prop: 'imageinfo',
    iiprop: 'url|mime|size|extmetadata', format: 'json', formatversion: 2,
  })
  return details.query?.pages ?? []
}

function toCandidate(page) {
  const info = page.imageinfo?.[0]
  const metadata = info?.extmetadata ?? {}
  const license = plainText(metadata.LicenseShortName?.value)
  const duration = Number(metadata.AudioDuration?.value ?? info?.duration ?? 0)
  const mediaUrl = info?.url ? cleanMediaUrl(info.url) : ''
  const title = page.title.replace(/^File:/, '')
  if (!info || rejectedTitles.has(title) || !supportedExtensionPattern.test(mediaUrl)) return null
  if (!allowedLicensePattern.test(license)) return null
  if (info.size > MAX_FILE_BYTES || (duration && duration > MAX_DURATION_SECONDS)) return null
  return {
    pageId: page.pageid,
    title,
    mediaUrl,
    descriptionUrl: info.descriptionurl,
    license,
    artist: plainText(metadata.Artist?.value) || 'Unbekannt',
    credit: plainText(metadata.Credit?.value),
    duration,
    size: info.size,
  }
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    return []
  }
}

async function pruneManifest(manifest) {
  const retained = []
  for (const item of manifest) {
    if (!rejectedTitles.has(item.title)) {
      retained.push(item)
      continue
    }
    try {
      await unlink(path.join('public', item.file.replace(/^\//, '')))
    } catch {
      // The manifest remains authoritative when a retired file is already absent.
    }
  }
  if (retained.length !== manifest.length) {
    await writeFile(MANIFEST_PATH, `${JSON.stringify(retained, null, 2)}\n`, 'utf8')
  }
  return retained
}

async function downloadCandidate(candidate, soundClass, ordinal) {
  const data = await curlBuffer(candidate.mediaUrl)
  if (data.length > MAX_FILE_BYTES) throw new Error('Downloaded file exceeds size limit')
  const extension = new URL(candidate.mediaUrl).pathname.split('.').pop().toLowerCase()
  const filename = `${String(ordinal).padStart(3, '0')}-${safeName(soundClass[1])}.${extension}`
  await writeFile(path.join(MEDIA_DIRECTORY, filename), data)
  return {
    id: `sound-commons-${String(ordinal).padStart(3, '0')}`,
    answer: soundClass[1],
    category: soundClass[2],
    file: `/media/sounds/${filename}`,
    title: candidate.title,
    sourceUrl: candidate.descriptionUrl,
    license: candidate.license,
    artist: candidate.artist,
    credit: candidate.credit,
    duration: candidate.duration,
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
  }
}

await mkdir(MEDIA_DIRECTORY, { recursive: true })
await mkdir(path.dirname(MANIFEST_PATH), { recursive: true })

const manifest = await pruneManifest(await loadManifest())
if (process.argv.includes('--prune-only')) {
  console.log(`Sound manifest contains ${manifest.length}/${TARGET_COUNT} licensed clips after pruning.`)
  process.exit(0)
}
let nextOrdinal = Math.max(0, ...manifest.map((item) => Number(item.id.match(/\d+$/)?.[0] ?? 0))) + 1
const usedPageIds = new Set(manifest.map((item) => item.pageId).filter(Boolean))
const perAnswerCount = new Map()
for (const item of manifest) perAnswerCount.set(item.answer, (perAnswerCount.get(item.answer) ?? 0) + 1)

for (const soundClass of [...soundClasses].reverse()) {
  if (manifest.length >= TARGET_COUNT) break
  const needed = 2 - (perAnswerCount.get(soundClass[1]) ?? 0)
  if (needed <= 0) continue
  process.stdout.write(`Searching ${soundClass[1]} ... `)
  try {
    const pages = await searchCandidates(soundClass[0])
    const candidates = pages.map(toCandidate).filter(Boolean).filter((item) => !usedPageIds.has(item.pageId))
    let added = 0
    for (const candidate of candidates) {
      if (added >= needed || manifest.length >= TARGET_COUNT) break
      const record = await downloadCandidate(candidate, soundClass, nextOrdinal)
      nextOrdinal += 1
      record.pageId = candidate.pageId
      manifest.push(record)
      usedPageIds.add(candidate.pageId)
      added += 1
      perAnswerCount.set(soundClass[1], (perAnswerCount.get(soundClass[1]) ?? 0) + 1)
      await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
      await sleep(180)
    }
    console.log(`${added} added`)
  } catch (error) {
    console.log(`skipped: ${error.message}`)
  }
  await sleep(180)
}

console.log(`Sound manifest contains ${manifest.length}/${TARGET_COUNT} licensed clips.`)
if (manifest.length < TARGET_COUNT) process.exitCode = 2