/**
 * mode-test.js — le « mode test » CACHÉ, pour essayer les fêtes sans attendre.
 *
 * Pour l'ouvrir : dans « À propos », toucher 5 fois le numéro de version.
 * On peut alors choisir une fausse date (ou sauter directement à une fête).
 * Tant qu'une fausse date est active, une étiquette 🧪 reste visible en haut de l'écran
 * (la toucher rouvre ce panneau). La fausse date ne change que le calendrier
 * (fêtes et quêtes du jour) : les plantes et les animaux suivent toujours l'heure réelle.
 */
import { FETES } from '../donnees/fetes.js'
import { dateDeTest, choisirDateDeTest, dimancheDePaques, cleDuJour, texteDate, dateDuJour } from '../jeu/calendrier.js'
import { creerFenetre, echapper } from './fenetre.js'

/** Le premier jour d'une fête, pour une année donnée. */
function debutDeFete(fete, annee) {
  const q = fete.quand
  if (q.type === 'paques') {
    const p = dimancheDePaques(annee)
    return new Date(p.getFullYear(), p.getMonth(), p.getDate() + q.debut)
  }
  return new Date(annee, q.debut[0] - 1, q.debut[1])
}

/**
 * @param {HTMLElement} barre  la barre du haut (où mettre l'étiquette 🧪)
 * @param {function} surChangement  appelée après un changement de date
 */
export function creerModeTest(barre, surChangement) {
  const etiquette = document.createElement('button')
  etiquette.className = 'bouton etiquette-test'
  etiquette.hidden = true
  barre.appendChild(etiquette)

  const fenetre = creerFenetre({
    classe: 'panneau-test',
    surClic: (el) => {
      const b = el.closest('button[data-date], button[data-action]')
      if (!b) return
      if (b.dataset.action === 'appliquer') {
        const v = fenetre.contenu.querySelector('input[type="date"]').value
        if (v) choisirDateDeTest(v)
      } else if (b.dataset.action === 'vraie') {
        choisirDateDeTest(null)
      } else if (b.dataset.action === 'demain') {
        const d = dateDuJour()
        choisirDateDeTest(cleDuJour(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)))
      } else if (b.dataset.date) {
        choisirDateDeTest(b.dataset.date)
      }
      actualiser()
      dessiner()
      if (surChangement) surChangement()
    },
  })

  function dessiner() {
    const annee = new Date().getFullYear()
    const raccourcis = FETES.map((f) => {
      // La prochaine fois que la fête commence (cette année ou l'an prochain).
      let d = debutDeFete(f, annee)
      if (d < new Date(new Date().setHours(0, 0, 0, 0))) d = debutDeFete(f, annee + 1)
      const texte = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      return `<button class="bouton" data-date="${cleDuJour(d)}">${f.icone} ${echapper(f.nom)}<span class="discret"> · ${texte}</span></button>`
    }).join('')
    const test = dateDeTest()
    fenetre.remplir(`
      <h2>🧪 Mode test</h2>
      <p class="discret">Pour essayer les fêtes et les quêtes d’un autre jour. Les plantes et les animaux
      continuent de suivre l’heure réelle.</p>
      <p>Date utilisée : <strong>${echapper(texteDate())}</strong>${test ? ' (date de test)' : ' (vraie date)'}</p>
      <div class="test-ligne"><label>Choisir une date : <input type="date" value="${cleDuJour()}"></label>
        <button class="bouton bouton-principal" data-action="appliquer">Appliquer</button></div>
      <div class="test-ligne">
        <button class="bouton" data-action="demain">⏭️ Jour suivant</button>
        <button class="bouton" data-action="vraie"${test ? '' : ' disabled'}>↩️ Revenir à la vraie date</button>
      </div>
      <h3>Aller directement à une fête</h3>
      <div class="test-raccourcis">${raccourcis}</div>`)
  }

  function actualiser() {
    const test = dateDeTest()
    etiquette.hidden = !test
    if (test) etiquette.textContent = `🧪 ${dateDuJour().toLocaleDateString('fr-FR')}`
  }

  function ouvrir() {
    dessiner()
    fenetre.ouvrir()
  }

  etiquette.addEventListener('click', ouvrir)

  // L'accès caché : 5 touchers sur le numéro de version (dans « À propos »).
  // Pas de limite de temps entre les touchers : seul le nombre compte.
  let touchers = 0
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-version]')) return
    touchers++
    if (touchers >= 5) {
      touchers = 0
      // On ferme « À propos » d'abord : sinon elle resterait par-dessus ce panneau.
      document.getElementById('fenetre-a-propos')?.close()
      ouvrir()
    }
  })

  actualiser()
  return { ouvrir, actualiser }
}
