/**
 * decorer.js — la fenêtre 🌼 « Décorer la ferme » :
 *  - les décorations qui attendent dans le sac (bouton « Poser ») ;
 *  - celles déjà posées dehors (bouton « Ranger » pour les remettre dans le sac).
 * Elle s'ouvre depuis 🎒 « Mon sac » et depuis la boutique (boutons data-ouvrir-decorer).
 */
import { creerFenetre, echapper } from './fenetre.js'
import { DECORATIONS, DECORATIONS_MAXIMUM } from '../donnees/decorations.js'
import { decorationsDansLeSac, decorationsPosees, rangerDecoration, placeRestante } from '../jeu/decorations.js'
import { etat } from '../jeu/etat.js'

/**
 * @param {object} o
 *  - dehors() : vrai si le personnage est dehors (on ne décore que dehors)
 *  - poser(type) : lance le placement d'une décoration
 */
export function creerDecorer({ dehors, poser }) {
  const fenetre = creerFenetre({
    classe: 'panneau-decorer',
    surClic: (el) => {
      const b = el.closest('button')
      if (!b || b.disabled) return
      if (b.dataset.poser) {
        poser(b.dataset.poser)
        return
      }
      if (b.dataset.ranger) rangerDecoration(Number(b.dataset.ranger))
      dessiner()
    },
  })

  function dessiner() {
    const sac = decorationsDansLeSac()
    const posees = decorationsPosees()
    const peutPoser = dehors() && placeRestante()
    let aPoser
    if (sac.length === 0) {
      aPoser = '<p class="discret">Aucune décoration dans le sac. Lila en vend dans sa boutique 🧺</p>'
    } else {
      aPoser = sac
        .map(([type, n]) => {
          const d = DECORATIONS[type]
          return `<div class="ligne-boutique"><span class="lb-icone" aria-hidden="true">${d.icone}</span>
            <span class="lb-texte"><strong>${echapper(d.nom)}</strong><span class="discret">× ${n} dans le sac</span></span>
            <span class="lb-actions"><button class="bouton bouton-principal" data-poser="${type}"${peutPoser ? '' : ' disabled'}>Poser</button></span></div>`
        })
        .join('')
    }
    let avertissement = ''
    if (!dehors()) avertissement = '<p class="reglage-message">🌳 Les décorations se posent dehors : sortez pour décorer la ferme !</p>'
    else if (!placeRestante()) avertissement = `<p class="reglage-message">La ferme est bien décorée ! (${DECORATIONS_MAXIMUM} décorations au plus.) Rangez-en une pour en poser une autre.</p>`
    const dansLaFerme = posees.length
      ? posees
          .map((p) => {
            const d = DECORATIONS[p.type]
            return `<div class="ligne-boutique"><span class="lb-icone" aria-hidden="true">${d.icone}</span>
              <span class="lb-texte"><strong>${echapper(d.nom)}</strong></span>
              <span class="lb-actions"><button class="bouton" data-ranger="${p.n}">🎒 Ranger</button></span></div>`
          })
          .join('')
      : '<p class="discret">Rien de posé pour l’instant.</p>'
    fenetre.remplir(`
      <h2>🌼 Décorer la ferme</h2>
      <p class="discret">Choisissez une décoration, puis touchez l’herbe à l’endroit voulu. Vous pourrez toujours la ranger ou la déplacer.</p>
      ${avertissement}
      <h3>🎒 Dans le sac</h3>${aPoser}
      <h3>🌳 Dans la ferme</h3>${dansLaFerme}`)
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-ouvrir-decorer]')) return
    dessiner()
    fenetre.ouvrir()
  })
  etat.ecouter(() => {
    if (fenetre.ouverte) dessiner()
  })
  return {
    ouvrir() {
      dessiner()
      fenetre.ouvrir()
    },
  }
}
