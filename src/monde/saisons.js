/**
 * saisons.js — la ferme change avec les saisons (d'après la vraie date) :
 *  - printemps : arbres en fleurs roses, quelques pétales qui volent ;
 *  - été : tout est vert, les papillons sont de sortie ;
 *  - automne : feuillage roux et doré, des feuilles qui tombent doucement ;
 *  - hiver : la neige recouvre l'herbe et les arbres, des flocons tombent.
 *
 * Les couleurs sont ici : vous pouvez les changer librement (0x + 6 chiffres/lettres).
 */
import { PALETTE } from '../modeles/materiaux.js'

export const COULEURS_SAISONS = {
  printemps: {
    sol: 0xa6dc86, feuillage: 0x7cc66a, haut: 0xf7bfd6, touffes: 0x8acb70, fleurs: true, chute: 'petales',
  },
  ete: {
    sol: PALETTE.herbe, feuillage: PALETTE.feuillage, haut: PALETTE.feuillageClair, touffes: PALETTE.herbeFoncee,
    fleurs: true, chute: null,
  },
  automne: {
    sol: 0xbfc977, feuillage: 0xe0913f, haut: 0xf2c14e, touffes: 0xa9b262, fleurs: true, chute: 'feuilles',
  },
  hiver: {
    sol: 0xe9f1f4, feuillage: 0xc9dadd, haut: 0xffffff, touffes: 0xc8d8d0, fleurs: false, chute: 'neige',
  },
}

/**
 * Habille la ferme pour une saison.
 * @param {string} saison  'printemps', 'ete', 'automne' ou 'hiver'
 * @param {object} t       { sol, feuillages, hauts, touffes, fleurs: [...] } (voir terrain.js)
 */
export function habillerSaison(saison, t) {
  const c = COULEURS_SAISONS[saison] || COULEURS_SAISONS.ete
  t.sol.material.color.set(c.sol)
  t.feuillages.material.color.set(c.feuillage)
  t.hauts.material.color.set(c.haut)
  t.touffes.material.color.set(c.touffes)
  for (const f of t.fleurs) f.visible = c.fleurs
  return c
}
