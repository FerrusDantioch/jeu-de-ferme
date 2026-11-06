/**
 * pastilles.js — les petites icônes rondes au-dessus des choses :
 * 🥚 quand une poule a pondu, ✨ quand une plante est prête, 🌾 quand un animal a un petit creux…
 *
 * Elles ne clignotent pas et ne bougent presque pas (juste un léger balancement,
 * supprimé si le téléphone demande « moins d'animations »).
 */
import { positionEcran, estAffiche } from './ancrage.js'

export function creerPastilles() {
  const racine = document.getElementById('interface')
  const actives = new Map() // objet 3D → { el, hauteur }

  return {
    /**
     * Affiche (ou retire, si icone = null) une pastille au-dessus d'un objet.
     */
    definir(objet, icone, hauteur = 1) {
      const existante = actives.get(objet)
      if (!icone) {
        if (existante) {
          existante.el.remove()
          actives.delete(objet)
        }
        return
      }
      if (existante) {
        existante.el.textContent = icone
        existante.hauteur = hauteur
        return
      }
      const el = document.createElement('div')
      el.className = 'pastille'
      el.setAttribute('aria-hidden', 'true')
      el.textContent = icone
      el.style.visibility = 'hidden'
      racine.appendChild(el)
      actives.set(objet, { el, hauteur })
    },

    /** Appelée à chaque image : replace les pastilles au-dessus des objets. */
    miseAJour(camera) {
      for (const [objet, p] of actives) {
        // Un objet qui n'est pas dans le lieu actuel (ou caché) : pastille cachée.
        if (!estAffiche(objet)) {
          p.el.style.visibility = 'hidden'
          continue
        }
        const pos = positionEcran(objet, p.hauteur, camera)
        if (!pos.visible) {
          p.el.style.visibility = 'hidden'
          continue
        }
        p.el.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px) translate(-50%, -100%)`
        p.el.style.visibility = 'visible'
      }
    },
  }
}
