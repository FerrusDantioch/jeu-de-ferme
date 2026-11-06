/**
 * potager.js (monde) — les parcelles du potager telles qu'on les voit dans la ferme.
 *
 * Chaque parcelle est un carré de terre qu'on peut toucher. Ce fichier redessine
 * les plantes quand elles changent d'étape, assombrit la terre quand elle est arrosée,
 * et affiche l'icône du légume au-dessus quand il est prêt à récolter.
 * (Les règles — pousse, arrosage, récolte — sont dans src/jeu/potager.js.)
 */
import * as THREE from 'three'
import { POTAGER } from '../donnees/ferme.js'
import { PALETTE, materiau } from '../modeles/materiaux.js'
import { boite, MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { obtenirModele } from '../modeles/index.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'
import { etat } from '../jeu/etat.js'
import { observer } from '../jeu/potager.js'

// Où placer les plantes dans une parcelle (en mètres depuis son centre).
const PLACES = {
  une: [[0, 0]],
  quatre: [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]],
}
const HAUTEUR_TERRE = 0.16

/**
 * @param {object} ctx { groupe, touchables, pastilles }
 * @returns {{ actualiser: function, parcelles: Array }}
 */
export function creerPotagerInteractif({ groupe, touchables, pastilles }) {
  const { x, z, colonnes, rangees, taille, ecart } = POTAGER
  const largeur = colonnes * taille + (colonnes - 1) * ecart
  const profondeur = rangees * taille + (rangees - 1) * ecart

  // Le cadre en bois et les petites allées entre les parcelles.
  const cadre = new THREE.Group()
  cadre.add(boite(largeur + 0.5, 0.08, profondeur + 0.5, PALETTE.boisFonce))
  cadre.add(boite(largeur + 0.3, 0.09, profondeur + 0.3, PALETTE.terre))
  const fixe = fusionnerParMateriau(cadre, { ombrePortee: false })
  fixe.position.set(x, 0, z)
  groupe.add(fixe)

  const parcelles = []
  for (let r = 0; r < rangees; r++) {
    for (let c = 0; c < colonnes; c++) {
      const n = r * colonnes + c
      const cx = x - largeur / 2 + taille / 2 + c * (taille + ecart)
      const cz = z - profondeur / 2 + taille / 2 + r * (taille + ecart)
      const racine = new THREE.Group()
      racine.position.set(cx, 0, cz)
      groupe.add(racine)

      // La terre (sa couleur change quand elle est arrosée).
      const terre = boite(taille, HAUTEUR_TERRE, taille, PALETTE.terreParcelle)
      terre.castShadow = false
      racine.add(terre)

      // Où se tenir pour s'en occuper : devant pour la rangée de devant, derrière sinon.
      const devant = r === rangees - 1
      const approche = { x: cx, z: devant ? cz + taille / 2 + 0.55 : cz - taille / 2 - 0.55 }

      // Zone invisible qu'on touche.
      const zone = new THREE.Mesh(new THREE.BoxGeometry(taille, 0.7, taille), MATERIAU_INVISIBLE)
      zone.position.y = 0.35
      zone.userData.toucher = { type: 'parcelle', n, approche, objet: racine }
      racine.add(zone)
      touchables.push(zone)

      parcelles.push({ n, racine, terre, plantes: null, cle: '' })
    }
  }

  /** Redessine ce qui a changé (appelée régulièrement, et après chaque action). */
  function actualiser(maintenant = Date.now()) {
    for (const p of parcelles) {
      const vue = observer(etat.d.parcelles[p.n], maintenant)
      const cle = vue.vide ? `vide:${vue.humide}` : `${vue.idCulture}:${vue.stade}:${vue.humide}`
      if (cle === p.cle) continue
      p.cle = cle
      p.terre.material = materiau(vue.humide ? PALETTE.terreHumide : PALETTE.terreParcelle)
      if (p.plantes) {
        p.racine.remove(p.plantes)
        p.plantes.traverse((o) => o.geometry && o.geometry.dispose())
        p.plantes = null
      }
      pastilles.definir(p.racine, vue.prete ? vue.culture.icone : null, 1.1)
      if (vue.vide) continue
      // Les plantes : une grosse (citrouille) ou quatre petites.
      const brutes = new THREE.Group()
      const places = vue.culture.modele === 'citrouille' ? PLACES.une : PLACES.quatre
      places.forEach(([px, pz], k) => {
        const plante = obtenirModele('plante', { modele: vue.culture.modele, stade: vue.stade })
        plante.position.set(px, HAUTEUR_TERRE, pz)
        plante.rotation.y = k * 1.7 + p.n // un peu de variété
        brutes.add(plante)
      })
      p.plantes = fusionnerParMateriau(brutes)
      p.racine.add(p.plantes)
    }
  }

  actualiser()
  return { actualiser, parcelles }
}
