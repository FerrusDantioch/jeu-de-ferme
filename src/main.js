/**
 * main.js — le point de départ du jeu. C'est ici que tout est assemblé :
 * la 3D, les lieux (dehors, maison, étable, boutique), le personnage, la caméra,
 * les commandes, l'interface et la sauvegarde.
 */
import * as THREE from 'three'
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
import { chargerPartie, demarrerSauvegardeAuto } from './jeu/sauvegarde.js'
import { avancerTous } from './jeu/elevage.js'
import { ficheParcelle, ficheAnimal, ficheReserve } from './jeu/fiches.js'
import { activerModeHorsLigne } from './pwa.js'

// 0) On reprend la partie enregistrée sur le téléphone (ou on en commence une nouvelle).
const partie = chargerPartie()
etat.remplacer(partie.donnees)
const nouvellePartie = !etat.d.joueur
avancerTous() // les animaux ont vécu pendant que le jeu était fermé

// 1) Le dessinateur 3D, la scène et la caméra.
const conteneur = document.getElementById('scene3d')
const { renderer, scene, suivreSoleil, changerAmbiance } = creerRendu(conteneur)
const { camera, placerSur, suivre, adapterTaille } = creerCamera()
adapterTaille(window.innerWidth, window.innerHeight)

// 2) L'interface : boutons, bulles de paroles, fondu entre les lieux,
//    fiche du bas (potager, animaux), petites icônes, sac.
const interfaceJeu = creerInterface({ aideAuDemarrage: nouvellePartie })
const bulles = creerBulles()
const fondu = creerFondu()
const pastilles = creerPastilles()
const fiche = creerFiche({ surOuverture: () => interfaceJeu.cacherAide() })
creerSac(interfaceJeu.barre)

// 3) Le personnage (sa grille d'obstacles sera celle du lieu où il se trouve)
//    et le petit cercle qui montre où il va.
const personnage = new Personnage(scene, new GrilleChemin(2, 0.5))
const marqueur = creerMarqueur(scene)

// La caméra suit le personnage, mais sans sortir des limites du lieu (s'il y en a).
const cibleCamera = new THREE.Vector3()
function limiterCamera(position) {
  cibleCamera.copy(position)
  const limites = lieux.actuel?.limitesCamera
  if (limites) {
    cibleCamera.x = Math.min(Math.max(cibleCamera.x, -limites.x), limites.x)
    cibleCamera.z = Math.min(Math.max(cibleCamera.z, -limites.z), limites.z)
  }
  // Quand la fiche du bas est ouverte, on décale la vue pour que le personnage
  // reste visible au-dessus d'elle (la caméra glisse doucement).
  if (fiche.ouverte) cibleCamera.z += window.innerHeight > window.innerWidth ? 2.6 : 1.6
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
  outils: { bulles, pastilles },
  surChangement(lieu) {
    interfaceJeu.montrerLieu(lieu.titre)
    fiche.fermer()
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
  personnage.porteVisee = null
  if (porte && personnage.distanceA(porte) < lieux.DISTANCE_PORTE) lieux.passerPorte(porte)
}

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
  const touches = lanceRayon.intersectObjects(lieux.actuel.touchables, true)
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
  const vivant = (t) => t.toucher.type === 'animal' || t.toucher.type === 'pnj'
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
function marcherVers(point, porte = null) {
  const destination = personnage.allerVers(point)
  personnage.porteVisee = destination ? porte : null
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

  const cible = objetTouche()
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
    if (pnj.parlerAvec(personnage)) {
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
    fiche.ouvrir(ficheAnimal(animal, { bulles, joueur: personnage, lieuReserve }))
    // On s'approche jusqu'à environ 1 mètre de l'animal.
    if (personnage.distanceA(animal.position) > 1.8) {
      const vers = new THREE.Vector3().subVectors(personnage.position, animal.position).setY(0).normalize()
      marcherVers(vers.multiplyScalar(1.1).add(animal.position))
    } else {
      personnage.regarderVers(animal.position.x, animal.position.z)
    }
    return
  }
  if (cible?.type === 'reserve') {
    fiche.ouvrir(ficheReserve({ bulles, joueur: personnage }))
    allerSiLoin(cible.approche)
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
  if (lanceRayon.ray.intersectPlane(planDuSol, pointSol)) marcherVers(pointSol)
})

// 6) Adapter l'affichage quand l'écran change de taille (ou que le téléphone pivote).
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  adapterTaille(window.innerWidth, window.innerHeight)
})

let horlogeSoins = 0 // compte le temps pour les soins des animaux (voir plus bas)

// 7) La boucle de jeu : mise à jour puis dessin, à chaque image.
const image = demarrerBoucle((dt) => {
  if (!lieux.actuel) return
  const dir = entrees.directionClavier()
  if ((dir.x !== 0 || dir.z !== 0) && !lieux.enTransition) {
    personnage.deplacerDirection(dir.x, dir.z, dt)
    marqueur.cacher()
    apresUnDeplacement()
    lieux.verifierPortesClavier(dir)
  }
  personnage.miseAJour(dt)
  lieux.miseAJour(dt)
  marqueur.miseAJour(dt)
  suivre(limiterCamera(personnage.position), dt)
  suivreSoleil(personnage.position)
  renderer.render(scene, camera)
  bulles.miseAJour(camera)
  pastilles.miseAJour(camera)
  // Une fois par seconde : les animaux vivent (faim, bonheur, production), même hors de vue.
  horlogeSoins += dt
  if (horlogeSoins >= 1) {
    horlogeSoins = 0
    avancerTous()
  }
})

// 8) On ouvre le lieu où l'on s'était arrêté (ou la ferme), puis on retire l'écran de chargement.
const ou = etat.d.joueur
lieux
  .demarrer(ou ? ou.lieu : 'exterieur', ou ? { x: ou.x, z: ou.z, angle: 0 } : 'depart')
  .then(() => {
    renderer.setAnimationLoop(image)
    interfaceJeu.finChargement()
    if (partie.message) bulles.dire(personnage.modele, partie.message)
    // La sauvegarde automatique note aussi où se trouve le personnage.
    demarrerSauvegardeAuto(
      (d) => {
        if (lieux.actuel) d.joueur = { lieu: lieux.actuel.id, x: personnage.position.x, z: personnage.position.z }
      },
      () => bulles.dire(personnage.modele, 'Oups, la partie n’a pas pu être sauvegardée. La mémoire du téléphone est peut-être pleine.')
    )
    etat.signaler() // première sauvegarde rapide
  })
  .catch((erreur) => {
    console.error(erreur)
    const texte = document.querySelector('#chargement .chargement-texte')
    if (texte) texte.textContent = 'Oups, le jeu n’a pas pu démarrer. Fermez-le et rouvrez-le.'
  })
activerModeHorsLigne()

// Accès pratique pour les tests automatiques (sans effet sur le jeu).
window.__jeu = { personnage, lieux, camera, bulles, etat, fiche }
