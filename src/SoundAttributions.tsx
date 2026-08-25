import { ArrowLeft, ExternalLink } from 'lucide-react'
import soundManifest from './content/data/sounds.generated.json'
import { soundLicenseUrl } from './content/soundLicenses'

export function SoundAttributions({ onBack }: { onBack: () => void }) {
  return (
    <section className="attributions page-enter">
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Zurück</button>
      <header className="attributions-intro">
        <p className="kicker">Quellen und Lizenzen</p>
        <h1>Audio-Credits</h1>
        <p>Alle Audiodateien werden unverändert bereitgestellt. Die Angaben stammen aus den beim Download erfassten Quelldaten.</p>
      </header>
      <div className="attribution-list">
        {soundManifest.map((sound) => (
          <article id={`credit-${sound.id}`} key={sound.id}>
            <div><span>{sound.category}</span><strong>{sound.title}</strong></div>
            <p>Von {sound.artist}</p>
            {sound.credit && <p>{sound.credit}</p>}
            <p>Originaldatei ohne weitere Bearbeitung verwendet.</p>
            <div className="attribution-links">
              <a href={sound.sourceUrl} target="_blank" rel="noreferrer">Quelle <ExternalLink size={13} aria-hidden="true" /></a>
              <a href={soundLicenseUrl(sound.license, sound.sourceUrl)} target="_blank" rel="noreferrer">{sound.license} <ExternalLink size={13} aria-hidden="true" /></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}