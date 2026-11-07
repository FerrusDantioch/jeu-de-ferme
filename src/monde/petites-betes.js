/**
 * petites-betes.js — la petite vie de la ferme :
 *  - des papillons qui volettent au-dessus des fleurs, le jour (sauf en hiver) ;
 *  - des lucioles qui scintillent doucement le soir (sauf en hiver).
 *
 * Pur décor : on ne peut pas les toucher. Avec « réduire les animations »,
 * les papillons restent cachés et les lucioles ne bougent plus.
 */
import * as THREE from 'three'

// Les coins où vivent les papillons et les lucioles : [x, z, rayon].
const COINS_PAPILLONS = [
  [-5, 1.6, 2.5], // devant le potager
  [-13, -0.5, 2], // près de l'étang
  [4, 5.5, 2], // autour du puits
  [-4, 10, 2.5], // près du banc de l'allée
  [11, 9.5, 2.5], // chez Mamie Rose
  [12, 3.8, 2], // devant l'enclos
  [-9, 9.5, 2], // vers la boutique
]
const COINS_LUCIOLES = [
  [-15, -3, 3.4], // l'étang
  [-5, -2, 3], // le potager
  [-4, 10, 3],
  [4, 4, 3],
  [11, 9.5, 3],
  [-12, 6, 3],
]
const COULEURS_PAPILLONS = [0xf7bfd6, 0xfff1a8, 0xbfe3f2, 0xd7c4f2, 0xffffff, 0xffc9a0, 0xc6ecc0]

const geoAile = new THREE.CircleGeometry(0.09, 6).scale(1, 0.75, 1).translate(0.085, 0, 0).rotateX(-Math.PI / 2)

/** Un papillon : deux ailes qui battent autour d'une charnière. */
function creerPapillon(couleur) {
  const g = new THREE.Group()
  const peinture = new THREE.MeshLambertMaterial({ color: couleur, side: THREE.DoubleSide })
  const droite = new THREE.Mesh(geoAile, peinture)
  const gauche = new THREE.Mesh(geoAile, peinture)
  gauche.scale.x = -1
  g.add(droite, gauche)
  g.userData.ailes = [droite, gauche]
  return g
}

/** @param {THREE.Group} groupe  le lieu (dehors) */
export function creerPetitesBetes(groupe) {
  // --- Papillons ---
  const papillons = COINS_PAPILLONS.map(([x, z, r], n) => {
    const p = creerPapillon(COULEURS_PAPILLONS[n % COULEURS_PAPILLONS.length])
    p.userData.coin = { x, z, r }
    // Chacun a son rythme, pour qu'ils ne volent pas tous pareil.
    p.userData.rythme = { a: 0.35 + Math.random() * 0.25, b: 0.5 + Math.random() * 0.3, decalage: Math.random() * 10 }
    p.visible = false
    groupe.add(p)
    return p
  })

  // --- Lucioles : de petits points lumineux ---
  const nbLucioles = 48
  const positions = new Float32Array(nbLucioles * 3)
  const couleurs = new Float32Array(nbLucioles * 3)
  const departs = []
  for (let k = 0; k < nbLucioles; k++) {
    const [cx, cz, r] = COINS_LUCIOLES[k % COINS_LUCIOLES.length]
    const angle = Math.random() * Math.PI * 2
    const d = Math.sqrt(Math.random()) * r
    departs.push({ x: cx + Math.cos(angle) * d, y: 0.4 + Math.random() * 1.2, z: cz + Math.sin(angle) * d, phase: Math.random() * 10 })
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(couleurs, 3))
  const lucioles = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: textureDouce(),
    })
  )
  lucioles.frustumCulled = false
  lucioles.visible = false
  groupe.add(lucioles)

  let temps = 0

  /**
   * À chaque image.
   * @param {object} o { lumieres (0 = jour, 1 = nuit), saison, calme (réduire les animations) }
   */
  function miseAJour(dt, { lumieres, saison, calme }) {
    temps += dt
    const hiver = saison === 'hiver'

    // Papillons : le jour seulement.
    const papillonsVisibles = !hiver && !calme && lumieres < 0.45
    for (const p of papillons) {
      p.visible = papillonsVisibles
      if (!papillonsVisibles) continue
      const { x, z, r } = p.userData.coin
      const { a, b, decalage } = p.userData.rythme
      const t = temps + decalage
      const nx = x + Math.sin(t * a) * r
      const nz = z + Math.sin(t * b) * Math.cos(t * a * 0.7) * r * 0.8
      // Il regarde vers où il va.
      p.rotation.y = Math.atan2(nx - p.position.x, nz - p.position.z)
      p.position.set(nx, 0.55 + Math.sin(t * 1.7) * 0.2, nz)
      const battement = Math.sin(t * 16) * 0.9
      p.userData.ailes[0].rotation.z = battement
      p.userData.ailes[1].rotation.z = -battement
    }

    // Lucioles : le soir, elles s'allument et s'éteignent doucement.
    lucioles.visible = !hiver && lumieres > 0.3
    if (!lucioles.visible) return
    for (let k = 0; k < nbLucioles; k++) {
      const d = departs[k]
      const t = temps * 0.5 + d.phase
      const bouge = calme ? 0 : 1
      positions[k * 3] = d.x + Math.sin(t * 0.9) * 0.5 * bouge
      positions[k * 3 + 1] = d.y + Math.sin(t * 1.3) * 0.25 * bouge
      positions[k * 3 + 2] = d.z + Math.cos(t * 0.7) * 0.5 * bouge
      const eclat = calme ? 0.8 : 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2))
      const force = eclat * Math.min(1, (lumieres - 0.3) * 2)
      couleurs[k * 3] = 0.9 * force
      couleurs[k * 3 + 1] = 1.0 * force
      couleurs[k * 3 + 2] = 0.45 * force
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true
  }

  return { miseAJour }
}

/** Un point rond et doux (pour les lucioles). */
function textureDouce() {
  const toile = document.createElement('canvas')
  toile.width = toile.height = 32
  const c = toile.getContext('2d')
  const d = c.createRadialGradient(16, 16, 0, 16, 16, 16)
  d.addColorStop(0, 'rgba(255,255,255,1)')
  d.addColorStop(0.3, 'rgba(255,255,255,0.7)')
  d.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = d
  c.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(toile)
}
