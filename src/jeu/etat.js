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
import { FRUITS, FRUITS_MAXIMUM, ARBRES_FRUITIERS } from '../donnees/vergers.js'
import { infosObjet } from '../donnees/objets.js'
import { CULTURES } from '../donnees/cultures.js'
import { ESPECES } from '../donnees/animaux.js'
import { DECORATIONS } from '../donnees/decorations.js'
import { ESPECES_COMPAGNONS } from '../donnees/compagnons.js'

// (Même liste que dans inventaire.js : les catégories notées dans le carnet.)
const CATEGORIES_DU_CARNET = ['recolte', 'fruit', 'produit', 'poisson', 'plat']

// Numéro de version du format de sauvegarde (à augmenter si on change sa forme).
export const VERSION_SAUVEGARDE = 1

/** Une parcelle vide. */
function parcelleVide() {
  return { culture: null, progression: 0, derniereMaj: 0, humideJusqua: 0 }
}

/** Les arbres fruitiers au début : déjà pleins de fruits (un cadeau de bienvenue). */
function arbresDeDepart(maintenant) {
  return Object.fromEntries(
    ARBRES_FRUITIERS.map((a) => [a.id, { depuis: maintenant - FRUITS[a.fruit].minutes * 60000 * FRUITS_MAXIMUM }])
  )
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
    // Le verger : depuis quand les fruits poussent sur chaque arbre (voir verger.js).
    arbres: arbresDeDepart(maintenant),
    // Le compagnon (chat ou chien), adopté chez Lila : null au début.
    compagnon: null,
    // Le carnet de collection : tout ce qu'on a déjà obtenu, et combien ({ id: nombre }).
    carnet: {},
    // Les décorations posées dehors : [{ n, type, x, z, angle }].
    decorations: [],
    stats: {
      recoltes: 0, produitsRamasses: 0, commandesLivrees: 0, piecesGagnees: 0, quetesReussies: 0, fruits: 0, plats: 0,
    },
  }
}

/**
 * Complète des données chargées avec ce qui manque (si le jeu a reçu de nouvelles
 * choses depuis la dernière sauvegarde). On ne perd jamais ce qui existe déjà.
 */
export function completer(donnees) {
  const neuf = nouvellePartie()
  const d = { ...neuf, ...donnees }
  d.inventaire = estObjet(donnees.inventaire) ? { ...donnees.inventaire } : null
  d.stats = { ...neuf.stats, ...(estObjet(donnees.stats) ? donnees.stats : {}) }
  // Une ancienne partie (sans personnage personnalisé) garde l'apparence de départ.
  d.perso = {
    ...neuf.perso,
    choisi: true, // partie déjà commencée : on ne réaffiche pas la fenêtre de bienvenue
    ...(estObjet(donnees.perso) ? donnees.perso : {}),
    apparence: { ...APPARENCE_DE_DEPART, ...(estObjet(donnees.perso?.apparence) ? donnees.perso.apparence : {}) },
  }
  d.commandes = estObjet(donnees.commandes) ? { ...donnees.commandes } : {}
  d.arbres = { ...neuf.arbres, ...(estObjet(donnees.arbres) ? donnees.arbres : {}) }
  d.decorations = Array.isArray(donnees.decorations) ? donnees.decorations : []
  // Une partie d'avant le carnet : on y note déjà ce qu'il y a dans le sac.
  if (!donnees.carnet) {
    d.carnet = {}
    for (const [id, n] of Object.entries(d.inventaire || {})) {
      if (CATEGORIES_DU_CARNET.includes(infosObjet(id).categorie) && n > 0) d.carnet[id] = n
    }
  }
  d.prochainesCommandes = { ...neuf.prochainesCommandes, ...(estObjet(donnees.prochainesCommandes) ? donnees.prochainesCommandes : {}) }
  // Parcelles : on garde les anciennes, on ajoute les nouvelles s'il y en a plus.
  const parcelles = Array.isArray(donnees.parcelles) ? donnees.parcelles : []
  d.parcelles = neuf.parcelles.map((vide, n) => ({ ...vide, ...(parcelles[n] || {}) }))
  // Animaux : on garde ceux qui existent, on ajoute ceux du départ qui manqueraient.
  const animaux = Array.isArray(donnees.animaux) ? donnees.animaux : []
  const parId = new Map(animaux.filter(Boolean).map((a) => [a.id, a]))
  d.animaux = [...animaux]
  for (const a of neuf.animaux) if (!parId.has(a.id)) d.animaux.push(a)
  d.version = VERSION_SAUVEGARDE
  return remettreEnOrdre(d)
}

// Petites aides pour vérifier ce qu'on lit.
const estObjet = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const nombre = (v, defaut = 0, minimum = 0) => (Number.isFinite(v) ? Math.max(minimum, v) : defaut)

/**
 * Remet en ordre des données lues (sauvegarde ou fichier importé) : tout ce qui est
 * abîmé ou inconnu est remplacé par une valeur saine, pour que le jeu démarre toujours.
 * Ce qui est correct n'est jamais touché.
 */
function remettreEnOrdre(d) {
  const maintenant = Date.now()
  const neuf = nouvellePartie(maintenant)
  d.pieces = Math.floor(nombre(d.pieces, PIECES_DE_DEPART))
  d.experience = Math.floor(nombre(d.experience))

  // Le sac : seulement des nombres entiers positifs.
  if (!estObjet(d.inventaire)) d.inventaire = { ...neuf.inventaire }
  for (const [id, n] of Object.entries(d.inventaire)) {
    if (Number.isFinite(n) && n >= 1) d.inventaire[id] = Math.floor(n)
    else delete d.inventaire[id]
  }
  // Le carnet : pareil.
  if (!estObjet(d.carnet)) d.carnet = {}
  for (const [id, n] of Object.entries(d.carnet)) if (!(Number.isFinite(n) && n > 0)) delete d.carnet[id]

  // Le potager : une culture inconnue redevient une parcelle vide.
  d.parcelles = d.parcelles.map((p) => {
    if (!estObjet(p) || (p.culture && !CULTURES[p.culture])) return parcelleVide()
    return {
      ...p,
      culture: p.culture || null,
      progression: nombre(p.progression),
      derniereMaj: nombre(p.derniereMaj, maintenant),
      humideJusqua: nombre(p.humideJusqua),
    }
  })

  // Les animaux : on garde ceux dont l'espèce existe, avec des jauges entre 0 et 100.
  const dejaVus = new Set()
  d.animaux = d.animaux
    .filter((a) => estObjet(a) && ESPECES[a.espece] && typeof a.id === 'string' && !dejaVus.has(a.id) && dejaVus.add(a.id))
    .map((a) => ({
      ...a,
      nom: typeof a.nom === 'string' && a.nom.trim() ? a.nom.slice(0, 14) : ESPECES[a.espece].nom,
      lieu: a.espece === 'vache' ? 'etable' : 'exterieur',
      satiete: Math.min(100, nombre(a.satiete, 70)),
      bonheur: Math.min(100, nombre(a.bonheur, 70)),
      production: nombre(a.production),
      produitPret: !!a.produitPret,
      derniereMaj: nombre(a.derniereMaj, maintenant),
    }))

  // Les décorations posées : type connu, position lisible.
  d.decorations = d.decorations
    .filter((x) => estObjet(x) && DECORATIONS[x.type] && Number.isFinite(x.x) && Number.isFinite(x.z))
    .map((x, n) => ({ ...x, n: Number.isFinite(x.n) ? x.n : n + 1, angle: nombre(x.angle, 0, -100) }))

  // Les commandes : chaque commande doit avoir une liste d'articles lisible.
  if (!estObjet(d.commandes)) d.commandes = {}
  for (const [client, c] of Object.entries(d.commandes)) {
    const correcte = estObjet(c) && Array.isArray(c.articles) && c.articles.length > 0 &&
      c.articles.every((a) => estObjet(a) && typeof a.id === 'string' && Number.isFinite(a.n) && a.n >= 1)
    if (!correcte) delete d.commandes[client]
    else {
      c.pieces = nombre(c.pieces)
      c.experience = nombre(c.experience)
    }
  }
  if (!estObjet(d.prochainesCommandes)) d.prochainesCommandes = neuf.prochainesCommandes
  for (const [client, quand] of Object.entries(d.prochainesCommandes)) {
    if (!Number.isFinite(quand)) d.prochainesCommandes[client] = maintenant
  }

  // Les quêtes : si elles sont illisibles, de nouvelles seront tirées.
  const quetesLisibles = estObjet(d.quetes) && Array.isArray(d.quetes.liste) &&
    d.quetes.liste.every((q) => estObjet(q) && typeof q.type === 'string' && Number.isFinite(q.objectif) && Number.isFinite(q.progres))
  if (!quetesLisibles) d.quetes = { jour: null, liste: [] }
  if (!estObjet(d.oeufsDePaques) || !Array.isArray(d.oeufsDePaques.trouves)) d.oeufsDePaques = { jour: null, trouves: [] }

  // Le verger, le compagnon, le personnage, sa position.
  for (const [id, a] of Object.entries(d.arbres)) if (!estObjet(a) || !Number.isFinite(a.depuis)) d.arbres[id] = neuf.arbres[id] || { depuis: maintenant }
  if (!estObjet(d.compagnon) || !ESPECES_COMPAGNONS[d.compagnon.espece]) d.compagnon = null
  else if (typeof d.compagnon.nom !== 'string' || !d.compagnon.nom.trim()) d.compagnon.nom = ESPECES_COMPAGNONS[d.compagnon.espece].nomParDefaut
  if (typeof d.perso.nom !== 'string') d.perso.nom = ''
  const j = d.joueur
  const lieuConnu = estObjet(j) && ['exterieur', 'maison', 'etable', 'boutique'].includes(j.lieu)
  if (!lieuConnu || !Number.isFinite(j.x) || !Number.isFinite(j.z)) d.joueur = estObjet(j) ? { lieu: 'exterieur', x: 0, z: 0, aReplacer: true } : null

  // Les petites statistiques.
  for (const [nom, v] of Object.entries(d.stats)) d.stats[nom] = nombre(v)
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
