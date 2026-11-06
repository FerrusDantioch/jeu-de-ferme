/**
 * exterieur.js — le lieu « La ferme » (dehors).
 *
 * Il assemble : le terrain, les bâtiments, l'enclos, le potager, l'étang, le puits,
 * les bancs, les panneaux, les fleurs et les villageois qui se promènent.
 * Le plan (où est quoi) se trouve dans src/donnees/ferme.js.
 *
 * Chaque lieu du jeu renvoie le même genre d'objet (voir la fin de ce fichier) :
 * c'est ce qui permet au gestionnaire de lieux de passer de l'un à l'autre.
 */
import * as THREE from 'three'
import { MONDE, COULEUR_FOND } from '../config.js'
import { GrilleChemin } from '../moteur/chemin.js'
import { creerTerrain, semerFleurs } from '../monde/terrain.js'
import { obtenirModele } from '../modeles/index.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'
import { creerPuits, creerBanc, creerPanneau, creerEtang, creerEnclos, creerPotager } from '../modeles/decor.js'
import {
  BATIMENTS, POINT_DE_DEPART, ENCLOS, POTAGER, ETANG, PUITS, BANCS, PANNEAUX,
} from '../donnees/ferme.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'

// Distance entre la façade et le point où l'on se tient pour passer la porte.
const RECUL_PORTE = 0.9
// Distance supplémentaire où l'on réapparaît en sortant (pour ne pas re-rentrer aussitôt).
const RECUL_SORTIE = 1.1

export function creerLieu(outils) {
  const groupe = new THREE.Group()
  groupe.name = 'exterieur'
  const grille = new GrilleChemin(MONDE.taille, MONDE.tailleCase)
  creerTerrain(groupe, grille)

  const portes = []
  const touchables = []
  const maisons = {} // pour les villageois : où se trouve la porte de chaque maison
  const arrivees = { depart: { x: POINT_DE_DEPART.x, z: POINT_DE_DEPART.z, angle: 0 } }

  // --- Les bâtiments ---
  for (const b of BATIMENTS) {
    const modele = fusionnerParMateriau(obtenirModele(b.modele, b))
    modele.position.set(b.x, 0, b.z)
    groupe.add(modele)
    grille.bloquerRectangle(b.x, b.z, b.largeur, b.profondeur, 0.35)

    // Le point devant la porte (au milieu de la façade avant).
    const devant = { x: b.x, z: b.z + b.profondeur / 2 + RECUL_PORTE }
    maisons[b.id] = devant

    if (b.interieur) {
      const porte = {
        id: b.id,
        x: devant.x,
        z: devant.z,
        normale: { x: 0, z: -1 }, // direction vers la porte (vers le fond de l'écran)
        vers: b.interieur,
        arrivee: 'entree',
        titre: b.titre,
      }
      portes.push(porte)
      arrivees[`devant-${b.id}`] = { x: devant.x, z: devant.z + RECUL_SORTIE, angle: 0 }
      modele.userData.toucher = { type: 'porte', porte }
    } else {
      modele.userData.toucher = { type: 'info', texte: b.texte, x: devant.x, z: devant.z }
    }
    touchables.push(modele)
  }

  // --- L'enclos (vide pour l'instant) ---
  const enclos = fusionnerParMateriau(creerEnclos(ENCLOS.largeur, ENCLOS.profondeur, ENCLOS.ouverture))
  enclos.position.set(ENCLOS.x, 0, ENCLOS.z)
  groupe.add(enclos)
  {
    const { x, z, largeur: l, profondeur: p, ouverture: o } = ENCLOS
    const e = 0.2 // épaisseur d'une barrière
    const marge = 0.3
    grille.bloquerRectangle(x, z - p / 2, l, e, marge) // fond
    grille.bloquerRectangle(x, z + p / 2, l, e, marge) // devant
    grille.bloquerRectangle(x + l / 2, z, e, p, marge) // droite
    const morceau = (p - o) / 2 // gauche : deux morceaux, l'ouverture au milieu
    grille.bloquerRectangle(x - l / 2, z - p / 2 + morceau / 2, e, morceau, marge)
    grille.bloquerRectangle(x - l / 2, z + p / 2 - morceau / 2, e, morceau, marge)
    grille.bloquerRectangle(x + l / 2 - 1.2, z - p / 2 + 0.6, 1.4, 0.5, marge) // abreuvoir
  }

  // --- Le potager (vide pour l'instant ; on peut marcher dessus) ---
  const potager = fusionnerParMateriau(creerPotager(POTAGER.largeur, POTAGER.profondeur), { ombrePortee: false })
  potager.position.set(POTAGER.x, 0, POTAGER.z)
  groupe.add(potager)

  // --- L'étang, le puits, les bancs, les panneaux ---
  const etang = fusionnerParMateriau(creerEtang(ETANG.rayon), { ombrePortee: false })
  etang.position.set(ETANG.x, 0, ETANG.z)
  groupe.add(etang)
  grille.bloquerCercle(ETANG.x, ETANG.z, ETANG.rayon, 0.3)

  const puits = fusionnerParMateriau(creerPuits())
  puits.position.set(PUITS.x, 0, PUITS.z)
  groupe.add(puits)
  grille.bloquerCercle(PUITS.x, PUITS.z, 0.75, 0.35)

  for (const b of BANCS) {
    const banc = fusionnerParMateriau(creerBanc())
    banc.position.set(b.x, 0, b.z)
    banc.rotation.y = b.angle
    groupe.add(banc)
    const tourne = Math.abs(Math.sin(b.angle)) > 0.5
    grille.bloquerRectangle(b.x, b.z, tourne ? 0.5 : 1.6, tourne ? 1.6 : 0.5, 0.25)
  }

  for (const p of PANNEAUX) {
    const panneau = fusionnerParMateriau(creerPanneau(p.texte, p.largeur))
    panneau.position.set(p.x, 0, p.z)
    groupe.add(panneau)
    grille.bloquerCercle(p.x, p.z, 0.1, 0.3)
  }

  // --- Les fleurs (après les obstacles, pour ne pas en semer dans les murs) ---
  semerFleurs(groupe, grille)

  // --- Les villageois qui vivent dehors ---
  const pnj = creerPnjDuLieu('exterieur', { groupe, grille, touchables, bulles: outils.bulles, maisons })

  return {
    id: 'exterieur',
    titre: '🌳 La ferme',
    groupe,
    grille,
    // Ambiance : ciel bleu pâle, brouillard léger au loin, lumière du jour.
    ambiance: { fond: COULEUR_FOND, brouillard: [30, 70], ciel: 0xfffbf0, sol: 0x8fbf7a, intensite: 1.6 },
    arrivees,
    portes,
    touchables,
    pnj,
  }
}
