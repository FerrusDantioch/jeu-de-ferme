/**
 * decorations.js (règles) — acheter, poser, tourner et ranger les décorations.
 *
 * Une décoration achetée va dans le sac (objet « deco-<type> »).
 * Une fois posée, elle est notée dans etat.d.decorations : [{ n, type, x, z, angle }].
 * La ranger la remet dans le sac : on ne perd jamais rien.
 */
import { etat } from './etat.js'
import { ajouter, retirer, quantite } from './inventaire.js'
import { niveau, depenserPieces } from './economie.js'
import { DECORATIONS, DECORATIONS_MAXIMUM } from '../donnees/decorations.js'

const auditeurs = new Set()
/** Être prévenu quand les décorations posées changent (pour redessiner la ferme). */
export function surChangementDecorations(fonction) {
  auditeurs.add(fonction)
}
const prevenir = () => auditeurs.forEach((f) => f())

/** Les décorations posées dehors. */
export function decorationsPosees() {
  return etat.d.decorations || []
}

/** Achète une décoration (elle va dans le sac). */
export function acheterDecoration(type) {
  const d = DECORATIONS[type]
  if (!d || niveau() < d.niveau || !depenserPieces(d.prix)) return false
  ajouter(`deco-${type}`, 1)
  return true
}

/** Vrai si on peut encore poser une décoration (il y a une limite, pour garder le jeu fluide). */
export function placeRestante() {
  return decorationsPosees().length < DECORATIONS_MAXIMUM
}

/** Pose une décoration du sac à un endroit. Renvoie vrai si c'est fait. */
export function poserDecoration(type, x, z, angle = 0) {
  if (!placeRestante() || quantite(`deco-${type}`) < 1) return false
  retirer(`deco-${type}`, 1)
  const liste = (etat.d.decorations ||= [])
  const n = liste.reduce((m, d) => Math.max(m, d.n), 0) + 1
  liste.push({ n, type, x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, angle })
  etat.signaler()
  prevenir()
  return true
}

/** Tourne une décoration posée d'un quart de tour. */
export function tournerDecoration(n) {
  const d = decorationsPosees().find((x) => x.n === n)
  if (!d) return
  d.angle = ((d.angle || 0) + Math.PI / 2) % (Math.PI * 2)
  etat.signaler()
  prevenir()
}

/** Range une décoration posée dans le sac. */
export function rangerDecoration(n) {
  const liste = decorationsPosees()
  const i = liste.findIndex((x) => x.n === n)
  if (i < 0) return
  const [d] = liste.splice(i, 1)
  ajouter(`deco-${d.type}`, 1)
  prevenir()
}

/** Les décorations qui attendent dans le sac : [[type, nombre], …]. */
export function decorationsDansLeSac() {
  return Object.keys(DECORATIONS)
    .map((type) => [type, quantite(`deco-${type}`)])
    .filter(([, n]) => n > 0)
}
