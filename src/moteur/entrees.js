/**
 * entrees.js — écoute ce que fait le joueur : toucher l'écran, cliquer, appuyer sur des touches.
 *
 * - Toucher / clic : on détecte un « toucher simple » (le doigt se pose puis se lève
 *   sans glisser). Aucun temps limite, aucun double-tap : un seul toucher suffit.
 * - Clavier : flèches, ZQSD (clavier français) ou WASD (clavier anglais).
 */

// Si le doigt glisse de plus de 14 pixels, on considère que ce n'est pas un toucher simple.
const TOLERANCE_GLISSEMENT = 14

export function creerEntrees(element) {
  // Liste des fonctions à prévenir quand le joueur touche l'écran.
  const auditeursToucher = []
  // Touches actuellement enfoncées.
  const touchesEnfoncees = new Set()

  // Doigts actuellement posés (pour ignorer les gestes à plusieurs doigts).
  const doigts = new Map()
  let gesteMultiDoigts = false

  element.addEventListener('pointerdown', (e) => {
    doigts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (doigts.size > 1) gesteMultiDoigts = true
  })

  element.addEventListener('pointerup', (e) => {
    const debut = doigts.get(e.pointerId)
    doigts.delete(e.pointerId)
    if (!debut) return
    const glissement = Math.hypot(e.clientX - debut.x, e.clientY - debut.y)
    const estToucherSimple = !gesteMultiDoigts && glissement <= TOLERANCE_GLISSEMENT
    if (doigts.size === 0) gesteMultiDoigts = false
    // Clic droit de la souris : ignoré.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (estToucherSimple) {
      for (const f of auditeursToucher) f(e.clientX, e.clientY)
    }
  })

  element.addEventListener('pointercancel', (e) => {
    doigts.delete(e.pointerId)
    if (doigts.size === 0) gesteMultiDoigts = false
  })

  // Empêche le menu « appui long » du navigateur sur la zone de jeu.
  element.addEventListener('contextmenu', (e) => e.preventDefault())

  // --- Clavier ---
  const TOUCHES_JEU = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyQ',
  ])

  window.addEventListener('keydown', (e) => {
    // « e.code » désigne l'emplacement physique de la touche :
    // sur un clavier français, la touche Z s'appelle « KeyW », Q s'appelle « KeyA ».
    // On accepte donc les deux noms pour que ZQSD et WASD marchent partout.
    if (TOUCHES_JEU.has(e.code)) {
      touchesEnfoncees.add(e.code)
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => touchesEnfoncees.delete(e.code))
  // Si la fenêtre perd le focus, on relâche tout (évite un personnage qui marche tout seul).
  window.addEventListener('blur', () => touchesEnfoncees.clear())

  /**
   * Direction demandée au clavier : { x, z } entre -1 et 1 (0,0 = aucune touche).
   * « Haut » éloigne le personnage de la caméra (vers le fond de l'écran).
   */
  function directionClavier() {
    const t = touchesEnfoncees
    let x = 0
    let z = 0
    if (t.has('ArrowUp') || t.has('KeyW') || t.has('KeyZ')) z -= 1
    if (t.has('ArrowDown') || t.has('KeyS')) z += 1
    if (t.has('ArrowLeft') || t.has('KeyA') || t.has('KeyQ')) x -= 1
    if (t.has('ArrowRight') || t.has('KeyD')) x += 1
    const longueur = Math.hypot(x, z)
    if (longueur > 0) {
      x /= longueur
      z /= longueur
    }
    return { x, z }
  }

  return {
    surToucher: (f) => auditeursToucher.push(f),
    directionClavier,
  }
}
