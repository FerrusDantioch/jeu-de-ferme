/**
 * cultures.js — les plantes du potager.
 *
 * Pour chaque culture :
 *  - nom / nomCourt / icone : ce qui s'affiche ;
 *  - minutes : temps pour pousser complètement, en VRAIES minutes
 *    (elle continue de pousser même quand le jeu est fermé) ;
 *  - recolte : combien on en ramasse ;
 *  - couleur / modele : apparence quand elle est prête (voir src/modeles/plantes.js).
 *
 * Arroser n'est jamais obligatoire : une plante arrosée pousse 2 fois plus vite
 * pendant un moment (voir ARROSAGE ci-dessous). Une plante oubliée ne fane jamais.
 */

export const CULTURES = {
  salade: { nom: 'Salade', nomCourt: 'salade', icone: '🥬', minutes: 4, recolte: 2, modele: 'salade' },
  carotte: { nom: 'Carotte', nomCourt: 'carotte', icone: '🥕', minutes: 8, recolte: 3, modele: 'carotte' },
  fraise: { nom: 'Fraise', nomCourt: 'fraise', icone: '🍓', minutes: 15, recolte: 4, modele: 'fraise' },
  tomate: { nom: 'Tomate', nomCourt: 'tomate', icone: '🍅', minutes: 25, recolte: 3, modele: 'tomate' },
  mais: { nom: 'Maïs', nomCourt: 'maïs', icone: '🌽', minutes: 40, recolte: 2, modele: 'mais' },
  citrouille: { nom: 'Citrouille', nomCourt: 'citrouille', icone: '🎃', minutes: 60, recolte: 1, modele: 'citrouille' },
}

export const ARROSAGE = {
  // Combien de temps la terre reste humide après un arrosage (en minutes).
  minutesHumide: 10,
  // Vitesse de pousse quand la terre est humide (2 = deux fois plus vite).
  bonus: 2,
}

// Graines reçues en plus de la récolte : au moins 1 (on n'en manque jamais), parfois 2.
export const GRAINES_RENDUES = { minimum: 1, chanceDeplus: 0.5 }

// Les graines dans le sac au tout début du jeu.
export const GRAINES_DE_DEPART = {
  salade: 3, carotte: 3, fraise: 2, tomate: 2, mais: 2, citrouille: 1,
}
