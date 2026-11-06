/**
 * terrain.js — fabrique le sol de la ferme et les décors naturels
 * (chemins, arbres, rochers, clôture, herbe, fleurs), d'après le plan
 * décrit dans src/donnees/ferme.js.
 *
 * Les décors répétés (arbres, rochers, piquets, fleurs) sont dessinés « en instances » :
 * on envoie la forme UNE seule fois à la carte graphique, avec la liste des positions.
 * C'est beaucoup plus rapide que de dessiner chaque arbre séparément.
 */
import * as THREE from 'three'
import { materiau, PALETTE } from '../modeles/materiaux.js'
import { MONDE } from '../config.js'
import { ARBRES, ROCHERS, CHEMINS, NOMBRE_DE_FLEURS } from '../donnees/ferme.js'

// Aléatoire « reproductible » : le même décor à chaque lancement.
function generateurAleatoire(graine) {
  let s = graine
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const m = new THREE.Matrix4()
const q = new THREE.Quaternion()
const echelle = new THREE.Vector3()
const position = new THREE.Vector3()
const axeY = new THREE.Vector3(0, 1, 0)

/** Vrai si le point (x, z) est sur un chemin de terre. */
export function surUnChemin(x, z, marge = 0) {
  return CHEMINS.some(
    ([cx, cz, l, p]) => Math.abs(x - cx) < l / 2 + marge && Math.abs(z - cz) < p / 2 + marge
  )
}

/**
 * Construit le terrain et déclare les obstacles dans la grille de chemin.
 * @param {THREE.Group} groupe  où ajouter les objets
 */
export function creerTerrain(groupe, grille) {
  const taille = MONDE.taille
  const demi = taille / 2
  const alea = generateurAleatoire(7)

  // --- Le sol : un grand carré d'herbe légèrement bosselé (aspect low-poly) ---
  const geoSol = new THREE.PlaneGeometry(taille + 40, taille + 40, 30, 30)
  geoSol.rotateX(-Math.PI / 2)
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
  groupe.add(sol)

  // --- Les chemins de terre (décoratifs : on peut marcher partout) ---
  CHEMINS.forEach(([x, z, l, p], n) => {
    const chemin = new THREE.Mesh(new THREE.PlaneGeometry(l, p), materiau(PALETTE.terre))
    chemin.rotation.x = -Math.PI / 2
    // Chaque chemin un tout petit peu plus haut que le précédent : évite le scintillement aux croisements.
    chemin.position.set(x, 0.01 + n * 0.002, z)
    chemin.receiveShadow = true
    groupe.add(chemin)
  })

  // --- Arbres ---
  const geoTronc = new THREE.CylinderGeometry(0.18, 0.25, 1.2, 6).translate(0, 0.6, 0)
  const geoFeuillage = new THREE.IcosahedronGeometry(1.1, 0).translate(0, 2.0, 0)
  const geoFeuillageHaut = new THREE.IcosahedronGeometry(0.75, 0).translate(0.15, 2.8, 0.1)
  const troncs = new THREE.InstancedMesh(geoTronc, materiau(PALETTE.tronc), ARBRES.length)
  const feuillages = new THREE.InstancedMesh(geoFeuillage, materiau(PALETTE.feuillage), ARBRES.length)
  const hauts = new THREE.InstancedMesh(geoFeuillageHaut, materiau(PALETTE.feuillageClair), ARBRES.length)
  ARBRES.forEach(([x, z], n) => {
    const e = 0.85 + alea() * 0.4
    q.setFromAxisAngle(axeY, alea() * Math.PI * 2)
    echelle.set(e, e, e)
    m.compose(position.set(x, 0, z), q, echelle)
    troncs.setMatrixAt(n, m)
    feuillages.setMatrixAt(n, m)
    hauts.setMatrixAt(n, m)
    // Obstacle : le tronc (avec une marge pour la taille du personnage).
    grille.bloquerCercle(x, z, 0.3 * e, 0.35)
  })
  for (const im of [troncs, feuillages, hauts]) {
    im.castShadow = true
    im.receiveShadow = true
    groupe.add(im)
  }

  // --- Rochers ---
  const geoRocher = new THREE.DodecahedronGeometry(1, 0)
  const instRochers = new THREE.InstancedMesh(geoRocher, materiau(PALETTE.rocher), ROCHERS.length)
  ROCHERS.forEach(([x, z, r], n) => {
    q.setFromAxisAngle(axeY, alea() * Math.PI)
    echelle.set(r, r * 0.65, r)
    m.compose(position.set(x, r * 0.2, z), q, echelle)
    instRochers.setMatrixAt(n, m)
    grille.bloquerCercle(x, z, r * 0.9, 0.3)
  })
  instRochers.castShadow = true
  instRochers.receiveShadow = true
  groupe.add(instRochers)

  // --- Clôture tout autour de la zone jouable ---
  const ecart = 2 // un piquet tous les 2 mètres
  const positionsPiquets = []
  for (let t = -demi; t <= demi; t += ecart) {
    positionsPiquets.push([t, -demi], [t, demi])
    if (t !== -demi && t !== demi) positionsPiquets.push([-demi, t], [demi, t])
  }
  const geoPiquet = new THREE.BoxGeometry(0.16, 0.9, 0.16).translate(0, 0.45, 0)
  const piquets = new THREE.InstancedMesh(geoPiquet, materiau(PALETTE.bois), positionsPiquets.length)
  positionsPiquets.forEach(([x, z], n) => {
    m.makeTranslation(x, 0, z)
    piquets.setMatrixAt(n, m)
  })
  piquets.castShadow = true
  groupe.add(piquets)

  // Barres horizontales de la clôture (4 côtés × 2 hauteurs).
  const geoBarre = new THREE.BoxGeometry(taille, 0.08, 0.06)
  for (const h of [0.35, 0.7]) {
    for (const [x, z, rot] of [[0, -demi, 0], [0, demi, 0], [-demi, 0, Math.PI / 2], [demi, 0, Math.PI / 2]]) {
      const barre = new THREE.Mesh(geoBarre, materiau(PALETTE.bois))
      barre.position.set(x, h, z)
      barre.rotation.y = rot
      barre.castShadow = true
      groupe.add(barre)
    }
  }

  // La clôture est un obstacle : on bloque une bande le long de chaque bord.
  const bord = 0.6
  grille.bloquerRectangle(0, -demi, taille, bord * 2)
  grille.bloquerRectangle(0, demi, taille, bord * 2)
  grille.bloquerRectangle(-demi, 0, bord * 2, taille)
  grille.bloquerRectangle(demi, 0, bord * 2, taille)

  // --- Touffes d'herbe (pur décor, pas d'obstacle) ---
  const nbTouffes = 70
  const geoTouffe = new THREE.ConeGeometry(0.12, 0.35, 4).translate(0, 0.17, 0)
  const touffes = new THREE.InstancedMesh(geoTouffe, materiau(PALETTE.herbeFoncee), nbTouffes)
  for (let n = 0; n < nbTouffes; n++) {
    let x, z
    do {
      x = (alea() - 0.5) * (taille - 2)
      z = (alea() - 0.5) * (taille - 2)
    } while (surUnChemin(x, z, 0.2))
    const e = 0.7 + alea() * 0.6
    q.setFromAxisAngle(axeY, alea() * Math.PI)
    echelle.set(e, e, e)
    m.compose(position.set(x, 0, z), q, echelle)
    touffes.setMatrixAt(n, m)
  }
  groupe.add(touffes)

  return sol
}

/**
 * Sème des fleurs au hasard dans l'herbe, en évitant les chemins et les obstacles.
 * À appeler APRÈS avoir placé les bâtiments (pour ne pas en mettre dedans).
 */
export function semerFleurs(groupe, grille) {
  const alea = generateurAleatoire(42)
  const couleurs = [PALETTE.fleurRose, PALETTE.fleurJaune, PALETTE.fleurBlanche, PALETTE.fleurViolette]
  const geoFleur = new THREE.IcosahedronGeometry(0.09, 0).translate(0, 0.2, 0)
  const geoTige = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 3).translate(0, 0.1, 0)
  const parCouleur = couleurs.map(() => [])
  const demi = MONDE.taille / 2 - 1
  let essais = 0
  let placees = 0
  while (placees < NOMBRE_DE_FLEURS && essais < NOMBRE_DE_FLEURS * 20) {
    essais++
    const x = (alea() * 2 - 1) * demi
    const z = (alea() * 2 - 1) * demi
    const c = grille.versCase(x, z)
    if (!grille.estLibre(c.i, c.j) || surUnChemin(x, z, 0.3)) continue
    parCouleur[placees % couleurs.length].push([x, z])
    placees++
  }
  const toutes = parCouleur.flat()
  const tiges = new THREE.InstancedMesh(geoTige, materiau(PALETTE.herbeFoncee), toutes.length)
  toutes.forEach(([x, z], n) => {
    tiges.setMatrixAt(n, m.makeTranslation(x, 0, z))
  })
  groupe.add(tiges)
  couleurs.forEach((couleur, k) => {
    const liste = parCouleur[k]
    const fleurs = new THREE.InstancedMesh(geoFleur, materiau(couleur), liste.length)
    liste.forEach(([x, z], n) => fleurs.setMatrixAt(n, m.makeTranslation(x, 0, z)))
    groupe.add(fleurs)
  })
}
