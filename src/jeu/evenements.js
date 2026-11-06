/**
 * evenements.js — un petit « haut-parleur » : quand le joueur fait quelque chose
 * (récolter, nourrir, livrer…), on l'annonce ici. Les quêtes écoutent ces annonces
 * pour avancer, sans que le potager ou les animaux aient besoin de les connaître.
 */

const auditeurs = new Set()

/** Annonce une action : type (ex. 'recolter') et détails éventuels. */
export function annoncer(type, details = {}) {
  for (const f of auditeurs) f(type, details)
}

/** Écoute toutes les annonces. */
export function ecouterActions(fonction) {
  auditeurs.add(fonction)
}
