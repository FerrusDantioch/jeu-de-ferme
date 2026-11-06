/**
 * animaux.js — les animaux de la ferme.
 *
 * Les animaux NE MEURENT JAMAIS et ne tombent jamais malades.
 * S'ils ont faim ou s'ennuient, ils arrêtent simplement de produire,
 * jusqu'à ce qu'on s'occupe d'eux. Tout se calcule en temps réel,
 * même quand le jeu est fermé (mais doucement : rien ne presse).
 *
 * Pour chaque espèce :
 *  - nourritures : ce qu'elle mange (la 1re est la nourriture de base, gratuite) ;
 *  - friandise : ce qu'elle adore (rend plus heureux) ;
 *  - produit / minutesProduction : ce qu'elle donne, et tous les combien ;
 *  - heuresPourAvoirFaim : temps pour passer de « ventre plein » à « vide » ;
 *  - heuresPourSEnnuyer : temps pour passer de « aux anges » à « besoin de câlins ».
 */

export const ESPECES = {
  poule: {
    nom: 'Poule',
    icone: '🐔',
    nourritures: ['grain', 'mais'],
    friandise: 'mais',
    produit: 'oeuf',
    minutesProduction: 6,
    heuresPourAvoirFaim: 6,
    heuresPourSEnnuyer: 12,
  },
  vache: {
    nom: 'Vache',
    icone: '🐄',
    nourritures: ['foin', 'carotte'],
    friandise: 'carotte',
    produit: 'lait',
    minutesProduction: 12,
    heuresPourAvoirFaim: 8,
    heuresPourSEnnuyer: 12,
  },
  mouton: {
    nom: 'Mouton',
    icone: '🐑',
    nourritures: ['foin', 'salade'],
    friandise: 'salade',
    produit: 'laine',
    minutesProduction: 20,
    heuresPourAvoirFaim: 8,
    heuresPourSEnnuyer: 12,
  },
}

export const SOINS = {
  // Un repas remplit le ventre de… (sur 100).
  repas: 40,
  // Bonheur gagné en mangeant (et en plus avec une friandise).
  bonheurRepas: 5,
  bonheurFriandise: 15,
  // Bonheur gagné avec une caresse.
  caresse: 15,
  // En dessous de ce niveau (sur 100), l'animal ne produit plus (mais va très bien sinon).
  seuilProduction: 20,
  // En dessous de ce niveau, une petite icône 🌾 montre qu'il aimerait manger.
  seuilFaim: 35,
}

// Les animaux présents au début du jeu.
// lieu : 'exterieur' (dans l'enclos) ou 'etable' (dans une stalle : place 0, 1 ou 2).
export const ANIMAUX_DE_DEPART = [
  { id: 'poule-1', espece: 'poule', nom: 'Cocotte', lieu: 'exterieur' },
  { id: 'poule-2', espece: 'poule', nom: 'Pâquerette', lieu: 'exterieur' },
  { id: 'poule-3', espece: 'poule', nom: 'Noisette', lieu: 'exterieur' },
  { id: 'mouton-1', espece: 'mouton', nom: 'Nuage', lieu: 'exterieur' },
  { id: 'mouton-2', espece: 'mouton', nom: 'Flocon', lieu: 'exterieur' },
  { id: 'vache-1', espece: 'vache', nom: 'Marguerite', lieu: 'etable', place: 0 },
  { id: 'vache-2', espece: 'vache', nom: 'Caramel', lieu: 'etable', place: 2 },
]

// Quantité prise d'un coup dans une réserve de nourriture (gratuite et sans limite).
export const PRISE_RESERVE = 5
