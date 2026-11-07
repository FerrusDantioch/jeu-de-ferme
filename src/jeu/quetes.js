/**
 * quetes.js — les règles des quêtes du jour.
 *
 *  - 3 quêtes par jour, les mêmes toute la journée (tirées au hasard avec le jour comme « graine ») ;
 *  - renouvelées à minuit (heure du téléphone) ;
 *  - une quête finie se « reçoit » avec un bouton (pièces + ⭐) ;
 *  - à minuit, les quêtes finies mais pas encore reçues sont données automatiquement :
 *    on ne perd jamais une récompense ;
 *  - aucune pénalité si une quête n'est pas faite.
 */
import { MODELES_QUETES, NOMBRE_DE_QUETES, TEXTES_SPECIAUX } from '../donnees/quetes.js'
import { etat } from './etat.js'
import { cleDuJour, feteDuJour } from './calendrier.js'
import { ecouterActions } from './evenements.js'
import { gagnerPieces, gagnerExperience } from './economie.js'

// Fonctions à prévenir quand une quête vient d'être terminée.
const auditeursFinies = new Set()
export function surQueteTerminee(fonction) {
  auditeursFinies.add(fonction)
}

/** Nombres pseudo-aléatoires reproductibles à partir d'un texte (la date). */
function aleatoireDepuis(texte) {
  let s = 0
  for (const c of texte) s = (s * 31 + c.charCodeAt(0)) % 2147483647
  if (s === 0) s = 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Le texte d'une quête. */
export function texteQuete(q) {
  const modele = MODELES_QUETES.find((m) => m.type === q.type)
  const brut = q.speciale ? TEXTES_SPECIAUX[q.type] || modele?.texte : modele?.texte
  return (brut || q.type).replace('{n}', q.objectif).replaceAll('{s}', q.objectif > 1 ? 's' : '')
}

/** Les modèles possibles aujourd'hui (ex. : pas de « ramasser » sans animaux). */
function modelesPossibles() {
  const animaux = etat.d.animaux.length > 0
  return MODELES_QUETES.filter((m) => (m.type === 'ramasser' || m.type === 'nourrir' || m.type === 'caresser' ? animaux : true))
}

/** Tire les quêtes d'un jour. */
function tirerQuetes(cle) {
  const alea = aleatoireDepuis(cle)
  const liste = []
  // Une quête spéciale si c'est jour de fête.
  const fete = feteDuJour()
  if (fete && fete.quete) {
    liste.push({ ...fete.quete, progres: 0, recue: false, speciale: true, fete: fete.id, vus: [] })
  }
  const modeles = modelesPossibles().filter((m) => !liste.some((q) => q.type === m.type))
  while (liste.length < NOMBRE_DE_QUETES && modeles.length > 0) {
    const m = modeles.splice(Math.floor(alea() * modeles.length), 1)[0]
    const n = m.objectif[0] + Math.floor(alea() * (m.objectif[1] - m.objectif[0] + 1))
    liste.push({
      type: m.type,
      objectif: n,
      progres: 0,
      recue: false,
      pieces: Math.round(m.pieces[0] + m.pieces[1] * n),
      experience: Math.round(m.experience[0] + m.experience[1] * n),
      vus: [],
    })
  }
  return liste
}

/** Donne la récompense d'une quête finie. */
function donner(q) {
  q.recue = true
  etat.d.stats.quetesReussies++
  gagnerPieces(q.pieces)
  gagnerExperience(q.experience)
}

/**
 * À appeler régulièrement : si on a changé de jour, les quêtes finies non reçues
 * sont données, puis 3 nouvelles quêtes sont tirées.
 * @returns {boolean} vrai si de nouvelles quêtes viennent d'arriver
 */
export function verifierJour() {
  const cle = cleDuJour()
  const q = etat.d.quetes
  if (q.jour === cle) return false
  for (const ancienne of q.liste) if (ancienne.progres >= ancienne.objectif && !ancienne.recue) donner(ancienne)
  etat.d.quetes = { jour: cle, liste: tirerQuetes(cle) }
  etat.signaler()
  return true
}

/** Les quêtes du jour. */
export function quetesDuJour() {
  return etat.d.quetes.liste
}

/** Nombre de quêtes finies dont la récompense attend d'être reçue. */
export function nombreARecevoir() {
  return quetesDuJour().filter((q) => q.progres >= q.objectif && !q.recue).length
}

/** Reçoit la récompense d'une quête finie. Renvoie la quête, ou null. */
export function recevoir(index) {
  const q = quetesDuJour()[index]
  if (!q || q.recue || q.progres < q.objectif) return null
  donner(q)
  return q
}

/** Fait avancer les quêtes d'un type. */
function avancer(type, combien = 1, idUnique = null) {
  let change = false
  for (const q of quetesDuJour()) {
    if (q.type !== type || q.progres >= q.objectif) continue
    if (idUnique) {
      // « Discuter avec 3 villageois DIFFÉRENTS » : on ne compte chacun qu'une fois.
      q.vus = q.vus || []
      if (q.vus.includes(idUnique)) continue
      q.vus.push(idUnique)
    }
    q.progres = Math.min(q.objectif, q.progres + combien)
    change = true
    if (q.progres >= q.objectif) for (const f of auditeursFinies) f(q)
  }
  if (change) etat.signaler()
}

// Les quêtes écoutent ce que fait le joueur.
ecouterActions((type, details) => {
  if (type === 'vendre') avancer('vendre', details.pieces || 0)
  else if (type === 'parler') avancer('parler', 1, details.qui)
  else if (type === 'oeuf') avancer('oeufs', 1)
  else if (type === 'cueillir') avancer('cueillir', details.n || 1)
  else avancer(type, 1)
})
