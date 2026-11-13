/**
 * reglages.js (interface) — la fenêtre ⚙️ « Réglages ».
 *
 * On y trouve :
 *  - le confort de lecture : thème (clair, sombre, violet nuit), luminosité, taille du texte ;
 *  - les sons et la musique (activés ou coupés, volume) ;
 *  - le jour et la nuit, la saison ;
 *  - le joystick à l'écran ;
 *  - réduire les animations ;
 *  - les ombres et le mode économie (pour les téléphones moins puissants) ;
 *  - la sauvegarde : exporter, importer, copies de secours, recommencer une partie ;
 *  - « Comment jouer » et « À propos ».
 */
import { reglages } from '../jeu/reglages.js'
import {
  exporterPartie, lireFichierDePartie, remplacerPartie, recommencerPartie, copiesDeSecours, restaurerCopie,
} from '../jeu/sauvegarde.js'
import { creerFenetre, echapper } from './fenetre.js'

// Les choix proposés : [nom du réglage, titre, [[valeur, texte], …]].
const CHOIX = [
  // Confort de lecture.
  ['theme', '🎨 Thème', [['clair', 'Clair'], ['sombre', 'Sombre'], ['violet', 'Violet nuit']]],
  ['luminosite', '🔆 Luminosité', [[100, 'Normale'], [85, 'Douce'], [70, 'Tamisée'], [55, 'Très tamisée']]],
  ['tailleTexte', '🔠 Taille du texte', [['normale', 'Normale'], ['grande', 'Grande'], ['tresGrande', 'Très grande']]],
  // Sons.
  ['son', '🔊 Sons', [[true, 'Activés'], [false, 'Coupés']]],
  ['musique', '🎵 Musique', [[true, 'Oui'], [false, 'Non']]],
  ['volume', '🔉 Volume', [['doux', 'Doux'], ['moyen', 'Moyen'], ['fort', 'Fort']]],
  ['joystick', '🕹️ Joystick à l’écran', [[false, 'Non'], [true, 'Oui']]],
  ['cycleJour', '🌙 Jour et nuit', [['auto', 'Selon l’heure'], ['jour', 'Toujours le jour'], ['nuit', 'Toujours la nuit']]],
  ['saison', '🍂 Saison', [['auto', 'Selon la date'], ['printemps', '🌸 Printemps'], ['ete', '☀️ Été'], ['automne', '🍂 Automne'], ['hiver', '❄️ Hiver']]],
  ['animationsReduites', '🌀 Animations', [[false, 'Normales'], [true, 'Réduites']]],
  ['ombres', '🌗 Ombres', [[true, 'Oui'], [false, 'Non']]],
  ['economie', '🔋 Mode économie', [[false, 'Non'], [true, 'Oui']]],
]

const GUIDE = `
  <h2>❓ Comment jouer</h2>
  <ul class="guide">
    <li>👆 <strong>Marcher</strong> : touche le sol. (Au clavier : flèches ou Z Q S D. Un joystick est disponible dans les Réglages.)</li>
    <li>🚪 <strong>Entrer</strong> dans un bâtiment : touche-le. Pour sortir : touche la porte.</li>
    <li>🌱 <strong>Potager</strong> : touche une parcelle pour planter, arroser (facultatif) et récolter. Les plantes poussent même quand le jeu est fermé.</li>
    <li>🐔 <strong>Animaux</strong> : touche-les pour les nourrir, les caresser et ramasser œufs, lait et laine. Le foin et le grain sont gratuits dans les réserves.</li>
    <li>📋 <strong>Commandes</strong> : les villageois avec un 📋 attendent quelque chose. Livre-les (ou passe par le tableau des commandes). Pas de limite de temps !</li>
    <li>🧺 <strong>Boutique</strong> : touche Lila pour acheter des graines et des décorations, adopter des animaux, un chat ou un chien (gratuit), ou vendre.</li>
    <li>🍎 <strong>Verger</strong> : à droite de l’étable, touche un arbre pour le secouer et cueillir ses fruits.</li>
    <li>🍳 <strong>Cuisine</strong> : dans la maison, touche la cuisine pour préparer de bons plats.</li>
    <li>🎣 <strong>Pêche</strong> : touche l’étang. Quand ça mord, le poisson attend : remonte la ligne quand tu veux.</li>
    <li>🌼 <strong>Décorer</strong> : dans 🎒 Mon sac, « Décorer la ferme », puis touche l’herbe là où poser la décoration.</li>
    <li>📖 <strong>Carnet</strong> : tout ce que tu as récolté, pêché et cuisiné (dans 🎒 Mon sac).</li>
    <li>👤 <strong>Mon personnage</strong> : prénom, coiffure, tenue… et ton compagnon.</li>
    <li>🪑 <strong>S’asseoir</strong> : touche un banc ou une chaise.</li>
    <li>📜 <strong>Quêtes</strong> : 3 petites missions chaque jour, renouvelées à minuit.</li>
    <li>🌙 Le jour, la nuit et les saisons suivent l’heure et la date du téléphone (réglables ci-dessus).</li>
    <li>💾 La partie est <strong>sauvegardée toute seule</strong>.</li>
  </ul>
  <p class="discret">Rien ne presse, rien ne se perd : prends ton temps. 🌷</p>`

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
  // Ce qu'on est en train de confirmer : { type: 'importer', donnees, resume }, { type: 'recommencer' },
  // { type: 'secours' } (la liste des copies) ou { type: 'restaurer', numero, titre }.
  let attente = null

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
        if (!remplacerPartie(attente.donnees, avantExport)) message = 'Oups, la mémoire du téléphone est peut-être pleine : l’import n’a pas pu se faire.'
        attente = null
      } else if (action === 'recommencer') {
        attente = { type: 'recommencer' }
        message = ''
      } else if (action === 'confirmer-recommencer') {
        recommencerPartie(avantExport)
      } else if (action === 'secours') {
        attente = { type: 'secours' }
        message = ''
      } else if (action === 'choisir-copie') {
        attente = { type: 'restaurer', numero: Number(b.dataset.numero), titre: b.dataset.titre }
      } else if (action === 'confirmer-restaurer' && attente?.type === 'restaurer') {
        if (!restaurerCopie(attente.numero, avantExport)) message = 'Oups, cette copie n’a pas pu être reprise.'
        attente = null
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
      const desactive = nom === 'volume' && !reglages.get('son') && !reglages.get('musique')
      const boutons = options
        .map(([valeur, texte]) => {
          const choisi = actuelle === valeur
          return `<button class="bouton${choisi ? ' bouton-principal' : ''}" data-reglage="${nom}" data-valeur='${JSON.stringify(valeur)}' aria-pressed="${choisi}"${desactive ? ' disabled' : ''}>${nom === 'theme' ? `<span class="apercu-theme" data-theme="${valeur}" aria-hidden="true"></span>` : ''}${echapper(texte)}</button>`
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
        <span class="discret">Ta partie actuelle sera gardée dans les « Copies de secours » : tu pourras encore y revenir. Tu peux aussi l’exporter d’abord.</span></p>
        <div class="reglage-choix"><button class="bouton" data-action="annuler">Non, garder ma partie</button>
        <button class="bouton bouton-attention" data-action="confirmer-recommencer">Oui, tout effacer</button></div>`
    } else if (attente?.type === 'secours') {
      const copies = copiesDeSecours()
      const liste = copies
        .map((c) => `<button class="bouton" data-action="choisir-copie" data-numero="${c.numero}" data-titre="${echapper(c.titre)}">
          <span class="bouton-textes"><span>🛟 ${echapper(c.titre)}</span>
          <span class="bouton-detail">${echapper(c.raison)} · ${echapper(c.resume)}</span></span></button>`)
        .join('')
      sauvegarde = `<p><strong>🛟 Copies de secours</strong><br>
        <span class="discret">Le jeu garde tout seul quelques copies de ta partie (une par jour de jeu, et une avant chaque import ou nouvelle partie). Choisis-en une pour y revenir.</span></p>
        <div class="liste-copies">${liste || '<p class="discret">Pas encore de copie : la première sera faite au prochain lancement du jeu.</p>'}</div>
        <div class="reglage-choix"><button class="bouton" data-action="annuler">Retour</button></div>`
    } else if (attente?.type === 'restaurer') {
      sauvegarde = `<p><strong>Reprendre la copie du ${echapper(attente.titre)} ?</strong><br>
        <span class="discret">Ta partie actuelle sera gardée, elle aussi, dans les copies de secours.</span></p>
        <div class="reglage-choix"><button class="bouton bouton-principal" data-action="confirmer-restaurer">Oui, reprendre cette copie</button>
        <button class="bouton" data-action="annuler">Annuler</button></div>`
    } else {
      sauvegarde = `<p class="discret">La partie est sauvegardée toute seule sur cet appareil. Tu peux aussi la garder dans un fichier.</p>
        <div class="reglage-choix">
          <button class="bouton" data-action="exporter">📤 Exporter</button>
          <button class="bouton" data-action="importer">📥 Importer</button>
          <button class="bouton" data-action="secours">🛟 Copies de secours</button>
          <button class="bouton" data-action="recommencer">🆕 Nouvelle partie</button>
        </div>`
    }

    fenetre.remplir(`
      <h2>⚙️ Réglages</h2>
      ${lignes}
      <p class="discret">🌙 Pour une ferme plus douce pour les yeux le soir, tu peux aussi choisir « Toujours la nuit ».</p>
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
