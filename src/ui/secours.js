/**
 * secours.js — l'écran de secours, affiché si le jeu n'arrive pas à démarrer.
 *
 * Cela ne devrait jamais arriver… mais si un jour c'est le cas, on ne reste pas
 * bloquée devant « Chargement… » : cet écran explique calmement la situation et
 * propose de réessayer, de reprendre une copie de secours, d'exporter la sauvegarde
 * dans un fichier, ou de commencer une nouvelle partie (l'ancienne reste gardée).
 *
 * Ce fichier est chargé en tout premier (voir main.js) et ne dépend presque de rien,
 * pour fonctionner même quand le reste du jeu est en panne.
 */
import '../jeu/reglages.js' // applique le thème et la taille du texte choisis
import { copiesDeSecours, restaurerCopie, recommencerPartie, exporterSauvegardeBrute } from '../jeu/sauvegarde.js'

let jeuLance = false
let ecran = null

/** À appeler quand le jeu a bien démarré : l'écran de secours n'a plus de raison d'apparaître. */
export function jeuBienDemarre() {
  jeuLance = true
}

function echapper(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

/** Affiche l'écran de secours (une seule fois). */
export function montrerSecours(erreur) {
  if (jeuLance || ecran) return
  if (erreur) console.error('Le jeu n’a pas pu démarrer :', erreur)
  document.getElementById('chargement')?.remove()

  ecran = document.createElement('div')
  ecran.id = 'secours'
  ecran.setAttribute('role', 'alertdialog')
  ecran.setAttribute('aria-labelledby', 'titre-secours')
  document.body.appendChild(ecran)

  let etape = 'accueil' // 'accueil' ou 'confirmer-nouvelle'
  let message = ''

  function dessiner() {
    const copies = copiesDeSecours()
    const liste = copies
      .map((c) => `<button class="bouton" data-copie="${c.numero}"><span class="bouton-textes">
        <span>🛟 Reprendre la copie du ${echapper(c.titre)}</span>
        <span class="bouton-detail">${echapper(c.raison)} · ${echapper(c.resume)}</span></span></button>`)
      .join('')
    const actions = etape === 'confirmer-nouvelle'
      ? `<p><strong>Commencer une nouvelle partie ?</strong><br>
          <span class="discret">Ta partie actuelle sera gardée dans les copies de secours.</span></p>
         <button class="bouton" data-action="annuler">Non, revenir</button>
         <button class="bouton bouton-attention" data-action="confirmer-nouvelle">Oui, nouvelle partie</button>`
      : `<button class="bouton bouton-principal" data-action="reessayer">🔁 Réessayer</button>
         ${liste}
         <button class="bouton" data-action="exporter">📤 Enregistrer ma sauvegarde dans un fichier</button>
         <button class="bouton" data-action="nouvelle">🆕 Commencer une nouvelle partie</button>`
    ecran.innerHTML = `
      <div class="secours-panneau">
        <h2 id="titre-secours">🌱 Oups, le jeu n’a pas pu démarrer</h2>
        <p>Pas d’inquiétude : ta partie est toujours sur cet appareil. Rien n’est effacé.</p>
        <p class="discret">Essaie d’abord « Réessayer ». Si ça ne suffit pas, tu peux reprendre une copie de secours.</p>
        ${message ? `<p class="reglage-message" role="status">${echapper(message)}</p>` : ''}
        <div class="secours-actions">${actions}</div>
      </div>`
  }

  ecran.addEventListener('click', (e) => {
    const b = e.target.closest('button')
    if (!b) return
    const { action, copie } = b.dataset
    message = ''
    if (copie !== undefined) {
      if (!restaurerCopie(Number(copie), null, false)) message = 'Oups, cette copie n’a pas pu être reprise. Essaie une autre.'
    } else if (action === 'reessayer') {
      location.reload()
      return
    } else if (action === 'exporter') {
      message = exporterSauvegardeBrute()
        ? '📤 Fichier enregistré (dans les Téléchargements).'
        : 'Il n’y a pas de sauvegarde à enregistrer sur cet appareil.'
    } else if (action === 'nouvelle') {
      etape = 'confirmer-nouvelle'
    } else if (action === 'annuler') {
      etape = 'accueil'
    } else if (action === 'confirmer-nouvelle') {
      recommencerPartie(null, false)
      return
    }
    dessiner()
  })
  dessiner()
}

// Une erreur pendant le démarrage (avant que le jeu soit lancé) : on affiche l'écran de secours.
// Une fois le jeu lancé, ces écouteurs ne font plus rien.
window.addEventListener('error', (e) => {
  if (e.error) montrerSecours(e.error) // (e.error absent = simple image manquante : sans gravité)
})
window.addEventListener('unhandledrejection', (e) => montrerSecours(e.reason))
