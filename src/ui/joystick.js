/**
 * joystick.js — un joystick à l'écran (en option, dans les Réglages).
 *
 * Un grand rond en bas à gauche : on pose le doigt dessus et on le fait glisser
 * dans la direction où l'on veut marcher. On lâche : le personnage s'arrête.
 * Il est grand (plus de 56 pixels) et marche aussi avec la souris.
 */

const RAYON = 60 // rayon du grand rond, en pixels

export function creerJoystick() {
  const zone = document.createElement('div')
  zone.className = 'joystick'
  zone.hidden = true
  zone.setAttribute('aria-label', 'Joystick : glisser pour marcher')
  const bouton = document.createElement('div')
  bouton.className = 'joystick-bouton'
  zone.appendChild(bouton)
  document.getElementById('interface').appendChild(zone)

  let doigt = null
  const direction = { x: 0, z: 0 }

  function bouger(e) {
    const r = zone.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > RAYON) {
      dx = (dx / d) * RAYON
      dy = (dy / d) * RAYON
    }
    bouton.style.transform = `translate(${dx}px, ${dy}px)`
    // Une petite zone morte au centre : on ne marche pas par accident.
    const force = Math.min(1, d / RAYON)
    if (force < 0.2) {
      direction.x = 0
      direction.z = 0
    } else {
      direction.x = (dx / RAYON) * (force > 0.6 ? 1 / force : 1)
      direction.z = (dy / RAYON) * (force > 0.6 ? 1 / force : 1)
    }
  }

  function relacher() {
    doigt = null
    direction.x = 0
    direction.z = 0
    bouton.style.transform = ''
  }

  zone.addEventListener('pointerdown', (e) => {
    doigt = e.pointerId
    zone.setPointerCapture(e.pointerId)
    bouger(e)
  })
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId === doigt) bouger(e)
  })
  zone.addEventListener('pointerup', relacher)
  zone.addEventListener('pointercancel', relacher)
  zone.addEventListener('contextmenu', (e) => e.preventDefault())

  return {
    /** Direction demandée : { x, z } entre -1 et 1. */
    direction: () => direction,
    afficher(oui) {
      zone.hidden = !oui
      if (!oui) relacher()
    },
  }
}
