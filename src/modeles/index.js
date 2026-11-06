/**
 * modeles/index.js — le « catalogue » des modèles 3D du jeu.
 *
 * Aujourd'hui, chaque modèle est fabriqué par du code (formes simples).
 * Plus tard, on pourra remplacer un modèle par un vrai fichier 3D (.glb) :
 *   1. déposer le fichier dans public/modeles/ (ex. : public/modeles/personnage.glb) ;
 *   2. indiquer son nom dans FICHIERS_GLB ci-dessous.
 * Le reste du jeu ne verra aucune différence : il demande toujours « obtenirModele('personnage') ».
 */
import { creerModelePersonnage } from './personnage.js'

// Modèles fabriqués par code.
const FABRIQUES = {
  personnage: creerModelePersonnage,
}

// Modèles à charger depuis un fichier .glb (vide pour l'instant).
// Exemple futur : { personnage: 'modeles/personnage.glb' }
export const FICHIERS_GLB = {}

/**
 * Renvoie un nouvel exemplaire du modèle demandé.
 * (Le chargement des .glb sera ajouté le jour où on en aura besoin.)
 */
export function obtenirModele(nom) {
  const fabrique = FABRIQUES[nom]
  if (!fabrique) throw new Error(`Modèle inconnu : « ${nom} »`)
  return fabrique()
}
