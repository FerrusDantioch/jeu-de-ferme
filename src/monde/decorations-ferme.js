/**
 * decorations-ferme.js — les décorations posées dehors par le joueur (en 3D) :
 *  - chacune gêne le passage selon sa taille (sauf sous l'arche) ;
 *  - on peut s'asseoir sur les bancs, les lanternes brillent le soir ;
 *  - un « aperçu » montre où ira une décoration avant de la poser
 *    (cercle vert : c'est possible ; cercle rouge : pas ici).
 */
import * as THREE from 'three'
import { creerDecoration } from '../modeles/decorations.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { DECORATIONS } from '../donnees/decorations.js'
import { decorationsPosees } from '../jeu/decorations.js'
import { placesDeBanc, ajouterSiege } from './sieges.js'
import { creerLueur, oublierLueur } from './ciel.js'

/**
 * @param {object} o
 *  - groupe, grille, touchables : ceux du lieu « dehors »
 *  - interdits : liste de zones où l'on ne peut rien poser [{ x, z, l, p }] (rectangles) ou [{ x, z, r }] (cercles)
 */
export function creerDecorationsFerme({ groupe, grille, touchables, interdits = [] }) {
  const conteneur = new THREE.Group()
  conteneur.name = 'decorations'
  groupe.add(conteneur)
  let zones = [] // zones à toucher (à retirer avant de reconstruire)
  let lueurs = []

  /** Les « morceaux » d'obstacle d'une décoration : [[x, z, rayon], …]. */
  function obstacles(type, x, z, angle) {
    const d = DECORATIONS[type]
    if (d.poteaux) {
      const cx = Math.cos(angle) * d.poteaux
      const cz = -Math.sin(angle) * d.poteaux
      return [[x + cx, z + cz, 0.12], [x - cx, z - cz, 0.12]]
    }
    if (d.banc) {
      // Un banc : trois cercles le long de l'assise.
      const cx = Math.cos(angle) * 0.55
      const cz = -Math.sin(angle) * 0.55
      return [[x - cx, z - cz, 0.3], [x, z, 0.3], [x + cx, z + cz, 0.3]]
    }
    return [[x, z, d.taille]]
  }

  /** Bloque le passage là où sont les décorations (à refaire après chaque changement d'obstacles). */
  function bloquer() {
    for (const d of decorationsPosees()) {
      for (const [x, z, r] of obstacles(d.type, d.x, d.z, d.angle || 0)) grille.bloquerCercle(x, z, r, 0.15)
    }
  }

  /** Redessine toutes les décorations posées. */
  function construire() {
    for (const o of [...conteneur.children]) {
      conteneur.remove(o)
      o.traverse((m) => m.isMesh && m.geometry.dispose())
    }
    for (const z of zones) touchables.splice(touchables.indexOf(z), 1)
    zones = []
    for (const l of lueurs) oublierLueur(l)
    lueurs = []

    for (const d of decorationsPosees()) {
      const info = DECORATIONS[d.type]
      if (!info) continue
      const angle = d.angle || 0
      const modele = fusionnerParMateriau(creerDecoration(d.type))
      modele.position.set(d.x, 0, d.z)
      modele.rotation.y = angle
      conteneur.add(modele)
      if (info.banc) {
        // Un banc : deux places pour s'asseoir (pas de zone « décoration » : on le range depuis 🌼 Décorer).
        for (const siege of placesDeBanc(d.x, d.z, angle, 0.5)) {
          const zone = ajouterSiege({ groupe: conteneur, touchables }, siege)
          zones.push(zone)
        }
      } else {
        const r = Math.max(0.45, info.taille + 0.1)
        const zone = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.4, 8), MATERIAU_INVISIBLE)
        zone.position.set(d.x, 0.7, d.z)
        zone.userData.toucher = { type: 'deco', deco: d }
        conteneur.add(zone)
        touchables.push(zone)
        zones.push(zone)
      }
      if (info.lumiere) {
        const lueur = creerLueur(0xffd27a, 1.8)
        lueur.position.set(d.x, 1.15, d.z)
        conteneur.add(lueur)
        lueurs.push(lueur)
      }
    }
  }

  /** Vrai si un point est dans une zone interdite. */
  function interdit(x, z, marge) {
    return interdits.some((i) =>
      i.r !== undefined
        ? Math.hypot(x - i.x, z - i.z) < i.r + marge
        : Math.abs(x - i.x) < i.l / 2 + marge && Math.abs(z - i.z) < i.p / 2 + marge
    )
  }

  /** Vrai si on peut poser cette décoration ici (rien ne gêne, pas dans une zone interdite). */
  function estPossible(type, x, z, angle = 0) {
    for (const [ox, oz, r] of obstacles(type, x, z, angle)) {
      if (interdit(ox, oz, r)) return false
      // On vérifie le centre et 8 points autour.
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * Math.PI * 2
        const px = k === 8 ? ox : ox + Math.cos(a) * r
        const pz = k === 8 ? oz : oz + Math.sin(a) * r
        const c = grille.versCase(px, pz)
        if (!grille.estLibre(c.i, c.j)) return false
      }
    }
    return true
  }

  // --- L'aperçu (avant de poser) ---
  const anneau = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x5a9e58, transparent: true, opacity: 0.85, depthWrite: false })
  )
  anneau.position.y = 0.03
  const apercu = new THREE.Group()
  apercu.add(anneau)
  apercu.visible = false
  groupe.add(apercu)
  let modeleApercu = null
  let typeApercu = null

  /** Montre l'aperçu d'une décoration (vert si c'est possible, rouge sinon). */
  function montrerApercu(type, x, z, angle) {
    if (type !== typeApercu) {
      if (modeleApercu) apercu.remove(modeleApercu)
      modeleApercu = creerDecoration(type)
      // Un peu transparent : ce n'est pas encore posé.
      modeleApercu.traverse((m) => {
        if (!m.isMesh) return
        m.material = m.material.clone()
        m.material.transparent = true
        m.material.opacity = 0.7
        m.castShadow = false
      })
      apercu.add(modeleApercu)
      typeApercu = type
    }
    const possible = estPossible(type, x, z, angle)
    anneau.material.color.set(possible ? 0x5a9e58 : 0xd9574a)
    anneau.scale.setScalar(Math.max(0.5, DECORATIONS[type].taille + 0.2))
    apercu.position.set(x, 0, z)
    modeleApercu.rotation.y = angle
    apercu.visible = true
    return possible
  }

  function cacherApercu() {
    apercu.visible = false
  }

  construire()
  return { construire, bloquer, estPossible, montrerApercu, cacherApercu }
}
