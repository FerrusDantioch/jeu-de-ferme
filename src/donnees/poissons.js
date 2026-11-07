/**
 * poissons.js — ce qu'on peut pêcher dans l'étang.
 *
 * La pêche ne rate jamais : quand ça mord, le poisson attend patiemment qu'on remonte la ligne.
 * Pour chaque prise :
 *  - chance : plus le nombre est grand, plus on en attrape souvent ;
 *  - saisons : quand on peut l'attraper (absent = toute l'année) ;
 *  - nuit : true = seulement le soir et la nuit ; false = seulement le jour ; absent = toujours ;
 *  - prix : prix de vente chez Lila ;
 *  - indice : la petite phrase du carnet tant qu'on ne l'a pas encore attrapé.
 */

export const POISSONS = {
  gardon: { nom: 'Gardon', icone: '🐟', chance: 30, prix: 6, indice: 'Le plus courant de l’étang.' },
  carpe: { nom: 'Carpe', icone: '🐡', chance: 18, prix: 9, indice: 'Toute l’année, en prenant son temps.' },
  perche: { nom: 'Perche', icone: '🐠', chance: 14, prix: 11, saisons: ['ete', 'printemps'], indice: 'Aux beaux jours.' },
  truite: { nom: 'Truite', icone: '🐟', chance: 12, prix: 14, saisons: ['printemps', 'automne'], indice: 'Au printemps et en automne.' },
  ecrevisse: { nom: 'Écrevisse', icone: '🦞', chance: 10, prix: 16, saisons: ['ete'], indice: 'Seulement en été.' },
  brochet: { nom: 'Brochet', icone: '🐟', chance: 8, prix: 22, saisons: ['hiver', 'automne'], indice: 'Quand il fait frais.' },
  poissonChat: { nom: 'Poisson-chat', icone: '🐟', chance: 12, prix: 15, nuit: true, indice: 'Il sort la nuit.' },
  anguille: { nom: 'Anguille', icone: '🐍', chance: 6, prix: 24, nuit: true, saisons: ['automne', 'ete'], indice: 'La nuit, en été et en automne.' },
  botte: { nom: 'Vieille botte', icone: '👢', chance: 4, prix: 1, indice: 'Ça arrive à tout le monde !' },
  poissonDore: { nom: 'Poisson doré', icone: '✨', chance: 1.5, prix: 60, indice: 'Très, très rare… et très brillant.' },
}

// Temps d'attente avant que ça morde (en secondes) : entre min et max. Jamais long.
export const ATTENTE_PECHE = { min: 3, max: 8 }
