/**
 * economie.js — les pièces, l'expérience (⭐) et les niveaux ;
 * acheter des graines ou des animaux, vendre ses récoltes.
 */
import {
  GRAINES_EN_VENTE, ANIMAUX_EN_VENTE, PRIX_DE_VENTE, NOMS_ANIMAUX,
  experiencePourNiveau, NIVEAU_MAXIMUM,
} from '../donnees/economie.js'
import { CULTURES } from '../donnees/cultures.js'
import { ESPECES } from '../donnees/animaux.js'
import { etat } from './etat.js'
import { DECORATIONS } from '../donnees/decorations.js'
import { ajouter, retirer, quantite } from './inventaire.js'
import { annoncer } from './evenements.js'

// Fonctions à prévenir quand on passe un niveau.
const auditeursNiveau = new Set()
export function surNouveauNiveau(fonction) {
  auditeursNiveau.add(fonction)
}

/** Le niveau correspondant à une quantité d'expérience. */
export function niveauPour(experience) {
  let n = 1
  while (n < NIVEAU_MAXIMUM && experience >= experiencePourNiveau(n + 1)) n++
  return n
}

export function niveau() {
  return niveauPour(etat.d.experience)
}

/** Où en est-on vers le niveau suivant : { niveau, fraction (0 à 1), manque } */
export function progression() {
  const n = niveau()
  if (n >= NIVEAU_MAXIMUM) return { niveau: n, fraction: 1, manque: 0 }
  const debut = experiencePourNiveau(n)
  const fin = experiencePourNiveau(n + 1)
  return { niveau: n, fraction: (etat.d.experience - debut) / (fin - debut), manque: fin - etat.d.experience }
}

/** Gagne de l'expérience. Prévient si un (ou plusieurs) niveaux sont passés. */
export function gagnerExperience(n) {
  if (!n) return 0
  const avant = niveau()
  etat.d.experience += n
  const apres = niveau()
  etat.signaler()
  for (let k = avant + 1; k <= apres; k++) for (const f of auditeursNiveau) f(k)
  return n
}

export function gagnerPieces(n) {
  etat.d.pieces += n
  etat.d.stats.piecesGagnees += n
  etat.signaler()
}

/** Dépense des pièces. Renvoie faux (sans rien faire) s'il n'y en a pas assez. */
export function depenserPieces(n) {
  if (etat.d.pieces < n) return false
  etat.d.pieces -= n
  etat.signaler()
  return true
}

/** Ce qui se débloque à un niveau donné : [{ icone, nom }] */
export function deblocagesDuNiveau(n) {
  const liste = []
  for (const [id, g] of Object.entries(GRAINES_EN_VENTE)) {
    if (g.niveau === n) liste.push({ icone: CULTURES[id].icone, nom: `Graines de ${CULTURES[id].nomCourt}` })
  }
  for (const [id, a] of Object.entries(ANIMAUX_EN_VENTE)) {
    if (a.niveau === n) liste.push({ icone: ESPECES[id].icone, nom: `${ESPECES[id].nom}s à adopter` })
  }
  for (const d of Object.values(DECORATIONS)) {
    if (d.niveau === n) liste.push({ icone: d.icone, nom: `Décoration : ${d.nom.toLowerCase()}` })
  }
  return liste
}

// --- Boutique ---

/** Achète n graines. Renvoie vrai si c'est fait. */
export function acheterGraines(idCulture, n = 1) {
  const offre = GRAINES_EN_VENTE[idCulture]
  if (!offre || niveau() < offre.niveau) return false
  if (!depenserPieces(offre.prix * n)) return false
  ajouter(`graine-${idCulture}`, n)
  return true
}

/** Nombre d'animaux d'une espèce à la ferme. */
export function nombreAnimaux(espece) {
  return etat.d.animaux.filter((a) => a.espece === espece).length
}

/**
 * Adopte un animal. Renvoie la fiche du nouvel animal, ou null si impossible.
 */
export function adopterAnimal(espece, maintenant = Date.now()) {
  const offre = ANIMAUX_EN_VENTE[espece]
  if (!offre || niveau() < offre.niveau) return null
  if (nombreAnimaux(espece) >= offre.maximum) return null
  if (!depenserPieces(offre.prix)) return null
  const pris = new Set(etat.d.animaux.map((a) => a.nom))
  const nom = NOMS_ANIMAUX[espece].find((x) => !pris.has(x)) || `${ESPECES[espece].nom} ${nombreAnimaux(espece) + 1}`
  const fiche = {
    id: `${espece}-${maintenant}`,
    espece,
    nom,
    lieu: espece === 'vache' ? 'etable' : 'exterieur',
    satiete: 80,
    bonheur: 80,
    production: 0,
    produitPret: false,
    derniereMaj: maintenant,
  }
  if (espece === 'vache') {
    // Première stalle libre.
    const prises = new Set(etat.d.animaux.filter((a) => a.espece === 'vache').map((a) => a.place))
    fiche.place = [0, 1, 2].find((p) => !prises.has(p)) ?? 1
  }
  etat.d.animaux.push(fiche)
  etat.signaler()
  return fiche
}

/** Ce qu'on peut vendre et qu'on a dans le sac : [[id, quantité, prix], …] */
export function aVendre() {
  return Object.entries(PRIX_DE_VENTE)
    .map(([id, prix]) => [id, quantite(id), prix])
    .filter(([, n]) => n > 0)
}

/** Vend n objets. Renvoie le nombre de pièces gagnées (0 si impossible). */
export function vendre(id, n = 1) {
  const prix = PRIX_DE_VENTE[id]
  if (!prix || !retirer(id, n)) return 0
  gagnerPieces(prix * n)
  annoncer('vendre', { id, pieces: prix * n })
  return prix * n
}
