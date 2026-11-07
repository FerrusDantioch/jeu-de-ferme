/**
 * reglages.js — les préférences de la personne qui joue (sons, texte, joystick…).
 *
 * Elles sont rangées à part de la partie : ce sont des réglages de l'appareil.
 * Exporter ou importer une partie ne les change pas.
 */

const CLE = 'jeu-de-ferme:reglages'

// Valeurs par défaut.
const DEFAUT = {
  son: true,
  volume: 'moyen', // 'doux', 'moyen' ou 'fort'
  joystick: false,
  tailleTexte: 'normale', // 'normale', 'grande' ou 'tresGrande'
  animationsReduites: null, // null = comme le téléphone le demande ; true / false = choix fait ici
  ombres: true,
  economie: false, // image un peu moins fine, mais plus fluide et moins gourmande en batterie
}

export const TAILLES_TEXTE = { normale: 20, grande: 24, tresGrande: 28 }
export const VOLUMES = { doux: 0.35, moyen: 0.65, fort: 1 }

const auditeurs = new Set()
let valeurs = { ...DEFAUT }
try {
  valeurs = { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE) || '{}') }
} catch {
  /* réglages illisibles : on garde ceux par défaut */
}

const systemeMoinsDAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')

export const reglages = {
  /** Lire un réglage. */
  get(nom) {
    return valeurs[nom]
  },
  /** Changer un réglage (il est retenu sur l'appareil). */
  set(nom, valeur) {
    valeurs[nom] = valeur
    try {
      localStorage.setItem(CLE, JSON.stringify(valeurs))
    } catch {
      /* tant pis : le réglage marche quand même jusqu'à la fermeture */
    }
    appliquer()
    for (const f of auditeurs) f(nom, valeur)
  },
  /** Être prévenu quand un réglage change. */
  ecouter(fonction) {
    auditeurs.add(fonction)
  },
}

/** Vrai s'il faut réduire les animations (choix fait ici, sinon celui du téléphone). */
export function animationsReduites() {
  const choix = valeurs.animationsReduites
  return choix === null || choix === undefined ? systemeMoinsDAnimations.matches : choix
}

/** Applique les réglages qui touchent la page (taille du texte, animations). */
function appliquer() {
  const racine = document.documentElement
  racine.style.setProperty('--taille-texte', `${TAILLES_TEXTE[valeurs.tailleTexte] || 20}px`)
  racine.classList.toggle('moins-animations', animationsReduites())
}
appliquer()
systemeMoinsDAnimations.addEventListener?.('change', appliquer)
