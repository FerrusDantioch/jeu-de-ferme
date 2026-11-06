/**
 * main.js — le point de départ du jeu. C'est ici que tout est assemblé :
 * la 3D, le terrain, le personnage, la caméra, les commandes et l'interface.
 */
import * as THREE from 'three'
import './ui/style.css'
import { MONDE } from './config.js'
import { creerRendu } from './moteur/rendu.js'
import { creerCamera } from './moteur/camera.js'
import { creerEntrees } from './moteur/entrees.js'
import { demarrerBoucle } from './moteur/boucle.js'
import { GrilleChemin } from './moteur/chemin.js'
import { creerTerrain } from './monde/terrain.js'
import { creerMarqueur } from './monde/marqueur.js'
import { Personnage } from './entites/personnage.js'
import { creerInterface } from './ui/interface.js'
import { activerModeHorsLigne } from './pwa.js'

// 1) Le dessinateur 3D, la scène et la caméra.
const conteneur = document.getElementById('scene3d')
const { renderer, scene, suivreSoleil } = creerRendu(conteneur)
const { camera, placerSur, suivre, adapterTaille } = creerCamera()
adapterTaille(window.innerWidth, window.innerHeight)

// 2) La grille invisible pour trouver les chemins, puis le terrain (qui y déclare ses obstacles).
const grille = new GrilleChemin(MONDE.taille, MONDE.tailleCase)
creerTerrain(scene, grille)

// 3) Le personnage, placé au milieu de la ferme.
const personnage = new Personnage(scene, grille)
personnage.placer(0, 2)
placerSur(personnage.position)

// 4) Le marqueur de destination et l'interface.
const marqueur = creerMarqueur(scene)
const interfaceJeu = creerInterface()
personnage.surArrivee = () => marqueur.cacher()

// 5) Les commandes : toucher le sol pour y aller.
const entrees = creerEntrees(renderer.domElement)
const lanceRayon = new THREE.Raycaster()
const planDuSol = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // le sol est à la hauteur 0
const pointEcran = new THREE.Vector2()
const pointSol = new THREE.Vector3()

entrees.surToucher((x, y) => {
  // On convertit la position du doigt (en pixels) en coordonnées de -1 à 1…
  pointEcran.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
  // … puis on lance un « rayon » depuis la caméra et on regarde où il touche le sol.
  lanceRayon.setFromCamera(pointEcran, camera)
  if (!lanceRayon.ray.intersectPlane(planDuSol, pointSol)) return
  const destination = personnage.allerVers(pointSol)
  if (destination) {
    marqueur.montrer(destination)
    interfaceJeu.cacherAide()
  }
})

// 6) Adapter l'affichage quand l'écran change de taille (ou que le téléphone pivote).
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  adapterTaille(window.innerWidth, window.innerHeight)
})

// 7) La boucle de jeu : mise à jour puis dessin, à chaque image.
const image = demarrerBoucle((dt) => {
  const dir = entrees.directionClavier()
  if (dir.x !== 0 || dir.z !== 0) {
    personnage.deplacerDirection(dir.x, dir.z, dt)
    marqueur.cacher()
    interfaceJeu.cacherAide()
  }
  personnage.miseAJour(dt)
  marqueur.miseAJour(dt)
  suivre(personnage.position, dt)
  suivreSoleil(personnage.position)
  renderer.render(scene, camera)
})
renderer.setAnimationLoop(image)

// 8) Tout est prêt : on retire l'écran de chargement et on active le mode hors ligne.
interfaceJeu.finChargement()
activerModeHorsLigne()

// Accès pratique pour les tests automatiques (sans effet sur le jeu).
window.__jeu = { personnage, grille, camera }
