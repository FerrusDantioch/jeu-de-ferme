/**
 * fetes.js (règles) — ce qui se passe pendant les fêtes :
 * la chasse aux œufs de Pâques, et les phrases de fête des villageois.
 */
import { RECOMPENSE_OEUF } from '../donnees/fetes.js'
import { etat } from './etat.js'
import { cleDuJour, feteDuJour } from './calendrier.js'
import { gagnerPieces, gagnerExperience } from './economie.js'
import { annoncer } from './evenements.js'

/** Les œufs de Pâques déjà trouvés aujourd'hui (la chasse recommence chaque jour de fête). */
export function oeufsTrouvesAujourdhui() {
  const o = etat.d.oeufsDePaques
  return o && o.jour === cleDuJour() ? o.trouves : []
}

/**
 * Trouve un œuf. Renvoie la récompense, ou null s'il était déjà trouvé.
 */
export function trouverOeuf(numero) {
  const cle = cleDuJour()
  if (!etat.d.oeufsDePaques || etat.d.oeufsDePaques.jour !== cle) etat.d.oeufsDePaques = { jour: cle, trouves: [] }
  const o = etat.d.oeufsDePaques
  if (o.trouves.includes(numero)) return null
  o.trouves.push(numero)
  gagnerPieces(RECOMPENSE_OEUF.pieces)
  gagnerExperience(RECOMPENSE_OEUF.experience)
  annoncer('oeuf', { numero })
  return { ...RECOMPENSE_OEUF, trouves: o.trouves.length }
}

/** Une phrase de fête au hasard (ou null s'il n'y a pas de fête). */
export function phraseDeFete() {
  const f = feteDuJour()
  if (!f || !f.phrases?.length) return null
  return f.phrases[Math.floor(Math.random() * f.phrases.length)]
}
