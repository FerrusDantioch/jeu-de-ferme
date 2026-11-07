/**
 * exterieur.js — le lieu « La ferme » (dehors).
 *
 * Il assemble : le terrain, les bâtiments, l'enclos, le potager, l'étang, le puits,
 * les bancs, les panneaux, les fleurs et les villageois qui se promènent.
 * Le plan (où est quoi) se trouve dans src/donnees/ferme.js.
 *
 * Chaque lieu du jeu renvoie le même genre d'objet (voir la fin de ce fichier) :
 * c'est ce qui permet au gestionnaire de lieux de passer de l'un à l'autre.
 */
import * as THREE from 'three'
import { MONDE, COULEUR_FOND } from '../config.js'
import { GrilleChemin } from '../moteur/chemin.js'
import { creerTerrain, semerFleurs } from '../monde/terrain.js'
import { obtenirModele } from '../modeles/index.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'
import {
  creerPuits, creerBanc, creerPanneau, creerEtang, creerEnclos, creerReserve, creerTableauCommandes, creerLampadaire,
} from '../modeles/decor.js'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import {
  BATIMENTS, POINT_DE_DEPART, ENCLOS, ETANG, PUITS, BANCS, PANNEAUX, RESERVES, TABLEAU_COMMANDES, LAMPADAIRES,
} from '../donnees/ferme.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'
import { creerAnimauxDuLieu, animerAnimaux } from './animaux-du-lieu.js'
import { creerPotagerInteractif } from '../monde/potager.js'
import { placesDeBanc, ajouterSiege } from '../monde/sieges.js'
import { creerDecorationsFete } from '../monde/decorations-fetes.js'
import { feteDuJour } from '../jeu/calendrier.js'
import { oeufsTrouvesAujourdhui } from '../jeu/fetes.js'
import { creerLueur } from '../monde/ciel.js'
import { habillerSaison } from '../monde/saisons.js'
import { creerChute } from '../monde/chute.js'
import { creerPetitesBetes } from '../monde/petites-betes.js'
import { creerVerger } from '../monde/verger.js'
import { saisonDuJour } from '../jeu/temps.js'
import { animationsReduites } from '../jeu/reglages.js'

// Distance entre la façade et le point où l'on se tient pour passer la porte.
const RECUL_PORTE = 0.9
// Distance supplémentaire où l'on réapparaît en sortant (pour ne pas re-rentrer aussitôt).
const RECUL_SORTIE = 1.1

export function creerLieu(outils) {
  const groupe = new THREE.Group()
  groupe.name = 'exterieur'
  const grille = new GrilleChemin(MONDE.taille, MONDE.tailleCase)
  // Tout ce qui ne bouge jamais (bâtiments, enclos, puits, chemins…) est rangé ici,
  // puis « collé » en un seul bloc à la fin : beaucoup moins de travail pour le téléphone.
  const statique = new THREE.Group()
  const terrain = creerTerrain(groupe, grille, statique)

  const portes = []
  const touchables = []
  const maisons = {} // pour les villageois : où se trouve la porte de chaque maison
  const arrivees = { depart: { x: POINT_DE_DEPART.x, z: POINT_DE_DEPART.z, angle: 0 } }

  // --- Les bâtiments ---
  for (const b of BATIMENTS) {
    const modele = obtenirModele(b.modele, b)
    modele.position.set(b.x, 0, b.z)
    statique.add(modele)
    // Zone invisible pour le toucher, à peu près à la forme du bâtiment :
    // les murs, plus une partie plus étroite pour le toit (pour ne pas cacher ce qui est derrière).
    const zoneBatiment = new THREE.Group()
    const murs = new THREE.Mesh(new THREE.BoxGeometry(b.largeur + 0.3, 2.8, b.profondeur + 0.3), MATERIAU_INVISIBLE)
    murs.position.y = 1.4
    const toit = new THREE.Mesh(new THREE.BoxGeometry(b.largeur * 0.55, 1.6, b.profondeur + 0.3), MATERIAU_INVISIBLE)
    toit.position.y = 3.6
    zoneBatiment.add(murs, toit)
    zoneBatiment.position.set(b.x, 0, b.z)
    groupe.add(zoneBatiment)
    grille.bloquerRectangle(b.x, b.z, b.largeur, b.profondeur, 0.35)

    // Le point devant la porte (au milieu de la façade avant).
    const devant = { x: b.x, z: b.z + b.profondeur / 2 + RECUL_PORTE }
    maisons[b.id] = devant

    if (b.interieur) {
      const porte = {
        id: b.id,
        x: devant.x,
        z: devant.z,
        normale: { x: 0, z: -1 }, // direction vers la porte (vers le fond de l'écran)
        vers: b.interieur,
        arrivee: 'entree',
        titre: b.titre,
      }
      portes.push(porte)
      arrivees[`devant-${b.id}`] = { x: devant.x, z: devant.z + RECUL_SORTIE, angle: 0 }
      zoneBatiment.userData.toucher = { type: 'porte', porte }
    } else {
      zoneBatiment.userData.toucher = { type: 'info', texte: b.texte, x: devant.x, z: devant.z }
    }
    touchables.push(zoneBatiment)
  }

  // --- L'enclos des poules et des moutons ---
  const enclos = creerEnclos(ENCLOS.largeur, ENCLOS.profondeur, ENCLOS.ouverture)
  enclos.position.set(ENCLOS.x, 0, ENCLOS.z)
  statique.add(enclos)
  {
    const { x, z, largeur: l, profondeur: p, ouverture: o } = ENCLOS
    const e = 0.2 // épaisseur d'une barrière
    const marge = 0.3
    grille.bloquerRectangle(x, z - p / 2, l, e, marge) // fond
    grille.bloquerRectangle(x, z + p / 2, l, e, marge) // devant
    grille.bloquerRectangle(x + l / 2, z, e, p, marge) // droite
    const morceau = (p - o) / 2 // gauche : deux morceaux, l'ouverture au milieu
    grille.bloquerRectangle(x - l / 2, z - p / 2 + morceau / 2, e, morceau, marge)
    grille.bloquerRectangle(x - l / 2, z + p / 2 - morceau / 2, e, morceau, marge)
    grille.bloquerRectangle(x + l / 2 - 1.2, z - p / 2 + 0.6, 1.4, 0.5, marge) // abreuvoir
  }

  // --- Le potager (on peut marcher entre les parcelles) ---
  const potager = creerPotagerInteractif({ groupe, touchables, pastilles: outils.pastilles })

  // --- Les réserves de nourriture gratuite pour les animaux ---
  for (const r of RESERVES) {
    const reserve = creerReserve()
    reserve.position.set(r.x, 0, r.z)
    statique.add(reserve)
    grille.bloquerRectangle(r.x, r.z, 1.6, 0.7, 0.3)
    const zone = new THREE.Mesh(new THREE.BoxGeometry(2, 1.4, 1.2), MATERIAU_INVISIBLE)
    zone.position.set(r.x, 0.7, r.z)
    zone.userData.toucher = { type: 'reserve', approche: { x: r.x, z: r.z + 1.0 } }
    groupe.add(zone)
    touchables.push(zone)
  }

  // --- L'étang, le puits, les bancs, les panneaux ---
  const etang = creerEtang(ETANG.rayon)
  etang.position.set(ETANG.x, 0, ETANG.z)
  statique.add(etang)
  grille.bloquerCercle(ETANG.x, ETANG.z, ETANG.rayon, 0.3)
  // On touche l'eau pour pêcher.
  const zoneEtang = new THREE.Mesh(new THREE.CylinderGeometry(ETANG.rayon, ETANG.rayon, 0.5, 16), MATERIAU_INVISIBLE)
  zoneEtang.position.set(ETANG.x, 0.25, ETANG.z)
  zoneEtang.userData.toucher = { type: 'etang' }
  groupe.add(zoneEtang)
  touchables.push(zoneEtang)

  const puits = creerPuits()
  puits.position.set(PUITS.x, 0, PUITS.z)
  statique.add(puits)
  grille.bloquerCercle(PUITS.x, PUITS.z, 0.75, 0.35)

  for (const b of BANCS) {
    const banc = creerBanc()
    banc.position.set(b.x, 0, b.z)
    banc.rotation.y = b.angle
    statique.add(banc)
    const tourne = Math.abs(Math.sin(b.angle)) > 0.5
    grille.bloquerRectangle(b.x, b.z, tourne ? 0.5 : 1.6, tourne ? 1.6 : 0.5, 0.1)
    // Deux places pour s'asseoir.
    for (const siege of placesDeBanc(b.x, b.z, b.angle, 0.5)) ajouterSiege({ groupe, touchables }, siege)
  }

  // Les lampadaires : leur lanterne brille le soir (avec un petit halo de lumière).
  for (const [x, z] of LAMPADAIRES) {
    const lampadaire = creerLampadaire()
    lampadaire.position.set(x, 0, z)
    statique.add(lampadaire)
    grille.bloquerCercle(x, z, 0.1, 0.3)
    const halo = creerLueur(0xffd27a, 2.4)
    halo.position.set(x + 0.3, 1.55, z)
    groupe.add(halo)
  }

  for (const p of PANNEAUX) {
    const panneau = creerPanneau(p.texte, p.largeur)
    panneau.position.set(p.x, 0, p.z)
    statique.add(panneau)
    grille.bloquerCercle(p.x, p.z, 0.1, 0.3)
  }

  // --- Le tableau des commandes (on peut y livrer toutes les commandes) ---
  {
    const { x, z } = TABLEAU_COMMANDES
    const tableau = creerTableauCommandes()
    tableau.position.set(x, 0, z)
    statique.add(tableau)
    grille.bloquerRectangle(x, z, 1.8, 0.2, 0.3)
    const zone = new THREE.Mesh(new THREE.BoxGeometry(2, 1.9, 0.8), MATERIAU_INVISIBLE)
    zone.position.set(x, 0.95, z)
    zone.userData.toucher = { type: 'tableau', approche: { x, z: z + 1.0 } }
    groupe.add(zone)
    touchables.push(zone)
  }

  // On colle tout ce qui ne bouge pas en un seul bloc (une pièce par couleur).
  groupe.add(fusionnerParMateriau(statique))

  // --- Le verger (arbres fruitiers) : son feuillage suit les saisons comme les autres arbres ---
  const verger = creerVerger({
    groupe, grille, touchables, feuillage: terrain.feuillages.material, haut: terrain.hauts.material,
  })

  // --- Les fleurs (après les obstacles, pour ne pas en semer dans les murs) ---
  terrain.fleurs = semerFleurs(groupe, grille)

  // --- Les saisons, ce qui tombe du ciel, les papillons et les lucioles ---
  const chute = creerChute(groupe)
  const betes = creerPetitesBetes(groupe)
  let saison = null
  function verifierSaison(centre) {
    const s = saisonDuJour()
    if (s === saison) return
    saison = s
    const habit = habillerSaison(s, terrain)
    chute.regler(habit.chute, centre)
  }
  verifierSaison(POINT_DE_DEPART)
  let compteurSaison = 0

  // --- Les villageois qui vivent dehors ---
  const pnj = creerPnjDuLieu('exterieur', { groupe, grille, touchables, bulles: outils.bulles, maisons })

  // --- Les animaux de l'enclos (ils se promènent à l'intérieur, loin des barrières) ---
  const m = 0.7
  const zoneEnclos = {
    xMin: ENCLOS.x - ENCLOS.largeur / 2 + m,
    xMax: ENCLOS.x + ENCLOS.largeur / 2 - m,
    zMin: ENCLOS.z - ENCLOS.profondeur / 2 + m + 0.6, // un peu plus loin du fond (l'abreuvoir)
    zMax: ENCLOS.z + ENCLOS.profondeur / 2 - m,
  }
  const animaux = creerAnimauxDuLieu('exterieur', () => zoneEnclos, { groupe, touchables, pastilles: outils.pastilles })
  const animer = animerAnimaux(animaux, () => {
    potager.actualiser()
    verger.actualiser()
  })

  // --- Décorations de fête (changent selon le calendrier, même en pleine partie) ---
  // On garde une copie des obstacles « sans décoration » pour pouvoir les retirer proprement.
  const obstaclesSansDecor = grille.bloquee.slice()
  let decorations = null
  function appliquerFete(fete) {
    if (decorations) {
      groupe.remove(decorations.groupe)
      for (const t of decorations.touchables) touchables.splice(touchables.indexOf(t), 1)
      grille.bloquee.set(obstaclesSansDecor)
      decorations = null
    }
    if (!fete) return
    decorations = creerDecorationsFete(fete, grille, oeufsTrouvesAujourdhui())
    groupe.add(decorations.groupe)
    touchables.push(...decorations.touchables)
  }
  appliquerFete(feteDuJour())

  return {
    id: 'exterieur',
    titre: '🌳 La ferme',
    groupe,
    grille,
    // Ambiance : ciel bleu pâle, brouillard léger au loin, lumière du jour.
    ambiance: { fond: COULEUR_FOND, brouillard: [30, 70], ciel: 0xfffbf0, sol: 0x8fbf7a, intensite: 1.6 },
    arrivees,
    portes,
    touchables,
    pnj,
    animaux,
    potager,
    verger,
    miseAJour(dt, joueur) {
      animer(dt)
      verger.miseAJour(dt)
      // Une fois par seconde : la saison a-t-elle changé (minuit, mode test, réglages) ?
      compteurSaison += dt
      if (compteurSaison > 1) {
        compteurSaison = 0
        verifierSaison(joueur.position)
      }
      const calme = animationsReduites()
      chute.miseAJour(dt, joueur.position, calme)
      betes.miseAJour(dt, { lumieres: outils.ciel?.lumieres ?? 0, saison, calme })
    },
    /** La saison affichée en ce moment. */
    get saison() {
      return saison
    },
    appliquerFete,
    /** Cache un œuf de Pâques trouvé. */
    cacherOeuf(numero) {
      const oeuf = decorations?.oeufs.get(numero)
      if (oeuf) oeuf.visible = false
    },
  }
}
