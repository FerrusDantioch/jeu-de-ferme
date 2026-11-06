/**
 * fiche.js — le panneau qui s'ouvre en bas de l'écran quand on touche quelque chose
 * (une parcelle du potager, un animal, une réserve de nourriture).
 *
 * Il montre un titre, quelques lignes d'information (avec des barres de niveau)
 * et de gros boutons d'action. Il se met à jour tout seul (une fois par seconde)
 * tant qu'il est ouvert. Il ne se ferme jamais tout seul avec le temps.
 *
 * Pour l'ouvrir, on donne une fonction qui DÉCRIT son contenu :
 *   () => ({ icone, titre, lignes: [...], actions: [...] })
 *   - une ligne : { texte } ou { barre: 0 à 100, texte } ;
 *   - une action : { icone, texte, detail, faire: () => {...}, principal, desactive }
 *     (« detail » = une petite ligne sous le texte, ex. : « ×3 · 4 min »).
 */

// Petite protection : le texte affiché ne peut jamais être pris pour du code HTML.
function echapper(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

export function creerFiche({ surOuverture } = {}) {
  const el = document.createElement('div')
  el.className = 'fiche'
  el.hidden = true
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-live', 'polite')
  document.getElementById('interface').appendChild(el)

  let decrire = null // la fonction qui décrit le contenu actuel
  let actions = []
  let dernierHtml = ''
  let minuterie = null

  function dessiner() {
    if (!decrire) return
    const d = decrire()
    if (!d) return fermer()
    actions = d.actions || []
    const lignes = (d.lignes || [])
      .map((l) => {
        if (l.barre !== undefined) {
          const v = Math.round(Math.min(100, Math.max(0, l.barre)) / 2) * 2
          return `<div class="fiche-ligne"><div>${echapper(l.texte)}</div>
            <div class="barre" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100">
            <div class="barre-plein" style="width:${v}%"></div></div></div>`
        }
        return `<div class="fiche-ligne${l.discret ? ' discret' : ''}">${echapper(l.texte)}</div>`
      })
      .join('')
    const boutons = actions
      .map(
        (a, n) =>
          `<button class="bouton${a.principal ? ' bouton-principal' : ''}" data-n="${n}"${a.desactive ? ' disabled' : ''}>
          <span class="icone" aria-hidden="true">${echapper(a.icone || '')}</span><span class="bouton-textes"><span>${echapper(a.texte)}</span>${a.detail ? `<span class="bouton-detail">${echapper(a.detail)}</span>` : ''}</span></button>`
      )
      .join('')
    const html = `
      <div class="fiche-entete">
        <div class="fiche-titre"><span aria-hidden="true">${echapper(d.icone || '')}</span> ${echapper(d.titre)}</div>
        <button class="bouton fiche-fermer" data-fermer aria-label="Fermer">✖️</button>
      </div>
      <div class="fiche-lignes">${lignes}</div>
      ${boutons ? `<div class="fiche-actions${actions.length > 3 ? ' grille' : ''}">${boutons}</div>` : ''}`
    // On ne redessine que si quelque chose a changé (évite de « perdre » un toucher sur un bouton).
    if (html !== dernierHtml) {
      el.innerHTML = html
      dernierHtml = html
    }
  }

  function fermer() {
    decrire = null
    el.hidden = true
    dernierHtml = ''
    clearInterval(minuterie)
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-fermer]')) return fermer()
    const bouton = e.target.closest('[data-n]')
    if (!bouton || bouton.disabled) return
    const action = actions[Number(bouton.dataset.n)]
    if (action && action.faire) {
      action.faire()
      dessiner()
    }
  })

  return {
    /** Ouvre la fiche avec une fonction qui décrit son contenu. */
    ouvrir(fonctionDescription) {
      decrire = fonctionDescription
      el.hidden = false
      dernierHtml = ''
      dessiner()
      clearInterval(minuterie)
      minuterie = setInterval(dessiner, 1000)
      if (surOuverture) surOuverture()
    },
    fermer,
    /** Redessine tout de suite (après un changement). */
    rafraichir: dessiner,
    get ouverte() {
      return !el.hidden
    },
  }
}
