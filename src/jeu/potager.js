/**
 * potager.js — les règles du potager (sans dessin : juste les calculs).
 *
 * La pousse se calcule avec l'heure réelle : si on ferme le jeu une heure,
 * les plantes ont poussé d'une heure en revenant.
 * Si l'heure du téléphone recule (changement d'heure…), rien ne recule : on repart de là.
 */
import { CULTURES, ARROSAGE, GRAINES_RENDUES } from '../donnees/cultures.js'
import { etat } from './etat.js'
import { ajouter, retirer, quantite } from './inventaire.js'
import { annoncer } from './evenements.js'

const MINUTE = 60 * 1000

// Les 4 étapes visibles : 0 = graine, 1 = pousse, 2 = jeune plante, 3 = prête à récolter.
export const NOMS_STADES = ['Graine', 'Petite pousse', 'Jeune plante', 'Prête à récolter !']

/** Fait avancer la pousse d'une parcelle jusqu'à « maintenant ». */
export function avancer(parcelle, maintenant = Date.now()) {
  if (!parcelle.culture) return
  const ecoule = maintenant - parcelle.derniereMaj
  if (ecoule > 0) {
    // Le temps passé en terre humide compte double (bonus d'arrosage).
    const humide = Math.min(Math.max(parcelle.humideJusqua - parcelle.derniereMaj, 0), ecoule)
    parcelle.progression += ecoule + humide * (ARROSAGE.bonus - 1)
    const duree = CULTURES[parcelle.culture].minutes * MINUTE
    parcelle.progression = Math.min(parcelle.progression, duree)
  }
  parcelle.derniereMaj = maintenant
}

/** Où en est une parcelle : stade (0 à 3), fraction (0 à 1), temps restant (ms), humide ? */
export function observer(parcelle, maintenant = Date.now()) {
  avancer(parcelle, maintenant)
  if (!parcelle.culture) return { vide: true, humide: parcelle.humideJusqua > maintenant }
  const culture = CULTURES[parcelle.culture]
  const duree = culture.minutes * MINUTE
  const fraction = Math.min(1, parcelle.progression / duree)
  const prete = fraction >= 1
  const humide = parcelle.humideJusqua > maintenant
  // Temps restant estimé (plus court si la terre est humide).
  const reste = duree - parcelle.progression
  const restantHumide = Math.max(0, parcelle.humideJusqua - maintenant) * ARROSAGE.bonus
  const resteMs = reste <= restantHumide ? reste / ARROSAGE.bonus : reste - restantHumide + restantHumide / ARROSAGE.bonus
  return {
    vide: false,
    culture,
    idCulture: parcelle.culture,
    fraction,
    prete,
    humide,
    resteMs: prete ? 0 : resteMs,
    stade: prete ? 3 : fraction < 0.33 ? 0 : fraction < 0.66 ? 1 : 2,
  }
}

/** Plante une graine (prise dans le sac). Renvoie vrai si c'est fait. */
export function planter(n, idCulture, maintenant = Date.now()) {
  const parcelle = etat.d.parcelles[n]
  if (!parcelle || parcelle.culture || !CULTURES[idCulture]) return false
  if (!retirer(`graine-${idCulture}`)) return false
  parcelle.culture = idCulture
  parcelle.progression = 0
  parcelle.derniereMaj = maintenant
  etat.signaler()
  annoncer('planter', { culture: idCulture })
  return true
}

/** Arrose une parcelle : la terre reste humide un moment. */
export function arroser(n, maintenant = Date.now()) {
  const parcelle = etat.d.parcelles[n]
  if (!parcelle) return false
  avancer(parcelle, maintenant)
  parcelle.humideJusqua = maintenant + ARROSAGE.minutesHumide * MINUTE
  etat.signaler()
  annoncer('arroser')
  return true
}

/**
 * Récolte une parcelle prête.
 * @returns {null | {recolte: number, graines: number, culture: object}}
 */
export function recolter(n, maintenant = Date.now()) {
  const parcelle = etat.d.parcelles[n]
  if (!parcelle || !parcelle.culture) return null
  const vue = observer(parcelle, maintenant)
  if (!vue.prete) return null
  const id = parcelle.culture
  const culture = CULTURES[id]
  const graines = GRAINES_RENDUES.minimum + (Math.random() < GRAINES_RENDUES.chanceDeplus ? 1 : 0)
  ajouter(id, culture.recolte)
  ajouter(`graine-${id}`, graines)
  parcelle.culture = null
  parcelle.progression = 0
  etat.d.stats.recoltes++
  etat.signaler()
  annoncer('recolter', { culture: id })
  return { recolte: culture.recolte, graines, culture }
}

/** Les graines disponibles dans le sac : [[idCulture, quantité], …] */
export function grainesDisponibles() {
  return Object.keys(CULTURES)
    .map((id) => [id, quantite(`graine-${id}`)])
    .filter(([, n]) => n > 0)
}

/** Texte lisible pour un temps restant (« encore 3 min », « moins d'une minute »). */
export function texteDuree(ms) {
  const minutes = Math.ceil(ms / MINUTE)
  if (minutes <= 1) return 'moins d’une minute'
  if (minutes < 60) return `environ ${minutes} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste ? `environ ${heures} h ${reste} min` : `environ ${heures} h`
}
