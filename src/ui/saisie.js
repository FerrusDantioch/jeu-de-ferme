/**
 * saisie.js — une petite fenêtre pour écrire un texte (ex. : donner un nom à un animal).
 *
 *   demanderTexte({ titre, valeur }).then((texte) => { … })
 *   → texte = ce qui a été écrit, ou null si on a annulé.
 */
import { creerFenetre, echapper } from './fenetre.js'

let fenetre = null
let reponse = null // la fonction à appeler avec le résultat

function terminer(valeur) {
  const r = reponse
  reponse = null
  if (r) r(valeur)
}

function preparer() {
  fenetre = creerFenetre({
    classe: 'panneau-saisie',
    texteFermer: 'Valider',
    surClic: (el) => {
      if (el.closest('[data-action="annuler"]')) {
        terminer(null)
        fenetre.fermer()
      }
    },
    // Fermer (bouton « Valider » ou toucher à côté) : on garde ce qui est écrit.
    surFermeture: () => terminer(champ()?.value ?? null),
  })
  fenetre.contenu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fenetre.fermer()
  })
}

const champ = () => fenetre.contenu.querySelector('input')

/**
 * @param {object} o { titre, texte (petite explication), valeur (texte de départ), max (longueur) }
 * @returns {Promise<string|null>}
 */
export function demanderTexte({ titre, texte = '', valeur = '', max = 16 }) {
  if (!fenetre) preparer()
  terminer(null) // une demande précédente restée ouverte est annulée
  return new Promise((resolve) => {
    fenetre.ouvrir(`
      <h2>${echapper(titre)}</h2>
      ${texte ? `<p class="discret">${echapper(texte)}</p>` : ''}
      <input class="champ-texte" type="text" maxlength="${max}" autocomplete="off" enterkeyhint="done" value="${echapper(valeur)}">
      <div class="reglage-choix perso-hasard"><button class="bouton" data-action="annuler">Annuler</button></div>`)
    reponse = (v) => resolve(v === null ? null : v.replace(/\s+/g, ' ').trim().slice(0, max) || null)
    const c = champ()
    c.focus({ preventScroll: true })
    c.select()
  })
}
