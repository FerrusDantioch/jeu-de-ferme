/**
 * commandes.js — les règles des commandes des villageois.
 *
 *  - Chaque client a au plus une commande à la fois.
 *  - Une commande n'expire jamais : aucune pénalité si on la livre tard.
 *  - On ne demande que des choses que le joueur PEUT produire
 *    (cultures débloquées à son niveau, produits des animaux qu'il possède).
 *  - Les quantités et les récompenses grandissent doucement avec le niveau.
 */
import { CLIENTS, DELAI_NOUVELLE_COMMANDE, PREMIERE_COMMANDE, RECOMPENSE } from '../donnees/commandes.js'
import { GRAINES_EN_VENTE, PRIX_DE_VENTE } from '../donnees/economie.js'
import { FRUITS } from '../donnees/vergers.js'
import { RECETTES } from '../donnees/recettes.js'
import { ESPECES } from '../donnees/animaux.js'
import { etat } from './etat.js'
import { quantite, retirer } from './inventaire.js'
import { niveau, gagnerPieces, gagnerExperience } from './economie.js'
import { annoncer } from './evenements.js'

const auHasard = (min, max) => min + Math.random() * (max - min)
const entier = (min, max) => Math.floor(auHasard(min, max + 1))

/** Ce qui peut être demandé, selon le niveau et les animaux présents. */
function articlesPossibles() {
  const n = niveau()
  const cultures = Object.entries(GRAINES_EN_VENTE).filter(([, g]) => g.niveau <= n).map(([id]) => id)
  const especes = new Set(etat.d.animaux.map((a) => a.espece))
  const produits = [...especes].map((e) => ESPECES[e].produit)
  const fruits = Object.keys(FRUITS)
  // Les plats (à partir du niveau 3), seulement si tous leurs ingrédients sont possibles.
  const possibles = new Set([...cultures, ...produits, ...fruits])
  const plats = n >= 3
    ? Object.entries(RECETTES).filter(([, r]) => Object.keys(r.ingredients).every((i) => possibles.has(i))).map(([id]) => id)
    : []
  return { cultures, produits, fruits, plats }
}

/** Calcule la récompense d'une liste d'articles. */
function recompense(articles) {
  const valeur = articles.reduce((somme, a) => somme + (PRIX_DE_VENTE[a.id] || 3) * a.n, 0)
  return {
    pieces: Math.ceil(valeur * RECOMPENSE.multiplicateur + RECOMPENSE.bonusPieces),
    experience: RECOMPENSE.bonusExperience + articles.length * 3 + Math.floor(valeur / 5),
  }
}

/** Invente une nouvelle commande. */
function inventerCommande() {
  const n = niveau()
  const { cultures, produits, fruits, plats } = articlesPossibles()
  // Un plat est demandé de temps en temps seulement (une commande sur quatre).
  const choix = [...cultures, ...produits, ...fruits, ...(Math.random() < 0.25 ? plats : [])]
  // 1 article au début, parfois 2 à partir du niveau 3, parfois 3 à partir du niveau 5.
  let nbArticles = 1
  if (n >= 3 && Math.random() < 0.5) nbArticles++
  if (n >= 5 && Math.random() < 0.4) nbArticles++
  nbArticles = Math.min(nbArticles, choix.length)
  const articles = []
  while (articles.length < nbArticles) {
    const id = choix[Math.floor(Math.random() * choix.length)]
    if (articles.some((a) => a.id === id)) continue
    const estProduit = produits.includes(id)
    let max = estProduit ? 1 + (n >= 4 ? 1 : 0) : Math.min(6, 2 + Math.floor(n / 3))
    if (fruits.includes(id)) max = Math.min(3, max)
    if (plats.includes(id)) max = 1
    articles.push({ id, n: entier(1, max) })
  }
  return { articles, ...recompense(articles) }
}

/**
 * À appeler régulièrement : les clients dont c'est le moment passent commande.
 * Renvoie la liste des clients qui viennent de passer une nouvelle commande.
 */
export function mettreAJour(maintenant = Date.now()) {
  const d = etat.d
  const nouveaux = []
  for (const client of CLIENTS) {
    if (d.commandes[client.id]) continue
    const quand = d.prochainesCommandes[client.id] ?? maintenant
    if (maintenant < quand) continue
    if (!d.premiereCommandeFaite && client.id === PREMIERE_COMMANDE.client) {
      d.commandes[client.id] = { articles: PREMIERE_COMMANDE.articles.map((a) => ({ ...a })), ...recompense(PREMIERE_COMMANDE.articles) }
      d.premiereCommandeFaite = true
    } else {
      d.commandes[client.id] = inventerCommande()
    }
    nouveaux.push(client.id)
  }
  if (nouveaux.length) etat.signaler()
  return nouveaux
}

/** La commande en cours d'un client (ou null). */
export function commandeDe(idClient) {
  return etat.d.commandes[idClient] || null
}

/** Toutes les commandes en cours : [[idClient, commande], …] */
export function commandesEnCours() {
  return CLIENTS.map((c) => [c.id, etat.d.commandes[c.id]]).filter(([, c]) => c)
}

/** Vrai si on a tout ce qu'il faut dans le sac pour livrer. */
export function peutLivrer(idClient) {
  const c = commandeDe(idClient)
  return !!c && c.articles.every((a) => quantite(a.id) >= a.n)
}

/** Combien d'un objet sont demandés en tout dans les commandes (pour ne pas tout vendre). */
export function quantiteDemandee(id) {
  return commandesEnCours().reduce((s, [, c]) => s + c.articles.filter((a) => a.id === id).reduce((t, a) => t + a.n, 0), 0)
}

/**
 * Livre une commande. Renvoie la récompense { pieces, experience } ou null si impossible.
 */
export function livrer(idClient, maintenant = Date.now()) {
  if (!peutLivrer(idClient)) return null
  const c = commandeDe(idClient)
  for (const a of c.articles) retirer(a.id, a.n)
  delete etat.d.commandes[idClient]
  const delai = auHasard(DELAI_NOUVELLE_COMMANDE.min, DELAI_NOUVELLE_COMMANDE.max)
  etat.d.prochainesCommandes[idClient] = maintenant + delai * 60000
  etat.d.stats.commandesLivrees++
  gagnerPieces(c.pieces)
  gagnerExperience(c.experience)
  annoncer('livrer', { client: idClient })
  return { pieces: c.pieces, experience: c.experience }
}
