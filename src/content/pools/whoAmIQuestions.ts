import type { WhoAmIQuestion } from '../../domain/questions'

type PersonData = [
  answer: string,
  birth: string,
  origin: string,
  role: string,
  knownFor: string,
  category: string,
]

const PERSON_DATA: PersonData[] = [
  ['Albert Einstein', '1879', 'dem damaligen Deutschen Reich', 'als theoretischer Physiker', 'Meine Relativitätstheorie veränderte das Verständnis von Raum und Zeit.', 'Wissenschaft'],
  ['Marie Curie', '1867', 'Polen und arbeitete später in Frankreich', 'als Physikerin und Chemikerin', 'Ich erforschte Radioaktivität und erhielt Nobelpreise in zwei Naturwissenschaften.', 'Wissenschaft'],
  ['Isaac Newton', '1643', 'England', 'als Physiker und Mathematiker', 'Mit mir verbindet man die Bewegungsgesetze und die Gravitation.', 'Wissenschaft'],
  ['Charles Darwin', '1809', 'England', 'als Naturforscher', 'Meine Evolutionstheorie beschreibt die natürliche Selektion.', 'Wissenschaft'],
  ['Galileo Galilei', '1564', 'Italien', 'als Astronom und Physiker', 'Meine Fernrohrbeobachtungen stützten das heliozentrische Weltbild.', 'Wissenschaft'],
  ['Nikola Tesla', '1856', 'dem heutigen Kroatien und wirkte in den USA', 'als Erfinder und Elektroingenieur', 'Mein Name ist eng mit Wechselstrom und einer magnetischen Einheit verbunden.', 'Wissenschaft'],
  ['Ada Lovelace', '1815', 'England', 'als Mathematikerin', 'Ein Algorithmus für die Analytical Engine brachte mir den Ruf der ersten Programmiererin ein.', 'Wissenschaft'],
  ['Alan Turing', '1912', 'England', 'als Mathematiker und Kryptoanalytiker', 'Ich half beim Entschlüsseln der Enigma und prägte die Informatik.', 'Wissenschaft'],
  ['Stephen Hawking', '1942', 'England', 'als theoretischer Physiker', 'Ich forschte zu Schwarzen Löchern und schrieb Eine kurze Geschichte der Zeit.', 'Wissenschaft'],
  ['Alexander Fleming', '1881', 'Schottland', 'als Arzt und Bakteriologe', 'Ich entdeckte die antibakterielle Wirkung des Penicillins.', 'Wissenschaft'],
  ['Louis Pasteur', '1822', 'Frankreich', 'als Chemiker und Mikrobiologe', 'Ein Verfahren zur Haltbarmachung trägt meinen Namen.', 'Wissenschaft'],
  ['Rosalind Franklin', '1920', 'England', 'als Chemikerin und Röntgenkristallografin', 'Meine Aufnahme Photo 51 war entscheidend für das Verständnis der DNA-Struktur.', 'Wissenschaft'],
  ['Johannes Gutenberg', 'um 1400', 'Mainz', 'als Erfinder und Drucker', 'Ich revolutionierte Europa mit dem Buchdruck mit beweglichen Metalllettern.', 'Wissenschaft'],
  ['Thomas Edison', '1847', 'den USA', 'als Erfinder und Unternehmer', 'Mit mir verbindet man den Phonographen und die praktische Glühlampe.', 'Wissenschaft'],
  ['Leonardo da Vinci', '1452', 'Italien', 'als Künstler, Ingenieur und Universalgelehrter', 'Ich malte die Mona Lisa und hinterließ zahlreiche technische Skizzen.', 'Wissenschaft'],
  ['Archimedes', 'um 287 v. Chr.', 'Syrakus', 'als Mathematiker und Ingenieur', 'Ein Auftriebsprinzip und der Ausruf Heureka werden mit mir verbunden.', 'Wissenschaft'],
  ['Nikolaus Kopernikus', '1473', 'Königlich Preußen', 'als Astronom', 'Ich stellte die Sonne in das Zentrum meines Modells des Planetensystems.', 'Wissenschaft'],
  ['Johannes Kepler', '1571', 'dem heutigen Baden-Württemberg', 'als Astronom und Mathematiker', 'Meine Gesetze beschreiben die elliptischen Bahnen der Planeten.', 'Wissenschaft'],
  ['Max Planck', '1858', 'Kiel', 'als Physiker', 'Ich begründete die Quantentheorie und eine Naturkonstante trägt meinen Namen.', 'Wissenschaft'],
  ['Hedy Lamarr', '1914', 'Wien', 'als Schauspielerin und Erfinderin', 'Neben Hollywood entwickelte ich eine frühe Form des Frequenzsprungverfahrens.', 'Wissenschaft'],

  ['William Shakespeare', '1564', 'England', 'als Dramatiker und Dichter', 'Hamlet, Macbeth und Romeo und Julia stammen von mir.', 'Kultur'],
  ['Johann Wolfgang von Goethe', '1749', 'Frankfurt am Main', 'als Dichter und Naturforscher', 'Mein zweiteiliges Drama Faust gehört zur Weltliteratur.', 'Kultur'],
  ['Friedrich Schiller', '1759', 'Marbach am Neckar', 'als Dichter und Dramatiker', 'Ich schrieb Die Räuber und die Ode An die Freude.', 'Kultur'],
  ['Franz Kafka', '1883', 'Prag', 'als deutschsprachiger Schriftsteller', 'In einer meiner Erzählungen erwacht Gregor Samsa als ungeheures Ungeziefer.', 'Kultur'],
  ['Jane Austen', '1775', 'England', 'als Schriftstellerin', 'Stolz und Vorurteil ist einer meiner bekanntesten Romane.', 'Kultur'],
  ['Virginia Woolf', '1882', 'England', 'als Schriftstellerin und Essayistin', 'Mrs Dalloway und Ein Zimmer für sich allein stammen von mir.', 'Kultur'],
  ['Agatha Christie', '1890', 'England', 'als Kriminalschriftstellerin', 'Ich erfand Hercule Poirot und Miss Marple.', 'Kultur'],
  ['Ernest Hemingway', '1899', 'den USA', 'als Schriftsteller und Journalist', 'Der alte Mann und das Meer brachte mir weltweite Bekanntheit.', 'Kultur'],
  ['J. R. R. Tolkien', '1892', 'dem heutigen Südafrika und lebte in England', 'als Philologe und Schriftsteller', 'Ich erschuf Mittelerde, den Hobbit und den Herrn der Ringe.', 'Kultur'],
  ['Astrid Lindgren', '1907', 'Schweden', 'als Kinderbuchautorin', 'Ich erfand Pippi Langstrumpf, Ronja Räubertochter und Michel.', 'Kultur'],
  ['Pablo Picasso', '1881', 'Spanien', 'als Maler und Bildhauer', 'Ich prägte den Kubismus und malte Guernica.', 'Kultur'],
  ['Vincent van Gogh', '1853', 'den Niederlanden', 'als Maler', 'Sternennacht und zahlreiche Sonnenblumenbilder stammen von mir.', 'Kultur'],
  ['Claude Monet', '1840', 'Frankreich', 'als Maler', 'Meine Seerosenbilder wurden zu Ikonen des Impressionismus.', 'Kultur'],
  ['Frida Kahlo', '1907', 'Mexiko', 'als Malerin', 'Meine Selbstporträts und die Ehe mit Diego Rivera sind Teil meiner Geschichte.', 'Kultur'],
  ['Salvador Dalí', '1904', 'Spanien', 'als surrealistischer Künstler', 'Zerfließende Uhren erscheinen in meinem berühmtesten Gemälde.', 'Kultur'],
  ['Rembrandt van Rijn', '1606', 'den Niederlanden', 'als Maler und Radierer', 'Die Nachtwache gehört zu meinen bekanntesten Werken.', 'Kultur'],
  ['Michelangelo', '1475', 'Italien', 'als Bildhauer, Maler und Architekt', 'Ich schuf den David und bemalte die Decke der Sixtinischen Kapelle.', 'Kultur'],
  ['Ludwig van Beethoven', '1770', 'Bonn', 'als Komponist', 'Meine neunte Sinfonie enthält die Ode an die Freude.', 'Kultur'],
  ['Wolfgang Amadeus Mozart', '1756', 'Salzburg', 'als Komponist', 'Die Zauberflöte und Eine kleine Nachtmusik stammen von mir.', 'Kultur'],
  ['Johann Sebastian Bach', '1685', 'Eisenach', 'als Komponist und Organist', 'Die Brandenburgischen Konzerte und das Weihnachtsoratorium stammen von mir.', 'Kultur'],

  ['Kleopatra VII.', '69 v. Chr.', 'Alexandria im ptolemäischen Ägypten', 'als Königin', 'Meine Bündnisse mit Julius Caesar und Marcus Antonius wurden legendär.', 'Geschichte'],
  ['Julius Caesar', '100 v. Chr.', 'Rom', 'als Feldherr und Staatsmann', 'Ich überschritt den Rubikon und wurde an den Iden des März ermordet.', 'Geschichte'],
  ['Alexander der Große', '356 v. Chr.', 'Makedonien', 'als König und Feldherr', 'Mein Reich reichte bis nach Ägypten und Indien.', 'Geschichte'],
  ['Napoleon Bonaparte', '1769', 'Korsika', 'als Feldherr und Kaiser', 'Meine endgültige Niederlage erlitt ich bei Waterloo.', 'Geschichte'],
  ['Elisabeth I.', '1533', 'England', 'als Königin', 'Meine Regierungszeit wird mit der spanischen Armada und einem goldenen Zeitalter verbunden.', 'Geschichte'],
  ['Ludwig XIV.', '1638', 'Frankreich', 'als König', 'Man nannte mich den Sonnenkönig und mein Hof residierte in Versailles.', 'Geschichte'],
  ['George Washington', '1732', 'den britischen Kolonien in Nordamerika', 'als General und Politiker', 'Ich wurde der erste Präsident der Vereinigten Staaten.', 'Geschichte'],
  ['Abraham Lincoln', '1809', 'den USA', 'als Politiker und Präsident', 'Ich führte die USA durch den Bürgerkrieg und bekämpfte die Sklaverei.', 'Geschichte'],
  ['Winston Churchill', '1874', 'England', 'als Politiker und Schriftsteller', 'Während des Zweiten Weltkriegs war ich britischer Premierminister.', 'Geschichte'],
  ['Mahatma Gandhi', '1869', 'Indien', 'als Anwalt und Unabhängigkeitsaktivist', 'Gewaltloser Widerstand prägte meinen Kampf gegen die britische Kolonialherrschaft.', 'Geschichte'],
  ['Nelson Mandela', '1918', 'Südafrika', 'als Politiker und Anti-Apartheid-Kämpfer', 'Nach langer Haft wurde ich der erste schwarze Präsident Südafrikas.', 'Geschichte'],
  ['Martin Luther King Jr.', '1929', 'den USA', 'als Bürgerrechtler und Baptistenpastor', 'Meine Rede I Have a Dream hielt ich 1963 in Washington.', 'Geschichte'],
  ['Rosa Parks', '1913', 'den USA', 'als Bürgerrechtlerin', 'Meine Weigerung, einen Bussitz aufzugeben, wurde zum Symbol des Widerstands.', 'Geschichte'],
  ['Sophie Scholl', '1921', 'Forchtenberg', 'als Widerstandskämpferin', 'Ich gehörte zur Weißen Rose und verteilte Flugblätter gegen das NS-Regime.', 'Geschichte'],
  ['Otto von Bismarck', '1815', 'Schönhausen', 'als Politiker', 'Als erster Reichskanzler prägte ich die deutsche Reichsgründung.', 'Geschichte'],
  ['Konrad Adenauer', '1876', 'Köln', 'als Politiker', 'Ich war der erste Bundeskanzler der Bundesrepublik Deutschland.', 'Geschichte'],
  ['Angela Merkel', '1954', 'Hamburg und wuchs in der DDR auf', 'als Physikerin und Politikerin', 'Von 2005 bis 2021 war ich deutsche Bundeskanzlerin.', 'Geschichte'],
  ['John F. Kennedy', '1917', 'den USA', 'als Politiker und Präsident', '1963 wurde ich während einer Fahrt durch Dallas ermordet.', 'Geschichte'],
  ['Michail Gorbatschow', '1931', 'der Sowjetunion', 'als Politiker', 'Glasnost und Perestroika sind eng mit mir verbunden.', 'Geschichte'],
  ['Anne Frank', '1929', 'Frankfurt am Main und lebte später in Amsterdam', 'als Tagebuchautorin', 'Mein Tagebuch dokumentiert das Leben im Versteck während der NS-Verfolgung.', 'Geschichte'],

  ['Elvis Presley', '1935', 'den USA', 'als Sänger und Schauspieler', 'Man nennt mich den King of Rock ’n’ Roll.', 'Musik & Film'],
  ['John Lennon', '1940', 'Liverpool', 'als Musiker und Songwriter', 'Ich war Mitglied der Beatles und schrieb Imagine.', 'Musik & Film'],
  ['Freddie Mercury', '1946', 'Sansibar', 'als Sänger und Songwriter', 'Als Frontmann von Queen sang ich Bohemian Rhapsody.', 'Musik & Film'],
  ['David Bowie', '1947', 'London', 'als Musiker und Schauspieler', 'Ziggy Stardust war eine meiner berühmtesten Kunstfiguren.', 'Musik & Film'],
  ['Michael Jackson', '1958', 'den USA', 'als Sänger, Tänzer und Produzent', 'Thriller und der Moonwalk machten mich zum King of Pop.', 'Musik & Film'],
  ['Madonna', '1958', 'den USA', 'als Sängerin und Schauspielerin', 'Like a Virgin und Like a Prayer gehören zu meinen größten Hits.', 'Musik & Film'],
  ['Whitney Houston', '1963', 'den USA', 'als Sängerin und Schauspielerin', 'Meine Version von I Will Always Love You wurde ein Welthit.', 'Musik & Film'],
  ['Tina Turner', '1939', 'den USA und lebte später in der Schweiz', 'als Sängerin', 'What’s Love Got to Do with It gehört zu meinen bekanntesten Liedern.', 'Musik & Film'],
  ['Aretha Franklin', '1942', 'den USA', 'als Sängerin', 'Als Queen of Soul forderte ich musikalisch R-E-S-P-E-C-T.', 'Musik & Film'],
  ['Bob Marley', '1945', 'Jamaika', 'als Reggae-Musiker', 'No Woman, No Cry und One Love gehören zu meinen Liedern.', 'Musik & Film'],
  ['Taylor Swift', '1989', 'den USA', 'als Sängerin und Songwriterin', 'Meine neu aufgenommenen Alben tragen den Zusatz Taylor’s Version.', 'Musik & Film'],
  ['Beyoncé', '1981', 'den USA', 'als Sängerin und Produzentin', 'Vor meiner Solokarriere war ich Mitglied von Destiny’s Child.', 'Musik & Film'],
  ['Adele', '1988', 'London', 'als Sängerin und Songwriterin', 'Meine Alben tragen Alterszahlen wie 19, 21, 25 und 30.', 'Musik & Film'],
  ['Elton John', '1947', 'England', 'als Sänger, Pianist und Komponist', 'Rocket Man und Your Song gehören zu meinen Klassikern.', 'Musik & Film'],
  ['Dolly Parton', '1946', 'den USA', 'als Country-Sängerin und Songwriterin', 'Ich schrieb Jolene und I Will Always Love You.', 'Musik & Film'],
  ['Charlie Chaplin', '1889', 'London', 'als Schauspieler und Regisseur', 'Meine Figur mit Melone, Stock und kleinem Schnurrbart hieß der Tramp.', 'Musik & Film'],
  ['Marilyn Monroe', '1926', 'den USA', 'als Schauspielerin und Fotomodell', 'In Manche mögen’s heiß spielte ich Sugar Kane.', 'Musik & Film'],
  ['Audrey Hepburn', '1929', 'Belgien', 'als Schauspielerin und UNICEF-Botschafterin', 'Frühstück bei Tiffany machte mein schwarzes Kleid weltberühmt.', 'Musik & Film'],
  ['Alfred Hitchcock', '1899', 'England', 'als Filmregisseur', 'Psycho, Vertigo und Die Vögel brachten mir den Titel Master of Suspense ein.', 'Musik & Film'],
  ['Steven Spielberg', '1946', 'den USA', 'als Filmregisseur und Produzent', 'Ich inszenierte Der weiße Hai, E.T. und Jurassic Park.', 'Musik & Film'],

  ['Muhammad Ali', '1942', 'den USA', 'als Boxer und Aktivist', 'Ich nannte mich The Greatest und gewann mehrfach den Schwergewichts-Weltmeistertitel.', 'Sport & Abenteuer'],
  ['Michael Jordan', '1963', 'den USA', 'als Basketballspieler', 'Mit den Chicago Bulls gewann ich sechs NBA-Meisterschaften.', 'Sport & Abenteuer'],
  ['Serena Williams', '1981', 'den USA', 'als Tennisspielerin', 'Ich gewann 23 Grand-Slam-Einzeltitel in der Open Era.', 'Sport & Abenteuer'],
  ['Steffi Graf', '1969', 'Mannheim', 'als Tennisspielerin', '1988 gelang mir der Golden Slam.', 'Sport & Abenteuer'],
  ['Roger Federer', '1981', 'der Schweiz', 'als Tennisspieler', 'Acht Einzeltitel in Wimbledon gehören zu meinen Erfolgen.', 'Sport & Abenteuer'],
  ['Usain Bolt', '1986', 'Jamaika', 'als Sprinter', 'Ich halte Weltrekorde über 100 und 200 Meter.', 'Sport & Abenteuer'],
  ['Pelé', '1940', 'Brasilien', 'als Fußballspieler', 'Ich gewann als einziger Spieler drei Fußball-Weltmeisterschaften.', 'Sport & Abenteuer'],
  ['Diego Maradona', '1960', 'Argentinien', 'als Fußballspieler', 'Bei der WM 1986 gelangen mir die Hand Gottes und das Tor des Jahrhunderts.', 'Sport & Abenteuer'],
  ['Franz Beckenbauer', '1945', 'München', 'als Fußballspieler und Trainer', 'Als Kaiser gewann ich die WM als Spieler und als Teamchef.', 'Sport & Abenteuer'],
  ['Marta', '1986', 'Brasilien', 'als Fußballspielerin', 'Ich wurde mehrfach zur FIFA-Weltfußballerin gewählt.', 'Sport & Abenteuer'],
  ['Lewis Hamilton', '1985', 'England', 'als Formel-1-Fahrer', 'Ich gewann sieben Formel-1-Weltmeistertitel.', 'Sport & Abenteuer'],
  ['Michael Schumacher', '1969', 'Hürth', 'als Formel-1-Fahrer', 'Mit Ferrari gewann ich fünf Weltmeisterschaften in Folge.', 'Sport & Abenteuer'],
  ['Simone Biles', '1997', 'den USA', 'als Turnerin', 'Mehrere besonders schwierige Turnelemente tragen meinen Namen.', 'Sport & Abenteuer'],
  ['Nadia Comăneci', '1961', 'Rumänien', 'als Turnerin', '1976 erhielt ich bei Olympia als Erste die perfekte Wertung 10,0.', 'Sport & Abenteuer'],
  ['Jesse Owens', '1913', 'den USA', 'als Leichtathlet', 'Bei den Olympischen Spielen 1936 in Berlin gewann ich vier Goldmedaillen.', 'Sport & Abenteuer'],
  ['Reinhold Messner', '1944', 'Südtirol', 'als Bergsteiger', 'Ich bestieg als Erster alle vierzehn Achttausender.', 'Sport & Abenteuer'],
  ['Amelia Earhart', '1897', 'den USA', 'als Pilotin', 'Ich überquerte als erste Frau allein den Atlantik im Flugzeug.', 'Sport & Abenteuer'],
  ['Christoph Kolumbus', '1451', 'Genua', 'als Seefahrer', '1492 erreichte meine Expedition im Auftrag Spaniens die Karibik.', 'Sport & Abenteuer'],
  ['James Cook', '1728', 'England', 'als Seefahrer und Kartograf', 'Meine Pazifikreisen führten unter anderem nach Neuseeland und Hawaii.', 'Sport & Abenteuer'],
  ['Juri Gagarin', '1934', 'der Sowjetunion', 'als Kosmonaut', '1961 umrundete ich als erster Mensch die Erde im Weltraum.', 'Sport & Abenteuer'],
]

function getEraHint(birth: string) {
  const year = Number(birth.match(/\d+/)?.[0])
  if (!year) return 'Meine Lebenszeit liegt weit vor der Gegenwart.'
  if (birth.includes('v. Chr.')) return `Ich wurde im ${Math.ceil(year / 100)}. Jahrhundert vor Christus geboren.`
  return `Ich wurde im ${Math.ceil(year / 100)}. Jahrhundert geboren.`
}

function getNameHints(answer: string) {
  const nameParts = answer.replace(/\s+(Jr\.|[IVXLCDM]+\.)$/, '').split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.at(-1) ?? firstName
  return [
    `Mein bekannter Name beginnt mit dem Buchstaben ${firstName[0]}.`,
    nameParts.length > 1
      ? `Mein Nachname beginnt mit dem Buchstaben ${lastName[0]}.`
      : `Mein bekannter Name endet mit dem Buchstaben ${lastName.at(-1)}.`,
  ]
}

export const WHO_AM_I_QUESTIONS: WhoAmIQuestion[] = PERSON_DATA.map((person, index) => {
  const [answer, birth, origin, role, knownFor, category] = person
  const [firstNameHint, lastNameHint] = getNameHints(answer)
  return {
    id: `who-${String(index + 1).padStart(3, '0')}`,
    type: 'who-am-i',
    prompt: 'Welche Person wird gesucht?',
    answer,
    category,
    difficulty: (1 + (index % 4)) as 1 | 2 | 3 | 4,
    hints: [
      `Man kennt mich vor allem aus dem Bereich ${category}.`,
      getEraHint(birth),
      `Ich stamme aus ${origin}.`,
      `Ich wirkte vor allem ${role}.`,
      knownFor,
      `Ich wurde ${birth} geboren.`,
      firstNameHint,
      lastNameHint,
    ],
    source: 'Redaktioneller Startpool auf Basis öffentlich zugänglicher Biografien',
  }
})