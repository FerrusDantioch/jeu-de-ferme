/**
 * personnage.js — le personnage du joueur.
 *
 * Il reprend tout ce que sait faire un « marcheur » (voir marcheur.js) et ajoute
 * le déplacement direct au clavier (et plus tard au joystick).
 *
 * Deux façons de le diriger :
 *  - allerVers(point) : il calcule un chemin et le suit tout seul (toucher l'écran) ;
 *  - deplacerDirection(dx, dz) : il avance dans une direction (clavier).
 */
import { obtenirModele } from '../modeles/index.js'
import { PERSONNAGE } from '../config.js'
import { Marcheur } from './marcheur.js'

export class Personnage extends Marcheur {
  constructor(scene, grille) {
    super(obtenirModele('personnage'), grille, PERSONNAGE.vitesse)
    scene.add(this.modele)

    // La porte vers laquelle il marche (si on a touché un bâtiment), sinon null.
    this.porteVisee = null
    // Le siège vers lequel il marche pour s'asseoir, sinon null.
    this.siegeVise = null
  }

  /**
   * Avance dans une direction (dx, dz entre -1 et 1) pendant dt secondes.
   * Si un obstacle bloque, le personnage « glisse » le long de lui.
   */
  deplacerDirection(dx, dz, dt) {
    if (this.assis) this.seLever() // bouger fait se relever
    this.chemin = [] // le clavier reprend la main : on oublie le chemin en cours
    this.porteVisee = null
    this.siegeVise = null
    const pas = this.vitesse * dt
    const p = this.position
    const essais = [
      [p.x + dx * pas, p.z + dz * pas], // tout droit
      [p.x + dx * pas, p.z], // seulement de côté
      [p.x, p.z + dz * pas], // seulement en avant / arrière
    ]
    // Sécurité : s'il se trouve dans une case « obstacle » (ex. : coincé contre un meuble),
    // on le laisse bouger quand même pour qu'il puisse toujours en sortir.
    const ici = this.grille.versCase(p.x, p.z)
    const coince = !this.grille.estLibre(ici.i, ici.j)
    for (const [x, z] of essais) {
      const c = this.grille.versCase(x, z)
      if (coince || this.grille.estLibre(c.i, c.j)) {
        p.x = x
        p.z = z
        break
      }
    }
    this.angleVise = Math.atan2(dx, dz)
    this._marcheCeTour = true
  }
}
