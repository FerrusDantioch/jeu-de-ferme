/**
 * fusion.js — un outil d'optimisation.
 *
 * Un bâtiment est fait de dizaines de petites pièces (murs, fenêtres, toit…).
 * Dessiner chaque pièce séparément demande beaucoup de travail au téléphone.
 * Ici, on « colle » ensemble toutes les pièces de la même couleur en une seule :
 * le dessin est identique, mais beaucoup plus rapide.
 *
 * À n'utiliser que pour des objets qui ne bougent pas (bâtiments, meubles…).
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

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
      if (!['position', 'normal', 'uv'].includes(nom)) geo.deleteAttribute(nom)
    }
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2))
    }
    if (!parMateriau.has(objet.material)) parMateriau.set(objet.material, [])
    parMateriau.get(objet.material).push(geo)
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
