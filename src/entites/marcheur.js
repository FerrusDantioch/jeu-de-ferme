/**
 * marcheur.js — tout ce qui marche dans le jeu : le joueur ET les villageois.
 *
 * Un « marcheur » sait :
 *  - suivre un chemin calculé (en contournant les obstacles) ;
 *  - se tourner doucement vers où il va (ou vers quelqu'un) ;
 *  - animer ses bras et ses jambes quand il marche, et respirer à l'arrêt ;
 *  - s'asseoir sur un banc ou une chaise, et se relever.
 *
 * Le joueur (personnage.js) et les villageois (pnj.js) reprennent tout ça
 * et ajoutent leurs propres comportements.
 */

// Vitesse à laquelle on se tourne vers sa direction (plus grand = plus vif).
const VITESSE_ROTATION = 10

export class Marcheur {
  /**
   * @param {THREE.Object3D} modele  le modèle 3D (voir src/modeles/personnage.js)
   * @param {GrilleChemin} grille    la grille des obstacles du lieu
   * @param {number} vitesse         vitesse de marche en mètres par seconde
   */
  constructor(modele, grille, vitesse) {
    this.modele = modele
    this.grille = grille
    this.vitesse = vitesse

    // Pièces animées (retrouvées par leur nom).
    this.corps = modele.getObjectByName('corps')
    this.jambes = [modele.getObjectByName('jambeGauche'), modele.getObjectByName('jambeDroite')]
    this.bras = [modele.getObjectByName('brasGauche'), modele.getObjectByName('brasDroit')]

    this.chemin = [] // liste des points à atteindre, dans l'ordre
    this.enMouvement = false
    this.phaseMarche = 0 // avance avec les pas, sert à balancer bras et jambes
    this.ampleur = 0 // 0 = immobile, 1 = marche franche
    this.angleVise = 0
    this.tempsTotal = Math.random() * 10 // décalage : tout le monde ne respire pas en même temps
    this._marcheCeTour = false
    this.assis = null // le siège où il est assis (ou null)

    // Hauteur de ses hanches (sert à bien le poser sur un siège).
    this.hauteurHanches = 0.45 * (this.corps?.scale.y || 1)

    // Fonction à appeler quand le marcheur arrive au bout de son chemin (optionnel).
    this.surArrivee = null
  }

  get position() {
    return this.modele.position
  }

  /** Place le marcheur directement à un endroit, tourné selon « angle » (0 = vers la caméra). */
  placer(x, z, angle = this.angleVise) {
    this.assis = null
    this.modele.position.set(x, 0, z)
    this.angleVise = angle
    this.modele.rotation.y = angle
    this.chemin = []
  }

  /**
   * Demande d'aller jusqu'à un point en contournant les obstacles.
   * @returns {THREE.Vector3|null} le point réellement visé (ou null si impossible)
   */
  allerVers(point) {
    if (this.assis) this.seLever()
    const chemin = this.grille.trouverChemin(this.position, point)
    if (!chemin || chemin.length === 0) return null
    this.chemin = chemin
    return chemin[chemin.length - 1]
  }

  arreter() {
    this.chemin = []
  }

  /**
   * S'assoit sur un siège (voir src/monde/sieges.js) : il se pose dessus,
   * se tourne dans le bon sens, et laisse pendre ses jambes.
   */
  asseoir(siege) {
    this.chemin = []
    this.assis = siege
    this.modele.position.set(siege.x, Math.max(0, siege.hauteur - this.hauteurHanches), siege.z)
    this.angleVise = siege.angle
  }

  /** Se relève et se met debout juste devant le siège. */
  seLever() {
    const siege = this.assis
    if (!siege) return
    this.assis = null
    this.modele.position.set(siege.devant.x, 0, siege.devant.z)
  }

  /** Vrai s'il est en train de suivre un chemin. */
  get enRoute() {
    return this.chemin.length > 0
  }

  /** Se tourne (doucement) vers un point. */
  regarderVers(x, z) {
    const dx = x - this.position.x
    const dz = z - this.position.z
    if (dx * dx + dz * dz > 0.0001) this.angleVise = Math.atan2(dx, dz)
  }

  /** Distance (en mètres, à plat) jusqu'à un point. */
  distanceA(point) {
    return Math.hypot(point.x - this.position.x, point.z - this.position.z)
  }

  /**
   * Appelée à chaque image : avance sur le chemin, tourne, anime.
   * « dt » = temps écoulé depuis l'image précédente, en secondes.
   */
  miseAJour(dt) {
    this.tempsTotal += dt
    let marche = this._marcheCeTour
    this._marcheCeTour = false

    // --- Assis : posture assise (jambes en avant, mains sur les genoux), et petite respiration ---
    if (this.assis) {
      this._tourner(dt)
      const t = Math.min(1, dt * 8)
      for (const j of this.jambes) j.rotation.x += (-1.25 - j.rotation.x) * t
      for (const b of this.bras) b.rotation.x += (-0.45 - b.rotation.x) * t
      this.ampleur = 0
      this.enMouvement = false
      this.corps.position.y = Math.sin(this.tempsTotal * 2) * 0.008
      return
    }

    // --- Suivre le chemin calculé ---
    if (this.chemin.length > 0) {
      const p = this.position
      const cible = this.chemin[0]
      const dx = cible.x - p.x
      const dz = cible.z - p.z
      const distance = Math.hypot(dx, dz)
      const pas = this.vitesse * dt
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

    this._tourner(dt)

    // --- Animation ---
    this.enMouvement = marche
    // L'ampleur du balancement monte doucement quand il marche, redescend à l'arrêt.
    const ampleurVisee = marche ? 1 : 0
    this.ampleur += (ampleurVisee - this.ampleur) * Math.min(1, dt * 8)
    // Les pas suivent la vitesse : un marcheur lent fait des pas plus lents.
    if (marche) this.phaseMarche += dt * this.vitesse * 3.1
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

  /** Rotation douce vers la direction voulue (par le chemin le plus court, sans tour complet). */
  _tourner(dt) {
    let ecart = this.angleVise - this.modele.rotation.y
    ecart = Math.atan2(Math.sin(ecart), Math.cos(ecart))
    this.modele.rotation.y += ecart * Math.min(1, VITESSE_ROTATION * dt)
  }
}
