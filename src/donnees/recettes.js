/**
 * recettes.js — ce qu'on peut cuisiner dans la cuisine de la maison.
 *
 * Pour chaque recette : son nom, son icône, les ingrédients ({ objet: quantité })
 * et son prix de vente chez Lila (toujours plus que les ingrédients vendus à part).
 * Cuisiner est instantané : pas de minuteur, rien ne brûle jamais. 🍳
 */

export const RECETTES = {
  saladeComposee: { nom: 'Salade composée', icone: '🥗', ingredients: { salade: 2, tomate: 1 }, prix: 22 },
  omelette: { nom: 'Omelette', icone: '🍳', ingredients: { oeuf: 2, lait: 1 }, prix: 26 },
  soupe: { nom: 'Soupe de légumes', icone: '🍲', ingredients: { carotte: 2, tomate: 1, salade: 1 }, prix: 28 },
  confiture: { nom: 'Confiture de fraises', icone: '🍯', ingredients: { fraise: 4 }, prix: 24 },
  jus: { nom: 'Jus de fruits', icone: '🧃', ingredients: { poire: 2, peche: 1 }, prix: 24 },
  popcorn: { nom: 'Pop-corn', icone: '🍿', ingredients: { mais: 2 }, prix: 36 },
  tarte: { nom: 'Tarte aux pommes', icone: '🥧', ingredients: { pomme: 3, oeuf: 1, lait: 1 }, prix: 42 },
  clafoutis: { nom: 'Clafoutis aux cerises', icone: '🍮', ingredients: { cerise: 4, oeuf: 2, lait: 1 }, prix: 56 },
  gateau: { nom: 'Gâteau à la carotte', icone: '🍰', ingredients: { carotte: 3, oeuf: 2, lait: 1 }, prix: 46 },
  poissonGrille: { nom: 'Poisson grillé aux herbes', icone: '🍤', ingredients: { gardon: 2, salade: 1 }, prix: 26 },
  veloute: { nom: 'Velouté de citrouille', icone: '🥣', ingredients: { citrouille: 1, lait: 1 }, prix: 62 },
}
