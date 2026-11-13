/**
 * interface.js — les boutons et fenêtres posés par-dessus la 3D.
 *
 *  - le nom du lieu où l'on se trouve, en haut à gauche ;
 *  - une bulle d'aide (« Touche le sol pour marcher », puis « Touche un bâtiment… ») ;
 *  - la fenêtre « À propos » (ouverte depuis ⚙️ Réglages) ;
 *  - un bouton « Mettre à jour » qui apparaît quand une nouvelle version est prête ;
 *  - un bouton « Installer » qui apparaît quand le téléphone permet d'installer le jeu.
 */
import { NOM_DU_JEU, CONTACT, SITE_OMNI } from '../config.js'

// Numéro de version du jeu (lu automatiquement dans package.json par Vite).
const VERSION = import.meta.env.VITE_VERSION

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
  const iconeFete = creer('span', 'lieu-fete')
  etiquetteLieu.append(nomLieu, compteurs)
  barre.appendChild(etiquetteLieu)

  const boutonInstaller = creer(
    'button',
    'bouton bouton-principal',
    '<span class="icone" aria-hidden="true">📲</span><span>Installer</span>'
  )
  boutonInstaller.hidden = true
  barre.appendChild(boutonInstaller)

  // Bouton « Mettre à jour » : caché, il n'apparaît que lorsqu'une nouvelle version
  // du jeu a été téléchargée. Rien ne change tant qu'on ne le touche pas.
  const boutonMiseAJour = creer(
    'button',
    'bouton bouton-principal',
    '<span class="icone" aria-hidden="true">🔄</span><span>Mettre à jour</span>'
  )
  boutonMiseAJour.hidden = true
  barre.appendChild(boutonMiseAJour)

  // --- Bulle d'aide ---
  const estTactile = window.matchMedia('(pointer: coarse)').matches
  const AIDES = {
    marcher: estTactile
      ? '👆 Touche le sol pour marcher'
      : '🖱️ Clique sur le sol pour marcher<br><span class="discret">ou utilise les flèches / Z Q S D</span>',
    entrer: estTactile
      ? '🚪 Touche un bâtiment pour y entrer<br><span class="discret">et un villageois pour lui parler</span>'
      : '🚪 Clique sur un bâtiment pour y entrer<br><span class="discret">et sur un villageois pour lui parler</span>',
  }
  const bulle = creer('div', 'bulle-aide', AIDES.marcher)
  if (!aideAuDemarrage) bulle.classList.add('cache') // partie déjà commencée : pas besoin
  racine.appendChild(bulle)

  // --- Fenêtre « À propos » ---
  // Sa structure est écrite dans index.html (une vraie fenêtre <dialog>, la même que
  // dans les autres applications de l'Omni-système). Ici, on la remplit avec config.js.
  const aPropos = document.getElementById('fenetre-a-propos')
  aPropos.querySelector('.nom-application').textContent = NOM_DU_JEU
  aPropos.querySelector('.version').textContent = `Version ${VERSION}`
  const contact = aPropos.querySelector('.contact')
  contact.href = `mailto:${CONTACT}`
  contact.textContent = CONTACT
  aPropos.querySelector('.lien-omni').href = SITE_OMNI
  aPropos.addEventListener('click', (e) => {
    // Le bouton « Fermer », ou un toucher en dehors de la fenêtre (sur le voile), la ferme.
    if (e.target === aPropos || e.target.closest('[data-fermer]')) aPropos.close()
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
    /** Ouvre la fenêtre « À propos ». */
    ouvrirAPropos() {
      if (!aPropos.open) aPropos.showModal()
    },
    /**
     * Affiche le bouton « Mettre à jour ». `appliquer` installe la nouvelle version
     * et relance le jeu (la partie est sauvegardée juste avant).
     */
    proposerMiseAJour(appliquer) {
      boutonMiseAJour.hidden = false
      boutonMiseAJour.onclick = () => {
        boutonMiseAJour.disabled = true
        appliquer()
      }
    },
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
      if (iconeFete.textContent) nomLieu.appendChild(iconeFete)
    },
    /** Affiche l'icône de la fête du jour à côté du nom du lieu (ou rien). */
    montrerFete(fete) {
      iconeFete.textContent = fete ? ` ${fete.icone}` : ''
      iconeFete.title = fete ? fete.nom : ''
      if (fete) nomLieu.appendChild(iconeFete)
      else iconeFete.remove()
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
