/**
 * fusion.js — un outil d'optimisation.
 *
 * Un bâtiment est fait de dizaines de petites pièces (murs, fenêtres, toit…).
 * Dessiner chaque pièce séparément demande beaucoup de travail au téléphone.
 * Ici, on « colle » ensemble les pièces en une seule : les couleurs sont alors
 * « peintes » directement sur la forme (couleur par sommet). Le dessin est identique,
 * mais beaucoup plus rapide. Seules les pièces avec une image (ex. : une enseigne)
 * ou transparentes restent à part.
 *
 * À n'utiliser que pour des objets qui ne bougent pas (bâtiments, meubles…).
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Une seule « peinture » pour toutes les pièces collées : elle lit la couleur peinte sur chaque sommet.
const PEINTURE_PAR_SOMMET = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })

/** Vrai si une pièce peut être collée avec les autres (couleur simple, sans image, opaque). */
function collable(materiau) {
  return (
    materiau.isMeshLambertMaterial && !materiau.map && !materiau.transparent && !materiau.vertexColors && !materiau.userData.aPart
  )
}

/**
 * Fusionne les pièces d'un groupe, par couleur.
 * @param {THREE.Group} groupe   le groupe à optimiser
 * @param {object} [options]     { ombrePortee: true, ombreRecue: true }
 * @returns {THREE.Group} un nouveau groupe, à la même place, avec beaucoup moins de pièces
 */
export function fusionnerParMateriau(groupe, { ombrePortee = true, ombreRecue = true } = {}) {
  groupe.updateMatrixWorld(true)
  const inverse = groupe.matrixWorld.clone().invert()
  const parMateriau = new Map()
  const relative = new THREE.Matrix4()

  groupe.traverse((objet) => {
    if (!objet.isMesh || objet.isInstancedMesh) return
    // Une pièce marquée « garderSeule » n'est pas fusionnée (ex. : objet à part).
    if (objet.userData.garderSeule) return
    // On ramène la forme à la position qu'elle occupe dans le groupe.
    relative.multiplyMatrices(inverse, objet.matrixWorld)
    let geo = objet.geometry.index ? objet.geometry.toNonIndexed() : objet.geometry.clone()
    geo.applyMatrix4(relative)
    // On garde seulement ce dont on a besoin (position, orientation des faces, textures).
    for (const nom of Object.keys(geo.attributes)) {
      if (!['position', 'normal', 'uv', 'color'].includes(nom)) geo.deleteAttribute(nom)
    }
    // Les pièces déjà peintes gardent leurs couleurs ; les autres n'en ont pas besoin ici.
    if (objet.material !== PEINTURE_PAR_SOMMET && geo.attributes.color) geo.deleteAttribute('color')
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
    }
    let cle = objet.material
    if (collable(objet.material)) {
      // On peint la couleur de la pièce sur chacun de ses sommets.
      const n = geo.attributes.position.count
      const couleurs = new Float32Array(n * 3)
      const { r, g, b } = objet.material.color
      for (let k = 0; k < n; k++) {
        couleurs[k * 3] = r
        couleurs[k * 3 + 1] = g
        couleurs[k * 3 + 2] = b
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(couleurs, 3))
      cle = PEINTURE_PAR_SOMMET
    } else if (objet.material === PEINTURE_PAR_SOMMET) {
      cle = PEINTURE_PAR_SOMMET // déjà peinte (fusion d'une fusion)
    }
    if (!parMateriau.has(cle)) parMateriau.set(cle, [])
    parMateriau.get(cle).push(geo)
  })

  const resultat = new THREE.Group()
  resultat.name = groupe.name
  resultat.position.copy(groupe.position)
  resultat.rotation.copy(groupe.rotation)
  resultat.scale.copy(groupe.scale)
  resultat.userData = groupe.userData

  for (const [mat, geos] of parMateriau) {
    const fusion = mergeGeometries(geos, false)
    if (!fusion) continue
    const mesh = new THREE.Mesh(fusion, mat)
    mesh.castShadow = ombrePortee
    mesh.receiveShadow = ombreRecue
    resultat.add(mesh)
  }

  // Les pièces gardées seules sont déplacées telles quelles dans le nouveau groupe.
  const aGarder = []
  groupe.traverse((o) => o.isMesh && o.userData.garderSeule && aGarder.push(o))
  for (const o of aGarder) {
    relative.multiplyMatrices(inverse, o.matrixWorld)
    o.removeFromParent()
    relative.decompose(o.position, o.quaternion, o.scale)
    resultat.add(o)
  }
  return resultat
}

/**
 * Fusionne « sur place » les pièces d'un groupe qui bouge (ex. : la tête d'un personnage) :
 * le groupe garde sa place et son animation, mais contient beaucoup moins de pièces.
 * @param {THREE.Group} groupe
 * @param {object} [o]  profond : true = toutes les pièces à l'intérieur (y compris les sous-groupes) ;
 *                      false = seulement les pièces posées directement dedans (les sous-groupes animés restent).
 */
export function fusionnerEnPlace(groupe, { profond = false } = {}) {
  const pieces = profond ? [...groupe.children] : groupe.children.filter((o) => o.isMesh)
  if (pieces.length < 2) return
  const temporaire = new THREE.Group()
  for (const p of pieces) temporaire.add(p) // (cela les retire du groupe)
  const fusion = fusionnerParMateriau(temporaire, { ombrePortee: true, ombreRecue: false })
  for (const m of [...fusion.children]) groupe.add(m)
}
