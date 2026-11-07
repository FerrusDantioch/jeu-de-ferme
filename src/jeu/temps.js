/**
 * temps.js — la saison et le moment de la journée, d'après le téléphone.
 *
 *  - la saison suit la vraie date (ou la date du mode test), sauf si un autre choix
 *    est fait dans ⚙️ Réglages (« Toujours l'été », etc.) ;
 *  - l'heure suit l'horloge du téléphone, sauf si on choisit « Toujours le jour »
 *    (ou « Toujours la nuit ») dans les Réglages.
 */
import { dateDuJour } from './calendrier.js'
import { reglages } from './reglages.js'

export const SAISONS = {
  printemps: { nom: 'Printemps', icone: '🌸' },
  ete: { nom: 'Été', icone: '☀️' },
  automne: { nom: 'Automne', icone: '🍂' },
  hiver: { nom: 'Hiver', icone: '❄️' },
}

/**
 * La saison du jour : 'printemps' (20 mars), 'ete' (21 juin), 'automne' (22 septembre)
 * ou 'hiver' (21 décembre).
 */
export function saisonDuJour(date = dateDuJour()) {
  const choix = reglages.get('saison')
  if (choix && choix !== 'auto' && SAISONS[choix]) return choix
  const jour = (date.getMonth() + 1) * 100 + date.getDate() // ex. : 21 juin → 621
  if (jour >= 320 && jour < 621) return 'printemps'
  if (jour >= 621 && jour < 922) return 'ete'
  if (jour >= 922 && jour < 1221) return 'automne'
  return 'hiver'
}

/** L'heure (avec les minutes en décimales : 18 h 30 → 18.5). */
export function heureDuJour() {
  const choix = reglages.get('cycleJour')
  if (choix === 'jour') return 13
  if (choix === 'nuit') return 23
  const maintenant = new Date()
  return maintenant.getHours() + maintenant.getMinutes() / 60
}
