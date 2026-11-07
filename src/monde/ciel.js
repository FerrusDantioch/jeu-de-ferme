/**
 * ciel.js — le jour et la nuit, selon l'heure du téléphone.
 *
 * La journée est découpée en quelques « moments » (nuit, aube, jour, coucher de soleil, soir).
 * Entre deux moments, les couleurs se mélangent tout doucement : pas de changement brusque.
 * La nuit reste douce et lisible (bleu tendre, jamais noir).
 *
 * Le soir venu (« lumieres » proche de 1) :
 *  - les fenêtres des maisons s'allument d'une lumière chaude ;
 *  - les lampadaires et les lanternes brillent (petites « lueurs ») ;
 *  - les lucioles sortent (voir petites-betes.js).
 */
import * as THREE from 'three'
import { MATERIAU_VITRE, MATERIAU_VITRE_INTERIEURE, PALETTE } from '../modeles/materiaux.js'
import { heureDuJour } from '../jeu/temps.js'
import { COULEUR_FOND } from '../config.js'

// Les moments de la journée : [heure, réglages de lumière].
//  fond : couleur du ciel (le fond de l'image) ; ciel / sol : lumière venant du haut / du bas ;
//  intensite : force de cette lumière ; soleil / forceSoleil : couleur et force du soleil (ou de la lune) ;
//  lumieres : 0 = éteintes, 1 = toutes allumées.
const NUIT = { fond: 0x34447a, ciel: 0xaab8ec, sol: 0x4a6a5a, intensite: 1.45, soleil: 0xb4c4ff, forceSoleil: 0.8, lumieres: 1 }
const AUBE = { fond: 0xf4c6b0, ciel: 0xffdcc8, sol: 0x8fa27a, intensite: 1.35, soleil: 0xffc896, forceSoleil: 1.2, lumieres: 0.5 }
const JOUR = { fond: COULEUR_FOND, ciel: 0xfffbf0, sol: 0x8fbf7a, intensite: 1.6, soleil: 0xfff1d6, forceSoleil: 2.0, lumieres: 0 }
const COUCHANT = { fond: 0xf2b48c, ciel: 0xffd4ac, sol: 0x9a9a6a, intensite: 1.4, soleil: 0xffa870, forceSoleil: 1.4, lumieres: 0.45 }
const SOIR = { fond: 0x4c5892, ciel: 0xb4bcee, sol: 0x4a6450, intensite: 1.5, soleil: 0xb0bcff, forceSoleil: 0.9, lumieres: 1 }

const MOMENTS = [
  [0, NUIT],
  [5.5, NUIT],
  [7, AUBE],
  [8.5, JOUR],
  [18, JOUR],
  [19.75, COUCHANT],
  [21.25, SOIR],
  [22.5, NUIT],
  [24, NUIT],
]

const ca = new THREE.Color()
const cb = new THREE.Color()

/** Mélange deux couleurs (t = 0 : la première, t = 1 : la deuxième). */
function melangeCouleur(a, b, t, sortie) {
  return sortie.copy(ca.set(a)).lerp(cb.set(b), t)
}

/**
 * Les réglages de lumière pour une heure donnée (mélange des deux moments voisins).
 * @returns {object} { fond, ciel, sol (THREE.Color), intensite, soleil (THREE.Color), forceSoleil, lumieres }
 */
export function lumiereDeLHeure(heure) {
  let k = 0
  while (k < MOMENTS.length - 2 && heure >= MOMENTS[k + 1][0]) k++
  const [h1, a] = MOMENTS[k]
  const [h2, b] = MOMENTS[k + 1]
  // Transition douce (en « S ») plutôt que linéaire.
  let t = Math.min(1, Math.max(0, (heure - h1) / (h2 - h1)))
  t = t * t * (3 - 2 * t)
  const nombre = (x, y) => x + (y - x) * t
  return {
    fond: melangeCouleur(a.fond, b.fond, t, new THREE.Color()),
    ciel: melangeCouleur(a.ciel, b.ciel, t, new THREE.Color()),
    sol: melangeCouleur(a.sol, b.sol, t, new THREE.Color()),
    intensite: nombre(a.intensite, b.intensite),
    soleil: melangeCouleur(a.soleil, b.soleil, t, new THREE.Color()),
    forceSoleil: nombre(a.forceSoleil, b.forceSoleil),
    lumieres: nombre(a.lumieres, b.lumieres),
  }
}

// --- Les « lueurs » : de petits halos de lumière (lampadaires, lanternes, fenêtres) ---

let textureLueur = null
/** Un dégradé rond (du centre lumineux vers le bord transparent), dessiné une seule fois. */
function texture() {
  if (textureLueur) return textureLueur
  const toile = document.createElement('canvas')
  toile.width = toile.height = 64
  const c = toile.getContext('2d')
  const degrade = c.createRadialGradient(32, 32, 0, 32, 32, 32)
  degrade.addColorStop(0, 'rgba(255,255,255,1)')
  degrade.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  degrade.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = degrade
  c.fillRect(0, 0, 64, 64)
  textureLueur = new THREE.CanvasTexture(toile)
  return textureLueur
}

const lueurs = new Set()

/**
 * Crée une lueur (invisible le jour, elle s'allume le soir).
 * @param {number} couleur  ex. : 0xffd27a
 * @param {number} taille   diamètre en mètres
 */
export function creerLueur(couleur = 0xffd27a, taille = 1.6) {
  const lueur = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture(),
      color: couleur,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  )
  lueur.scale.setScalar(taille)
  lueur.visible = false
  lueurs.add(lueur)
  return lueur
}

/**
 * Le « maître du ciel ».
 * @param {object} o { scene, soleil, lumiereAmbiante } (voir moteur/rendu.js)
 */
export function creerCiel({ scene, soleil, lumiereAmbiante }) {
  let actuelle = lumiereDeLHeure(heureDuJour())

  /**
   * Met à jour la lumière.
   * @param {boolean} dehors  vrai si on est dehors (dedans, la lumière de la pièce ne change pas)
   */
  function appliquer(dehors) {
    actuelle = lumiereDeLHeure(heureDuJour())
    const l = actuelle
    // Fenêtres : chaudes vues de dehors, bleu nuit vues de dedans.
    MATERIAU_VITRE.emissiveIntensity = l.lumieres * 0.9
    MATERIAU_VITRE_INTERIEURE.color.set(PALETTE.vitre).lerp(ca.set(0x34407a), l.lumieres * 0.85)
    for (const lueur of lueurs) {
      lueur.visible = l.lumieres > 0.02
      lueur.material.opacity = l.lumieres * 0.85
    }
    if (!dehors) {
      // Dedans, la lumière reste celle de la pièce (le « soleil » reprend sa force normale).
      soleil.color.set(JOUR.soleil)
      soleil.intensity = JOUR.forceSoleil
      return
    }
    scene.background.copy(l.fond)
    if (scene.fog) scene.fog.color.copy(l.fond)
    lumiereAmbiante.color.copy(l.ciel)
    lumiereAmbiante.groundColor.copy(l.sol)
    lumiereAmbiante.intensity = l.intensite
    soleil.color.copy(l.soleil)
    soleil.intensity = l.forceSoleil
    document.body.style.background = '#' + l.fond.getHexString()
  }

  return {
    appliquer,
    /** Le niveau des lumières du soir (0 = jour, 1 = nuit), pour les lucioles par exemple. */
    get lumieres() {
      return actuelle.lumieres
    },
  }
}
