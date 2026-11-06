/**
 * personnage.js — le personnage du joueur : sa position, sa marche, son animation.
 *
 * Deux façons de le diriger :
 *  - allerVers(point) : il calcule un chemin et le suit tout seul (toucher l'écran) ;
 *  - deplacerDirection(dx, dz) : il avance dans une direction (clavier, plus tard joystick).
 */
import * as THREE from 'three'
import { obtenirModele } from '../modeles/index.js'
import { PERSONNAGE } from '../config.js'

// Vitesse à laquelle le personnage se tourne vers sa direction (plus grand = plus vif).
const VITESSE_ROTATION = 10

export class Personnage {
  constructor(scene, grille) {
    this.grille = grille
    this.modele = obtenirModele('personnage')
    scene.add(this.modele)

    // Pièces animées (retrouvées par leur nom).
    this.corps = this.modele.getObjectByName('corps')
    this.jambes = [this.modele.getObjectByName('jambeGauche'), this.modele.getObjectByName('jambeDroite')]
    this.bras = [this.modele.getObjectByName('brasGauche'), this.modele.getObjectByName('brasDroit')]

    this.chemin = [] // liste des points à atteindre, dans l'ordre
    this.enMouvement = false
    this.phaseMarche = 0 // avance avec les pas, sert à balancer bras et jambes
    this.ampleur = 0 // 0 = immobile, 1 = marche franche
    this.angleVise = 0
    this.tempsTotal = 0

    // Fonction à appeler quand le personnage arrive à destination (optionnel).
    this.surArrivee = null
  }

  get position() {
    return this.modele.position
  }

  placer(x, z) {
    this.modele.position.set(x, 0, z)
  }

  /**
   * Demande au personnage d'aller jusqu'à un point en contournant les obstacles.
   * @returns {THREE.Vector3|null} le point réellement visé (ou null si impossible)
   */
  allerVers(point) {
    const chemin = this.grille.trouverChemin(this.position, point)
    if (!chemin || chemin.length === 0) return null
    this.chemin = chemin
    return chemin[chemin.length - 1]
  }

  arreter() {
    this.chemin = []
  }

  /**
   * Avance dans une direction (dx, dz entre -1 et 1) pendant dt secondes.
   * Si un obstacle bloque, le personnage « glisse » le long de lui.
   */
  deplacerDirection(dx, dz, dt) {
    this.chemin = [] // le clavier reprend la main : on oublie le chemin en cours
    const pas = PERSONNAGE.vitesse * dt
    const p = this.position
    const essais = [
      [p.x + dx * pas, p.z + dz * pas], // tout droit
      [p.x + dx * pas, p.z], // seulement de côté
      [p.x, p.z + dz * pas], // seulement en avant / arrière
    ]
    for (const [x, z] of essais) {
      const c = this.grille.versCase(x, z)
      if (this.grille.estLibre(c.i, c.j)) {
        p.x = x
        p.z = z
        break
      }
    }
    this.angleVise = Math.atan2(dx, dz)
    this._marcheCeTour = true
  }

  /**
   * Appelée à chaque image.
   */
  miseAJour(dt) {
    this.tempsTotal += dt
    let marche = this._marcheCeTour === true
    this._marcheCeTour = false

    // --- Suivre le chemin calculé ---
    if (this.chemin.length > 0) {
      const p = this.position
      const cible = this.chemin[0]
      const dx = cible.x - p.x
      const dz = cible.z - p.z
      const distance = Math.hypot(dx, dz)
      const pas = PERSONNAGE.vitesse * dt
      if (distance <= pas) {
        // Point atteint : on passe au suivant.
        p.x = cible.x
        p.z = cible.z
        this.chemin.shift()
        if (this.chemin.length === 0 && this.surArrivee) this.surArrivee()
      } else {
        p.x += (dx / distance) * pas
        p.z += (dz / distance) * pas
        this.angleVise = Math.atan2(dx, dz)
      }
      marche = true
    }

    // --- Rotation douce vers la direction de marche ---
    let ecart = this.angleVise - this.modele.rotation.y
    ecart = Math.atan2(Math.sin(ecart), Math.cos(ecart)) // chemin le plus court (pas de tour complet)
    this.modele.rotation.y += ecart * Math.min(1, VITESSE_ROTATION * dt)

    // --- Animation ---
    this.enMouvement = marche
    // L'ampleur du balancement monte doucement quand il marche, redescend à l'arrêt.
    const ampleurVisee = marche ? 1 : 0
    this.ampleur += (ampleurVisee - this.ampleur) * Math.min(1, dt * 8)
    if (marche) this.phaseMarche += dt * 10
    const balancement = Math.sin(this.phaseMarche) * 0.6 * this.ampleur
    this.jambes[0].rotation.x = balancement
    this.jambes[1].rotation.x = -balancement
    this.bras[0].rotation.x = -balancement * 0.8
    this.bras[1].rotation.x = balancement * 0.8
    // Petit rebond quand il marche, légère respiration à l'arrêt.
    this.corps.position.y =
      Math.abs(Math.sin(this.phaseMarche)) * 0.05 * this.ampleur +
      Math.sin(this.tempsTotal * 2) * 0.008 * (1 - this.ampleur)
  }
}
