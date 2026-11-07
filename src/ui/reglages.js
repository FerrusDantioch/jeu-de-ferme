/**
 * reglages.js (interface) — la fenêtre ⚙️ « Réglages ».
 *
 * On y trouve :
 *  - les sons (activés ou coupés, volume) ;
 *  - le joystick à l'écran ;
 *  - la taille du texte ;
 *  - réduire les animations ;
 *  - les ombres et le mode économie (pour les téléphones moins puissants) ;
 *  - la sauvegarde : exporter, importer, recommencer une partie ;
 *  - « Comment jouer » et « À propos ».
 */
import { reglages } from '../jeu/reglages.js'
import { exporterPartie, lireFichierDePartie, remplacerPartie, recommencerPartie } from '../jeu/sauvegarde.js'
import { creerFenetre, echapper } from './fenetre.js'

// Les choix proposés : [nom du réglage, titre, [[valeur, texte], …]].
const CHOIX = [
  ['son', '🔊 Sons', [[true, 'Activés'], [false, 'Coupés']]],
  ['volume', '🔉 Volume', [['doux', 'Doux'], ['moyen', 'Moyen'], ['fort', 'Fort']]],
  ['joystick', '🕹️ Joystick à l’écran', [[false, 'Non'], [true, 'Oui']]],
  ['tailleTexte', '🔠 Taille du texte', [['normale', 'Normale'], ['grande', 'Grande'], ['tresGrande', 'Très grande']]],
  ['animationsReduites', '🌀 Animations', [[false, 'Normales'], [true, 'Réduites']]],
  ['ombres', '🌗 Ombres', [[true, 'Oui'], [false, 'Non']]],
  ['economie', '🔋 Mode économie', [[false, 'Non'], [true, 'Oui']]],
]

const GUIDE = `
  <h2>❓ Comment jouer</h2>
  <ul class="guide">
    <li>👆 <strong>Marcher</strong> : touchez le sol. (Au clavier : flèches ou Z Q S D. Un joystick est disponible dans les Réglages.)</li>
    <li>🚪 <strong>Entrer</strong> dans un bâtiment : touchez-le. Pour sortir : touchez la porte.</li>
    <li>🌱 <strong>Potager</strong> : touchez une parcelle pour planter, arroser (facultatif) et récolter. Les plantes poussent même quand le jeu est fermé.</li>
    <li>🐔 <strong>Animaux</strong> : touchez-les pour les nourrir, les caresser et ramasser œufs, lait et laine. Le foin et le grain sont gratuits dans les réserves.</li>
    <li>📋 <strong>Commandes</strong> : les villageois avec un 📋 attendent quelque chose. Livrez-les (ou passez par le tableau des commandes). Pas de limite de temps !</li>
    <li>🧺 <strong>Boutique</strong> : touchez Lila pour acheter des graines, adopter des animaux ou vendre.</li>
    <li>📜 <strong>Quêtes</strong> : 3 petites missions chaque jour, renouvelées à minuit.</li>
    <li>💾 La partie est <strong>sauvegardée toute seule</strong>.</li>
  </ul>
  <p class="discret">Rien ne presse, rien ne se perd : prenez votre temps. 🌷</p>`

/**
 * @param {object} o
 *  - barre : la barre du haut (où ajouter le bouton ⚙️)
 *  - ouvrirAPropos : ouvre la fenêtre « À propos »
 *  - avantExport : note la position du personnage avant d'exporter
 */
export function creerReglages({ barre, ouvrirAPropos, avantExport }) {
  const bouton = document.createElement('button')
  bouton.className = 'bouton bouton-reglages'
  bouton.setAttribute('aria-label', 'Réglages')
  bouton.innerHTML = '<span class="icone" aria-hidden="true">⚙️</span><span class="texte-facultatif">Réglages</span>'
  barre.appendChild(bouton)

  // Champ (invisible) pour choisir un fichier à importer.
  const choixFichier = document.createElement('input')
  choixFichier.type = 'file'
  choixFichier.accept = '.json,application/json'
  choixFichier.hidden = true
  document.body.appendChild(choixFichier)

  let message = '' // petit message sous la partie « Sauvegarde »
  let attente = null // { type: 'importer', donnees, resume } ou { type: 'recommencer' }

  const guide = creerFenetre({ classe: 'panneau-guide' })
  const fenetre = creerFenetre({
    classe: 'panneau-reglages',
    surClic: (el) => {
      const b = el.closest('button')
      if (!b || b.disabled) return
      const { reglage, valeur, action } = b.dataset
      if (reglage) {
        reglages.set(reglage, JSON.parse(valeur))
      } else if (action === 'exporter') {
        const nom = exporterPartie(avantExport)
        message = `📤 Fichier « ${nom} » enregistré (dans les Téléchargements).`
      } else if (action === 'importer') {
        message = ''
        choixFichier.click()
      } else if (action === 'confirmer-import' && attente?.type === 'importer') {
        if (!remplacerPartie(attente.donnees)) message = 'Oups, la mémoire du téléphone est peut-être pleine : l’import n’a pas pu se faire.'
        attente = null
      } else if (action === 'recommencer') {
        attente = { type: 'recommencer' }
        message = ''
      } else if (action === 'confirmer-recommencer') {
        recommencerPartie()
      } else if (action === 'annuler') {
        attente = null
        message = ''
      } else if (action === 'guide') {
        guide.ouvrir(GUIDE)
      } else if (action === 'apropos') {
        fenetre.fermer()
        ouvrirAPropos()
        return
      }
      dessiner()
    },
    surFermeture: () => {
      attente = null
      message = ''
    },
  })

  choixFichier.addEventListener('change', async () => {
    const fichier = choixFichier.files[0]
    choixFichier.value = ''
    if (!fichier) return
    const r = await lireFichierDePartie(fichier)
    if (r.ok) attente = { type: 'importer', donnees: r.donnees, resume: r.resume }
    else message = r.message
    dessiner()
  })

  function dessiner() {
    const lignes = CHOIX.map(([nom, titre, options]) => {
      let actuelle = reglages.get(nom)
      // « Animations » : si rien n'a été choisi, on montre ce que demande le téléphone.
      if (nom === 'animationsReduites' && (actuelle === null || actuelle === undefined)) {
        actuelle = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
      const desactive = nom === 'volume' && !reglages.get('son')
      const boutons = options
        .map(([valeur, texte]) => {
          const choisi = actuelle === valeur
          return `<button class="bouton${choisi ? ' bouton-principal' : ''}" data-reglage="${nom}" data-valeur='${JSON.stringify(valeur)}' aria-pressed="${choisi}"${desactive ? ' disabled' : ''}>${echapper(texte)}</button>`
        })
        .join('')
      return `<div class="ligne-reglage"><div class="reglage-titre">${titre}</div><div class="reglage-choix">${boutons}</div></div>`
    }).join('')

    let sauvegarde
    if (attente?.type === 'importer') {
      sauvegarde = `<p><strong>Remplacer la partie actuelle par celle-ci ?</strong><br><span class="discret">${echapper(attente.resume)}</span></p>
        <div class="reglage-choix"><button class="bouton bouton-principal" data-action="confirmer-import">Oui, remplacer</button>
        <button class="bouton" data-action="annuler">Annuler</button></div>`
    } else if (attente?.type === 'recommencer') {
      sauvegarde = `<p><strong>Tout effacer et recommencer une nouvelle partie ?</strong><br>
        <span class="discret">La partie actuelle sera perdue. Pensez à l’exporter d’abord si vous voulez la garder.</span></p>
        <div class="reglage-choix"><button class="bouton" data-action="annuler">Non, garder ma partie</button>
        <button class="bouton bouton-attention" data-action="confirmer-recommencer">Oui, tout effacer</button></div>`
    } else {
      sauvegarde = `<p class="discret">La partie est sauvegardée toute seule sur cet appareil. Vous pouvez aussi la garder dans un fichier.</p>
        <div class="reglage-choix">
          <button class="bouton" data-action="exporter">📤 Exporter</button>
          <button class="bouton" data-action="importer">📥 Importer</button>
          <button class="bouton" data-action="recommencer">🆕 Nouvelle partie</button>
        </div>`
    }

    fenetre.remplir(`
      <h2>⚙️ Réglages</h2>
      ${lignes}
      <p class="discret">🔋 Le mode économie rend l’image un peu moins fine, mais le jeu plus fluide et moins gourmand en batterie.</p>
      <h3>💾 Sauvegarde</h3>
      ${sauvegarde}
      ${message ? `<p class="reglage-message" role="status">${echapper(message)}</p>` : ''}
      <h3>📖 Aide</h3>
      <div class="reglage-choix">
        <button class="bouton" data-action="guide">❓ Comment jouer</button>
        <button class="bouton" data-action="apropos">ℹ️ À propos</button>
      </div>`)
  }

  bouton.addEventListener('click', () => {
    dessiner()
    fenetre.ouvrir()
  })
  reglages.ecouter(() => {
    if (fenetre.ouverte) dessiner()
  })

  return { ouvrir: () => bouton.click(), ouvrirGuide: () => guide.ouvrir(GUIDE) }
}
