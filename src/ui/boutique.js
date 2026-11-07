/**
 * boutique.js — la boutique de Lila : acheter des graines, adopter des animaux,
 * vendre ses récoltes et les produits des animaux.
 *
 * Deux onglets : « Acheter » et « Vendre ». Les boutons sont grands et bien espacés.
 * Un petit message confirme chaque achat ou vente. Rien n'est jamais acheté par erreur
 * d'un seul geste coûteux : les animaux demandent une confirmation.
 */
import { CULTURES } from '../donnees/cultures.js'
import { ESPECES } from '../donnees/animaux.js'
import { GRAINES_EN_VENTE, ANIMAUX_EN_VENTE } from '../donnees/economie.js'
import { infosObjet } from '../donnees/objets.js'
import { etat } from '../jeu/etat.js'
import { quantite } from '../jeu/inventaire.js'
import { niveau, acheterGraines, adopterAnimal, nombreAnimaux, aVendre, vendre } from '../jeu/economie.js'
import { quantiteDemandee } from '../jeu/commandes.js'
import { creerFenetre, echapper } from './fenetre.js'
import { ESPECES_COMPAGNONS } from '../donnees/compagnons.js'
import { compagnon, adopterCompagnon } from '../jeu/compagnon.js'
import { DECORATIONS } from '../donnees/decorations.js'
import { acheterDecoration } from '../jeu/decorations.js'

/**
 * @param {function} surAdoption  appelée avec la fiche d'un animal adopté (pour l'ajouter au monde)
 */
export function creerBoutique({ surAdoption } = {}) {
  let onglet = 'acheter'
  let message = ''
  let confirmation = null // espèce dont on attend la confirmation d'adoption

  const fenetre = creerFenetre({
    classe: 'panneau-boutique',
    surClic: (el) => {
      const b = el.closest('button[data-action]')
      if (!b || b.disabled) return
      agir(b.dataset.action, b.dataset.id, Number(b.dataset.n || 1))
    },
    surFermeture: () => {
      message = ''
      confirmation = null
    },
  })

  function bouton(action, id, texte, { n = 1, desactive = false, principal = false } = {}) {
    return `<button class="bouton${principal ? ' bouton-principal' : ''}" data-action="${action}" data-id="${id}" data-n="${n}"${desactive ? ' disabled' : ''}>${echapper(texte)}</button>`
  }

  function pageAcheter() {
    const nv = niveau()
    const pieces = etat.d.pieces
    const graines = Object.entries(GRAINES_EN_VENTE).map(([id, g]) => {
      const c = CULTURES[id]
      const bloque = nv < g.niveau
      const actions = bloque
        ? `<span class="verrou">🔒 Niveau ${g.niveau}</span>`
        : bouton('graine', id, '+1', { desactive: pieces < g.prix }) +
          bouton('graine', id, '+5', { n: 5, desactive: pieces < g.prix * 5 })
      return `<div class="ligne-boutique${bloque ? ' bloquee' : ''}">
        <span class="lb-icone" aria-hidden="true">${c.icone}</span>
        <span class="lb-texte"><strong>${echapper(c.nom)}</strong>
          <span class="discret">🪙 ${g.prix} · pousse en ${c.minutes < 60 ? `${c.minutes} min` : `${c.minutes / 60} h`} · ${quantite(`graine-${id}`)} dans le sac</span></span>
        <span class="lb-actions">${actions}</span></div>`
    })
    const animaux = Object.entries(ANIMAUX_EN_VENTE).map(([id, a]) => {
      const e = ESPECES[id]
      const nb = nombreAnimaux(id)
      const bloque = nv < a.niveau
      const plein = nb >= a.maximum
      let actions
      if (bloque) actions = `<span class="verrou">🔒 Niveau ${a.niveau}</span>`
      else if (plein) actions = `<span class="verrou">Plus de place</span>`
      else if (confirmation === id)
        actions = bouton('adopter', id, `Oui, adopter (🪙 ${a.prix})`, { principal: true, desactive: pieces < a.prix }) +
          bouton('annuler', id, 'Non')
      else actions = bouton('demander', id, 'Adopter', { desactive: pieces < a.prix })
      const ou = id === 'vache' ? 'dans l’étable' : 'à la ferme'
      return `<div class="ligne-boutique${bloque ? ' bloquee' : ''}">
        <span class="lb-icone" aria-hidden="true">${e.icone}</span>
        <span class="lb-texte"><strong>${echapper(e.nom)}</strong>
          <span class="discret">🪙 ${a.prix} · ${nb} / ${a.maximum} ${ou} · donne : ${infosObjet(e.produit).icone}</span></span>
        <span class="lb-actions">${actions}</span></div>`
    })
    return `<h3>🌱 Graines</h3>${graines.join('')}<h3>🐾 Animaux</h3>${animaux.join('')}
      <h3>💕 Un compagnon</h3>${pageCompagnon()}
      <h3>🌼 Décorations</h3>${pageDecorations()}`
  }

  /** Les décorations à poser dehors. */
  function pageDecorations() {
    const nv = niveau()
    const pieces = etat.d.pieces
    const posees = (etat.d.decorations || []).reduce((c, d) => ({ ...c, [d.type]: (c[d.type] || 0) + 1 }), {})
    const lignes = Object.entries(DECORATIONS).map(([id, d]) => {
      const bloque = nv < d.niveau
      const nb = quantite(`deco-${id}`) + (posees[id] || 0)
      const actions = bloque ? `<span class="verrou">🔒 Niveau ${d.niveau}</span>` : bouton('deco', id, 'Acheter', { desactive: pieces < d.prix })
      return `<div class="ligne-boutique${bloque ? ' bloquee' : ''}">
        <span class="lb-icone" aria-hidden="true">${d.icone}</span>
        <span class="lb-texte"><strong>${echapper(d.nom)}</strong>
          <span class="discret">🪙 ${d.prix}${nb ? ` · vous en avez ${nb}` : ''}</span></span>
        <span class="lb-actions">${actions}</span></div>`
    })
    return `${lignes.join('')}<div class="reglage-choix"><button class="bouton" data-ouvrir-decorer>🌼 Poser mes décorations</button></div>`
  }

  /** Le chat ou le chien qui suit le joueur partout (gratuit, un seul). */
  function pageCompagnon() {
    const c = compagnon()
    if (c) {
      const e = ESPECES_COMPAGNONS[c.espece]
      return `<div class="ligne-boutique"><span class="lb-icone" aria-hidden="true">${e.icone}</span>
        <span class="lb-texte"><strong>${echapper(c.nom)} vous accompagne 💕</strong>
        <span class="discret">Son nom et son pelage se changent dans 👤 « Mon personnage ».</span></span></div>`
    }
    return Object.entries(ESPECES_COMPAGNONS)
      .map(([id, e]) => `<div class="ligne-boutique"><span class="lb-icone" aria-hidden="true">${e.icone}</span>
        <span class="lb-texte"><strong>${echapper(e.nom)}</strong><span class="discret">Gratuit · il vous suit partout</span></span>
        <span class="lb-actions">${bouton('compagnon', id, 'Adopter')}</span></div>`)
      .join('')
  }

  function pageVendre() {
    const liste = aVendre()
    if (liste.length === 0) {
      return '<p>Rien à vendre pour l’instant : récoltez le potager et ramassez les œufs, le lait et la laine !</p>'
    }
    const lignes = liste.map(([id, n, prix]) => {
      const o = infosObjet(id)
      const demande = quantiteDemandee(id)
      return `<div class="ligne-boutique">
        <span class="lb-icone" aria-hidden="true">${o.icone}</span>
        <span class="lb-texte"><strong>${echapper(o.nom)} × ${n}</strong>
          <span class="discret">🪙 ${prix} pièce${prix > 1 ? 's' : ''} chacun${demande ? ` · 📋 ${demande} demandé${demande > 1 ? 's' : ''} en commande` : ''}</span></span>
        <span class="lb-actions">${bouton('vendre', id, 'Vendre 1')}${n > 1 ? bouton('vendre', id, `Tout (🪙 ${prix * n})`, { n }) : ''}</span></div>`
    })
    return `${lignes.join('')}<p class="discret">📋 Pensez à garder ce qu’il faut pour les commandes des villageois : elles rapportent plus !</p>`
  }

  function dessiner() {
    const onglets = ['acheter', 'vendre']
      .map((o) => `<button class="bouton onglet${o === onglet ? ' bouton-principal' : ''}" data-action="onglet" data-id="${o}" aria-pressed="${o === onglet}">
        ${o === 'acheter' ? '🛒 Acheter' : '💰 Vendre'}</button>`)
      .join('')
    fenetre.remplir(`
      <h2>🧺 La boutique de Lila</h2>
      <div class="boutique-entete"><span class="boutique-pieces">🪙 ${etat.d.pieces}</span>
        <span class="boutique-message" role="status">${echapper(message)}</span></div>
      <div class="onglets">${onglets}</div>
      <div class="boutique-page">${onglet === 'acheter' ? pageAcheter() : pageVendre()}</div>`)
  }

  function agir(action, id, n) {
    if (action === 'onglet') {
      onglet = id
      message = ''
      confirmation = null
    } else if (action === 'graine') {
      message = acheterGraines(id, n)
        ? `Merci ! ${n} graine${n > 1 ? 's' : ''} de ${CULTURES[id].nomCourt} dans votre sac 🌱`
        : 'Pas assez de pièces pour l’instant.'
    } else if (action === 'demander') {
      confirmation = id
      message = ''
    } else if (action === 'annuler') {
      confirmation = null
    } else if (action === 'adopter') {
      const fiche = adopterAnimal(id)
      confirmation = null
      if (fiche) {
        message = `${fiche.nom} vous attend ${id === 'vache' ? 'dans l’étable' : 'dans l’enclos'} ! ${ESPECES[id].icone}💕`
        if (surAdoption) surAdoption(fiche)
      } else message = 'Impossible pour l’instant.'
    } else if (action === 'deco') {
      message = acheterDecoration(id)
        ? `Merci ! ${DECORATIONS[id].icone} ${DECORATIONS[id].nom} dans votre sac. Posez-la dehors avec 🌼 Décorer.`
        : 'Pas assez de pièces pour l’instant.'
    } else if (action === 'compagnon') {
      const c = adopterCompagnon(id)
      if (c) message = `${c.nom} vous suivra partout ! ${ESPECES_COMPAGNONS[id].icone}💕`
    } else if (action === 'vendre') {
      const gain = vendre(id, n)
      message = gain ? `Vendu ! +${gain} 🪙` : ''
    }
    dessiner()
  }

  // Si les pièces ou le sac changent pendant que la boutique est ouverte, on la redessine.
  etat.ecouter(() => {
    if (fenetre.ouverte) dessiner()
  })

  return {
    ouvrir(ongletVoulu = 'acheter') {
      onglet = ongletVoulu
      message = ''
      confirmation = null
      dessiner()
      fenetre.ouvrir()
    },
    get ouverte() {
      return fenetre.ouverte
    },
  }
}
