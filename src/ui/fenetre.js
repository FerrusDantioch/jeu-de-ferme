/**
 * fenetre.js — une fenêtre au centre de l'écran (sur un voile léger), réutilisable :
 * progression, nouveau niveau, boutique…
 *
 * Elle se ferme avec son bouton, ou en touchant à côté. Jamais toute seule.
 */

export function echapper(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

// Toutes les fenêtres créées (pour pouvoir tout fermer d'un coup).
const toutes = new Set()

/** Ferme toutes les fenêtres ouvertes (ex. : avant de poser une décoration). */
export function toutFermer() {
  for (const f of toutes) f.fermer()
  // (et les fenêtres faites à la main, comme le sac)
  for (const v of document.querySelectorAll('#interface .voile')) v.hidden = true
}

/**
 * @param {object} o
 *  - classe : classe CSS en plus pour le panneau
 *  - texteFermer : texte du bouton du bas
 *  - surClic(element) : appelée quand on touche un élément à l'intérieur (pour les boutons)
 *  - surFermeture() : appelée quand la fenêtre se ferme
 */
export function creerFenetre({ classe = '', texteFermer = 'Fermer', surClic, surFermeture } = {}) {
  const voile = document.createElement('div')
  voile.className = 'voile'
  voile.hidden = true
  voile.innerHTML = `
    <div class="panneau ${classe}" role="dialog" aria-modal="true">
      <div class="fenetre-contenu"></div>
      <div class="actions">
        <button class="bouton bouton-principal" data-fermer>
          <span class="icone" aria-hidden="true">✔️</span><span>${echapper(texteFermer)}</span>
        </button>
      </div>
    </div>`
  document.getElementById('interface').appendChild(voile)
  const contenu = voile.querySelector('.fenetre-contenu')

  function fermer() {
    if (voile.hidden) return
    voile.hidden = true
    if (surFermeture) surFermeture()
  }

  voile.addEventListener('click', (e) => {
    if (e.target === voile || e.target.closest('[data-fermer]')) return fermer()
    if (surClic) surClic(e.target)
  })

  const fenetre = {
    /** Ouvre la fenêtre (le contenu est du HTML déjà préparé). */
    ouvrir(html) {
      if (html !== undefined) contenu.innerHTML = html
      // On la remet tout au-dessus des autres fenêtres (ex. : « Comment jouer » ouvert depuis les Réglages).
      voile.parentElement.appendChild(voile)
      voile.hidden = false
      voile.querySelector('[data-fermer]').focus({ preventScroll: true })
    },
    /** Change le contenu sans fermer. */
    remplir(html) {
      contenu.innerHTML = html
    },
    fermer,
    get ouverte() {
      return !voile.hidden
    },
    contenu,
  }
  toutes.add(fenetre)
  return fenetre
}
