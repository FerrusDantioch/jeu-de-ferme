/**
 * animal.js — un animal dans le monde : il se promène tranquillement dans sa zone
 * (l'enclos ou sa stalle), picore ou broute, et montre une petite icône
 * au-dessus de lui quand il a quelque chose à donner (🥚 🥛 🧶) ou un petit creux (🌾).
 *
 * Ses besoins (ventre, bonheur, production) sont dans la mémoire du jeu (voir jeu/elevage.js) :
 * ce fichier ne s'occupe que de le faire vivre à l'écran.
 */
import * as THREE from 'three'
import { obtenirModele } from '../modeles/index.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { ESPECES, SOINS } from '../donnees/animaux.js'
import { infosObjet } from '../donnees/objets.js'
import { trouver } from '../jeu/elevage.js'

// Réglages propres à chaque espèce : vitesse de marche, taille de la zone à toucher,
// hauteur de l'icône, et la tête baissée (picorer / brouter).
const ALLURES = {
  poule: { vitesse: 0.7, rayonToucher: 0.55, hauteurIcone: 0.85, teteBaissee: 0.9, pas: 18 },
  mouton: { vitesse: 0.45, rayonToucher: 0.65, hauteurIcone: 1.2, teteBaissee: 0.6, pas: 9 },
  vache: { vitesse: 0.3, rayonToucher: 0.85, hauteurIcone: 1.55, teteBaissee: 0.5, pas: 7 },
}

const auHasard = (min, max) => min + Math.random() * (max - min)

export class Animal {
  /**
   * @param {object} fiche   l'animal dans la mémoire du jeu (id, espece, nom…)
   * @param {object} zone    { xMin, xMax, zMin, zMax, angle? } : où il peut se promener
   *                          (angle : direction à prendre au repos, si besoin)
   * @param {object} pastilles  l'outil qui affiche les petites icônes
   */
  constructor(fiche, zone, pastilles) {
    this.id = fiche.id
    this.espece = fiche.espece
    this.nom = fiche.nom
    this.zone = zone
    this.pastilles = pastilles
    this.allure = ALLURES[fiche.espece]
    this.modele = obtenirModele(fiche.espece)
    this.corps = this.modele.getObjectByName('corps')
    this.tete = this.modele.getObjectByName('tete')
    this.pattes = []
    for (let n = 0; n < 4; n++) {
      const p = this.modele.getObjectByName(`patte${n}`)
      if (p) this.pattes.push(p)
    }

    // Position de départ au hasard dans sa zone.
    this.modele.position.set(auHasard(zone.xMin, zone.xMax), 0, auHasard(zone.zMin, zone.zMax))
    this.modele.rotation.y = zone.angle ?? auHasard(-Math.PI, Math.PI)
    this.angleVise = this.modele.rotation.y

    // Zone invisible pour le toucher (plus grande que l'animal).
    const r = this.allure.rayonToucher
    const zoneToucher = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 2, 8), MATERIAU_INVISIBLE)
    zoneToucher.position.y = r
    zoneToucher.userData.toucher = { type: 'animal', animal: this }
    this.modele.add(zoneToucher)
    this.zoneToucher = zoneToucher

    this.cible = null
    this.pause = auHasard(0, 3)
    this.attention = 0 // temps pendant lequel il regarde le joueur (quand on s'occupe de lui)
    this.phase = Math.random() * 10
    this.ampleur = 0
    this.temps = Math.random() * 10
    this.iconeAffichee = undefined
  }

  get position() {
    return this.modele.position
  }

  /** Les besoins de l'animal (ventre, bonheur…), lus dans la mémoire du jeu. */
  get fiche() {
    return trouver(this.id)
  }

  /** On s'occupe de lui : il s'arrête et regarde le joueur un moment. */
  regarder(x, z) {
    this.cible = null
    this.attention = 5
    const dx = x - this.position.x
    const dz = z - this.position.z
    if (dx * dx + dz * dz > 0.01) this.angleVise = Math.atan2(dx, dz)
  }

  /** Met à jour la petite icône au-dessus de lui. */
  rafraichirIcone() {
    const fiche = this.fiche
    let icone = null
    if (fiche.produitPret) icone = infosObjet(ESPECES[this.espece].produit).icone
    else if (fiche.satiete < SOINS.seuilFaim) icone = '🌾'
    if (icone !== this.iconeAffichee) {
      this.iconeAffichee = icone
      this.pastilles.definir(this.modele, icone, this.allure.hauteurIcone)
    }
  }

  miseAJour(dt) {
    this.temps += dt
    const p = this.position
    let marche = false

    if (this.attention > 0) {
      this.attention -= dt
    } else if (this.cible) {
      // Il marche vers sa cible.
      const dx = this.cible.x - p.x
      const dz = this.cible.z - p.z
      const d = Math.hypot(dx, dz)
      const pas = this.allure.vitesse * dt
      if (d <= pas) {
        this.cible = null
        this.pause = auHasard(2, 7)
        // Certaines zones imposent une direction au repos (ex. : la vache face à l'entrée de sa stalle).
        if (this.zone.angle !== undefined) this.angleVise = this.zone.angle
      } else {
        p.x += (dx / d) * pas
        p.z += (dz / d) * pas
        this.angleVise = Math.atan2(dx, dz)
        marche = true
      }
    } else {
      // En pause ; ensuite il choisit un nouvel endroit dans sa zone.
      this.pause -= dt
      if (this.pause <= 0) {
        const z = this.zone
        this.cible = { x: auHasard(z.xMin, z.xMax), z: auHasard(z.zMin, z.zMax) }
      }
    }

    // Rotation douce.
    let ecart = this.angleVise - this.modele.rotation.y
    ecart = Math.atan2(Math.sin(ecart), Math.cos(ecart))
    this.modele.rotation.y += ecart * Math.min(1, dt * 4)

    // Pattes qui se balancent en marchant.
    this.ampleur += ((marche ? 1 : 0) - this.ampleur) * Math.min(1, dt * 6)
    if (marche) this.phase += dt * this.allure.pas
    const balancement = Math.sin(this.phase) * 0.5 * this.ampleur
    this.pattes.forEach((patte, n) => (patte.rotation.x = n % 2 === (n < 2 ? 0 : 1) ? balancement : -balancement))
    if (this.corps) this.corps.position.y = Math.abs(Math.sin(this.phase)) * 0.025 * this.ampleur

    // À l'arrêt, de temps en temps, il baisse la tête pour picorer ou brouter.
    if (this.tete) {
      const picore = !marche && this.attention <= 0 && Math.sin(this.temps * 0.9 + this.phase) > 0.4
      const vise = picore ? this.allure.teteBaissee * (0.8 + 0.2 * Math.sin(this.temps * 6)) : 0
      this.tete.rotation.x += (vise - this.tete.rotation.x) * Math.min(1, dt * 5)
    }
  }
}
