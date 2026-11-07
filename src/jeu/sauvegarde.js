/**
 * sauvegarde.js — garde la partie sur le téléphone, automatiquement.
 *
 * La partie est rangée dans la mémoire du navigateur (« localStorage ») :
 * elle reste sur l'appareil, rien n'est envoyé sur Internet.
 *
 * On sauvegarde :
 *  - toutes les 15 secondes s'il y a eu du changement ;
 *  - dès que le jeu passe en arrière-plan ou se ferme.
 *
 * Si une sauvegarde est abîmée, on la met de côté (sans l'effacer) et on
 * recommence une partie, avec un message gentil.
 *
 * On peut aussi « exporter » la partie dans un fichier (pour la garder ou la
 * passer sur un autre appareil) et l'« importer » plus tard.
 */
import { etat, nouvellePartie, completer, VERSION_SAUVEGARDE } from './etat.js'
import { NOM_DU_JEU } from '../config.js'

const CLE = 'jeu-de-ferme:sauvegarde'
const CLE_ABIMEE = 'jeu-de-ferme:sauvegarde-abimee'
const INTERVALLE = 15000 // millisecondes
// Marque reconnue dans les fichiers exportés (pour refuser les fichiers d'autres jeux).
const MARQUE = 'jeu-de-ferme'

// Quand on remplace la partie (import, nouvelle partie), on bloque la sauvegarde
// automatique pour qu'elle n'écrase pas la nouvelle avec l'ancienne.
let bloque = false

/**
 * Charge la partie enregistrée (ou en crée une nouvelle).
 * @returns {{ donnees: object, message: string|null }}
 */
export function chargerPartie() {
  let texte = null
  try {
    texte = localStorage.getItem(CLE)
  } catch {
    return {
      donnees: nouvellePartie(),
      message: 'La mémoire du navigateur n’est pas accessible : la partie ne pourra pas être gardée.',
    }
  }
  if (!texte) return { donnees: nouvellePartie(), message: null }
  try {
    const lu = JSON.parse(texte)
    if (!lu || typeof lu !== 'object') throw new Error('format inconnu')
    return { donnees: completer(lu), message: null }
  } catch (erreur) {
    console.error('Sauvegarde illisible :', erreur)
    try {
      localStorage.setItem(CLE_ABIMEE, texte)
    } catch {
      /* tant pis : on aura essayé */
    }
    return {
      donnees: nouvellePartie(),
      message: 'Oups, la sauvegarde n’a pas pu être lue. Une nouvelle partie commence (l’ancienne est gardée de côté).',
    }
  }
}

/**
 * Enregistre la partie maintenant.
 * @param {function} avantEnregistrement  appelée juste avant (pour noter la position du joueur…)
 * @returns {boolean} vrai si tout s'est bien passé
 */
export function enregistrer(avantEnregistrement) {
  if (bloque) return true
  try {
    if (avantEnregistrement) avantEnregistrement(etat.d)
    etat.d.enregistreLe = Date.now()
    localStorage.setItem(CLE, JSON.stringify(etat.d))
    return true
  } catch (erreur) {
    console.error('Sauvegarde impossible :', erreur)
    return false
  }
}

/**
 * Lance la sauvegarde automatique.
 * @param {function} avantEnregistrement  voir enregistrer()
 * @param {function} surEchec  appelée (une seule fois) si la sauvegarde échoue
 */
export function demarrerSauvegardeAuto(avantEnregistrement, surEchec) {
  let echecSignale = false
  const sauver = () => {
    const ok = enregistrer(avantEnregistrement)
    if (!ok && !echecSignale) {
      echecSignale = true
      if (surEchec) surEchec()
    }
  }
  setInterval(() => {
    if (etat.prendreModifie()) sauver()
  }, INTERVALLE)
  // Le jeu passe en arrière-plan (autre appli, écran éteint) ou se ferme : on sauvegarde tout de suite.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sauver()
  })
  window.addEventListener('pagehide', sauver)

  // On demande au navigateur de ne pas effacer nos données pour faire de la place.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {})
}

// --- Exporter / importer / recommencer ---

/** Le fichier (texte) d'une partie exportée. */
function fichierDePartie(donnees) {
  return JSON.stringify({ marque: MARQUE, jeu: NOM_DU_JEU, version: VERSION_SAUVEGARDE, exporteLe: new Date().toISOString(), partie: donnees }, null, 1)
}

/**
 * Exporte la partie : le téléphone télécharge un petit fichier (dans « Téléchargements »).
 * @returns {string} le nom du fichier
 */
export function exporterPartie(avantEnregistrement) {
  enregistrer(avantEnregistrement)
  const d = new Date()
  const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const nom = `petite-ferme-sauvegarde-${jour}.json`
  const blob = new Blob([fichierDePartie(etat.d)], { type: 'application/json' })
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(blob)
  lien.download = nom
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(lien.href), 10000)
  return nom
}

/**
 * Lit un fichier choisi par la personne et vérifie que c'est bien une partie de ce jeu.
 * @returns {Promise<{ ok: boolean, donnees?: object, resume?: string, message?: string }>}
 */
export async function lireFichierDePartie(fichier) {
  try {
    if (fichier.size > 5 * 1024 * 1024) return { ok: false, message: 'Ce fichier est bien trop gros pour être une partie.' }
    const lu = JSON.parse(await fichier.text())
    if (!lu || lu.marque !== MARQUE || typeof lu.partie !== 'object' || !lu.partie) {
      return { ok: false, message: 'Ce fichier n’est pas une sauvegarde de ce jeu.' }
    }
    const donnees = completer(lu.partie)
    const date = lu.exporteLe ? new Date(lu.exporteLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '?'
    return { ok: true, donnees, resume: `Partie exportée le ${date} · 🪙 ${donnees.pieces} · ⭐ ${donnees.experience} expérience` }
  } catch (erreur) {
    console.error('Fichier illisible :', erreur)
    return { ok: false, message: 'Oups, ce fichier n’a pas pu être lu. Est-ce bien une sauvegarde du jeu ?' }
  }
}

/** Remplace la partie actuelle par une autre, puis relance le jeu. */
export function remplacerPartie(donnees) {
  try {
    localStorage.setItem(CLE, JSON.stringify(donnees))
  } catch (erreur) {
    console.error('Import impossible :', erreur)
    return false // la partie actuelle n'a pas été touchée
  }
  bloque = true
  location.reload()
  return true
}

/** Efface la partie et en commence une nouvelle (le jeu se relance). */
export function recommencerPartie() {
  bloque = true
  localStorage.removeItem(CLE)
  location.reload()
}
