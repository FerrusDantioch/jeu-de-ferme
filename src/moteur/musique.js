/**
 * musique.js — une petite musique d'ambiance, douce et calme, fabriquée par le code
 * (aucun fichier à télécharger : elle marche aussi sans Internet).
 *
 * Principe : une mélodie lente qui se promène sur cinq notes qui sonnent toujours bien
 * ensemble (gamme « pentatonique »), avec de longs accords très doux en fond.
 * Elle n'est jamais deux fois la même. Le soir, elle devient plus lente et plus grave.
 * On la coupe dans ⚙️ Réglages (« Musique »).
 */
import { reglages, VOLUMES } from '../jeu/reglages.js'
import { contexteAudio } from './sons.js'
import { heureDuJour } from '../jeu/temps.js'

// La gamme (en hertz) : do, ré, mi, sol, la, sur deux octaves.
const GAMME = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0]
// Les accords du fond (do, la mineur, fa, sol), joués à tour de rôle.
const ACCORDS = [
  [130.81, 196.0, 329.63],
  [110.0, 164.81, 261.63],
  [87.31, 130.81, 220.0],
  [98.0, 146.83, 246.94],
]
const FORCE = 0.5 // la musique reste plus discrète que les petits sons du jeu

let sortie = null
let prochainTemps = 0 // quand jouer le prochain « temps » (en secondes, horloge du son)
let numeroTemps = 0
let position = 4 // la note actuelle dans la gamme

function note(ctx, frequence, debut, duree, { type = 'sine', force = 0.06, attaque = 0.04 } = {}) {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequence
  env.gain.setValueAtTime(0.0001, debut)
  env.gain.exponentialRampToValueAtTime(force, debut + attaque)
  env.gain.exponentialRampToValueAtTime(0.0001, debut + duree)
  osc.connect(env).connect(sortie)
  osc.start(debut)
  osc.stop(debut + duree + 0.05)
}

/** Prépare les notes des prochaines secondes (appelée régulièrement). */
function programmer() {
  const ctx = contexteAudio()
  const active = reglages.get('musique') && ctx && ctx.state === 'running' && !document.hidden
  if (!active) {
    prochainTemps = 0
    return
  }
  if (!sortie) {
    sortie = ctx.createGain()
    sortie.connect(ctx.destination)
  }
  sortie.gain.value = (VOLUMES[reglages.get('volume')] ?? VOLUMES.moyen) * FORCE
  const h = heureDuJour()
  const soir = h >= 20.5 || h < 6.5
  const duree = soir ? 1.15 : 0.8 // durée d'un temps (plus lent le soir)
  if (prochainTemps < ctx.currentTime) prochainTemps = ctx.currentTime + 0.3

  while (prochainTemps < ctx.currentTime + 1.2) {
    const t = prochainTemps
    const mesure = Math.floor(numeroTemps / 8) // une « phrase » = 8 temps
    const dansLaMesure = numeroTemps % 8
    // Un accord très doux au début de chaque phrase.
    if (dansLaMesure === 0) {
      const accord = ACCORDS[mesure % ACCORDS.length]
      for (const f of accord) note(ctx, soir ? f / 2 : f, t, duree * 8, { type: 'triangle', force: 0.018, attaque: 1.2 })
    }
    // Une phrase sur trois est un silence (on respire), sinon la mélodie se promène.
    const silence = mesure % 3 === 2
    if (!silence && Math.random() < (dansLaMesure === 0 ? 0.9 : 0.55)) {
      position += [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]
      position = Math.max(0, Math.min(GAMME.length - 1, position))
      const f = GAMME[position] * (soir ? 0.5 : 1)
      note(ctx, f, t, duree * 1.8, { force: 0.05 })
    }
    numeroTemps++
    prochainTemps += duree
  }
}

/** Lance la musique (elle attend le premier toucher de l'écran pour démarrer). */
export function demarrerMusique() {
  setInterval(programmer, 300)
}
