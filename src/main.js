/**
 * main.js — le point de départ du jeu. C'est ici que tout est assemblé :
 * la 3D, les lieux (dehors, maison, étable, boutique), le personnage, la caméra,
 * les commandes, l'interface et la sauvegarde.
 */
import * as THREE from 'three'
import './ui/themes.css' // les couleurs (thèmes clair, sombre, violet nuit)
import './ui/style.css'
import { creerRendu } from './moteur/rendu.js'
import { creerCamera } from './moteur/camera.js'
import { creerEntrees } from './moteur/entrees.js'
import { demarrerBoucle } from './moteur/boucle.js'
import { GrilleChemin } from './moteur/chemin.js'
import { creerMarqueur } from './monde/marqueur.js'
import { Personnage } from './entites/personnage.js'
import { creerGestionnaireLieux } from './lieux/gestionnaire.js'
import { creerInterface } from './ui/interface.js'
import { creerBulles } from './ui/bulles.js'
import { creerFondu } from './ui/fondu.js'
import { creerFiche } from './ui/fiche.js'
import { creerPastilles } from './ui/pastilles.js'
import { creerSac } from './ui/sac.js'
import { etat } from './jeu/etat.js'
import { chargerPartie, demarrerSauvegardeAuto, enregistrer } from './jeu/sauvegarde.js'
import { avancerTous } from './jeu/elevage.js'
import {
  ficheParcelle, ficheAnimal, ficheReserve, ficheCommandes, ficheCompagnon, ficheArbre, ficheCuisine, fichePeche,
} from './jeu/fiches.js'
import { creerPeche } from './monde/peche.js'
import { creerCarnet } from './ui/carnet.js'
import { creerDecorer } from './ui/decorer.js'
import { toutFermer } from './ui/fenetre.js'
import { DECORATIONS } from './donnees/decorations.js'
import { poserDecoration, tournerDecoration, rangerDecoration } from './jeu/decorations.js'
import { tirerPrise, prendre } from './jeu/peche.js'
import { ETANG } from './donnees/ferme.js'
import { infosObjet } from './donnees/objets.js'
import * as commandes from './jeu/commandes.js'
import { creerBoutique } from './ui/boutique.js'
import { creerProgression } from './ui/progression.js'
import { creerQuetes } from './ui/quetes.js'
import { creerModeTest } from './ui/mode-test.js'
import { creerFenetre, echapper } from './ui/fenetre.js'
import * as quetes from './jeu/quetes.js'
import { feteDuJour, cleDuJour } from './jeu/calendrier.js'
import { trouverOeuf, phraseDeFete } from './jeu/fetes.js'
import { annoncer } from './jeu/evenements.js'
import { CACHETTES_OEUFS } from './monde/decorations-fetes.js'
import { PHRASES_ASSIS } from './monde/sieges.js'
import { reglages } from './jeu/reglages.js'
import { jouer } from './moteur/sons.js'
import { creerJoystick } from './ui/joystick.js'
import { creerReglages } from './ui/reglages.js'
import { ecouterActions } from './jeu/evenements.js'
import { surNouveauNiveau } from './jeu/economie.js'
import { activerModeHorsLigne } from './pwa.js'
import { creerFenetrePerso } from './ui/perso.js'
import { demanderTexte } from './ui/saisie.js'
import { surChangementApparence } from './jeu/perso.js'
import { creerCiel } from './monde/ciel.js'
import { Compagnon } from './entites/compagnon.js'
import { compagnon, changerCompagnon, surChangementCompagnon } from './jeu/compagnon.js'
import { demarrerMusique } from './moteur/musique.js'

// 0) On reprend la partie enregistrée sur le téléphone (ou on en commence une nouvelle).
const partie = chargerPartie()
etat.remplacer(partie.donnees)
const nouvellePartie = !etat.d.joueur
avancerTous() // les animaux ont vécu pendant que le jeu était fermé

// 1) Le dessinateur 3D, la scène et la caméra.
const conteneur = document.getElementById('scene3d')
const { renderer, scene, soleil, lumiereAmbiante, suivreSoleil, changerAmbiance, appliquerQualite } = creerRendu(conteneur)
// Le jour et la nuit (selon l'heure du téléphone) : couleurs du ciel, fenêtres et lampadaires allumés le soir.
const ciel = creerCiel({ scene, soleil, lumiereAmbiante })
const appliquerCiel = () => lieux?.actuel && ciel.appliquer(lieux.actuel.id === 'exterieur')
const { camera, placerSur, suivre, adapterTaille, zoomer } = creerCamera()
adapterTaille(window.innerWidth, window.innerHeight)

// 2) L'interface : boutons, bulles de paroles, fondu entre les lieux,
//    fiche du bas (potager, animaux), petites icônes, sac.
const interfaceJeu = creerInterface({ aideAuDemarrage: nouvellePartie })
const bulles = creerBulles()
const fondu = creerFondu()
const pastilles = creerPastilles()
const fiche = creerFiche({ surOuverture: () => interfaceJeu.cacherAide() })
creerSac(interfaceJeu.barre)
creerCarnet()
const joystick = creerJoystick()
creerProgression(interfaceJeu.compteurs, interfaceJeu.etiquetteLieu)
// La boutique de Lila. Un animal adopté apparaît tout de suite s'il est dans un lieu déjà construit
// (sinon, il sera là à la première visite de l'étable).
// Les quêtes du jour (bouton 📜) : « +15 🪙 » s'envole au-dessus du personnage à la récompense.
const panneauQuetes = creerQuetes(interfaceJeu.barre, {
  surRecompense: (q) => {
    bulles.flotter(personnage.modele, `+${q.pieces} 🪙`, 1.7)
    setTimeout(() => bulles.flotter(personnage.modele, `+${q.experience} ⭐`, 1.7), 900)
  },
})
// Le mode test caché (5 touchers sur le numéro de version, dans « À propos »).
creerModeTest(interfaceJeu.barre, () => verifierCalendrier())
// La fenêtre qui annonce une fête (une fois par jour de fête).
const fenetreFete = creerFenetre({ classe: 'panneau-fete', texteFermer: 'Merci !' })
const boutique = creerBoutique({
  surAdoption: (ficheAnimal) => lieux.lieuConstruit(ficheAnimal.lieu)?.animaux?.ajouter(ficheAnimal),
})

// 3) Le personnage (sa grille d'obstacles sera celle du lieu où il se trouve)
//    et le petit cercle qui montre où il va.
const personnage = new Personnage(scene, new GrilleChemin(2, 0.5))
const marqueur = creerMarqueur(scene)

// La fenêtre 👤 « Mon personnage » : le personnage change en direct, et se tourne vers nous.
const fenetrePerso = creerFenetrePerso({
  barre: interfaceJeu.barre,
  surOuverture: () => {
    fiche.fermer()
    if (!personnage.assis) {
      personnage.arreter()
      marqueur.cacher()
      personnage.angleVise = 0
    }
  },
})
surChangementApparence(() => personnage.actualiserApparence())

// Le compagnon (chat ou chien), s'il a été adopté chez Lila : il suit le personnage partout.
let animalCompagnon = null
function actualiserCompagnon() {
  const f = compagnon()
  if (!f) return
  if (animalCompagnon) return animalCompagnon.changerApparence(f)
  animalCompagnon = new Compagnon(scene, f)
  if (lieux.actuel) animalCompagnon.placerPres(personnage.position.x, personnage.position.z, lieux.actuel.grille)
}
surChangementCompagnon(actualiserCompagnon)

/** Donner un nouveau nom à un animal (depuis sa fiche). */
async function renommerAnimal(fiche) {
  const nom = await demanderTexte({ titre: `✏️ Un nouveau nom pour ${fiche.nom} ?`, valeur: fiche.nom, max: 14 })
  if (!nom || nom === fiche.nom) return
  fiche.nom = nom
  etat.signaler()
}

// La caméra suit le personnage, mais sans sortir des limites du lieu (s'il y en a).
const cibleCamera = new THREE.Vector3()
function limiterCamera(position) {
  cibleCamera.copy(position)
  const limites = lieux.actuel?.limitesCamera
  if (limites) {
    cibleCamera.x = Math.min(Math.max(cibleCamera.x, -limites.x), limites.x)
    cibleCamera.z = Math.min(Math.max(cibleCamera.z, -limites.z), limites.z)
  }
  // Quand la fiche du bas (ou la fenêtre 👤) est ouverte, on décale la vue pour que
  // le personnage reste visible au-dessus d'elle (la caméra glisse doucement).
  if (fenetrePerso.ouverte) cibleCamera.z += window.innerHeight > window.innerWidth ? 1.5 : 0.6
  else if (fiche.ouverte) cibleCamera.z += window.innerHeight > window.innerWidth ? 2.6 : 1.6
  return cibleCamera
}

// 4) Le gestionnaire de lieux : il passe de dehors à dedans avec un fondu.
let aideEntrerMontree = false
let dejaEntre = false
const lieux = creerGestionnaireLieux({
  scene,
  changerAmbiance,
  personnage,
  placerCamera: (position) => placerSur(limiterCamera(position)),
  fondu,
  bulles,
  marqueur,
  outils: { bulles, pastilles, ciel },
  surChangement(lieu) {
    if (interfaceJeu.lieuDejaAffiche) jouer('porte')
    interfaceJeu.lieuDejaAffiche = true
    interfaceJeu.montrerLieu(lieu.titre)
    ciel.appliquer(lieu.id === 'exterieur')
    fiche.fermer()
    peche.arreter()
    finirPlacement()
    // Le compagnon passe la porte avec nous.
    animalCompagnon?.placerPres(personnage.position.x, personnage.position.z, lieu.grille)
    if (lieu.id !== 'exterieur' && !dejaEntre) {
      dejaEntre = true
      interfaceJeu.cacherAide()
    }
  },
})

// Après le tout premier déplacement, on montre la deuxième aide (« Touchez un bâtiment… »).
function apresUnDeplacement() {
  if (aideEntrerMontree || !nouvellePartie) return // seulement la toute première fois
  aideEntrerMontree = true
  interfaceJeu.cacherAide()
  setTimeout(() => {
    if (dejaEntre) return
    interfaceJeu.montrerAide('entrer')
    setTimeout(() => interfaceJeu.cacherAide(), 9000)
  }, 3500)
}

// Quand le personnage arrive au bout de son chemin : s'il allait vers une porte, il la passe.
personnage.surArrivee = () => {
  marqueur.cacher()
  const porte = personnage.porteVisee
  const siege = personnage.siegeVise
  const action = personnage.quandArrive
  personnage.porteVisee = null
  personnage.siegeVise = null
  personnage.quandArrive = null
  if (porte && personnage.distanceA(porte) < lieux.DISTANCE_PORTE) lieux.passerPorte(porte)
  else if (siege && personnage.distanceA(siege.devant) < 0.9) sAsseoir(siege)
  else if (action) action()
}

/** Le personnage s'assoit (avec, parfois, une petite phrase). */
function sAsseoir(siege) {
  personnage.asseoir(siege)
  jouer('asseoir')
  annoncer('asseoir')
  if (Math.random() < 0.35) bulles.dire(personnage.modele, PHRASES_ASSIS[Math.floor(Math.random() * PHRASES_ASSIS.length)])
}

// --- La pêche à l'étang ---
const peche = creerPeche(scene)
let dernierePrise = null // { id, nouveau } : pour l'afficher dans la fiche

/**
 * L'endroit où pêcher au bord de l'étang : parmi quelques places bien visibles
 * (à gauche et au-dessus de l'étang, jamais cachées par la boutique), la plus proche.
 */
const PLACES_DE_PECHE = [Math.PI, Math.PI * 0.75, -Math.PI * 0.75, -Math.PI / 2, -Math.PI / 4]
function bordDeLEtang() {
  const grille = lieux.actuel.grille
  let meilleure = null
  for (const a of PLACES_DE_PECHE) {
    const x = ETANG.x + Math.cos(a) * (ETANG.rayon + 0.8)
    const z = ETANG.z + Math.sin(a) * (ETANG.rayon + 0.8)
    const c = grille.versCase(x, z)
    if (!grille.estLibre(c.i, c.j)) continue
    const d = personnage.distanceA({ x, z })
    if (!meilleure || d < meilleure.d) meilleure = { x, z, a, d }
  }
  return meilleure
}

/** Va au bord de l'étang (si besoin), puis lance la ligne. */
function allerPecher() {
  dernierePrise = null
  const bord = bordDeLEtang()
  if (!bord) return
  const commencer = () => {
    personnage.regarderVers(ETANG.x, ETANG.z)
    const eau = { x: ETANG.x + Math.cos(bord.a) * (ETANG.rayon - 1.0), z: ETANG.z + Math.sin(bord.a) * (ETANG.rayon - 1.0) }
    // On attend que le personnage soit tourné vers l'eau avant de lancer.
    setTimeout(() => {
      if (personnage.distanceA(bord) > 0.4 || personnage.enRoute) return
      peche.lancer(personnage, eau, () => {
        jouer('mord')
        bulles.dire(personnage.modele, 'Ça mord ! 🐟')
        fiche.rafraichir()
      })
      jouer('lancer')
      fiche.rafraichir()
    }, 350)
  }
  if (personnage.assis) personnage.seLever()
  if (personnage.distanceA(bord) < 0.4) commencer()
  else marcherVers(new THREE.Vector3(bord.x, 0, bord.z), null, null, commencer)
}

const descriptionPeche = fichePeche({
  peche,
  lancer: allerPecher,
  ranger: () => peche.arreter(),
  remonter: () => {
    if (!peche.remonter()) return
    const id = tirerPrise()
    const nouveau = !etat.d.carnet?.[id]
    const r = prendre(id)
    dernierePrise = { id, nouveau }
    const o = infosObjet(id)
    bulles.flotter(personnage.modele, `+1 ${o.icone}`, 1.7)
    if (r.xp) setTimeout(() => bulles.flotter(personnage.modele, `+${r.xp} ⭐`, 1.7), 900)
  },
  dernierePrise: () => dernierePrise,
})

// --- Décorer la ferme : choisir une décoration, toucher l'herbe, puis « Poser ici » ---
const placement = { type: null, x: 0, z: 0, angle: 0, possible: false }

function actualiserApercu() {
  const decos = lieux.actuel?.decorations
  if (!placement.type || !decos) return
  placement.possible = decos.montrerApercu(placement.type, placement.x, placement.z, placement.angle)
  fiche.rafraichir()
}

function finirPlacement() {
  placement.type = null
  lieux.lieuConstruit('exterieur')?.decorations.cacherApercu()
}

/** Commence à poser une décoration (seulement dehors). */
function commencerPlacement(type) {
  if (lieux.actuel.id !== 'exterieur') return
  toutFermer()
  if (personnage.assis) personnage.seLever()
  personnage.arreter()
  // On propose d'abord une place juste devant le personnage.
  placement.type = type
  placement.angle = 0
  placement.x = personnage.position.x
  placement.z = personnage.position.z + 1.8
  fiche.ouvrir(() => {
    if (!placement.type) return null
    const d = DECORATIONS[placement.type]
    return {
      icone: d.icone,
      titre: `Poser : ${d.nom}`,
      lignes: [
        { texte: 'Touche l’herbe pour choisir l’endroit.', discret: true },
        { texte: placement.possible ? '✅ Ici, c’est parfait !' : '🚫 Pas de place ici : choisis un autre endroit.' },
      ],
      actions: [
        {
          icone: '✅',
          texte: 'Poser ici',
          principal: true,
          desactive: !placement.possible,
          faire: () => {
            if (!poserDecoration(placement.type, placement.x, placement.z, placement.angle)) return
            jouer('planter')
            finirPlacement()
            fiche.fermer()
            bulles.flotter(personnage.modele, '✨', 1.7)
          },
        },
        {
          icone: '↻',
          texte: 'Tourner',
          faire: () => {
            placement.angle = (placement.angle + Math.PI / 2) % (Math.PI * 2)
            actualiserApercu()
          },
        },
        { icone: '✖️', texte: 'Annuler', faire: () => fiche.fermer() },
      ],
    }
  })
  actualiserApercu()
}
creerDecorer({ dehors: () => lieux.actuel?.id === 'exterieur', poser: commencerPlacement })

// 5) Les commandes : toucher le sol pour y aller, toucher un bâtiment pour y entrer,
//    toucher un villageois pour lui parler.
const entrees = creerEntrees(renderer.domElement)
const lanceRayon = new THREE.Raycaster()
const planDuSol = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // le sol est à la hauteur 0
const pointEcran = new THREE.Vector2()
const pointSol = new THREE.Vector3()

/** Vrai si l'objet et tous ses parents sont visibles (un villageois rentré chez lui ne compte pas). */
function estVisible(objet) {
  for (let o = objet; o; o = o.parent) if (!o.visible) return false
  return true
}

/** Cherche, parmi les objets touchés par le rayon, le premier qui réagit au toucher. */
function objetTouche() {
  const liste = animalCompagnon ? [...lieux.actuel.touchables, animalCompagnon.zone] : lieux.actuel.touchables
  const touches = lanceRayon.intersectObjects(liste, true)
  const trouves = [] // [{ toucher, objet }] dans l'ordre (le plus proche de la caméra d'abord)
  for (const t of touches) {
    if (!estVisible(t.object)) continue
    for (let o = t.object; o; o = o.parent) {
      if (o.userData.toucher) {
        trouves.push({ toucher: o.userData.toucher, objet: o })
        break
      }
    }
  }
  if (trouves.length === 0) return null
  // Des animaux ou des villageois serrés les uns contre les autres : on prend celui
  // dont le centre est le plus près de l'endroit exact où le doigt a touché.
  const vivant = (t) => ['animal', 'pnj', 'compagnon'].includes(t.toucher.type)
  if (!vivant(trouves[0])) return trouves[0].toucher
  let meilleur = null
  let meilleureDistance = Infinity
  for (const t of trouves) {
    if (!vivant(t)) continue
    t.objet.getWorldPosition(centreObjet)
    const d = lanceRayon.ray.distanceSqToPoint(centreObjet)
    if (d < meilleureDistance) {
      meilleureDistance = d
      meilleur = t.toucher
    }
  }
  return meilleur
}
const centreObjet = new THREE.Vector3()

/** Fait marcher le personnage vers un point ; renvoie vrai si c'est possible. */
function marcherVers(point, porte = null, siege = null, quandArrive = null) {
  const destination = personnage.allerVers(point)
  personnage.porteVisee = destination ? porte : null
  personnage.siegeVise = destination ? siege : null
  personnage.quandArrive = destination ? quandArrive : null
  if (destination) {
    marqueur.montrer(destination)
    apresUnDeplacement()
  }
  return !!destination
}

/** Va jusqu'à un point, sauf si on est déjà tout près. */
function allerSiLoin(point) {
  if (personnage.distanceA(point) > 0.6) marcherVers(new THREE.Vector3(point.x, 0, point.z))
}

entrees.surToucher((x, y) => {
  if (!lieux.actuel || lieux.enTransition) return
  // On convertit la position du doigt (en pixels) en coordonnées de -1 à 1…
  pointEcran.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
  // … puis on lance un « rayon » depuis la caméra pour voir ce qu'il touche.
  lanceRayon.setFromCamera(pointEcran, camera)

  // En train de poser une décoration : toucher le sol déplace l'aperçu.
  if (placement.type) {
    if (lanceRayon.ray.intersectPlane(planDuSol, pointSol)) {
      placement.x = pointSol.x
      placement.z = pointSol.z
      actualiserApercu()
    }
    return
  }

  const cible = objetTouche()
  if (cible?.type === 'deco') {
    // Une décoration posée : la tourner, la déplacer ou la ranger.
    const d = cible.deco
    const info = DECORATIONS[d.type]
    fiche.ouvrir(() => {
      if (!lieux.actuel.decorations || !(etat.d.decorations || []).includes(d)) return null
      return {
        icone: info.icone,
        titre: info.nom,
        lignes: [{ texte: 'Une jolie décoration 🌼', discret: true }],
        actions: [
          { icone: '↻', texte: 'Tourner', faire: () => tournerDecoration(d.n) },
          {
            icone: '✋',
            texte: 'Déplacer',
            faire: () => {
              rangerDecoration(d.n)
              commencerPlacement(d.type)
              placement.x = d.x
              placement.z = d.z
              placement.angle = d.angle || 0
              actualiserApercu()
            },
          },
          { icone: '🎒', texte: 'Ranger dans le sac', faire: () => rangerDecoration(d.n) },
        ],
      }
    })
    return
  }
  if (cible?.type === 'porte') {
    // Un bâtiment ou une sortie : on marche jusqu'à la porte, puis on la passe.
    const porte = cible.porte
    if (personnage.distanceA(porte) < lieux.DISTANCE_PORTE) lieux.passerPorte(porte)
    else marcherVers(new THREE.Vector3(porte.x, 0, porte.z), porte)
    return
  }
  if (cible?.type === 'pnj') {
    // Un villageois : il nous parle ; s'il est loin, on s'approche un peu de lui.
    const pnj = cible.pnj
    const idClient = pnj.donnees.id
    const commande = commandes.commandeDe(idClient)
    const demande = commande && pnj.donnees.demandes ? pnj.donnees.demandes[0] : null
    // Un jour de fête, les villageois en parlent une fois sur deux.
    const fete = !demande && Math.random() < 0.5 ? phraseDeFete() : null
    if (pnj.parlerAvec(personnage, demande || fete)) {
      annoncer('parler', { qui: idClient })
      if (pnj.donnees.marchande) boutique.ouvrir()
      // Un client avec une commande : on affiche ce qu'il demande.
      else if (commande) fiche.ouvrir(ficheCommandes({ bulles, joueur: personnage, idClient }))
      const distance = personnage.distanceA(pnj.position)
      if (distance > 2.2) {
        const vers = new THREE.Vector3().subVectors(personnage.position, pnj.position).setY(0).normalize()
        marcherVers(vers.multiplyScalar(1.4).add(pnj.position))
      } else {
        personnage.arreter()
        personnage.regarderVers(pnj.position.x, pnj.position.z)
      }
      apresUnDeplacement()
    }
    return
  }
  if (cible?.type === 'parcelle') {
    // Une parcelle du potager : la fiche s'ouvre et le personnage s'en approche.
    const lieu = lieux.actuel
    fiche.ouvrir(ficheParcelle(cible.n, { bulles, objet: cible.objet, actualiser: () => lieu.potager?.actualiser() }))
    allerSiLoin(cible.approche)
    return
  }
  if (cible?.type === 'animal') {
    const animal = cible.animal
    animal.regarder(personnage.position.x, personnage.position.z)
    const lieuReserve = lieux.actuel.id === 'etable' ? 'de l’étable' : 'près de l’enclos'
    fiche.ouvrir(ficheAnimal(animal, { bulles, joueur: personnage, lieuReserve, renommer: renommerAnimal }))
    // On s'approche jusqu'à environ 1 mètre de l'animal.
    if (personnage.distanceA(animal.position) > 1.8) {
      const vers = new THREE.Vector3().subVectors(personnage.position, animal.position).setY(0).normalize()
      marcherVers(vers.multiplyScalar(1.1).add(animal.position))
    } else {
      personnage.regarderVers(animal.position.x, animal.position.z)
    }
    return
  }
  if (cible?.type === 'compagnon') {
    const c = cible.compagnon
    fiche.ouvrir(
      ficheCompagnon({
        bulles,
        joueur: personnage,
        compagnon: c,
        renommer: async () => {
          const nom = await demanderTexte({ titre: `✏️ Un nouveau nom pour ${compagnon().nom} ?`, valeur: compagnon().nom, max: 14 })
          if (nom) changerCompagnon('nom', nom)
        },
      })
    )
    if (!personnage.assis) personnage.regarderVers(c.position.x, c.position.z)
    return
  }
  if (cible?.type === 'etang') {
    fiche.ouvrir(descriptionPeche)
    if (!peche.etape) allerPecher()
    return
  }
  if (cible?.type === 'arbre') {
    // Un arbre fruitier : la fiche s'ouvre et on s'en approche.
    const verger = lieux.actuel.verger
    fiche.ouvrir(ficheArbre(cible.arbre, { bulles, joueur: personnage, objet: cible.objet, surSecousse: () => verger?.secouer(cible.arbre.id) }))
    allerSiLoin(cible.approche)
    return
  }
  if (cible?.type === 'cuisine') {
    fiche.ouvrir(ficheCuisine({ bulles, joueur: personnage }))
    allerSiLoin(cible.approche)
    return
  }
  if (cible?.type === 'reserve') {
    fiche.ouvrir(ficheReserve({ bulles, joueur: personnage }))
    allerSiLoin(cible.approche)
    return
  }
  if (cible?.type === 'oeufPaques') {
    // Chasse aux œufs de Pâques : on le ramasse, et le personnage y va.
    const r = trouverOeuf(cible.numero)
    if (r) {
      cible.objet.visible = false
      bulles.flotter(cible.objet, `+${r.pieces} 🪙  🥚 ${r.trouves}/${CACHETTES_OEUFS.length}`, 0.6)
      if (r.trouves === CACHETTES_OEUFS.length) bulles.dire(personnage.modele, 'Tous les œufs sont trouvés ! 🐣🎉')
    }
    marcherVers(new THREE.Vector3(cible.objet.position.x, 0, cible.objet.position.z + 0.6))
    return
  }
  if (cible?.type === 'siege') {
    // Un banc, une chaise… : on y va, puis on s'assoit.
    const siege = cible.siege
    if (personnage.assis === siege) return // déjà assis ici
    fiche.fermer()
    if (personnage.assis) personnage.seLever()
    if (personnage.distanceA(siege.devant) < 0.6) sAsseoir(siege)
    else marcherVers(new THREE.Vector3(siege.devant.x, 0, siege.devant.z), null, siege)
    return
  }
  if (cible?.type === 'tableau') {
    fiche.ouvrir(ficheCommandes({ bulles, joueur: personnage }))
    allerSiLoin(cible.approche)
    return
  }
  if (cible?.type === 'boutique') {
    // Le comptoir : Lila dit bonjour et la boutique s'ouvre.
    const lila = lieux.actuel.pnj.find((p) => p.donnees.marchande)
    if (lila) lila.parlerAvec(personnage)
    boutique.ouvrir()
    return
  }
  if (cible?.type === 'info') {
    // Un bâtiment fermé : le personnage dit ce que c'est, et s'en approche.
    bulles.dire(personnage.modele, cible.texte)
    marcherVers(new THREE.Vector3(cible.x, 0, cible.z))
    return
  }

  // Sinon : le sol. On y va (et on referme la fiche s'il y en a une).
  fiche.fermer()
  if (lanceRayon.ray.intersectPlane(planDuSol, pointSol) && marcherVers(pointSol)) jouer('toucher')
})

// 6) Adapter l'affichage quand l'écran change de taille (ou que le téléphone pivote).
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  adapterTaille(window.innerWidth, window.innerHeight)
})

let horlogeSoins = 0 // compte le temps pour les soins des animaux (voir plus bas)

/**
 * Le calendrier (une fois par seconde, et après un changement de date en mode test) :
 *  - à minuit, de nouvelles quêtes arrivent ;
 *  - quand une fête commence ou finit, la ferme change de décor ;
 *  - le premier jour d'une fête, une petite fenêtre l'annonce (une seule fois).
 */
let feteAffichee = 'pas encore regardé' // l'identifiant de la fête affichée ('' = aucune)
let jourAffiche = null
function verifierCalendrier() {
  quetes.verifierJour()
  const fete = feteDuJour()
  const cle = cleDuJour()
  const idFete = fete ? fete.id : ''
  // On redessine les décorations quand la fête change, et chaque nouveau jour de fête
  // (les œufs de Pâques se recachent tous les matins).
  if (idFete !== feteAffichee || (fete && jourAffiche !== cle)) {
    feteAffichee = idFete
    jourAffiche = cle
    lieux.lieuConstruit('exterieur')?.appliquerFete(fete)
    interfaceJeu.montrerFete(fete)
    interfaceJeu.montrerLieu(lieux.actuel.titre)
  }
  // Annonce de la fête, une fois par jour.
  if (fete && etat.d.feteAnnoncee !== `${cle}:${fete.id}`) {
    etat.d.feteAnnoncee = `${cle}:${fete.id}`
    etat.signaler()
    jouer('fete')
    fenetreFete.ouvrir(`<h2>${fete.icone} ${echapper(fete.nom)}</h2><p>${echapper(fete.message)}</p>
      ${fete.quete ? '<p class="discret">📜 Une quête spéciale t’attend aujourd’hui !</p>' : ''}`)
  }
}

// Quand une quête est terminée, le personnage le dit (et le bouton 📜 affiche un nombre).
quetes.surQueteTerminee(() => {
  jouer('quete')
  bulles.dire(personnage.modele, 'Quête terminée ! 📜 Touche « Quêtes » pour recevoir la récompense.')
  panneauQuetes.actualiser()
})

/**
 * Une fois par seconde : de nouvelles commandes arrivent quand c'est le moment,
 * et une icône 📋 flotte au-dessus des villageois qui ont une commande pour nous.
 */
function suivreCommandes() {
  const nouveaux = commandes.mettreAJour()
  for (const pnj of lieux.actuel.pnj) {
    const id = pnj.donnees.id
    pastilles.definir(pnj.modele, commandes.commandeDe(id) ? '📋' : null, pnj.hauteurBulle + 0.45)
    // Un villageois tout juste arrivé avec une commande le dit (s'il est visible).
    if (nouveaux.includes(id) && pnj.present && pnj.donnees.demandes) {
      pnj.dire(pnj.donnees.demandes[Math.floor(Math.random() * pnj.donnees.demandes.length)])
    }
  }
}

let joystickAffiche = null

// --- Sons : chaque action du joueur a son petit son doux ---
const SON_DE_L_ACTION = {
  planter: 'planter', arroser: 'arroser', recolter: 'recolter', ramasser: 'ramasser',
  nourrir: 'nourrir', caresser: 'caresser', livrer: 'pieces', vendre: 'pieces', oeuf: 'oeuf',
  cueillir: 'cueillir', cuisiner: 'cuisiner', pecher: 'recolter',
}
ecouterActions((type) => SON_DE_L_ACTION[type] && jouer(SON_DE_L_ACTION[type]))
// Une nouvelle découverte pour le carnet : le personnage le dit (un peu après le « +1 »).
ecouterActions((type, details) => {
  if (type !== 'decouverte') return
  const o = infosObjet(details.id)
  setTimeout(() => bulles.dire(personnage.modele, `Nouveau dans mon carnet 📖 ${o.icone} ${o.nom} !`), 1500)
})
surNouveauNiveau(() => setTimeout(() => jouer('niveau'), 1200))
// Un petit « tic » pour les boutons de l'interface (ceux de la fiche ont déjà leur son).
document.addEventListener('click', (e) => {
  if (e.target.closest('button') && !e.target.closest('.fiche [data-n]')) jouer('bouton')
})

// --- Réglages : qualité de l'image, joystick ---
const NOMS_DES_LIEUX = ['exterieur', 'maison', 'etable', 'boutique']
function appliquerReglagesImage() {
  const autres = NOMS_DES_LIEUX.map((id) => lieux.lieuConstruit(id)?.groupe).filter(Boolean)
  appliquerQualite({ ombres: reglages.get('ombres'), economie: reglages.get('economie') }, autres)
}
appliquerReglagesImage()
reglages.ecouter((nom) => {
  if (nom === 'ombres' || nom === 'economie') appliquerReglagesImage()
  if (nom === 'cycleJour') appliquerCiel()
})
demarrerMusique()

/** Note où se trouve le personnage dans la partie (avant une sauvegarde ou un export). */
function noterPosition(d) {
  if (!lieux.actuel) return
  // Assis : on note l'endroit juste devant le siège (on y réapparaîtra debout).
  const p = personnage.assis ? personnage.assis.devant : personnage.position
  d.joueur = { lieu: lieux.actuel.id, x: p.x, z: p.z }
}
creerReglages({ barre: interfaceJeu.barre, ouvrirAPropos: () => interfaceJeu.ouvrirAPropos(), avantExport: noterPosition })

/**
 * Si le jeu tourne lentement (moins de 24 images par seconde en moyenne pendant
 * les premières secondes), on propose gentiment le mode économie. Une seule fois.
 */
let mesure = { temps: 0, images: 0, fini: false }
function surveillerFluidite(dt) {
  if (mesure.fini) return
  mesure.temps += dt
  if (mesure.temps < 4) return // on laisse le jeu démarrer tranquillement
  mesure.images++
  if (mesure.temps < 14) return
  mesure.fini = true
  const parSeconde = mesure.images / (mesure.temps - 4)
  let dejaPropose = false
  try {
    dejaPropose = !!localStorage.getItem('jeu-de-ferme:economie-proposee')
    if (parSeconde < 24 && !reglages.get('economie') && !dejaPropose) {
      localStorage.setItem('jeu-de-ferme:economie-proposee', '1')
      bulles.dire(personnage.modele, 'Le jeu semble un peu lent sur cet appareil : essaie le « Mode économie » dans ⚙️ Réglages.')
    }
  } catch {
    /* pas grave */
  }
  window.__jeu.imagesParSeconde = Math.round(parSeconde)
}

// 7) La boucle de jeu : mise à jour puis dessin, à chaque image.
const image = demarrerBoucle((dt) => {
  if (!lieux.actuel) return
  // Le joystick (s'il est activé) est caché quand la fiche du bas est ouverte.
  const joystickVisible = reglages.get('joystick') && !fiche.ouverte
  if (joystickVisible !== joystickAffiche) {
    joystickAffiche = joystickVisible
    joystick.afficher(joystickVisible)
  }
  let dir = placement.type ? { x: 0, z: 0 } : entrees.directionClavier()
  if (dir.x === 0 && dir.z === 0 && joystickVisible) dir = joystick.direction()
  if ((dir.x !== 0 || dir.z !== 0) && !lieux.enTransition) {
    personnage.deplacerDirection(dir.x, dir.z, dt)
    marqueur.cacher()
    apresUnDeplacement()
    lieux.verifierPortesClavier(dir)
  }
  // La fiche « Poser » a été fermée : on abandonne le placement (la décoration reste dans le sac).
  if (placement.type && !fiche.ouverte) finirPlacement()
  personnage.miseAJour(dt)
  peche.miseAJour(dt, personnage)
  animalCompagnon?.miseAJour(dt, personnage)
  lieux.miseAJour(dt)
  marqueur.miseAJour(dt)
  zoomer(fenetrePerso.ouverte ? 0.42 : 1) // la caméra s'approche pour bien voir le personnage
  suivre(limiterCamera(personnage.position), dt)
  suivreSoleil(personnage.position)
  renderer.render(scene, camera)
  bulles.miseAJour(camera)
  pastilles.miseAJour(camera)
  surveillerFluidite(dt)
  // Une fois par seconde : les animaux vivent (faim, bonheur, production), même hors de vue.
  horlogeSoins += dt
  if (horlogeSoins >= 1) {
    horlogeSoins = 0
    avancerTous()
    suivreCommandes()
    verifierCalendrier()
    appliquerCiel()
  }
})

// 8) On ouvre le lieu où l'on s'était arrêté (ou la ferme), puis on retire l'écran de chargement.
const ou = etat.d.joueur
lieux
  .demarrer(ou ? ou.lieu : 'exterieur', ou ? { x: ou.x, z: ou.z, angle: 0 } : 'depart')
  .then(() => {
    actualiserCompagnon()
    renderer.setAnimationLoop(image)
    interfaceJeu.finChargement()
    if (partie.message) bulles.dire(personnage.modele, partie.message)
    // Nouvelle partie : on commence par choisir son prénom et son allure.
    // (window.__sansAccueil : seulement pour les tests automatiques.)
    if (!etat.d.perso.choisi && !window.__sansAccueil) setTimeout(() => fenetrePerso.ouvrir({ accueil: true }), 600)
    // La sauvegarde automatique note aussi où se trouve le personnage.
    demarrerSauvegardeAuto(
      noterPosition,
      () => bulles.dire(personnage.modele, 'Oups, la partie n’a pas pu être sauvegardée. La mémoire du téléphone est peut-être pleine.')
    )
    etat.signaler() // première sauvegarde rapide
    verifierCalendrier()
  })
  .catch((erreur) => {
    console.error(erreur)
    const texte = document.querySelector('#chargement .chargement-texte')
    if (texte) texte.textContent = 'Oups, le jeu n’a pas pu démarrer. Ferme-le et rouvre-le.'
  })
// Hors ligne et mises à jour : quand une nouvelle version est prête, le bouton
// « Mettre à jour » apparaît en haut. On sauvegarde la partie juste avant de relancer le jeu.
activerModeHorsLigne({
  surMiseAJour: (appliquer) =>
    interfaceJeu.proposerMiseAJour(() => {
      enregistrer(noterPosition)
      appliquer()
    }),
})

// Accès pratique pour les tests automatiques (sans effet sur le jeu).
window.__jeu = {
  personnage, lieux, camera, bulles, etat, fiche, boutique, verifierCalendrier, renderer, reglages, fenetrePerso, ciel, appliquerCiel,
  get compagnon() {
    return animalCompagnon
  },
  /** Ce qui se trouve sous un point de l'écran (pour les tests). */
  quoiSous(x, y) {
    pointEcran.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
    lanceRayon.setFromCamera(pointEcran, camera)
    return objetTouche()?.type || 'sol'
  },
}
