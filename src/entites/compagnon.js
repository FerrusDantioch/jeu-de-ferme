/**
 * compagnon.js (entité) — le chat ou le chien qui suit le personnage.
 *
 *  - il trottine derrière le personnage (en contournant les obstacles) ;
 *  - quand le personnage s'arrête, il s'assoit à côté et remue la queue ;
 *  - quand le personnage s'assoit sur un banc, il saute sur la place d'à côté ;
 *  - il passe les portes avec lui (il réapparaît juste à côté) ;
 *  - on peut le toucher pour le caresser ou jouer.
 */
import * as THREE from 'three'
import { obtenirModele } from '../modeles/index.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { couleursPelage } from '../jeu/compagnon.js'

const VITESSE = 3.6 // un peu plus rapide que le personnage, pour le rattraper
const DISTANCE_SUIVI = 1.6 // au-delà, il se met en route
const DISTANCE_TROP_LOIN = 14 // au-delà, il réapparaît directement à côté

export class Compagnon {
  /**
   * @param {THREE.Scene} scene
   * @param {object} fiche  { espece, nom, pelage } (voir jeu/compagnon.js)
   */
  constructor(scene, fiche) {
    this.scene = scene
    this.modele = new THREE.Group()
    this.modele.name = 'compagnon'
    scene.add(this.modele)
    this.grille = null
    this.chemin = []
    this.assisSur = null // la place de banc où il est installé
    this.temps = 0
    this.phase = 0
    this.ampleur = 0
    this.joie = 0 // > 0 : il sautille de joie (caresse, jeu)
    this.angleVise = 0
    this.recalcul = 0

    // Zone invisible pour le toucher (plus grande que lui, il est petit).
    this.zone = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 8), MATERIAU_INVISIBLE)
    this.zone.position.y = 0.4
    this.zone.userData.toucher = { type: 'compagnon', compagnon: this }
    this.modele.add(this.zone)
    this.changerApparence(fiche)
  }

  get position() {
    return this.modele.position
  }

  /** Redessine le compagnon (nouvelle espèce ou nouveau pelage). */
  changerApparence(fiche) {
    this.fiche = fiche
    if (this.corpsComplet) {
      this.modele.remove(this.corpsComplet)
      this.corpsComplet.traverse((o) => o.isMesh && o.geometry.dispose())
    }
    this.corpsComplet = obtenirModele('compagnon', { espece: fiche.espece, pelage: couleursPelage(fiche) })
    this.modele.add(this.corpsComplet)
    this.corps = this.corpsComplet.getObjectByName('corps')
    this.tete = this.corpsComplet.getObjectByName('tete')
    this.queue = this.corpsComplet.getObjectByName('queue')
    this.pattes = [0, 1, 2, 3].map((n) => this.corpsComplet.getObjectByName(`patte${n}`))
  }

  /** Le place juste à côté d'un point (sur une case libre de la grille). */
  placerPres(x, z, grille) {
    this.grille = grille
    this.chemin = []
    this.assisSur = null
    const essais = [[0.9, 0.6], [-0.9, 0.6], [0, 1.1], [1.1, 0], [-1.1, 0], [0, -1], [0.6, -0.8], [0, 0]]
    for (const [dx, dz] of essais) {
      const c = grille.versCase(x + dx, z + dz)
      if (grille.estLibre(c.i, c.j) || (dx === 0 && dz === 0)) {
        this.modele.position.set(x + dx, 0, z + dz)
        break
      }
    }
  }

  /** On le caresse (ou on joue) : il sautille et regarde le joueur. */
  rejouir(joueur) {
    this.joie = 1.2
    this.chemin = []
    this.regarderVers(joueur.position.x, joueur.position.z)
  }

  regarderVers(x, z) {
    const dx = x - this.position.x
    const dz = z - this.position.z
    if (dx * dx + dz * dz > 0.0001) this.angleVise = Math.atan2(dx, dz)
  }

  /**
   * À chaque image.
   * @param {Marcheur} joueur  le personnage du joueur
   */
  miseAJour(dt, joueur) {
    this.temps += dt
    this.joie = Math.max(0, this.joie - dt)
    const p = this.position
    const distance = Math.hypot(joueur.position.x - p.x, joueur.position.z - p.z)

    // --- Le joueur est assis sur un banc : il s'installe sur la place d'à côté ---
    const voisine = joueur.assis?.voisine
    if (voisine && distance < 3) {
      if (this.assisSur !== voisine) {
        this.assisSur = voisine
        this.chemin = []
        p.set(voisine.x, voisine.hauteur - 0.02, voisine.z)
        this.angleVise = voisine.angle
      }
      this._poser(dt, 1)
      this._tourner(dt)
      return
    }
    if (this.assisSur) {
      // Le joueur s'est levé : il saute du banc.
      p.set(this.assisSur.devant.x + 0.5, 0, this.assisSur.devant.z)
      this.assisSur = null
    }

    // --- Trop loin (ou coincé) : il réapparaît à côté ---
    if (distance > DISTANCE_TROP_LOIN && this.grille) this.placerPres(joueur.position.x, joueur.position.z, this.grille)

    // --- Suivre le joueur ---
    this.recalcul -= dt
    if (distance > DISTANCE_SUIVI && this.recalcul <= 0 && this.grille) {
      this.recalcul = 0.5
      // Il vise un point juste à côté du joueur (pas sur lui).
      const vers = new THREE.Vector3(p.x - joueur.position.x, 0, p.z - joueur.position.z).normalize()
      const but = new THREE.Vector3(joueur.position.x + vers.x * 0.9, 0, joueur.position.z + vers.z * 0.9)
      this.chemin = this.grille.trouverChemin(p, but) || []
    }
    let marche = false
    if (this.chemin.length > 0 && distance > 1.0) {
      const cible = this.chemin[0]
      const dx = cible.x - p.x
      const dz = cible.z - p.z
      const d = Math.hypot(dx, dz)
      const pas = VITESSE * dt * Math.min(1, distance / 2.5 + 0.4)
      if (d <= pas) {
        p.x = cible.x
        p.z = cible.z
        this.chemin.shift()
      } else {
        p.x += (dx / d) * pas
        p.z += (dz / d) * pas
        this.angleVise = Math.atan2(dx, dz)
      }
      marche = true
    } else {
      this.chemin = []
      // À l'arrêt, il regarde le joueur de temps en temps.
      if (Math.sin(this.temps * 0.4) > 0.3 || this.joie > 0) this.regarderVers(joueur.position.x, joueur.position.z)
    }
    p.y = this.joie > 0 ? Math.abs(Math.sin(this.joie * 9)) * 0.12 : 0

    // --- Animation : les pattes quand il trottine, assis quand il attend ---
    this.ampleur += ((marche ? 1 : 0) - this.ampleur) * Math.min(1, dt * 8)
    if (marche) this.phase += dt * 14
    this._poser(dt, marche || this.joie > 0 ? 0 : 1)
    const b = Math.sin(this.phase) * 0.7 * this.ampleur
    this.pattes[0].rotation.x += b
    this.pattes[3].rotation.x += b
    this.pattes[1].rotation.x -= b
    this.pattes[2].rotation.x -= b
    this._tourner(dt)
  }

  /**
   * Pose du corps : 0 = debout, 1 = assis (avant redressé, pattes arrière repliées).
   * La queue remue toujours un peu (plus fort quand il est content).
   */
  _poser(dt, assis) {
    this.pose = (this.pose ?? 0) + (assis - (this.pose ?? 0)) * Math.min(1, dt * 5)
    const a = this.pose
    this.corps.rotation.x = -0.5 * a
    this.corps.position.y = 0.05 * a
    this.pattes[0].rotation.x = 0.5 * a
    this.pattes[1].rotation.x = 0.5 * a
    this.pattes[2].rotation.x = -1.1 * a
    this.pattes[3].rotation.x = -1.1 * a
    const vitesseQueue = this.joie > 0 ? 14 : 5
    this.queue.rotation.y = Math.sin(this.temps * vitesseQueue) * (this.joie > 0 ? 0.7 : 0.3)
    this.tete.rotation.x = 0.35 * a + Math.sin(this.temps * 1.3) * 0.04
  }

  _tourner(dt) {
    let ecart = this.angleVise - this.modele.rotation.y
    ecart = Math.atan2(Math.sin(ecart), Math.cos(ecart))
    this.modele.rotation.y += ecart * Math.min(1, 8 * dt)
  }

  /** Le retire de la scène (s'il fallait). */
  retirer() {
    this.scene.remove(this.modele)
  }
}
