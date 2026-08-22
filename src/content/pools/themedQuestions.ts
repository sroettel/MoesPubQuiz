import type { ThemedQuestion } from '../../domain/questions'
import { COUNTRY_THEMED_QUESTIONS } from './countryQuestions'

type ThemedData = [prompt: string, answer: string, theme: string]

const EDITORIAL_THEMED_DATA: ThemedData[] = [
  ['In welchem Hochhaus spielt Stirb langsam?', 'Nakatomi Plaza', '80er-Actionfilme'],
  ['Welcher Schauspieler verkörpert den Terminator im Film von 1984?', 'Arnold Schwarzenegger', '80er-Actionfilme'],
  ['Wie lautet Pete Mitchells Rufname in Top Gun?', 'Maverick', '80er-Actionfilme'],
  ['Unter welchem englischen Titel erschien der erste Rambo-Film?', 'First Blood', '80er-Actionfilme'],
  ['Wie heißt Arnold Schwarzeneggers Figur in Predator?', 'Dutch', '80er-Actionfilme'],
  ['In welcher Stadt versieht RoboCop seinen Dienst?', 'Detroit', '80er-Actionfilme'],
  ['Wie heißen die beiden Partner in Lethal Weapon?', 'Riggs und Murtaugh', '80er-Actionfilme'],
  ['Wie heißt John Matrix’ Tochter in Phantom-Kommando?', 'Jenny', '80er-Actionfilme'],
  ['Wie heißt der Antiheld in Die Klapperschlange?', 'Snake Plissken', '80er-Actionfilme'],
  ['Welche Kampfkunst steht im Zentrum von Karate Tiger 3: Der Kickboxer?', 'Kickboxen', '80er-Actionfilme'],
  ['Wie heißt das Café der Freunde in Friends?', 'Central Perk', '90er-Sitcoms'],
  ['In welcher Stadt arbeitet Frasier Crane als Radiomoderator?', 'Seattle', '90er-Sitcoms'],
  ['In welchen Stadtteil zieht Will in Der Prinz von Bel-Air?', 'Bel-Air', '90er-Sitcoms'],
  ['Wie heißt die Heimwerkersendung in Hör mal, wer da hämmert?', 'Tool Time', '90er-Sitcoms'],
  ['In welcher Stadt spielt Seinfeld?', 'New York City', '90er-Sitcoms'],
  ['Wie heißt die Heimatstadt der Simpsons?', 'Springfield', '90er-Sitcoms'],
  ['Wie lautet der Familienname in Full House?', 'Tanner', '90er-Sitcoms'],
  ['Für welchen Paketdienst arbeitet Doug in King of Queens?', 'IPS', '90er-Sitcoms'],
  ['Welchen Beruf hat Al Bundy?', 'Schuhverkäufer', '90er-Sitcoms'],
  ['Wie heißt Sabrinas sprechender Kater?', 'Salem', '90er-Sitcoms'],
  ['Wie heißt die rechte Schiffsseite in Fahrtrichtung?', 'Steuerbord', 'Segeln'],
  ['Wie heißt der vordere Teil eines Schiffsrumpfs?', 'Bug', 'Segeln'],
  ['In welcher Einheit wird die Geschwindigkeit eines Schiffs angegeben?', 'Knoten', 'Segeln'],
  ['Wie heißt der senkrechte Träger der Segel?', 'Mast', 'Segeln'],
  ['Wie heißt das dreieckige Vorsegel?', 'Fock', 'Segeln'],
  ['Wie heißt das Manöver, bei dem der Bug durch den Wind geht?', 'Wende', 'Segeln'],
  ['Welches Bauteil unter dem Rumpf vermindert die Abdrift?', 'Kiel', 'Segeln'],
  ['Welcher internationale Notruf wird im Sprechfunk verwendet?', 'Mayday', 'Segeln'],
  ['Welche Skala beschreibt die Windstärke?', 'Beaufortskala', 'Segeln'],
  ['Wie nennt man einen sportlichen Segelwettbewerb?', 'Regatta', 'Segeln'],
  ['Welche Spirituose bildet die Basis eines Mojito?', 'Weißer Rum', 'Cocktails'],
  ['Aus Gin, rotem Wermut und Campari besteht welcher Klassiker?', 'Negroni', 'Cocktails'],
  ['Welche Basisspirituose wird für einen Old Fashioned verwendet?', 'Whiskey', 'Cocktails'],
  ['Welche Spirituose gehört in eine klassische Margarita?', 'Tequila', 'Cocktails'],
  ['Welche Spirituose bildet die Basis eines Moscow Mule?', 'Wodka', 'Cocktails'],
  ['Welche brasilianische Spirituose gehört in eine Caipirinha?', 'Cachaça', 'Cocktails'],
  ['Welche Frucht prägt neben Kokos den Geschmack einer Piña Colada?', 'Ananas', 'Cocktails'],
  ['Welche Spirituose gehört in einen Espresso Martini?', 'Wodka', 'Cocktails'],
  ['Welcher Zitrussaft gehört in einen klassischen Gin Fizz?', 'Zitronensaft', 'Cocktails'],
  ['Mit welchem aromatisierten Wein wird ein Manhattan gemixt?', 'Roter Wermut', 'Cocktails'],
]

const editorialQuestions = EDITORIAL_THEMED_DATA.map<ThemedQuestion>(([prompt, answer, theme], index) => ({
  id: `themed-editorial-${String(index + 1).padStart(3, '0')}`,
  type: 'themed',
  prompt,
  answer,
  category: theme === 'Segeln' ? 'Sport' : theme === 'Cocktails' ? 'Getränke' : 'Film & Fernsehen',
  theme,
  difficulty: 2,
}))

export const THEMED_QUESTIONS: ThemedQuestion[] = [...COUNTRY_THEMED_QUESTIONS, ...editorialQuestions]