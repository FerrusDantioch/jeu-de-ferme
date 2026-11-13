/**
 * sac.js — la fenêtre « Mon sac » : tout ce que l'on possède, rangé par catégories.
 */
import { CATEGORIES, infosObjet } from '../donnees/objets.js'
import { contenu } from '../jeu/inventaire.js'
import { etat } from '../jeu/etat.js'
import { creerFenetre, echapper } from './fenetre.js'

/**
 * @param {HTMLElement} barre  la barre du haut, où ajouter le bouton « Sac »
 */
export function creerSac(barre) {
  const bouton = document.createElement('button')
  bouton.className = 'bouton bouton-sac'
  bouton.innerHTML = '<span class="icone" aria-hidden="true">🎒</span><span class="texte-facultatif">Mon sac</span>'
  bouton.setAttribute('aria-label', 'Ouvrir mon sac')
  barre.appendChild(bouton)

  const fenetre = creerFenetre({ classe: 'panneau-sac' })

  function dessiner() {
    const objets = contenu()
    let liste = '<p class="discret">Ton sac est vide pour l’instant.</p>'
    if (objets.length > 0) {
      liste = CATEGORIES.map((cat) => {
        const dedans = objets.filter(([id]) => infosObjet(id).categorie === cat.id)
        if (dedans.length === 0) return ''
        const cases = dedans
          .map(([id, n]) => {
            const o = infosObjet(id)
            return `<div class="sac-case"><span class="sac-icone" aria-hidden="true">${o.icone}</span>
              <span class="sac-nom">${echapper(o.nom)}</span><span class="sac-nombre">× ${n}</span></div>`
          })
          .join('')
        return `<h3>${cat.titre}</h3><div class="sac-grille">${cases}</div>`
      }).join('')
    }
    fenetre.remplir(`
      <h2>🎒 Mon sac</h2>
      ${liste}
      <div class="reglage-choix perso-hasard">
        <button class="bouton" data-ouvrir-carnet>📖 Mon carnet de collection</button>
        <button class="bouton" data-ouvrir-decorer>🌼 Décorer la ferme</button>
      </div>`)
  }

  bouton.addEventListener('click', () => {
    dessiner()
    fenetre.ouvrir()
  })
  // Si le sac est ouvert et que son contenu change, on le redessine.
  etat.ecouter(() => {
    if (fenetre.ouverte) dessiner()
  })
}
