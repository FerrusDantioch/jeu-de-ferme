/**
 * verger.js (monde) — les arbres fruitiers dehors : on voit les fruits mûrs sur l'arbre,
 * et on le touche pour le secouer (voir src/jeu/verger.js pour les règles).
 *
 * Le feuillage suit les saisons comme les autres arbres (il partage leurs « peintures »).
 */
import * as THREE from 'three'
import { materiau, PALETTE } from '../modeles/materiaux.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { ARBRES_FRUITIERS, FRUITS, FRUITS_MAXIMUM } from '../donnees/vergers.js'
import { observerArbre } from '../jeu/verger.js'

const geoTronc = new THREE.CylinderGeometry(0.16, 0.22, 1.1, 6).translate(0, 0.55, 0)
const geoFeuillage = new THREE.IcosahedronGeometry(1.0, 1).scale(1, 0.85, 1).translate(0, 1.75, 0)
const geoHaut = new THREE.IcosahedronGeometry(0.55, 0).translate(0.2, 2.35, 0.15)
const geoFruit = new THREE.IcosahedronGeometry(0.11, 0)

// Où pendent les fruits (à la surface du feuillage, côté visible) : 2 par fruit.
const PLACES = []
for (let k = 0; k < FRUITS_MAXIMUM * 2; k++) {
  const angle = -Math.PI * 0.55 + (k / (FRUITS_MAXIMUM * 2 - 1)) * Math.PI * 1.1 + (k % 2) * 0.25
  const hauteur = 1.45 + ((k * 37) % 5) * 0.12
  PLACES.push(new THREE.Vector3(Math.sin(angle) * 0.92, hauteur, Math.cos(angle) * 0.92))
}

/**
 * @param {object} o { groupe, grille, touchables, feuillage, haut } (peintures des feuillages : saisons)
 * @returns {{ actualiser, secouer(id), arbres }}
 */
export function creerVerger({ groupe, grille, touchables, feuillage, haut }) {
  const arbres = ARBRES_FRUITIERS.map((a) => {
    const g = new THREE.Group()
    g.position.set(a.x, 0, a.z)
    const tronc = new THREE.Mesh(geoTronc, materiau(PALETTE.tronc))
    const feuilles = new THREE.Mesh(geoFeuillage, feuillage)
    const dessus = new THREE.Mesh(geoHaut, haut)
    for (const m of [tronc, feuilles, dessus]) {
      m.castShadow = true
      m.receiveShadow = true
    }
    // Le haut de l'arbre (feuillage + fruits) peut se balancer quand on le secoue.
    const couronne = new THREE.Group()
    couronne.add(feuilles, dessus)
    const fruits = new THREE.InstancedMesh(geoFruit, materiau(FRUITS[a.fruit].couleur), PLACES.length)
    const m = new THREE.Matrix4()
    PLACES.forEach((p, k) => fruits.setMatrixAt(k, m.makeTranslation(p.x, p.y, p.z)))
    fruits.count = 0
    fruits.castShadow = true
    couronne.add(fruits)
    g.add(tronc, couronne)
    groupe.add(g)
    grille.bloquerCercle(a.x, a.z, 0.3, 0.35)

    // Zone invisible à toucher (tout l'arbre).
    const zone = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 8), MATERIAU_INVISIBLE)
    zone.position.set(a.x, 1.5, a.z)
    zone.userData.toucher = { type: 'arbre', arbre: a, approche: { x: a.x, z: a.z + 1.3 }, objet: g }
    groupe.add(zone)
    touchables.push(zone)
    return { donnees: a, groupe: g, couronne, fruits, secousse: 0 }
  })

  /** Montre le bon nombre de fruits sur chaque arbre. */
  function actualiser() {
    for (const a of arbres) a.fruits.count = observerArbre(a.donnees).fruits * 2
  }
  actualiser()

  return {
    arbres,
    actualiser,
    /** L'arbre se balance un instant (on vient de le secouer). */
    secouer(id) {
      const a = arbres.find((x) => x.donnees.id === id)
      if (a) a.secousse = 1
      actualiser()
    },
    /** À chaque image : les arbres secoués se balancent puis se calment. */
    miseAJour(dt) {
      for (const a of arbres) {
        if (a.secousse <= 0) continue
        a.secousse = Math.max(0, a.secousse - dt * 1.4)
        a.couronne.rotation.z = Math.sin(a.secousse * 30) * 0.08 * a.secousse
      }
    },
  }
}
