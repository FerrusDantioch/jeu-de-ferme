/**
 * rendu.js — prépare le « dessinateur » 3D (le renderer) et la scène.
 *
 * Vocabulaire :
 *  - scène : la boîte qui contient tous les objets 3D du monde.
 *  - renderer (dessinateur) : il transforme la scène en image à l'écran,
 *    plusieurs dizaines de fois par seconde.
 *  - lumières : sans lumière, tout serait noir.
 */
import * as THREE from 'three'
import { PERFORMANCE, COULEUR_FOND } from '../config.js'

export function creerRendu(conteneur) {
  // Le dessinateur. « antialias » adoucit les bords en escalier.
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })

  // On plafonne la densité de pixels pour rester fluide sur téléphone.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, PERFORMANCE.plafondDensitePixels))
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Ombres simples et légèrement adoucies : bon compromis beauté / rapidité.
  renderer.shadowMap.enabled = PERFORMANCE.ombres
  renderer.shadowMap.type = THREE.PCFShadowMap

  conteneur.appendChild(renderer.domElement)

  // La scène, avec un ciel bleu pâle et un léger brouillard au loin (ambiance douce).
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(COULEUR_FOND)
  scene.fog = new THREE.Fog(COULEUR_FOND, 30, 70)

  // Lumière « ciel / sol » : éclaire doucement tout, bleuté par le haut, vert par le bas.
  const lumiereAmbiante = new THREE.HemisphereLight(0xfffbf0, 0x8fbf7a, 1.6)
  scene.add(lumiereAmbiante)

  // Le « soleil » : une lumière directionnelle qui crée les ombres.
  const soleil = new THREE.DirectionalLight(0xfff1d6, 2.0)
  soleil.position.set(12, 20, 8)
  soleil.castShadow = PERFORMANCE.ombres
  soleil.shadow.mapSize.set(PERFORMANCE.tailleCarteOmbres, PERFORMANCE.tailleCarteOmbres)
  // Zone couverte par les ombres (autour du personnage, voir suivreSoleil).
  const s = 14
  soleil.shadow.camera.left = -s
  soleil.shadow.camera.right = s
  soleil.shadow.camera.top = s
  soleil.shadow.camera.bottom = -s
  soleil.shadow.camera.near = 1
  soleil.shadow.camera.far = 60
  soleil.shadow.bias = -0.0005
  scene.add(soleil)
  scene.add(soleil.target)

  /**
   * Le soleil « suit » le personnage pour que les ombres restent nettes
   * autour de lui sans devoir couvrir tout le terrain (plus économique).
   */
  const decalageSoleil = soleil.position.clone()
  function suivreSoleil(position) {
    soleil.position.copy(position).add(decalageSoleil)
    soleil.target.position.copy(position)
  }

  /**
   * Change l'ambiance quand on change de lieu (dehors : ciel bleu ; dedans : lumière chaude).
   * @param {object} a { fond, brouillard: [proche, loin] ou null, ciel, sol, intensite }
   */
  function changerAmbiance(a) {
    scene.background.set(a.fond)
    scene.fog = a.brouillard ? new THREE.Fog(a.fond, a.brouillard[0], a.brouillard[1]) : null
    lumiereAmbiante.color.set(a.ciel)
    lumiereAmbiante.groundColor.set(a.sol)
    lumiereAmbiante.intensity = a.intensite
    // La couleur de la page derrière le jeu suit le fond (visible lors des rotations d'écran).
    document.body.style.background = '#' + scene.background.getHexString()
  }

  /**
   * Qualité de l'image (réglages) :
   *  - ombres : avec ou sans ombres ;
   *  - economie : moins de pixels à dessiner (plus fluide, moins de batterie).
   * @param {THREE.Object3D[]} autres  d'autres groupes à prévenir (lieux construits mais pas affichés)
   */
  function appliquerQualite({ ombres, economie }, autres = []) {
    const ratio = economie ? 1 : Math.min(window.devicePixelRatio || 1, PERFORMANCE.plafondDensitePixels)
    renderer.setPixelRatio(ratio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    const ombresVoulues = PERFORMANCE.ombres && ombres
    if (renderer.shadowMap.enabled === ombresVoulues) return
    renderer.shadowMap.enabled = ombresVoulues
    soleil.castShadow = ombresVoulues
    // Les « peintures » doivent être recalculées quand on change les ombres.
    for (const racine of [scene, ...autres]) {
      racine.traverse((o) => {
        if (!o.material) return
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) m.needsUpdate = true
      })
    }
  }

  return { renderer, scene, soleil, suivreSoleil, changerAmbiance, appliquerQualite }
}
