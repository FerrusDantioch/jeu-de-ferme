/**
 * compagnon.js (règles) — le chat ou le chien du joueur, dans la mémoire de la partie :
 * etat.d.compagnon = null (pas encore adopté) ou { espece, nom, pelage }.
 */
import { etat } from './etat.js'
import { ESPECES_COMPAGNONS, PELAGES } from '../donnees/compagnons.js'

const auditeurs = new Set()

/** Être prévenu quand le compagnon arrive ou change (espèce, pelage). */
export function surChangementCompagnon(fonction) {
  auditeurs.add(fonction)
}
const prevenir = () => auditeurs.forEach((f) => f())

/** Le compagnon (ou null). */
export function compagnon() {
  return etat.d.compagnon || null
}

/** Adopte un compagnon (gratuit). Renvoie sa fiche. */
export function adopterCompagnon(espece) {
  if (!ESPECES_COMPAGNONS[espece]) return null
  etat.d.compagnon = { espece, nom: ESPECES_COMPAGNONS[espece].nomParDefaut, pelage: espece === 'chat' ? 'roux' : 'brun' }
  etat.signaler()
  prevenir()
  return etat.d.compagnon
}

/** Change l'espèce, le pelage ou le nom. */
export function changerCompagnon(partie, valeur) {
  const c = compagnon()
  if (!c) return
  if (partie === 'espece' && ESPECES_COMPAGNONS[valeur]) c.espece = valeur
  else if (partie === 'pelage' && PELAGES.some((p) => p.id === valeur)) c.pelage = valeur
  else if (partie === 'nom') c.nom = String(valeur || '').replace(/\s+/g, ' ').trim().slice(0, 14) || c.nom
  else return
  etat.signaler()
  if (partie !== 'nom') prevenir()
}

/** Les couleurs du pelage choisi. */
export function couleursPelage(c = compagnon()) {
  return PELAGES.find((p) => p.id === c?.pelage) || PELAGES[0]
}
