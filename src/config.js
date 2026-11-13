/**
 * config.js — LE fichier des réglages généraux du jeu.
 *
 * 👉 Pour changer le nom du jeu, il suffit de modifier NOM_DU_JEU ci-dessous.
 *    (Le nom affiché dans l'onglet, dans l'écran d'accueil et dans l'application
 *    installée sur le téléphone vient d'ici.)
 */

// Nom du jeu (provisoire) — à changer ici uniquement.
export const NOM_DU_JEU = 'La Petite Ferme'

// Nom court : utilisé sous l'icône du téléphone (12 caractères maximum conseillé).
export const NOM_COURT = 'Petite Ferme'

// Auteur affiché dans l'écran « À propos » (pseudonyme uniquement).
export const AUTEUR = 'Ferrus Dantioch'

// Adresse de contact et site de l'Omni-système (affichés dans « À propos »).
export const CONTACT = 'omni-systeme.choking513@passmail.net'
export const SITE_OMNI = 'https://ferrusdantioch.github.io/omni-systeme/'

// Couleurs principales (utilisées aussi pour l'icône et la barre du téléphone).
export const COULEUR_THEME = '#7cc47a'
export const COULEUR_FOND = '#cdeaf7'

/**
 * Réglages techniques de performance.
 * Ils servent à garder le jeu fluide sur un téléphone de milieu de gamme.
 */
export const PERFORMANCE = {
  // Nombre maximal de « pixels physiques » par pixel d'écran.
  // Les téléphones récents ont des écrans très denses (3 ou plus) :
  // on plafonne pour ne pas faire travailler la carte graphique pour rien.
  plafondDensitePixels: 1.5,
  // Ombres activées par défaut (pourra être coupé dans les réglages plus tard).
  ombres: true,
  // Taille de la « photo » utilisée pour calculer les ombres (plus petit = plus rapide).
  tailleCarteOmbres: 1024,
}

/**
 * Réglages du terrain et du déplacement.
 */
export const MONDE = {
  // Taille du terrain en mètres (carré de TAILLE x TAILLE).
  taille: 40,
  // Taille d'une case de la grille invisible qui sert à trouver le chemin.
  tailleCase: 0.5,
}

export const PERSONNAGE = {
  // Vitesse de marche en mètres par seconde (calme, pas trop rapide).
  vitesse: 3.2,
  // Rayon du personnage : sert à garder une petite distance avec les obstacles.
  rayon: 0.35,
}
