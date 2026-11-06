/**
 * modeles/index.js — le « catalogue » des modèles 3D du jeu.
 *
 * Aujourd'hui, chaque modèle est fabriqué par du code (formes simples).
 * Plus tard, on pourra remplacer un modèle par un vrai fichier 3D (.glb) :
 *   1. déposer le fichier dans public/modeles/ (ex. : public/modeles/maison.glb) ;
 *   2. indiquer son nom dans FICHIERS_GLB ci-dessous.
 * Le reste du jeu ne verra aucune différence : il demande toujours « obtenirModele('maison') ».
 */
import { creerModelePersonnage } from './personnage.js'
import { creerMaison, creerEtable, creerBoutique, creerChaumiere } from './batiments.js'
import { creerPoule, creerVache, creerMouton } from './animaux.js'
import { creerPlante } from './plantes.js'
import { PALETTE } from './materiaux.js'

// Modèles fabriqués par code. « options » permet de les personnaliser (couleurs, tailles…).
const FABRIQUES = {
  personnage: (options) => creerModelePersonnage(options),
  maison: (options) => creerMaison(options),
  etable: (options) => creerEtable(options),
  boutique: (options) => creerBoutique(options),
  chaumiere: (options) =>
    creerChaumiere({ ...options, couleurToit: PALETTE[options?.couleurToit] ?? PALETTE.toitBleu }),
  poule: () => creerPoule(),
  vache: () => creerVache(),
  mouton: () => creerMouton(),
  // options : { modele: 'carotte', stade: 0 à 3 }
  plante: (options) => creerPlante(options.modele, options.stade),
}

// Modèles à charger depuis un fichier .glb (vide pour l'instant).
// Exemple futur : { maison: 'modeles/maison.glb' }
export const FICHIERS_GLB = {}

/**
 * Renvoie un nouvel exemplaire du modèle demandé.
 * (Le chargement des .glb sera ajouté le jour où on en aura besoin.)
 */
export function obtenirModele(nom, options = {}) {
  const fabrique = FABRIQUES[nom]
  if (!fabrique) throw new Error(`Modèle inconnu : « ${nom} »`)
  return fabrique(options)
}
