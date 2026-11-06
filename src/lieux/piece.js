/**
 * piece.js — un outil pour construire une pièce intérieure (maison, étable, boutique).
 *
 * Il fabrique le sol, les murs (style « maison de poupée » : le mur de devant est bas,
 * pour bien voir à l'intérieur), la porte de sortie et son paillasson, et la grille
 * des obstacles. Il suffit ensuite d'y « placer » des meubles.
 */
import * as THREE from 'three'
import { GrilleChemin } from '../moteur/chemin.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'
import { boite, MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { PALETTE } from '../modeles/materiaux.js'

// Distance aux murs que le personnage garde (pour ne pas « rentrer » dans les murs).
const MARGE_MURS = 0.4

/**
 * @param {object} options
 *  - id : identifiant du lieu (doit correspondre au bâtiment dans src/donnees/ferme.js)
 *  - titre : nom affiché (ex. : '🏠 La maison')
 *  - largeur, profondeur : taille de la pièce en mètres
 *  - hauteur : hauteur des murs
 *  - couleurSol, couleurMur, couleurBas : couleurs
 *  - lattes : true = dessine des lattes de parquet au sol
 */
export function creerPiece({
  id, titre, largeur: l, profondeur: p, hauteur = 2.8,
  couleurSol = PALETTE.parquet, couleurMur = PALETTE.murCreme, couleurBas = PALETTE.boisFonce, lattes = true,
}) {
  const groupe = new THREE.Group()
  groupe.name = id
  const decor = new THREE.Group() // meubles (fusionnés à la fin pour aller plus vite)
  const murs = new THREE.Group() // murs (qui ne font pas d'ombre, pour garder la pièce lumineuse)
  const grille = new GrilleChemin(Math.max(l, p) + 2, 0.5)
  grille.bloquerHorsRectangle(l, p, MARGE_MURS)
  const touchables = []

  // --- Sol ---
  murs.add(boite(l + 0.4, 0.1, p + 0.4, couleurSol, 0, -0.1, 0))
  if (lattes) {
    for (let x = -l / 2 + 0.6; x < l / 2; x += 0.6) murs.add(boite(0.03, 0.005, p, PALETTE.boisFonce, x, 0, 0))
  }

  // --- Murs du fond et des côtés, avec une plinthe en bas ---
  murs.add(boite(l + 0.4, hauteur, 0.2, couleurMur, 0, 0, -p / 2 - 0.1))
  murs.add(boite(l, 0.18, 0.04, couleurBas, 0, 0, -p / 2 + 0.02))
  for (const cote of [-1, 1]) {
    murs.add(boite(0.2, hauteur, p + 0.2, couleurMur, cote * (l / 2 + 0.1), 0, -0.1))
    murs.add(boite(0.04, 0.18, p, couleurBas, cote * (l / 2 - 0.02), 0, 0))
  }

  // --- Mur de devant : bas (pour voir dedans), avec l'encadrement de la porte au milieu ---
  const lPorte = 1.4
  const lMorceau = (l - lPorte) / 2
  for (const cote of [-1, 1]) {
    murs.add(boite(lMorceau + 0.2, 0.5, 0.2, couleurMur, cote * (lPorte / 2 + lMorceau / 2 + 0.1), 0, p / 2 + 0.1))
    murs.add(boite(0.18, 2.2, 0.24, couleurBas, cote * (lPorte / 2 + 0.09), 0, p / 2 + 0.1)) // montants
  }
  murs.add(boite(lPorte + 0.36, 0.18, 0.24, couleurBas, 0, 2.2, p / 2 + 0.1)) // linteau
  // Paillasson devant la sortie.
  murs.add(boite(1.2, 0.03, 0.7, PALETTE.tapisVert, 0, 0, p / 2 - 0.45))
  murs.add(boite(1.0, 0.035, 0.5, PALETTE.paille, 0, 0, p / 2 - 0.45))

  // --- La porte de sortie ---
  const porte = {
    id: 'sortie',
    x: 0,
    z: p / 2 - 0.6,
    normale: { x: 0, z: 1 }, // direction vers la porte (vers le bas de l'écran)
    vers: 'exterieur',
    arrivee: `devant-${id}`,
    titre: '🌳 La ferme',
  }
  // Zone invisible autour de la porte et du paillasson : facile à toucher.
  const zone = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 1.6), MATERIAU_INVISIBLE)
  zone.position.set(0, 1.2, p / 2 - 0.3)
  zone.userData.toucher = { type: 'porte', porte }
  groupe.add(zone)
  touchables.push(zone)

  return {
    groupe,
    grille,
    touchables,
    porte,
    largeur: l,
    profondeur: p,

    /**
     * Place un meuble dans la pièce.
     * @param {THREE.Object3D} objet
     * @param {number} x, z position
     * @param {object} [o] { angle, obstacle: [largeur, profondeur] ou rayon, y }
     */
    placer(objet, x, z, { angle = 0, obstacle = null, y = 0 } = {}) {
      objet.position.set(x, y, z)
      objet.rotation.y = angle
      decor.add(objet)
      if (Array.isArray(obstacle)) {
        // Si le meuble est tourné d'un quart de tour, largeur et profondeur s'échangent.
        const tourne = Math.abs(Math.sin(angle)) > 0.5
        const [ol, op] = tourne ? [obstacle[1], obstacle[0]] : obstacle
        grille.bloquerRectangle(x, z, ol, op, 0.3)
      } else if (typeof obstacle === 'number') {
        grille.bloquerCercle(x, z, obstacle, 0.3)
      }
      return objet
    },

    /** Accroche un objet au mur du fond, à la hauteur y. */
    accrocherAuFond(objet, x, y) {
      objet.position.set(x, y, -p / 2 + 0.02)
      decor.add(objet)
      return objet
    },

    /** Accroche un objet sur un mur de côté (cote = -1 gauche, +1 droite). */
    accrocherSurCote(objet, cote, z, y) {
      objet.position.set(cote * (l / 2 - 0.02), y, z)
      objet.rotation.y = (-cote * Math.PI) / 2
      decor.add(objet)
      return objet
    },

    /**
     * Termine la pièce et renvoie le lieu prêt à l'emploi.
     * @param {object} extra  { pnj, animaux, ambiance, miseAJour }
     */
    terminer({ pnj = [], animaux = [], ambiance = {}, miseAJour } = {}) {
      groupe.add(fusionnerParMateriau(murs, { ombrePortee: false }))
      groupe.add(fusionnerParMateriau(decor))
      return {
        id,
        titre,
        groupe,
        grille,
        // Ambiance d'intérieur : fond brun chaud, pas de brouillard, lumière dorée.
        ambiance: { fond: 0x4a3b33, brouillard: null, ciel: 0xfff1dc, sol: 0xb08a6a, intensite: 1.8, ...ambiance },
        arrivees: { entree: { x: 0, z: p / 2 - 1.7, angle: Math.PI } },
        // La caméra reste centrée sur la pièce (pas de grand vide autour quand on longe un mur).
        limitesCamera: {
          x: Math.max(0, l / 2 - 3.5),
          z: Math.max(0, p / 2 - 3),
        },
        portes: [porte],
        touchables,
        pnj,
        animaux,
        miseAJour,
      }
    },
  }
}
