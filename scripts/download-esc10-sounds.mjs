import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const TARGET_COUNT = 100
const MEDIA_DIRECTORY = path.resolve('public/media/sounds')
const MANIFEST_PATH = path.resolve('src/content/data/sounds.generated.json')
const REPOSITORY_URL = 'https://github.com/karoldvl/ESC-50'
const RAW_URL = 'https://raw.githubusercontent.com/karoldvl/ESC-50/master'
const executeFile = promisify(execFile)

const classes = {
  dog: ['Hundebellen', 'Tierstimmen'],
  rooster: ['Krähen eines Hahns', 'Tierstimmen'],
  rain: ['Regen', 'Natur'],
  sea_waves: ['Meereswellen', 'Natur'],
  crackling_fire: ['Knisterndes Feuer', 'Natur'],
  crying_baby: ['Weinen eines Babys', 'Menschen'],
  sneezing: ['Niesen', 'Menschen'],
  clock_tick: ['Ticken einer Uhr', 'Alltag'],
  helicopter: ['Hubschrauber', 'Verkehr'],
  chainsaw: ['Kettensäge', 'Alltag'],
}

function parseCsvLine(line) {
  return line.split(',')
}

function parseMetadata(csv) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/)
  const headers = parseCsvLine(headerLine)
  return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index]])))
}

function licenseKey(filename) {
  return filename.replace(/-\d+\.wav$/, '.ogg')
}

function parseAttributions(licenseText) {
  const attributions = new Map()
  for (const line of licenseText.split(/\r?\n/)) {
    const match = line.match(/^- \[([^\]]+)\]: clip derived from (.*) \((https?:\/\/[^)]+)\) by (.*) \[([^\]]+)\]$/)
    if (!match) continue
    attributions.set(match[1], {
      title: match[2],
      sourceUrl: match[3],
      artist: match[4],
      originalLicense: match[5],
    })
  }
  return attributions
}

async function curlBuffer(url) {
  const { stdout } = await executeFile('curl.exe', [
    '--silent', '--show-error', '--location', '--fail',
    '--connect-timeout', '8', '--max-time', '30', String(url),
  ], { encoding: 'buffer', maxBuffer: 3_000_000 })
  return stdout
}

async function loadManifest() {
  return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
}

function candidateQueues(metadata, manifest, attributions) {
  const usedSourceIds = new Set(manifest.filter((item) => item.id.startsWith('sound-esc10-')).map((item) => String(-item.pageId)))
  const seenSourceIds = new Set()
  const queues = new Map(Object.keys(classes).map((category) => [category, []]))

  for (const row of metadata) {
    if (row.esc10 !== 'True' || !classes[row.category] || usedSourceIds.has(row.src_file) || seenSourceIds.has(row.src_file)) continue
    const attribution = attributions.get(licenseKey(row.filename))
    if (!attribution) continue
    queues.get(row.category).push({ ...row, ...attribution })
    seenSourceIds.add(row.src_file)
  }
  return queues
}

function answerCounts(manifest) {
  const counts = new Map()
  for (const item of manifest) counts.set(item.answer, (counts.get(item.answer) ?? 0) + 1)
  return counts
}

await mkdir(MEDIA_DIRECTORY, { recursive: true })
const manifest = await loadManifest()
if (manifest.length >= TARGET_COUNT) {
  console.log(`Sound manifest already contains ${manifest.length}/${TARGET_COUNT} licensed clips.`)
  process.exit(0)
}

const [metadataBuffer, licenseBuffer] = await Promise.all([
  curlBuffer(`${RAW_URL}/meta/esc50.csv`),
  curlBuffer(`${RAW_URL}/LICENSE`),
])
const metadata = parseMetadata(metadataBuffer.toString('utf8'))
const queues = candidateQueues(metadata, manifest, parseAttributions(licenseBuffer.toString('utf8')))
const counts = answerCounts(manifest)
const hashes = new Set(manifest.map((item) => item.sha256))

while (manifest.length < TARGET_COUNT) {
  const available = [...queues.entries()]
    .filter(([, queue]) => queue.length > 0)
    .sort(([left], [right]) => (counts.get(classes[left][0]) ?? 0) - (counts.get(classes[right][0]) ?? 0))
  if (available.length === 0) throw new Error('No unused ESC-10 candidates remain')

  const [className, queue] = available[0]
  const candidate = queue.shift()
  const [answer, category] = classes[className]
  process.stdout.write(`Downloading ${answer}: ${candidate.filename} ... `)
  try {
    const data = await curlBuffer(`${RAW_URL}/audio/${candidate.filename}`)
    if (data.length < 44 || data.subarray(0, 4).toString('ascii') !== 'RIFF') throw new Error('Invalid WAV file')
    const sha256 = createHash('sha256').update(data).digest('hex')
    if (hashes.has(sha256)) {
      console.log('duplicate skipped')
      continue
    }

    const stem = path.basename(candidate.filename, '.wav')
    const filename = `esc10-${candidate.filename}`
    await writeFile(path.join(MEDIA_DIRECTORY, filename), data)
    manifest.push({
      id: `sound-esc10-${stem}`,
      answer,
      category,
      file: `/media/sounds/${filename}`,
      title: `${candidate.title} (ESC-50 ${candidate.filename})`,
      sourceUrl: candidate.sourceUrl,
      license: 'CC BY 3.0',
      artist: candidate.artist,
      credit: `ESC-10 by Karol J. Piczak; original ${candidate.originalLicense}; ${REPOSITORY_URL}`,
      duration: 5,
      bytes: data.length,
      sha256,
      pageId: -Number(candidate.src_file),
    })
    hashes.add(sha256)
    counts.set(answer, (counts.get(answer) ?? 0) + 1)
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    console.log(`${manifest.length}/${TARGET_COUNT}`)
  } catch (error) {
    console.log(`skipped: ${error.message}`)
  }
}

console.log(`Sound manifest contains ${manifest.length}/${TARGET_COUNT} licensed clips.`)