/**
 * annonces.js — les messages importants, qui restent affichés jusqu'à ce qu'on les touche.
 *
 * Les petites bulles au-dessus du personnage s'effacent toutes seules après quelques
 * secondes : c'est très bien pour bavarder, mais un message important (une quête
 * terminée, une sauvegarde impossible…) pourrait passer inaperçu.
 * Ces messages-là s'affichent donc dans une carte en haut de l'écran, sous les boutons,
 * et ne partent que lorsqu'on touche « OK » (ou le bouton d'action, s'il y en a un).
 *
 *   const annonces = creerAnnonces(barre)
 *   annonces.montrer('quete', '📜 Quête terminée !', { action: { texte: 'Voir', faire: () => … } })
 *   annonces.retirer('quete')
 *
 * Chaque annonce a un nom (« cle ») : une nouvelle annonce du même nom remplace l'ancienne
 * (on n'empile pas trois fois « Quête terminée »).
 */
import { echapper } from './fenetre.js'

/** @param {HTMLElement} barre  la barre du haut (les annonces se placent juste en dessous) */
export function creerAnnonces(barre) {
  const zone = document.createElement('div')
  zone.className = 'annonces'
  // « polite » : un lecteur d'écran lit le message sans interrompre ce qu'il disait.
  zone.setAttribute('aria-live', 'polite')
  document.getElementById('interface').appendChild(zone)

  const actives = new Map() // cle → { el, action }

  /** Place les annonces juste sous la barre du haut (elle peut tenir sur une ou deux lignes). */
  function placer() {
    zone.style.top = `${Math.round(barre.getBoundingClientRect().bottom + 10)}px`
  }
  window.addEventListener('resize', placer)
  // La barre peut changer de hauteur (ex. : le bouton « Mettre à jour » apparaît et la fait
  // passer sur deux lignes) : les annonces la suivent.
  if (window.ResizeObserver) new ResizeObserver(placer).observe(barre)

  function retirer(cle) {
    const a = actives.get(cle)
    if (!a) return
    actives.delete(cle)
    a.el.remove()
  }

  zone.addEventListener('click', (e) => {
    const bouton = e.target.closest('button[data-cle]')
    if (!bouton) return
    const { cle, role } = bouton.dataset
    const a = actives.get(cle)
    retirer(cle)
    if (role === 'action' && a?.action) a.action.faire()
  })

  return {
    /**
     * Affiche (ou remplace) une annonce.
     * @param {string} cle    son nom
     * @param {string} texte  le message
     * @param {object} [o]    { action: { texte, faire } } : un bouton en plus de « OK »
     */
    montrer(cle, texte, { action = null } = {}) {
      retirer(cle)
      const el = document.createElement('div')
      el.className = 'annonce'
      el.setAttribute('role', 'status')
      el.innerHTML = `<p class="annonce-texte">${echapper(texte)}</p>
        <div class="annonce-boutons">
          ${action ? `<button class="bouton bouton-principal" data-cle="${echapper(cle)}" data-role="action">${echapper(action.texte)}</button>` : ''}
          <button class="bouton" data-cle="${echapper(cle)}" data-role="ok">OK</button>
        </div>`
      zone.appendChild(el)
      actives.set(cle, { el, action })
      placer()
    },
    retirer,
    /** Vrai si une annonce de ce nom est affichée. */
    affichee: (cle) => actives.has(cle),
  }
}
