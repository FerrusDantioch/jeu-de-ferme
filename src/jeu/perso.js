/**
 * perso.js — le prénom et l'apparence du personnage du joueur.
 *
 * Ils sont gardés dans la partie (etat.d.perso) : { nom, apparence: { peau, cheveux, … } }.
 * L'apparence est rangée sous forme de « choix » (ex. : cheveux: 'roux') ;
 * versModele() la traduit en couleurs pour le modèle 3D.
 */
import { etat } from './etat.js'
import {
  PEAUX, CHEVEUX, COIFFURES, TENUES, COULEURS_TENUE, CHAPEAUX, APPARENCE_DE_DEPART, LONGUEUR_PRENOM,
} from '../donnees/apparence.js'
import { PALETTE } from '../modeles/materiaux.js'

// Pour chaque partie de l'apparence : la liste des choix possibles.
export const LISTES = {
  peau: PEAUX,
  cheveux: CHEVEUX,
  coiffure: COIFFURES,
  tenue: TENUES,
  haut: COULEURS_TENUE,
  bas: COULEURS_TENUE,
  chapeau: CHAPEAUX,
  couleurChapeau: COULEURS_TENUE,
}

const auditeurs = new Set()

/** Être prévenu quand l'apparence change (pour redessiner le personnage). */
export function surChangementApparence(fonction) {
  auditeurs.add(fonction)
}

/** L'apparence actuelle (avec des valeurs de départ pour ce qui manquerait). */
export function apparence() {
  return { ...APPARENCE_DE_DEPART, ...(etat.d.perso?.apparence || {}) }
}

/** Le prénom choisi (ou '' si aucun). */
export function prenom() {
  return etat.d.perso?.nom || ''
}

/** Change le prénom (espaces en trop retirés, longueur limitée). */
export function changerPrenom(texte) {
  const nom = String(texte || '').replace(/\s+/g, ' ').trim().slice(0, LONGUEUR_PRENOM)
  etat.d.perso = { ...(etat.d.perso || {}), nom }
  etat.signaler()
}

/** Change une partie de l'apparence (ex. : changer('cheveux', 'roux')). */
export function changer(partie, choix) {
  if (!LISTES[partie]?.some((c) => c.id === choix)) return
  etat.d.perso = { ...(etat.d.perso || {}), apparence: { ...apparence(), [partie]: choix } }
  etat.signaler()
  for (const f of auditeurs) f()
}

/** Une apparence tirée au hasard (pour le bouton 🎲). */
export function auHasard() {
  const tirer = (liste) => liste[Math.floor(Math.random() * liste.length)].id
  const nouvelle = Object.fromEntries(Object.entries(LISTES).map(([partie, liste]) => [partie, tirer(liste)]))
  // Pas deux fois la même couleur en haut et en bas (c'est plus joli).
  while (nouvelle.bas === nouvelle.haut) nouvelle.bas = tirer(COULEURS_TENUE)
  etat.d.perso = { ...(etat.d.perso || {}), apparence: nouvelle }
  etat.signaler()
  for (const f of auditeurs) f()
}

/** La couleur (0x…) d'un choix. */
function couleur(partie, id) {
  const liste = LISTES[partie]
  return (liste.find((c) => c.id === id) || liste[0]).couleur
}

/** Traduit l'apparence choisie en « options » pour le modèle 3D (src/modeles/personnage.js). */
export function versModele(a = apparence()) {
  const haut = couleur('haut', a.haut)
  const bas = couleur('bas', a.bas)
  return {
    peau: couleur('peau', a.peau),
    cheveux: couleur('cheveux', a.cheveux),
    coiffure: a.coiffure,
    haut,
    // En robe, les jambes ont la couleur des collants (celle du bas).
    bas,
    robe: a.tenue === 'robe',
    salopette: a.tenue === 'salopette',
    tablier: a.tenue === 'jardinier' ? bas : null,
    // Avec le tablier de jardin, le pantalon est brun (le tablier prend la couleur choisie).
    ...(a.tenue === 'jardinier' ? { bas: 0x8a6a4a } : {}),
    chapeau: a.chapeau,
    couleurChapeau: couleur('couleurChapeau', a.couleurChapeau),
    chaussures: PALETTE.chaussures,
  }
}

/**
 * Glisse le prénom du joueur dans une phrase : « Bonjour {nom} ! » → « Bonjour Camille ! ».
 * Sans prénom, le {nom} disparaît simplement : « Bonjour ! ».
 */
export function avecPrenom(texte) {
  const nom = prenom()
  return nom ? texte.replaceAll('{nom}', nom) : texte.replace(/\s*\{nom\}/g, '')
}
