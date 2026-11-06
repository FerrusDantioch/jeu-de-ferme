/**
 * chemin.js — la « recherche de chemin » (pathfinding).
 *
 * Principe, expliqué simplement :
 *  1. On découpe le terrain en petites cases invisibles (une grille, comme un damier).
 *  2. Chaque case est soit libre, soit bloquée (arbre, rocher, mur…).
 *  3. Quand on touche un endroit, on cherche la suite de cases libres la plus courte
 *     entre le personnage et ce point. On utilise la méthode « A* » (prononcer « A étoile »),
 *     une recette classique et rapide.
 *  4. On « lisse » ensuite le chemin pour que le personnage marche en ligne droite
 *     quand c'est possible, au lieu de zigzaguer de case en case.
 */
import * as THREE from 'three'

export class GrilleChemin {
  /**
   * @param {number} taille     taille du terrain en mètres (carré)
   * @param {number} tailleCase taille d'une case en mètres
   */
  constructor(taille, tailleCase) {
    this.tailleCase = tailleCase
    this.nb = Math.round(taille / tailleCase) // nombre de cases par côté
    this.demi = taille / 2 // le terrain va de -demi à +demi
    // Tableau de cases : 0 = libre, 1 = bloquée.
    this.bloquee = new Uint8Array(this.nb * this.nb)
  }

  // --- Conversions entre positions en mètres et numéros de case ---

  versCase(x, z) {
    return {
      i: Math.floor((x + this.demi) / this.tailleCase),
      j: Math.floor((z + this.demi) / this.tailleCase),
    }
  }

  versMonde(i, j) {
    return new THREE.Vector3(
      (i + 0.5) * this.tailleCase - this.demi,
      0,
      (j + 0.5) * this.tailleCase - this.demi
    )
  }

  dansGrille(i, j) {
    return i >= 0 && j >= 0 && i < this.nb && j < this.nb
  }

  estLibre(i, j) {
    return this.dansGrille(i, j) && this.bloquee[j * this.nb + i] === 0
  }

  // --- Déclarer des obstacles ---

  /**
   * Bloque un disque (ex. : tronc d'arbre, rocher).
   * « marge » ajoute de l'espace pour que le personnage ne frotte pas l'obstacle.
   */
  bloquerCercle(x, z, rayon, marge = 0) {
    const r = rayon + marge
    const min = this.versCase(x - r, z - r)
    const max = this.versCase(x + r, z + r)
    for (let j = min.j; j <= max.j; j++) {
      for (let i = min.i; i <= max.i; i++) {
        if (!this.dansGrille(i, j)) continue
        const c = this.versMonde(i, j)
        if ((c.x - x) ** 2 + (c.z - z) ** 2 <= r * r) this.bloquee[j * this.nb + i] = 1
      }
    }
  }

  /**
   * Bloque un rectangle aligné sur les axes (ex. : mur, bâtiment, clôture).
   * (x, z) = centre ; largeur sur l'axe X, profondeur sur l'axe Z.
   */
  bloquerRectangle(x, z, largeur, profondeur, marge = 0) {
    const min = this.versCase(x - largeur / 2 - marge, z - profondeur / 2 - marge)
    const max = this.versCase(x + largeur / 2 + marge, z + profondeur / 2 + marge)
    for (let j = min.j; j <= max.j; j++) {
      for (let i = min.i; i <= max.i; i++) {
        if (this.dansGrille(i, j)) this.bloquee[j * this.nb + i] = 1
      }
    }
  }

  /**
   * Si la case visée est bloquée, trouve la case libre la plus proche
   * (on cherche en cercles de plus en plus grands).
   */
  caseLibreProche(i, j) {
    if (this.estLibre(i, j)) return { i, j }
    for (let r = 1; r < 30; r++) {
      let meilleure = null
      let meilleureDist = Infinity
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue // seulement le contour
          if (!this.estLibre(i + di, j + dj)) continue
          const d = di * di + dj * dj
          if (d < meilleureDist) {
            meilleureDist = d
            meilleure = { i: i + di, j: j + dj }
          }
        }
      }
      if (meilleure) return meilleure
    }
    return null
  }

  /**
   * Vérifie qu'on peut aller en ligne droite de A à B sans toucher d'obstacle
   * (on avance par petits pas et on regarde chaque case traversée).
   */
  ligneLibre(a, b) {
    const dx = b.x - a.x
    const dz = b.z - a.z
    const distance = Math.hypot(dx, dz)
    const pas = this.tailleCase / 3
    const n = Math.ceil(distance / pas)
    for (let k = 0; k <= n; k++) {
      const t = n === 0 ? 0 : k / n
      const c = this.versCase(a.x + dx * t, a.z + dz * t)
      if (!this.estLibre(c.i, c.j)) return false
    }
    return true
  }

  /**
   * Cherche un chemin du point « depart » au point « arrivee » (positions en mètres).
   * Renvoie une liste de points à suivre, ou null si c'est impossible.
   */
  trouverChemin(depart, arrivee) {
    let d = this.versCase(depart.x, depart.z)
    let a = this.versCase(arrivee.x, arrivee.z)
    d = this.caseLibreProche(d.i, d.j)
    const arriveeLibre = this.caseLibreProche(a.i, a.j)
    if (!d || !arriveeLibre) return null
    const viseeExacte = arriveeLibre.i === a.i && arriveeLibre.j === a.j
    a = arriveeLibre

    // Cas simple : ligne droite possible → pas besoin de chercher plus.
    const pointFinal = viseeExacte ? new THREE.Vector3(arrivee.x, 0, arrivee.z) : this.versMonde(a.i, a.j)
    if (this.ligneLibre(depart, pointFinal)) return [pointFinal]

    const nb = this.nb
    const total = nb * nb
    const indexDepart = d.j * nb + d.i
    const indexArrivee = a.j * nb + a.i

    // coutDepuisDepart[n] = distance parcourue pour atteindre la case n.
    const coutDepuisDepart = new Float32Array(total).fill(Infinity)
    const parent = new Int32Array(total).fill(-1)
    const fermee = new Uint8Array(total)
    const file = new FileDePriorite()

    // Estimation de la distance restante (ligne « en diagonale puis droite »).
    const estimation = (i, j) => {
      const dx = Math.abs(i - a.i)
      const dy = Math.abs(j - a.j)
      return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)
    }

    coutDepuisDepart[indexDepart] = 0
    file.ajouter(indexDepart, estimation(d.i, d.j))

    // Les 8 voisins d'une case (droite, gauche, haut, bas et diagonales).
    const voisins = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ]

    let trouve = false
    while (file.taille > 0) {
      const courant = file.extraire()
      if (courant === indexArrivee) {
        trouve = true
        break
      }
      if (fermee[courant]) continue
      fermee[courant] = 1
      const ci = courant % nb
      const cj = (courant - ci) / nb

      for (const [di, dj, cout] of voisins) {
        const ni = ci + di
        const nj = cj + dj
        if (!this.estLibre(ni, nj)) continue
        // Pas de raccourci en diagonale à travers le coin d'un obstacle.
        if (di !== 0 && dj !== 0 && (!this.estLibre(ci + di, cj) || !this.estLibre(ci, cj + dj))) continue
        const n = nj * nb + ni
        if (fermee[n]) continue
        const nouveauCout = coutDepuisDepart[courant] + cout
        if (nouveauCout < coutDepuisDepart[n]) {
          coutDepuisDepart[n] = nouveauCout
          parent[n] = courant
          file.ajouter(n, nouveauCout + estimation(ni, nj))
        }
      }
    }

    if (!trouve) return null

    // On remonte de l'arrivée jusqu'au départ grâce aux « parents ».
    const cases = []
    for (let n = indexArrivee; n !== -1; n = parent[n]) {
      const i = n % nb
      cases.push(this.versMonde(i, (n - i) / nb))
    }
    cases.reverse()
    cases[cases.length - 1] = pointFinal

    return this.lisser(depart, cases)
  }

  /**
   * Lissage : on supprime les points intermédiaires inutiles
   * quand on peut aller directement plus loin en ligne droite.
   */
  lisser(depart, points) {
    const resultat = []
    let ancre = new THREE.Vector3(depart.x, 0, depart.z)
    let k = 0
    while (k < points.length) {
      // On cherche le point le plus éloigné atteignable en ligne droite.
      let plusLoin = k
      for (let m = points.length - 1; m > k; m--) {
        if (this.ligneLibre(ancre, points[m])) {
          plusLoin = m
          break
        }
      }
      resultat.push(points[plusLoin])
      ancre = points[plusLoin]
      k = plusLoin + 1
    }
    return resultat
  }
}

/**
 * File de priorité (petit outil interne) : donne toujours en premier
 * la case la plus prometteuse. Rangée sous forme de « tas » pour aller vite.
 */
class FileDePriorite {
  constructor() {
    this.elements = []
    this.priorites = []
  }
  get taille() {
    return this.elements.length
  }
  ajouter(element, priorite) {
    const e = this.elements
    const p = this.priorites
    e.push(element)
    p.push(priorite)
    let k = e.length - 1
    while (k > 0) {
      const parent = (k - 1) >> 1
      if (p[parent] <= p[k]) break
      ;[e[k], e[parent]] = [e[parent], e[k]]
      ;[p[k], p[parent]] = [p[parent], p[k]]
      k = parent
    }
  }
  extraire() {
    const e = this.elements
    const p = this.priorites
    const premier = e[0]
    const dernierE = e.pop()
    const dernierP = p.pop()
    if (e.length > 0) {
      e[0] = dernierE
      p[0] = dernierP
      let k = 0
      for (;;) {
        const g = 2 * k + 1
        const d = g + 1
        let plusPetit = k
        if (g < e.length && p[g] < p[plusPetit]) plusPetit = g
        if (d < e.length && p[d] < p[plusPetit]) plusPetit = d
        if (plusPetit === k) break
        ;[e[k], e[plusPetit]] = [e[plusPetit], e[k]]
        ;[p[k], p[plusPetit]] = [p[plusPetit], p[k]]
        k = plusPetit
      }
    }
    return premier
  }
}
