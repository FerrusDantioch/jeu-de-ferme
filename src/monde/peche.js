/**
 * peche.js (monde) — la canne à pêche, le fil et le bouchon, au bord de l'étang.
 *
 * Étapes : « attente » (le bouchon flotte doucement) → « mord » (le bouchon plonge :
 * ça mord !). Le poisson attend aussi longtemps qu'il faut : pas de limite de temps.
 * Si le personnage s'en va, la canne se range toute seule.
 */
import * as THREE from 'three'
import { materiau, PALETTE } from '../modeles/materiaux.js'
import { ATTENTE_PECHE } from '../donnees/poissons.js'

const HAUT = new THREE.Vector3(0, 1, 0)

export function creerPeche(scene) {
  // La canne : un long bâton fin.
  const canne = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 1, 5), materiau(PALETTE.boisFonce))
  canne.castShadow = true
  // Le fil, du bout de la canne jusqu'au bouchon.
  const geoFil = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
  const fil = new THREE.Line(geoFil, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }))
  fil.frustumCulled = false
  // Le bouchon : rouge et blanc.
  const bouchon = new THREE.Group()
  const haut = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), materiau(PALETTE.tomate))
  const bas = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), materiau(PALETTE.blanc))
  bouchon.add(haut, bas)
  const groupe = new THREE.Group()
  groupe.add(canne, fil, bouchon)
  groupe.visible = false
  scene.add(groupe)

  let etat = null // { etape, reste, depart: {x, z}, eau: {x, z}, temps }
  let surMord = null
  const main = new THREE.Vector3()
  const bout = new THREE.Vector3()
  const milieu = new THREE.Vector3()

  function arreter() {
    etat = null
    groupe.visible = false
  }

  return {
    /**
     * Lance la ligne.
     * @param {Marcheur} joueur
     * @param {{x, z}} eau  où tombe le bouchon
     * @param {function} quandCaMord  appelée quand un poisson mord
     */
    lancer(joueur, eau, quandCaMord) {
      etat = {
        etape: 'attente',
        reste: ATTENTE_PECHE.min + Math.random() * (ATTENTE_PECHE.max - ATTENTE_PECHE.min),
        depart: { x: joueur.position.x, z: joueur.position.z },
        eau,
        temps: 0,
      }
      surMord = quandCaMord
      groupe.visible = true
    },
    arreter,
    /** 'attente', 'mord' ou null (pas en train de pêcher). */
    get etape() {
      return etat?.etape ?? null
    },

    miseAJour(dt, joueur) {
      if (!etat) return
      // Le personnage est parti : on range la canne.
      if (Math.hypot(joueur.position.x - etat.depart.x, joueur.position.z - etat.depart.z) > 0.3 || joueur.assis) {
        arreter()
        return
      }
      etat.temps += dt
      if (etat.etape === 'attente') {
        etat.reste -= dt
        if (etat.reste <= 0) {
          etat.etape = 'mord'
          if (surMord) surMord()
        }
      }
      // La canne part de la main droite et pointe vers l'eau, vers le haut.
      joueur.modele.updateMatrixWorld()
      main.set(0.3, 0.75, 0.2)
      joueur.modele.localToWorld(main)
      bout.set(0.35, 1.7, 1.25)
      joueur.modele.localToWorld(bout)
      milieu.addVectors(main, bout).multiplyScalar(0.5)
      canne.position.copy(milieu)
      canne.scale.y = main.distanceTo(bout)
      canne.quaternion.setFromUnitVectors(HAUT, bout.clone().sub(main).normalize())
      // Le bouchon flotte doucement ; quand ça mord, il plonge et remonte vite.
      const mord = etat.etape === 'mord'
      const y = mord ? 0.02 + Math.abs(Math.sin(etat.temps * 9)) * 0.06 - 0.05 : 0.06 + Math.sin(etat.temps * 2.5) * 0.015
      bouchon.position.set(etat.eau.x, y, etat.eau.z)
      const points = geoFil.attributes.position
      points.setXYZ(0, bout.x, bout.y, bout.z)
      points.setXYZ(1, etat.eau.x, y + 0.07, etat.eau.z)
      points.needsUpdate = true
    },

    /** Remonte la ligne : vrai si un poisson avait mordu (la canne se range). */
    remonter() {
      const avaitMordu = etat?.etape === 'mord'
      arreter()
      return avaitMordu
    },
  }
}
