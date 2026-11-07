/**
 * perso.js (interface) — la fenêtre 👤 « Mon personnage » : prénom, peau, cheveux,
 * coiffure, tenue, couleurs et chapeau.
 *
 * La fenêtre s'ouvre en bas de l'écran : on voit le personnage changer au-dessus,
 * en direct, à chaque choix. Elle s'ouvre aussi toute seule au début d'une nouvelle partie.
 */
import { creerFenetre, echapper } from './fenetre.js'
import { LISTES, apparence, prenom, changerPrenom, changer, auHasard } from '../jeu/perso.js'
import { LONGUEUR_PRENOM } from '../donnees/apparence.js'
import { etat } from '../jeu/etat.js'

/** « 0xf28b82 » → « #f28b82 » (pour colorer les pastilles). */
const versHex = (n) => '#' + n.toString(16).padStart(6, '0')

/**
 * @param {object} o
 *  - barre : la barre du haut (où ajouter le bouton 👤)
 *  - surOuverture() : appelée à l'ouverture (ex. : le personnage se tourne vers nous)
 */
export function creerFenetrePerso({ barre, surOuverture }) {
  const bouton = document.createElement('button')
  bouton.className = 'bouton bouton-perso'
  bouton.setAttribute('aria-label', 'Mon personnage')
  bouton.innerHTML = '<span class="icone" aria-hidden="true">👤</span><span class="texte-facultatif">Moi</span>'
  barre.insertBefore(bouton, barre.querySelector('.bouton-sac'))

  let bienvenue = false // vrai pour la toute première ouverture d'une nouvelle partie

  const fenetre = creerFenetre({
    classe: 'panneau-perso',
    texteFermer: 'C’est parfait !',
    surClic: (el) => {
      const b = el.closest('button')
      if (!b) return
      if (b.dataset.partie) changer(b.dataset.partie, b.dataset.choix)
      else if (b.dataset.action === 'hasard') auHasard()
      else return
      dessiner()
    },
    surFermeture: () => {
      // La fenêtre de bienvenue ne s'affichera plus.
      if (!etat.d.perso.choisi) {
        etat.d.perso.choisi = true
        etat.signaler()
      }
    },
  })
  // La fenêtre se place en bas de l'écran, sur un voile très léger (pour voir le personnage).
  fenetre.contenu.closest('.voile').classList.add('voile-bas')

  // Le prénom s'enregistre au fur et à mesure qu'on l'écrit.
  fenetre.contenu.addEventListener('input', (e) => {
    if (e.target.name === 'prenom') changerPrenom(e.target.value)
  })
  // « Entrée » ferme le clavier du téléphone.
  fenetre.contenu.addEventListener('keydown', (e) => {
    if (e.target.name === 'prenom' && e.key === 'Enter') e.target.blur()
  })

  /** Une rangée de choix (pastilles de couleur ou boutons avec du texte). */
  function rangee(titre, partie, a) {
    const liste = LISTES[partie]
    const enCouleurs = liste[0].couleur !== undefined
    const boutons = liste
      .map((c) => {
        const choisi = a[partie] === c.id
        if (enCouleurs) {
          return `<button class="bouton pastille-couleur${choisi ? ' choisie' : ''}" style="--c:${versHex(c.couleur)}"
            data-partie="${partie}" data-choix="${c.id}" aria-pressed="${choisi}" aria-label="${echapper(c.nom)}" title="${echapper(c.nom)}"></button>`
        }
        return `<button class="bouton${choisi ? ' bouton-principal' : ''}" data-partie="${partie}" data-choix="${c.id}"
          aria-pressed="${choisi}">${echapper(c.nom)}</button>`
      })
      .join('')
    return `<div class="ligne-reglage"><div class="reglage-titre">${titre}</div>
      <div class="reglage-choix${enCouleurs ? ' choix-couleurs' : ''}">${boutons}</div></div>`
  }

  function dessiner() {
    const a = apparence()
    // Le nom de la 2e couleur dépend de la tenue.
    const titreBas = { robe: '🧦 Couleur des collants', jardinier: '🧑‍🌾 Couleur du tablier' }[a.tenue] || '👖 Couleur du bas'
    const titreHaut = a.tenue === 'robe' ? '👗 Couleur de la robe' : '👕 Couleur du haut'
    fenetre.remplir(`
      <h2>${bienvenue ? '🌷 Bienvenue à la ferme !' : '👤 Mon personnage'}</h2>
      ${bienvenue ? '<p class="discret">Choisissez votre prénom et votre allure. Vous pourrez tout changer plus tard avec le bouton 👤.</p>' : ''}
      <label class="perso-prenom">
        <span class="reglage-titre">✏️ Prénom</span>
        <input name="prenom" type="text" maxlength="${LONGUEUR_PRENOM}" autocomplete="off" enterkeyhint="done"
          placeholder="Votre prénom" value="${echapper(prenom())}">
      </label>
      ${rangee('🙂 Peau', 'peau', a)}
      ${rangee('💇 Couleur des cheveux', 'cheveux', a)}
      ${rangee('✂️ Coiffure', 'coiffure', a)}
      ${rangee('👚 Tenue', 'tenue', a)}
      ${rangee(titreHaut, 'haut', a)}
      ${rangee(titreBas, 'bas', a)}
      ${rangee('👒 Sur la tête', 'chapeau', a)}
      ${a.chapeau !== 'aucun' ? rangee(a.chapeau === 'paille' ? '🎀 Couleur du ruban' : '🎨 Couleur', 'couleurChapeau', a) : ''}
      <div class="reglage-choix perso-hasard">
        <button class="bouton" data-action="hasard">🎲 Au hasard</button>
      </div>`)
  }

  function ouvrir({ accueil = false } = {}) {
    bienvenue = accueil
    dessiner()
    fenetre.ouvrir()
    if (surOuverture) surOuverture()
  }

  bouton.addEventListener('click', () => ouvrir())

  return {
    ouvrir,
    get ouverte() {
      return fenetre.ouverte
    },
  }
}
