/**
 * bulles.js — les bulles de paroles au-dessus de la tête des personnages.
 *
 * Une bulle est un petit cadre de texte (en HTML, donc net et lisible) que l'on
 * replace à chaque image au-dessus de la tête du personnage, même s'il marche.
 * Elle reste affichée assez longtemps pour être lue tranquillement, puis s'efface en douceur.
 */
import * as THREE from 'three'

// Temps d'affichage : au moins 4 secondes, plus pour les longues phrases.
const DUREE_MINI = 4000
const DUREE_PAR_LETTRE = 75

export function creerBulles() {
  const racine = document.getElementById('interface')
  const actives = new Map() // objet 3D → { el, hauteur, fin }
  const point = new THREE.Vector3()

  function retirer(objet) {
    const bulle = actives.get(objet)
    if (!bulle) return
    actives.delete(objet)
    bulle.el.classList.add('cache')
    setTimeout(() => bulle.el.remove(), 400)
  }

  return {
    /**
     * Affiche une bulle au-dessus d'un personnage.
     * @param {THREE.Object3D} objet  le modèle du personnage
     * @param {string} texte          ce qu'il dit
     * @param {object} [options]      { nom, hauteur } — hauteur de la bulle au-dessus des pieds
     */
    dire(objet, texte, { nom = '', hauteur = 1.8 } = {}) {
      retirer(objet) // une seule bulle à la fois par personnage
      const el = document.createElement('div')
      el.className = 'bulle-parole'
      el.setAttribute('role', 'status')
      if (nom) {
        const n = document.createElement('div')
        n.className = 'bulle-nom'
        n.textContent = nom
        el.appendChild(n)
      }
      const t = document.createElement('div')
      t.textContent = texte
      el.appendChild(t)
      el.style.visibility = 'hidden' // invisible tant qu'elle n'est pas à sa place
      racine.appendChild(el)
      const duree = Math.max(DUREE_MINI, 1500 + texte.length * DUREE_PAR_LETTRE)
      actives.set(objet, { el, hauteur, fin: performance.now() + duree })
    },

    retirer,

    /** Efface toutes les bulles (en changeant de lieu). */
    toutRetirer() {
      for (const objet of [...actives.keys()]) retirer(objet)
    },

    /** Appelée à chaque image : replace les bulles au-dessus des têtes. */
    miseAJour(camera) {
      const maintenant = performance.now()
      const largeurEcran = window.innerWidth
      const hauteurEcran = window.innerHeight
      for (const [objet, bulle] of actives) {
        if (maintenant > bulle.fin || !objet.visible) {
          retirer(objet)
          continue
        }
        objet.getWorldPosition(point)
        point.y += bulle.hauteur
        point.project(camera)
        // Derrière la caméra ou hors de l'écran : on la cache.
        if (point.z > 1 || Math.abs(point.x) > 1.2 || Math.abs(point.y) > 1.2) {
          bulle.el.style.visibility = 'hidden'
          continue
        }
        let x = (point.x * 0.5 + 0.5) * largeurEcran
        const y = (-point.y * 0.5 + 0.5) * hauteurEcran
        // On garde la bulle entièrement dans l'écran (à gauche / à droite).
        const demiLargeur = bulle.el.offsetWidth / 2
        x = Math.min(Math.max(x, demiLargeur + 8), largeurEcran - demiLargeur - 8)
        bulle.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(Math.max(y, 8))}px) translate(-50%, -100%)`
        bulle.el.style.visibility = 'visible'
      }
    },
  }
}
