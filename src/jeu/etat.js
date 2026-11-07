/**
 * etat.js — « la mémoire » du jeu : tout ce qu'il faut retenir d'une partie.
 *
 *  - les pièces, l'expérience (⭐) ;
 *  - le contenu du sac (inventaire) ;
 *  - les commandes des villageois ;
 *  - les parcelles du potager (ce qui y pousse, depuis quand) ;
 *  - les animaux (ventre, bonheur, production) ;
 *  - où se trouve le personnage.
 *
 * C'est cet objet qui est sauvegardé sur le téléphone (voir sauvegarde.js).
 * Quand quelque chose change, on appelle etat.signaler() : l'interface se met
 * à jour et la sauvegarde automatique sait qu'il y a du nouveau.
 */
import { GRAINES_DE_DEPART } from '../donnees/cultures.js'
import { ANIMAUX_DE_DEPART } from '../donnees/animaux.js'
import { POTAGER } from '../donnees/ferme.js'
import { PIECES_DE_DEPART } from '../donnees/economie.js'
import { CLIENTS } from '../donnees/commandes.js'
import { APPARENCE_DE_DEPART } from '../donnees/apparence.js'

// Numéro de version du format de sauvegarde (à augmenter si on change sa forme).
export const VERSION_SAUVEGARDE = 1

/** Une parcelle vide. */
function parcelleVide() {
  return { culture: null, progression: 0, derniereMaj: 0, humideJusqua: 0 }
}

/** Les données d'une toute nouvelle partie. */
export function nouvellePartie(maintenant = Date.now()) {
  const inventaire = { foin: 10, grain: 10 }
  for (const [culture, n] of Object.entries(GRAINES_DE_DEPART)) inventaire[`graine-${culture}`] = n
  return {
    version: VERSION_SAUVEGARDE,
    creeLe: maintenant,
    inventaire,
    parcelles: Array.from({ length: POTAGER.colonnes * POTAGER.rangees }, parcelleVide),
    animaux: ANIMAUX_DE_DEPART.map((a) => ({
      ...a,
      satiete: 70, // ventre : 100 = plein, 0 = vide
      bonheur: 70, // 100 = aux anges
      production: 0, // secondes écoulées vers le prochain produit
      produitPret: false,
      derniereMaj: maintenant,
    })),
    joueur: null, // { lieu, x, z } : rempli à la première sauvegarde
    // Le prénom et l'apparence du personnage (fenêtre 👤 « Mon personnage »).
    perso: { nom: '', apparence: { ...APPARENCE_DE_DEPART }, choisi: false },
    pieces: PIECES_DE_DEPART,
    experience: 0,
    // Commandes en cours : { idClient: { articles: [{ id, n }], pieces, experience } }
    commandes: {},
    // Quand chaque client passera sa prochaine commande (heure, en millisecondes).
    prochainesCommandes: Object.fromEntries(CLIENTS.map((c) => [c.id, maintenant + c.premiereCommande * 60000])),
    premiereCommandeFaite: false,
    // Quêtes du jour : { jour: '2026-12-24', liste: [...] } (tirées à minuit).
    quetes: { jour: null, liste: [] },
    // Chasse aux œufs de Pâques : œufs trouvés aujourd'hui.
    oeufsDePaques: { jour: null, trouves: [] },
    stats: { recoltes: 0, produitsRamasses: 0, commandesLivrees: 0, piecesGagnees: 0, quetesReussies: 0 },
  }
}

/**
 * Complète des données chargées avec ce qui manque (si le jeu a reçu de nouvelles
 * choses depuis la dernière sauvegarde). On ne perd jamais ce qui existe déjà.
 */
export function completer(donnees) {
  const neuf = nouvellePartie()
  const d = { ...neuf, ...donnees }
  d.inventaire = { ...(donnees.inventaire || {}) }
  d.stats = { ...neuf.stats, ...(donnees.stats || {}) }
  // Une ancienne partie (sans personnage personnalisé) garde l'apparence de départ.
  d.perso = {
    ...neuf.perso,
    choisi: true, // partie déjà commencée : on ne réaffiche pas la fenêtre de bienvenue
    ...(donnees.perso || {}),
    apparence: { ...APPARENCE_DE_DEPART, ...(donnees.perso?.apparence || {}) },
  }
  d.commandes = { ...(donnees.commandes || {}) }
  d.prochainesCommandes = { ...neuf.prochainesCommandes, ...(donnees.prochainesCommandes || {}) }
  // Parcelles : on garde les anciennes, on ajoute les nouvelles s'il y en a plus.
  const parcelles = Array.isArray(donnees.parcelles) ? donnees.parcelles : []
  d.parcelles = neuf.parcelles.map((vide, n) => ({ ...vide, ...(parcelles[n] || {}) }))
  // Animaux : on garde ceux qui existent, on ajoute ceux du départ qui manqueraient.
  const animaux = Array.isArray(donnees.animaux) ? donnees.animaux : []
  const parId = new Map(animaux.map((a) => [a.id, a]))
  d.animaux = [...animaux]
  for (const a of neuf.animaux) if (!parId.has(a.id)) d.animaux.push(a)
  d.version = VERSION_SAUVEGARDE
  return d
}

// --- L'objet partagé par tout le jeu ---

const auditeurs = new Set()
let donnees = nouvellePartie()
let modifie = false

export const etat = {
  /** Les données de la partie en cours. */
  get d() {
    return donnees
  },
  /** Remplace toutes les données (au chargement d'une sauvegarde). */
  remplacer(nouvelles) {
    donnees = nouvelles
    this.signaler()
  },
  /** À appeler après chaque changement : prévient l'interface et la sauvegarde. */
  signaler() {
    modifie = true
    for (const f of auditeurs) f()
  },
  /** Être prévenu des changements. */
  ecouter(fonction) {
    auditeurs.add(fonction)
  },
  /** Vrai s'il y a eu des changements depuis la dernière sauvegarde (et remet à zéro). */
  prendreModifie() {
    const m = modifie
    modifie = false
    return m
  },
}
