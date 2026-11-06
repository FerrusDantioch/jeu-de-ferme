/**
 * terrain.js — fabrique le sol de la ferme et quelques décors de test
 * (arbres, rochers, clôture) qui servent aussi d'obstacles.
 *
 * Les décors répétés (arbres, rochers, piquets) sont dessinés « en instances » :
 * on envoie la forme UNE seule fois à la carte graphique, avec la liste des positions.
 * C'est beaucoup plus rapide que de dessiner chaque arbre séparément.
 */
import * as THREE from 'three'
import { materiau, PALETTE } from '../modeles/materiaux.js'
import { MONDE } from '../config.js'

// Aléatoire « reproductible » : le même décor à chaque lancement.
function generateurAleatoire(graine) {
  let s = graine
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Construit le terrain et déclare les obstacles dans la grille de chemin.
 * @returns {THREE.Mesh} le sol (utile pour savoir où le joueur touche)
 */
export function creerTerrain(scene, grille) {
  const taille = MONDE.taille
  const demi = taille / 2

  // --- Le sol : un grand carré d'herbe légèrement bosselé (aspect low-poly) ---
  const geoSol = new THREE.PlaneGeometry(taille + 40, taille + 40, 30, 30)
  geoSol.rotateX(-Math.PI / 2)
  const alea = generateurAleatoire(7)
  const pos = geoSol.attributes.position
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k)
    const z = pos.getZ(k)
    // On ne bosselle qu'en dehors de la zone jouable (pour que le sol reste plat sous les pieds).
    if (Math.abs(x) > demi + 1 || Math.abs(z) > demi + 1) pos.setY(k, alea() * 0.8)
  }
  geoSol.computeVertexNormals()
  const sol = new THREE.Mesh(geoSol, materiau(PALETTE.herbe))
  sol.receiveShadow = true
  sol.name = 'sol'
  scene.add(sol)

  // --- Un petit chemin de terre (décoratif) ---
  const chemin = new THREE.Mesh(new THREE.PlaneGeometry(2.2, taille * 0.7), materiau(PALETTE.terre))
  chemin.rotation.x = -Math.PI / 2
  chemin.position.set(0, 0.01, 4)
  chemin.receiveShadow = true
  scene.add(chemin)

  // --- Arbres ---
  const arbres = [
    [-8, -6], [-12, 3], [9, -9], [12, 5], [-5, 10], [6, 12], [-14, -13],
    [14, -14], [3, -13], [-10, 14], [15, 0], [-16, -3], [-3, -9], [10, -2],
  ]
  const nbArbres = arbres.length
  const geoTronc = new THREE.CylinderGeometry(0.18, 0.25, 1.2, 6)
  geoTronc.translate(0, 0.6, 0)
  const geoFeuillage = new THREE.IcosahedronGeometry(1.1, 0)
  geoFeuillage.translate(0, 2.0, 0)
  const troncs = new THREE.InstancedMesh(geoTronc, materiau(PALETTE.tronc), nbArbres)
  const feuillages = new THREE.InstancedMesh(geoFeuillage, materiau(PALETTE.feuillage), nbArbres)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const echelle = new THREE.Vector3()
  const axeY = new THREE.Vector3(0, 1, 0)
  arbres.forEach(([x, z], n) => {
    const e = 0.85 + alea() * 0.4
    q.setFromAxisAngle(axeY, alea() * Math.PI * 2)
    echelle.set(e, e, e)
    m.compose(new THREE.Vector3(x, 0, z), q, echelle)
    troncs.setMatrixAt(n, m)
    feuillages.setMatrixAt(n, m)
    // Obstacle : le tronc (avec une marge pour la taille du personnage).
    grille.bloquerCercle(x, z, 0.3 * e, 0.35)
  })
  for (const im of [troncs, feuillages]) {
    im.castShadow = true
    im.receiveShadow = true
    scene.add(im)
  }

  // --- Rochers ---
  const rochers = [
    [-4, -3, 0.6], [5, 3, 0.8], [-9, 7, 0.5], [7, -5, 0.7], [2, 8, 0.4], [-6, 2, 0.9],
  ]
  const geoRocher = new THREE.DodecahedronGeometry(1, 0)
  const instRochers = new THREE.InstancedMesh(geoRocher, materiau(PALETTE.rocher), rochers.length)
  rochers.forEach(([x, z, r], n) => {
    q.setFromAxisAngle(axeY, alea() * Math.PI)
    echelle.set(r, r * 0.65, r)
    m.compose(new THREE.Vector3(x, r * 0.2, z), q, echelle)
    instRochers.setMatrixAt(n, m)
    grille.bloquerCercle(x, z, r * 0.9, 0.3)
  })
  instRochers.castShadow = true
  instRochers.receiveShadow = true
  scene.add(instRochers)

  // --- Clôture tout autour de la zone jouable ---
  const ecart = 2 // un piquet tous les 2 mètres
  const positionsPiquets = []
  for (let t = -demi; t <= demi; t += ecart) {
    positionsPiquets.push([t, -demi], [t, demi])
    if (t !== -demi && t !== demi) positionsPiquets.push([-demi, t], [demi, t])
  }
  const geoPiquet = new THREE.BoxGeometry(0.16, 0.9, 0.16)
  geoPiquet.translate(0, 0.45, 0)
  const piquets = new THREE.InstancedMesh(geoPiquet, materiau(PALETTE.bois), positionsPiquets.length)
  positionsPiquets.forEach(([x, z], n) => {
    m.makeTranslation(x, 0, z)
    piquets.setMatrixAt(n, m)
  })
  piquets.castShadow = true
  scene.add(piquets)

  // Barres horizontales de la clôture (4 côtés × 2 hauteurs).
  const matBois = materiau(PALETTE.bois)
  for (const h of [0.35, 0.7]) {
    for (const [x, z, rot] of [[0, -demi, 0], [0, demi, 0], [-demi, 0, Math.PI / 2], [demi, 0, Math.PI / 2]]) {
      const barre = new THREE.Mesh(new THREE.BoxGeometry(taille, 0.08, 0.06), matBois)
      barre.position.set(x, h, z)
      barre.rotation.y = rot
      barre.castShadow = true
      scene.add(barre)
    }
  }

  // La clôture est un obstacle : on bloque une bande le long de chaque bord.
  const bord = 0.6
  grille.bloquerRectangle(0, -demi, taille, bord * 2)
  grille.bloquerRectangle(0, demi, taille, bord * 2)
  grille.bloquerRectangle(-demi, 0, bord * 2, taille)
  grille.bloquerRectangle(demi, 0, bord * 2, taille)

  // --- Quelques touffes d'herbe et fleurs (pur décor, pas d'obstacle) ---
  const nbTouffes = 60
  const geoTouffe = new THREE.ConeGeometry(0.12, 0.35, 4)
  geoTouffe.translate(0, 0.17, 0)
  const touffes = new THREE.InstancedMesh(geoTouffe, materiau(PALETTE.herbeFoncee), nbTouffes)
  for (let n = 0; n < nbTouffes; n++) {
    const x = (alea() - 0.5) * (taille - 2)
    const z = (alea() - 0.5) * (taille - 2)
    const e = 0.7 + alea() * 0.6
    q.setFromAxisAngle(axeY, alea() * Math.PI)
    echelle.set(e, e, e)
    m.compose(new THREE.Vector3(x, 0, z), q, echelle)
    touffes.setMatrixAt(n, m)
  }
  scene.add(touffes)

  return sol
}
