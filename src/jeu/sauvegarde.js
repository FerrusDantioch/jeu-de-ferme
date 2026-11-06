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
 */
import { etat, nouvellePartie, completer } from './etat.js'

const CLE = 'jeu-de-ferme:sauvegarde'
const CLE_ABIMEE = 'jeu-de-ferme:sauvegarde-abimee'
const INTERVALLE = 15000 // millisecondes

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
