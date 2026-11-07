/**
 * compagnons.js — le chat ou le chien qui accompagne le personnage partout.
 *
 * On l'adopte gratuitement chez Lila (boutique), puis on change son nom et son pelage
 * dans la fenêtre 👤 « Mon personnage ». Il suit le personnage, s'assoit à côté de lui,
 * et adore les caresses. Les textes et couleurs sont modifiables librement.
 */

export const ESPECES_COMPAGNONS = {
  chat: {
    nom: 'Chat',
    icone: '🐱',
    nomParDefaut: 'Minou',
    // Ce qu'il « dit » quand on le caresse ou qu'on joue avec lui.
    caresses: ['Ronron… 💕', 'Miaou ! 😺', 'Prrrr… 💕'],
    jeux: ['Miaou ! 🧶', 'Hop ! 😸'],
  },
  chien: {
    nom: 'Chien',
    icone: '🐶',
    nomParDefaut: 'Filou',
    caresses: ['Wouf ! 💕', 'Ouaf ouaf ! 🐾', '*remue la queue* 💕'],
    jeux: ['Wouf wouf ! 🎾', 'Hop ! 🐾'],
  },
}

// Les pelages : couleur principale et couleur du ventre / du museau.
export const PELAGES = [
  { id: 'roux', nom: 'Roux', couleur: 0xe39a5a, couleur2: 0xfbe6cf },
  { id: 'creme', nom: 'Crème', couleur: 0xf2dcb4, couleur2: 0xffffff },
  { id: 'brun', nom: 'Brun', couleur: 0x8a5a3b, couleur2: 0xe3c193 },
  { id: 'gris', nom: 'Gris', couleur: 0x9aa0a8, couleur2: 0xe6e8ea },
  { id: 'noir', nom: 'Noir', couleur: 0x3a3536, couleur2: 0xf0ece6 },
  { id: 'blanc', nom: 'Blanc', couleur: 0xf7f4ee, couleur2: 0xf4c6c6 },
]
