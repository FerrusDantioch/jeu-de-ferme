/**
 * quetes.js (interface) — le bouton 📜 « Quêtes » et sa fenêtre.
 *
 * Un petit rond avec un nombre apparaît sur le bouton quand une quête est finie
 * et que sa récompense attend d'être reçue.
 */
import { etat } from '../jeu/etat.js'
import { quetesDuJour, texteQuete, recevoir, nombreARecevoir } from '../jeu/quetes.js'
import { tempsAvantMinuit, dateDuJour, feteDuJour } from '../jeu/calendrier.js'
import { texteDuree } from '../jeu/potager.js'
import { creerFenetre, echapper } from './fenetre.js'

/**
 * @param {HTMLElement} barre  la barre du haut (où ajouter le bouton)
 * @param {object} o           { surRecompense(quete) } : pour afficher « +15 🪙 » à l'écran
 */
export function creerQuetes(barre, { surRecompense } = {}) {
  const bouton = document.createElement('button')
  bouton.className = 'bouton bouton-quetes'
  bouton.setAttribute('aria-label', 'Quêtes du jour')
  bouton.innerHTML = '<span class="icone" aria-hidden="true">📜</span><span class="texte-facultatif">Quêtes</span><span class="pastille-nombre" hidden></span>'
  barre.insertBefore(bouton, barre.querySelector('.bouton-sac') || barre.lastElementChild)
  const nombre = bouton.querySelector('.pastille-nombre')

  const fenetre = creerFenetre({
    classe: 'panneau-quetes',
    surClic: (el) => {
      const b = el.closest('button[data-recevoir]')
      if (!b || b.disabled) return
      const q = recevoir(Number(b.dataset.recevoir))
      if (q && surRecompense) surRecompense(q)
      dessiner()
    },
  })

  function dessiner() {
    const fete = feteDuJour()
    const cartes = quetesDuJour()
      .map((q, n) => {
        const finie = q.progres >= q.objectif
        const v = Math.round((q.progres / q.objectif) * 100)
        let action = ''
        if (q.recue) action = '<span class="quete-recue">✔️ Récompense reçue</span>'
        else if (finie) action = `<button class="bouton bouton-principal" data-recevoir="${n}">🎁 Recevoir</button>`
        return `<div class="carte-quete${finie ? ' finie' : ''}">
          <div class="quete-texte">${q.speciale && fete ? `${fete.icone} ` : ''}${echapper(texteQuete(q))}</div>
          <div class="barre" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><div class="barre-plein" style="width:${v}%"></div></div>
          <div class="quete-bas"><span>${q.progres} / ${q.objectif}</span><span class="discret">🪙 ${q.pieces} · ⭐ ${q.experience}</span></div>
          ${action}</div>`
      })
      .join('')
    const jour = dateDuJour().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    fenetre.remplir(`
      <h2>📜 Quêtes du jour</h2>
      <p class="discret">${echapper(jour)}${fete ? ` · ${fete.icone} ${echapper(fete.nom)}` : ''}</p>
      ${cartes || '<p>Les quêtes arrivent…</p>'}
      <p class="discret">De nouvelles quêtes arrivent à minuit (dans ${texteDuree(tempsAvantMinuit())}).
      Pas d’obligation : une quête finie mais oubliée est donnée automatiquement.</p>`)
  }

  function actualiserBouton() {
    const n = nombreARecevoir()
    nombre.hidden = n === 0
    nombre.textContent = String(n)
    if (fenetre.ouverte) dessiner()
  }

  bouton.addEventListener('click', () => {
    dessiner()
    fenetre.ouvrir()
  })
  etat.ecouter(actualiserBouton)
  actualiserBouton()

  return { ouvrir: () => bouton.click(), actualiser: actualiserBouton }
}
