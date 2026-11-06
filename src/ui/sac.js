/**
 * sac.js — la fenêtre « Mon sac » : tout ce que l'on possède, rangé par catégories.
 */
import { CATEGORIES, infosObjet } from '../donnees/objets.js'
import { contenu } from '../jeu/inventaire.js'
import { etat } from '../jeu/etat.js'

function echapper(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

/**
 * @param {HTMLElement} barre  la barre du haut, où ajouter le bouton « Sac »
 */
export function creerSac(barre) {
  const bouton = document.createElement('button')
  bouton.className = 'bouton bouton-sac'
  bouton.innerHTML = '<span class="icone" aria-hidden="true">🎒</span><span class="texte-facultatif">Mon sac</span>'
  bouton.setAttribute('aria-label', 'Ouvrir mon sac')
  // Le sac se place juste avant le bouton « À propos ».
  barre.insertBefore(bouton, barre.lastElementChild)

  const voile = document.createElement('div')
  voile.className = 'voile'
  voile.hidden = true
  voile.innerHTML = `
    <div class="panneau panneau-sac" role="dialog" aria-modal="true" aria-labelledby="titre-sac">
      <h2 id="titre-sac">🎒 Mon sac</h2>
      <div class="sac-contenu"></div>
      <div class="actions">
        <button class="bouton bouton-principal" data-fermer>
          <span class="icone" aria-hidden="true">✔️</span><span>Fermer</span>
        </button>
      </div>
    </div>`
  document.getElementById('interface').appendChild(voile)
  const zone = voile.querySelector('.sac-contenu')

  function dessiner() {
    const objets = contenu()
    if (objets.length === 0) {
      zone.innerHTML = '<p class="discret">Votre sac est vide pour l’instant.</p>'
      return
    }
    zone.innerHTML = CATEGORIES.map((cat) => {
      const liste = objets.filter(([id]) => infosObjet(id).categorie === cat.id)
      if (liste.length === 0) return ''
      const cases = liste
        .map(([id, n]) => {
          const o = infosObjet(id)
          return `<div class="sac-case"><span class="sac-icone" aria-hidden="true">${o.icone}</span>
            <span class="sac-nom">${echapper(o.nom)}</span><span class="sac-nombre">× ${n}</span></div>`
        })
        .join('')
      return `<h3>${cat.titre}</h3><div class="sac-grille">${cases}</div>`
    }).join('')
  }

  bouton.addEventListener('click', () => {
    dessiner()
    voile.hidden = false
    voile.querySelector('[data-fermer]').focus()
  })
  voile.addEventListener('click', (e) => {
    if (e.target === voile || e.target.closest('[data-fermer]')) voile.hidden = true
  })
  // Si le sac est ouvert et que son contenu change, on le redessine.
  etat.ecouter(() => {
    if (!voile.hidden) dessiner()
  })
}
