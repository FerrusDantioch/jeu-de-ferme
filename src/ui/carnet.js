/**
 * carnet.js — la fenêtre 📖 « Mon carnet » : tout ce qu'on a récolté, cueilli, pêché,
 * ramassé et cuisiné depuis le début. Ce qui manque encore est montré avec un indice.
 *
 * Elle s'ouvre depuis 🎒 « Mon sac » et depuis ⭐ « Ma progression »
 * (tout bouton portant l'attribut data-ouvrir-carnet).
 */
import { creerFenetre, echapper } from './fenetre.js'
import { CATEGORIES, OBJETS, infosObjet } from '../donnees/objets.js'
import { CATEGORIES_DU_CARNET } from '../jeu/inventaire.js'
import { POISSONS } from '../donnees/poissons.js'
import { RECETTES } from '../donnees/recettes.js'
import { etat } from '../jeu/etat.js'

// L'indice affiché pour ce qu'on n'a pas encore trouvé.
const INDICES = {
  recolte: 'À cultiver au potager',
  fruit: 'À cueillir au verger',
  produit: 'Avec les animaux de la ferme',
  plat: null, // pour les plats, on montre la recette
  poisson: null, // pour les poissons, voir src/donnees/poissons.js
}

function indice(id, categorie) {
  if (categorie === 'poisson') return POISSONS[id]?.indice || ''
  if (categorie === 'plat') {
    return Object.entries(RECETTES[id].ingredients).map(([i, n]) => `${infosObjet(i).icone}×${n}`).join(' ')
  }
  return INDICES[categorie] || ''
}

export function creerCarnet() {
  const fenetre = creerFenetre({ classe: 'panneau-carnet' })

  function ouvrir() {
    const carnet = etat.d.carnet || {}
    const tous = Object.entries(OBJETS).filter(([, o]) => CATEGORIES_DU_CARNET.includes(o.categorie))
    const trouves = tous.filter(([id]) => carnet[id]).length
    const pourcent = Math.round((trouves / tous.length) * 100)
    const sections = CATEGORIES.filter((c) => CATEGORIES_DU_CARNET.includes(c.id)).map((cat) => {
      const liste = tous.filter(([, o]) => o.categorie === cat.id)
      const nb = liste.filter(([id]) => carnet[id]).length
      const cases = liste
        .map(([id, o]) => {
          if (carnet[id]) {
            return `<div class="sac-case carnet-trouve"><span class="sac-icone" aria-hidden="true">${o.icone}</span>
              <span class="sac-nom">${echapper(o.nom)}</span><span class="sac-nombre">× ${carnet[id]}</span></div>`
          }
          return `<div class="sac-case carnet-manque"><span class="sac-icone" aria-hidden="true">❔</span>
            <span class="sac-nom">???</span><span class="carnet-indice">${echapper(indice(id, cat.id))}</span></div>`
        })
        .join('')
      return `<h3>${cat.titre} <span class="discret">${nb} / ${liste.length}</span></h3><div class="sac-grille">${cases}</div>`
    })
    fenetre.ouvrir(`
      <h2>📖 Mon carnet</h2>
      <p><strong>${trouves} / ${tous.length}</strong> découvertes${trouves === tous.length ? ' — tout est trouvé, bravo ! 🎉' : ''}</p>
      <div class="barre" role="progressbar" aria-valuenow="${pourcent}" aria-valuemin="0" aria-valuemax="100">
        <div class="barre-plein" style="width:${pourcent}%"></div></div>
      ${sections.join('')}`)
  }

  // Tout bouton « 📖 Mon carnet » ouvre cette fenêtre.
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-ouvrir-carnet]')) ouvrir()
  })
  return { ouvrir }
}
