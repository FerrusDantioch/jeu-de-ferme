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
 * Copies de secours : en plus de la sauvegarde, on garde quelques copies anciennes
 * (une par jour de jeu, et une juste avant chaque import, restauration ou nouvelle
 * partie). Une erreur n'est donc jamais définitive : on peut revenir en arrière
 * depuis ⚙️ Réglages → « Copies de secours ».
 *
 * Si la sauvegarde est abîmée, on la met de côté (sans l'effacer) et on reprend
 * automatiquement la copie de secours la plus récente (ou, s'il n'y en a pas,
 * une nouvelle partie), avec un message gentil.
 *
 * On peut aussi « exporter » la partie dans un fichier (pour la garder ou la
 * passer sur un autre appareil) et l'« importer » plus tard.
 */
import { etat, nouvellePartie, completer, VERSION_SAUVEGARDE } from './etat.js'
import { NOM_DU_JEU } from '../config.js'

const CLE = 'jeu-de-ferme:sauvegarde'
const CLE_ABIMEE = 'jeu-de-ferme:sauvegarde-abimee'
const CLE_SECOURS = 'jeu-de-ferme:secours'
// Nombre de copies de secours gardées (les plus anciennes laissent la place).
const COPIES_MAXIMUM = 6
const INTERVALLE = 15000 // millisecondes
// Marque reconnue dans les fichiers exportés (pour refuser les fichiers d'autres jeux).
const MARQUE = 'jeu-de-ferme'

// Quand on remplace la partie (import, nouvelle partie), on bloque la sauvegarde
// automatique pour qu'elle n'écrase pas la nouvelle avec l'ancienne.
let bloque = false

// --- Copies de secours ---

const deuxChiffres = (n) => String(n).padStart(2, '0')
/** « 2026-11-13 » : le jour d'une date (heure de l'appareil). */
const jourDe = (d) => `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`

/** Lit la liste brute des copies : [{ quand, raison, texte }], la plus récente d'abord. */
function lireCopies() {
  try {
    const liste = JSON.parse(localStorage.getItem(CLE_SECOURS) || '[]')
    return Array.isArray(liste) ? liste.filter((c) => c && typeof c.texte === 'string' && Number.isFinite(c.quand)) : []
  } catch {
    return []
  }
}

/** Range la liste des copies. Si la mémoire est pleine, on enlève les plus anciennes. */
function ecrireCopies(liste) {
  let copies = liste.slice(0, COPIES_MAXIMUM)
  while (copies.length > 0) {
    try {
      localStorage.setItem(CLE_SECOURS, JSON.stringify(copies))
      return true
    } catch {
      copies = copies.slice(0, -1)
    }
  }
  return false
}

/**
 * Garde une copie de la sauvegarde telle qu'elle est rangée en ce moment.
 * @param {string} raison  'jour' (copie automatique du jour), 'import', 'restauration' ou 'recommencer'
 */
function garderCopie(raison) {
  try {
    const texte = localStorage.getItem(CLE)
    if (!texte) return false
    JSON.parse(texte) // on ne garde que des copies lisibles
    const copies = lireCopies().filter((c) => c.texte !== texte)
    copies.unshift({ quand: Date.now(), raison, texte })
    return ecrireCopies(copies)
  } catch {
    return false
  }
}

/**
 * La copie automatique du jour : à appeler une fois le jeu bien démarré (on est alors
 * sûr que cette sauvegarde fonctionne). Une seule par jour.
 */
export function garderCopieDuJour() {
  const aujourdhui = jourDe(new Date())
  if (lireCopies().some((c) => c.raison === 'jour' && jourDe(new Date(c.quand)) === aujourdhui)) return
  garderCopie('jour')
}

const RAISONS = {
  jour: 'Copie automatique',
  import: 'Avant un import',
  restauration: 'Avant une restauration',
  recommencer: 'Avant une nouvelle partie',
}

/**
 * Les copies de secours, prêtes à être affichées :
 * [{ numero, titre, resume }], la plus récente d'abord.
 */
export function copiesDeSecours() {
  return lireCopies().map((c, numero) => {
    const date = new Date(c.quand).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const heure = new Date(c.quand).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    let resume = ''
    try {
      const d = JSON.parse(c.texte)
      resume = `🪙 ${Number(d.pieces) || 0} · ⭐ ${Number(d.experience) || 0} · 🐾 ${Array.isArray(d.animaux) ? d.animaux.length : 0} animaux`
    } catch {
      /* copie illisible : elle ne devrait pas exister, on l'affiche sans détails */
    }
    return { numero, titre: `${date} à ${heure}`, raison: RAISONS[c.raison] || 'Copie', resume }
  })
}

/** Reprend une copie de secours (la partie actuelle est d'abord gardée, elle aussi), puis relance le jeu. */
export function restaurerCopie(numero, avantEnregistrement, enregistrerAvant = true) {
  const copie = lireCopies()[numero]
  if (!copie) return false
  try {
    JSON.parse(copie.texte)
    // (enregistrerAvant = false : depuis l'écran de secours, on ne touche pas à ce qui est rangé.)
    if (enregistrerAvant && etat.d.joueur) enregistrer(avantEnregistrement) // la partie en cours, à jour
    garderCopie('restauration')
    localStorage.setItem(CLE, copie.texte)
  } catch (erreur) {
    console.error('Restauration impossible :', erreur)
    return false
  }
  bloque = true
  location.reload()
  return true
}

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
    if (!lu || typeof lu !== 'object' || Array.isArray(lu)) throw new Error('format inconnu')
    return { donnees: completer(lu), message: null }
  } catch (erreur) {
    console.error('Sauvegarde illisible :', erreur)
    try {
      localStorage.setItem(CLE_ABIMEE, texte)
    } catch {
      /* tant pis : on aura essayé */
    }
    // On reprend la copie de secours la plus récente qui se lit bien.
    for (const copie of lireCopies()) {
      try {
        const donnees = completer(JSON.parse(copie.texte))
        const date = new Date(copie.quand).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        return { donnees, message: `Oups, la sauvegarde était abîmée. J’ai repris ta copie de secours du ${date} : rien de grave ! 🛟` }
      } catch {
        /* cette copie ne va pas non plus : on essaie la suivante */
      }
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
    // De retour dans le jeu (parfois plusieurs jours après, sans l'avoir fermé) :
    // on fait la copie de secours du jour si elle n'existe pas encore.
    else garderCopieDuJour()
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

/** Propose un fichier au téléchargement (il arrive dans « Téléchargements »). */
function telecharger(contenu, nom) {
  const blob = new Blob([contenu], { type: 'application/json' })
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(blob)
  lien.download = nom
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  setTimeout(() => URL.revokeObjectURL(lien.href), 10000)
}

/**
 * Exporte la partie : le téléphone télécharge un petit fichier (dans « Téléchargements »).
 * @returns {string} le nom du fichier
 */
export function exporterPartie(avantEnregistrement) {
  enregistrer(avantEnregistrement)
  const nom = `petite-ferme-sauvegarde-${jourDe(new Date())}.json`
  telecharger(fichierDePartie(etat.d), nom)
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

/**
 * Remplace la partie actuelle par une autre, puis relance le jeu.
 * La partie actuelle est d'abord gardée dans les copies de secours.
 */
export function remplacerPartie(donnees, avantEnregistrement) {
  try {
    enregistrer(avantEnregistrement)
    garderCopie('import')
    localStorage.setItem(CLE, JSON.stringify(donnees))
  } catch (erreur) {
    console.error('Import impossible :', erreur)
    return false // la partie actuelle n'a pas été touchée
  }
  bloque = true
  location.reload()
  return true
}

/**
 * Commence une nouvelle partie (le jeu se relance).
 * L'ancienne partie est gardée dans les copies de secours : on peut encore y revenir.
 */
export function recommencerPartie(avantEnregistrement, enregistrerAvant = true) {
  try {
    if (enregistrerAvant && etat.d.joueur) enregistrer(avantEnregistrement)
    garderCopie('recommencer')
    localStorage.removeItem(CLE)
  } catch (erreur) {
    console.error('Nouvelle partie impossible :', erreur)
    return
  }
  bloque = true
  location.reload()
}

/**
 * Télécharge la sauvegarde telle qu'elle est rangée sur l'appareil, sans passer par le jeu
 * (utilisé par l'écran de secours, quand le jeu n'a pas pu démarrer).
 * @returns {boolean} vrai si un fichier a été proposé
 */
export function exporterSauvegardeBrute() {
  let texte = null
  try {
    texte = localStorage.getItem(CLE)
  } catch {
    /* mémoire inaccessible */
  }
  if (!texte) return false
  let contenu = texte
  try {
    // Si elle se lit, on lui donne la même forme qu'un export normal (elle pourra être importée).
    contenu = fichierDePartie(JSON.parse(texte))
  } catch {
    /* illisible : on donne le texte tel quel, pour ne rien perdre */
  }
  telecharger(contenu, `petite-ferme-sauvegarde-${jourDe(new Date())}.json`)
  return true
}
