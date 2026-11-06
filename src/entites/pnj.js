/**
 * pnj.js — un villageois (PNJ = « personnage non joueur »).
 *
 * Sa petite vie, en boucle :
 *  1. il choisit un endroit de sa promenade et y marche tranquillement ;
 *  2. il fait une pause (et dit parfois quelque chose) ;
 *  3. de temps en temps, il rentre chez lui, y reste un moment, puis ressort.
 *
 * Quand on passe près de lui, il dit bonjour. Quand on le touche, il s'arrête,
 * se tourne vers nous et nous parle. Il ne bloque jamais le passage.
 *
 * Les villageois « fixes » (ex. : la marchande) restent à leur place.
 */
import * as THREE from 'three'
import { obtenirModele } from '../modeles/index.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { Marcheur } from './marcheur.js'

// Distance (en mètres) à laquelle un villageois remarque le joueur et le salue.
const DISTANCE_SALUT = 2.6
// Temps minimum (en secondes) entre deux saluts au joueur : il ne répète pas sans arrêt.
const DELAI_ENTRE_SALUTS = 45
// Chance de rentrer à la maison à chaque nouvelle balade (0.2 = une fois sur cinq).
const CHANCE_RENTRER = 0.2

// Nombre au hasard entre min et max.
const auHasard = (min, max) => min + Math.random() * (max - min)

export class PNJ extends Marcheur {
  /**
   * @param {object} donnees   la fiche du villageois (voir src/donnees/pnj.js)
   * @param {GrilleChemin} grille
   * @param {object} outils    { bulles, maisons } — maisons : { id: {x, z} devant la porte }
   */
  constructor(donnees, grille, { bulles, maisons = {} }) {
    super(obtenirModele('personnage', donnees.apparence), grille, donnees.vitesse || 1.8)
    this.donnees = donnees
    this.nom = donnees.nom
    this.bulles = bulles
    this.maison = donnees.maison ? maisons[donnees.maison] : null
    this.hauteurBulle = 1.75 * (donnees.apparence?.taille || 1)

    const [x, z] = donnees.depart
    this.angleDepart = 0 // tourné vers la caméra
    this.placer(x, z, this.angleDepart)

    // Zone invisible autour de lui, plus grande que lui : facile à toucher du doigt.
    const zone = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 8), MATERIAU_INVISIBLE)
    zone.position.y = 0.9
    zone.userData.toucher = { type: 'pnj', pnj: this }
    this.modele.add(zone)
    this.zoneToucher = zone

    // État de sa petite vie.
    this.etat = 'pause' // 'pause', 'marche' ou 'chezSoi'
    this.minuteur = auHasard(1, 4)
    this.destination = null
    this.versMaison = false
    this.ecoute = 0 // temps restant pendant lequel il discute avec le joueur
    this.depuisSalut = DELAI_ENTRE_SALUTS // prêt à saluer dès le début
    this.dernierePhrase = -1
    this.dernierPoint = -1

    this.surArrivee = () => this._arrive()
  }

  /** Vrai s'il est visible (pas rentré chez lui). */
  get present() {
    return this.modele.visible
  }

  /** Dit quelque chose dans une bulle au-dessus de sa tête. */
  dire(texte) {
    this.bulles.dire(this.modele, texte, { nom: this.nom, hauteur: this.hauteurBulle })
  }

  /** Choisit une phrase au hasard (jamais deux fois la même d'affilée). */
  _phraseAuHasard(liste) {
    if (liste.length === 1) return liste[0]
    let n
    do n = Math.floor(Math.random() * liste.length)
    while (n === this.dernierePhrase)
    this.dernierePhrase = n
    return liste[n]
  }

  /**
   * Le joueur le touche : il s'arrête, se tourne vers lui et parle.
   * @param {string} [texteImpose]  ce qu'il doit dire (sinon : une phrase au hasard)
   * @returns {boolean} vrai s'il a pu parler
   */
  parlerAvec(joueur, texteImpose) {
    if (!this.present) return false
    this.arreter()
    this.ecoute = 5
    this.regarderVers(joueur.position.x, joueur.position.z)
    this.dire(texteImpose || this._phraseAuHasard(this.donnees.phrases))
    this.depuisSalut = 0
    return true
  }

  miseAJour(dt, joueur) {
    super.miseAJour(dt)
    this.depuisSalut += dt

    // --- Rentré chez lui : il attend avant de ressortir ---
    if (this.etat === 'chezSoi') {
      this.minuteur -= dt
      if (this.minuteur <= 0) this._sortir()
      return
    }

    const distanceJoueur = this.distanceA(joueur.position)

    // --- En pleine discussion avec le joueur ---
    if (this.ecoute > 0) {
      this.ecoute -= dt
      this.regarderVers(joueur.position.x, joueur.position.z)
      if (this.ecoute <= 0 && !this.donnees.fixe) {
        // Il reprend sa balade là où il l'avait laissée.
        if (this.destination && this.allerVers(this.destination)) this.etat = 'marche'
        else this._pause(2, 4)
      }
      return
    }

    // --- Le joueur passe tout près : il dit bonjour ---
    if (distanceJoueur < DISTANCE_SALUT && this.depuisSalut > DELAI_ENTRE_SALUTS) {
      this.depuisSalut = 0
      this.dire(this._phraseAuHasard(this.donnees.salutations))
      if (!this.enRoute) {
        this.regarderVers(joueur.position.x, joueur.position.z)
        this.minuteur = Math.max(this.minuteur, 3)
      }
    }

    // --- Villageois fixe : il regarde le joueur s'il est proche, sinon devant lui ---
    if (this.donnees.fixe) {
      if (distanceJoueur < 4) this.regarderVers(joueur.position.x, joueur.position.z)
      else this.angleVise = this.angleDepart
      return
    }

    // --- En pause : quand le minuteur est fini, il repart ---
    if (this.etat === 'pause') {
      this.minuteur -= dt
      if (this.minuteur <= 0) this._choisirDestination()
    }

    this._joueurProche = distanceJoueur < 9
  }

  _pause(min, max) {
    this.etat = 'pause'
    this.minuteur = auHasard(min, max)
  }

  _choisirDestination() {
    const promenade = this.donnees.promenade || []
    this.versMaison = false
    if (this.maison && Math.random() < CHANCE_RENTRER) {
      this.versMaison = true
      this.destination = new THREE.Vector3(this.maison.x, 0, this.maison.z)
    } else if (promenade.length > 0) {
      let n
      do n = Math.floor(Math.random() * promenade.length)
      while (promenade.length > 1 && n === this.dernierPoint)
      this.dernierPoint = n
      this.destination = new THREE.Vector3(promenade[n][0], 0, promenade[n][1])
    } else {
      this._pause(5, 10)
      return
    }
    if (this.allerVers(this.destination)) this.etat = 'marche'
    else this._pause(2, 4) // chemin impossible : il réessaiera un peu plus tard
  }

  _arrive() {
    if (this.ecoute > 0) return
    if (this.versMaison) {
      this._rentrer()
      return
    }
    this._pause(3, 8)
    // Parfois, il dit quelque chose tout seul (seulement si le joueur est dans les parages).
    if (this._joueurProche && Math.random() < 0.3) this.dire(this._phraseAuHasard(this.donnees.phrases))
  }

  _rentrer() {
    this.etat = 'chezSoi'
    this.minuteur = auHasard(15, 30)
    this.modele.visible = false
    this.bulles.retirer(this.modele)
  }

  _sortir() {
    this.placer(this.maison.x, this.maison.z, 0)
    this.modele.visible = true
    this.versMaison = false
    this.destination = null
    this._pause(1.5, 3)
  }
}
