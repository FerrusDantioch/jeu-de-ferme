/**
 * interface.js — les boutons et fenêtres posés par-dessus la 3D.
 *
 *  - le nom du lieu où l'on se trouve, en haut à gauche ;
 *  - une bulle d'aide (« Touchez le sol pour marcher », puis « Touchez un bâtiment… ») ;
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

export function creerInterface({ aideAuDemarrage = true } = {}) {
  const racine = document.getElementById('interface')

  // --- Barre du haut, avec le nom du lieu actuel à gauche ---
  const barre = creer('div', 'barre-haut')
  racine.appendChild(barre)
  // L'étiquette montre le lieu, les pièces et le niveau ; la toucher ouvre « Ma progression ».
  const etiquetteLieu = creer('button', 'etiquette-lieu')
  etiquetteLieu.setAttribute('aria-label', 'Ma progression')
  const nomLieu = creer('span', 'lieu-nom')
  nomLieu.setAttribute('aria-live', 'polite')
  const compteurs = creer('span', 'lieu-compteurs')
  etiquetteLieu.append(nomLieu, compteurs)
  barre.appendChild(etiquetteLieu)

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
    '<span class="icone" aria-hidden="true">ℹ️</span><span class="texte-facultatif">À propos</span>'
  )
  barre.appendChild(boutonAPropos)

  // --- Bulle d'aide ---
  const estTactile = window.matchMedia('(pointer: coarse)').matches
  const AIDES = {
    marcher: estTactile
      ? '👆 Touchez le sol pour marcher'
      : '🖱️ Cliquez sur le sol pour marcher<br><span class="discret">ou utilisez les flèches / Z Q S D</span>',
    entrer: estTactile
      ? '🚪 Touchez un bâtiment pour y entrer<br><span class="discret">et un villageois pour lui parler</span>'
      : '🚪 Cliquez sur un bâtiment pour y entrer<br><span class="discret">et sur un villageois pour lui parler</span>',
  }
  const bulle = creer('div', 'bulle-aide', AIDES.marcher)
  if (!aideAuDemarrage) bulle.classList.add('cache') // partie déjà commencée : pas besoin
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
    /** La barre du haut (pour y ajouter d'autres boutons). */
    barre,
    /** Cache la bulle d'aide (après le premier déplacement). */
    cacherAide() {
      bulle.classList.add('cache')
    },
    /** Affiche une autre aide : 'marcher' ou 'entrer'. */
    montrerAide(nom) {
      bulle.innerHTML = AIDES[nom] || ''
      bulle.classList.remove('cache')
    },
    /** Affiche le nom du lieu où l'on se trouve. */
    montrerLieu(titre) {
      nomLieu.textContent = titre
    },
    /** L'étiquette (à toucher) et la zone où écrire pièces et niveau. */
    etiquetteLieu,
    compteurs,
    /** Cache l'écran de chargement. */
    finChargement() {
      const ecran = document.getElementById('chargement')
      ecran.classList.add('cache')
      setTimeout(() => ecran.remove(), 800)
    },
  }
}
