/**
 * sons.js — des petits sons doux, fabriqués par le code (aucun fichier à télécharger,
 * donc ils marchent aussi sans Internet).
 *
 * Principe : on joue de courtes notes avec un son rond (« sinus » ou « triangle »),
 * qui commencent et finissent en douceur. Jamais fort, jamais strident.
 * Le navigateur n'autorise le son qu'après un premier toucher de l'écran :
 * avant, les sons sont simplement ignorés.
 */
import { reglages, VOLUMES } from '../jeu/reglages.js'

let contexte = null
let sortie = null

/** Prépare le son au premier toucher (exigé par les navigateurs). */
function preparer() {
  if (contexte) {
    if (contexte.state === 'suspended') contexte.resume().catch(() => {})
    return
  }
  const Classe = window.AudioContext || window.webkitAudioContext
  if (!Classe) return
  contexte = new Classe()
  sortie = contexte.createGain()
  sortie.connect(contexte.destination)
}
window.addEventListener('pointerdown', preparer, { passive: true })
window.addEventListener('keydown', preparer)

/**
 * Joue une note.
 * @param {number} frequence  hauteur de la note (en hertz)
 * @param {number} debut      dans combien de secondes
 * @param {number} duree      durée en secondes
 * @param {object} o          { type: 'sine' | 'triangle', force: 0 à 1, glisse: fréquence d'arrivée }
 */
function note(frequence, debut = 0, duree = 0.15, { type = 'sine', force = 0.5, glisse = null } = {}) {
  const t = contexte.currentTime + debut
  const osc = contexte.createOscillator()
  const enveloppe = contexte.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequence, t)
  if (glisse) osc.frequency.exponentialRampToValueAtTime(glisse, t + duree)
  // Attaque douce, puis extinction progressive (pas de « clic »).
  enveloppe.gain.setValueAtTime(0.0001, t)
  enveloppe.gain.exponentialRampToValueAtTime(force * 0.25, t + 0.015)
  enveloppe.gain.exponentialRampToValueAtTime(0.0001, t + duree)
  osc.connect(enveloppe).connect(sortie)
  osc.start(t)
  osc.stop(t + duree + 0.05)
}

// Notes (en hertz) : do, mi, sol, do aigu…
const DO = 523.25
const RE = 587.33
const MI = 659.25
const SOL = 783.99
const LA = 880
const DO2 = 1046.5

// Le catalogue des sons du jeu.
const SONS = {
  toucher: () => note(660, 0, 0.07, { force: 0.25 }),
  bouton: () => note(880, 0, 0.06, { type: 'triangle', force: 0.25 }),
  planter: () => note(330, 0, 0.12, { glisse: 440, force: 0.5 }),
  arroser: () => {
    for (let k = 0; k < 4; k++) note(1200 + k * 150, k * 0.05, 0.06, { force: 0.2 })
  },
  recolter: () => {
    note(MI, 0, 0.12)
    note(SOL, 0.09, 0.18)
  },
  ramasser: () => {
    note(SOL, 0, 0.1)
    note(DO2, 0.08, 0.16)
  },
  nourrir: () => note(392, 0, 0.18, { type: 'triangle', glisse: 330, force: 0.45 }),
  caresser: () => {
    note(LA, 0, 0.12, { force: 0.3 })
    note(DO2, 0.1, 0.2, { force: 0.3 })
  },
  pieces: () => {
    note(1318.5, 0, 0.08, { type: 'triangle', force: 0.35 })
    note(1760, 0.07, 0.18, { type: 'triangle', force: 0.35 })
  },
  cueillir: () => {
    // Des fruits qui tombent : petites notes qui descendent.
    for (let k = 0; k < 3; k++) note(MI * 2 - k * 120, k * 0.08, 0.1, { force: 0.3 })
  },
  cuisiner: () => {
    note(SOL, 0, 0.12, { type: 'triangle', force: 0.35 })
    note(DO2, 0.1, 0.25, { type: 'triangle', force: 0.35 })
  },
  asseoir: () => note(440, 0, 0.25, { type: 'triangle', glisse: 330, force: 0.3 }),
  porte: () => note(220, 0, 0.35, { type: 'triangle', glisse: 165, force: 0.3 }),
  quete: () => [DO, MI, SOL].forEach((f, k) => note(f, k * 0.1, 0.22, { force: 0.45 })),
  niveau: () => [DO, MI, SOL, DO2].forEach((f, k) => note(f, k * 0.12, 0.3, { force: 0.5 })),
  fete: () => [SOL, MI, SOL, DO2].forEach((f, k) => note(f, k * 0.14, 0.26, { force: 0.4 })),
  oeuf: () => {
    note(RE, 0, 0.1)
    note(LA, 0.08, 0.2)
  },
}

/** Le « contexte audio » (null tant que le joueur n'a pas encore touché l'écran). */
export function contexteAudio() {
  return contexte
}

/** Joue un son du catalogue (si les sons sont activés). */
export function jouer(nom) {
  if (!reglages.get('son') || !contexte || contexte.state !== 'running') return
  const son = SONS[nom]
  if (!son) return
  sortie.gain.value = VOLUMES[reglages.get('volume')] ?? VOLUMES.moyen
  try {
    son()
  } catch {
    /* un son raté n'est jamais grave */
  }
}
