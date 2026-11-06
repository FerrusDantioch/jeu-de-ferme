/**
 * elevage.js — les règles des animaux (sans dessin : juste les calculs).
 *
 * Chaque animal a :
 *  - un ventre (satiété) de 0 à 100, qui se vide doucement ;
 *  - un bonheur de 0 à 100, qui baisse doucement s'il n'a pas de câlins ;
 *  - une production (œuf, lait, laine) qui avance tant qu'il va bien.
 * Il ne meurt jamais : au pire, il arrête de produire en attendant qu'on s'occupe de lui.
 * Tout se calcule avec l'heure réelle, même jeu fermé.
 */
import { ESPECES, SOINS } from '../donnees/animaux.js'
import { etat } from './etat.js'
import { ajouter, retirer, quantite } from './inventaire.js'

const borner = (v) => Math.min(100, Math.max(0, v))

/** Fait vivre l'animal jusqu'à « maintenant » (faim, ennui, production). */
export function avancer(animal, maintenant = Date.now()) {
  const espece = ESPECES[animal.espece]
  const secondes = (maintenant - animal.derniereMaj) / 1000
  animal.derniereMaj = maintenant
  if (!(secondes > 0)) return // heure qui recule : on ne fait rien
  const faimParSeconde = 100 / (espece.heuresPourAvoirFaim * 3600)
  const ennuiParSeconde = 100 / (espece.heuresPourSEnnuyer * 3600)
  // La production n'avance que tant que ventre ET bonheur sont au-dessus du seuil.
  const tempsVentre = Math.max(0, (animal.satiete - SOINS.seuilProduction) / faimParSeconde)
  const tempsBonheur = Math.max(0, (animal.bonheur - SOINS.seuilProduction) / ennuiParSeconde)
  const tempsUtile = Math.min(secondes, tempsVentre, tempsBonheur)
  if (!animal.produitPret) {
    animal.production += tempsUtile
    if (animal.production >= espece.minutesProduction * 60) {
      animal.produitPret = true // un seul produit à la fois : il attend qu'on le ramasse
      animal.production = 0
    }
  }
  animal.satiete = borner(animal.satiete - faimParSeconde * secondes)
  animal.bonheur = borner(animal.bonheur - ennuiParSeconde * secondes)
}

/** Avance tous les animaux. */
export function avancerTous(maintenant = Date.now()) {
  for (const a of etat.d.animaux) avancer(a, maintenant)
}

export function trouver(id) {
  return etat.d.animaux.find((a) => a.id === id)
}

/** Ce qu'un animal peut manger et qu'on a dans le sac : [[id, quantité], …] */
export function nourrituresDisponibles(animal) {
  return ESPECES[animal.espece].nourritures.map((id) => [id, quantite(id)])
}

/**
 * Donne à manger. Renvoie null si impossible, sinon { friandise: bool }.
 */
export function nourrir(animal, idNourriture) {
  const espece = ESPECES[animal.espece]
  if (!espece.nourritures.includes(idNourriture)) return null
  if (animal.satiete >= 100) return null
  avancer(animal)
  if (!retirer(idNourriture)) return null
  const friandise = idNourriture === espece.friandise
  animal.satiete = borner(animal.satiete + SOINS.repas)
  animal.bonheur = borner(animal.bonheur + (friandise ? SOINS.bonheurFriandise : SOINS.bonheurRepas))
  etat.signaler()
  return { friandise }
}

export function caresser(animal) {
  avancer(animal)
  animal.bonheur = borner(animal.bonheur + SOINS.caresse)
  etat.signaler()
}

/** Ramasse le produit (œuf, lait, laine). Renvoie l'id du produit, ou null. */
export function ramasser(animal) {
  avancer(animal)
  if (!animal.produitPret) return null
  const produit = ESPECES[animal.espece].produit
  animal.produitPret = false
  ajouter(produit, 1)
  etat.d.stats.produitsRamasses++
  etat.signaler()
  return produit
}

/** Mots doux pour décrire le ventre et le bonheur (jamais alarmants). */
export function texteVentre(v) {
  if (v >= 80) return 'Le ventre bien plein 😋'
  if (v >= SOINS.seuilFaim) return 'Ça va bien 🙂'
  if (v >= SOINS.seuilProduction) return 'Un petit creux…'
  return 'Aimerait bien manger 🌾'
}
export function texteBonheur(v) {
  if (v >= 80) return 'Aux anges 💕'
  if (v >= 50) return 'De bonne humeur 🙂'
  if (v >= SOINS.seuilProduction) return 'Aimerait un câlin'
  return 'A besoin de câlins 🤗'
}
