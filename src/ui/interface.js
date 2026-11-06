/**
 * interface.js — les boutons et fenêtres posés par-dessus la 3D.
 *
 * Pour le jalon 1 :
 *  - une bulle d'aide « Touchez le sol pour marcher » ;
 *  - un bouton « À propos » (nom du jeu, auteur, version) ;
 *  - un bouton « Installer » qui apparaît quand le téléphone permet d'installer le jeu.
 */
import { NOM_DU_JEU, AUTEUR } from '../config.js'

// Numéro de version du jeu (lu automatiquement dans package.json par Vite).
const VERSION = import.meta.env.VITE_VERSION || '0.1.0'

// Petite aide pour créer un élément HTML.
function creer(balise, classes = '', html = '') {
  const el = document.createElement(balise)
  if (classes) el.className = classes
  if (html) el.innerHTML = html
  return el
}

export function creerInterface() {
  const racine = document.getElementById('interface')

  // --- Barre du haut ---
  const barre = creer('div', 'barre-haut')
  racine.appendChild(barre)

  const boutonInstaller = creer(
    'button',
    'bouton bouton-principal',
    '<span class="icone" aria-hidden="true">📲</span><span>Installer</span>'
  )
  boutonInstaller.hidden = true
  barre.appendChild(boutonInstaller)

  const boutonAPropos = creer(
    'button',
    'bouton',
    '<span class="icone" aria-hidden="true">ℹ️</span><span>À propos</span>'
  )
  barre.appendChild(boutonAPropos)

  // --- Bulle d'aide ---
  const estTactile = window.matchMedia('(pointer: coarse)').matches
  const bulle = creer(
    'div',
    'bulle-aide',
    estTactile
      ? '👆 Touchez le sol pour marcher'
      : '🖱️ Cliquez sur le sol pour marcher<br><span class="discret">ou utilisez les flèches / Z Q S D</span>'
  )
  racine.appendChild(bulle)

  // --- Fenêtre « À propos » ---
  const voile = creer('div', 'voile')
  voile.hidden = true
  voile.innerHTML = `
    <div class="panneau" role="dialog" aria-modal="true" aria-labelledby="titre-apropos">
      <h2 id="titre-apropos">${NOM_DU_JEU}</h2>
      <p>Un jeu de ferme tout doux : prenez votre temps, rien ne presse. 🌱</p>
      <p>Créé par <strong>${AUTEUR}</strong>.</p>
      <p class="discret">Version ${VERSION}<br>
      Sans publicité, sans achat, sans collecte de données.<br>
      Fonctionne sans Internet une fois installé.</p>
      <div class="actions">
        <button class="bouton bouton-principal" data-action="fermer">
          <span class="icone" aria-hidden="true">✔️</span><span>Fermer</span>
        </button>
      </div>
    </div>`
  racine.appendChild(voile)

  const boutonFermer = voile.querySelector('[data-action="fermer"]')
  boutonAPropos.addEventListener('click', () => {
    voile.hidden = false
    boutonFermer.focus()
  })
  boutonFermer.addEventListener('click', () => (voile.hidden = true))
  // Toucher en dehors de la fenêtre la ferme aussi.
  voile.addEventListener('click', (e) => {
    if (e.target === voile) voile.hidden = true
  })

  // --- Installation de l'appli (Android / ordinateur avec Chrome ou Edge) ---
  // Le navigateur nous prévient quand le jeu peut être installé ; on garde ce
  // « droit d'installer » de côté et on affiche notre propre bouton.
  let invitationInstallation = null
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    invitationInstallation = e
    boutonInstaller.hidden = false
  })
  boutonInstaller.addEventListener('click', async () => {
    if (!invitationInstallation) return
    invitationInstallation.prompt()
    await invitationInstallation.userChoice
    invitationInstallation = null
    boutonInstaller.hidden = true
  })
  window.addEventListener('appinstalled', () => (boutonInstaller.hidden = true))

  return {
    /** Cache la bulle d'aide (après le premier déplacement). */
    cacherAide() {
      bulle.classList.add('cache')
    },
    /** Cache l'écran de chargement. */
    finChargement() {
      const ecran = document.getElementById('chargement')
      ecran.classList.add('cache')
      setTimeout(() => ecran.remove(), 800)
    },
  }
}
