/**
 * calendrier.js — la date du jour, minuit, Pâques et les fêtes.
 *
 * La date utilisée par le jeu est celle du téléphone (heure locale).
 * Le « mode test » (caché) permet de faire comme si on était un autre jour,
 * pour essayer les fêtes : cette date de test est rangée à part et ne touche
 * pas à la pousse des plantes ni aux animaux (eux suivent toujours l'heure réelle).
 */
import { FETES } from '../donnees/fetes.js'

const CLE_DATE_TEST = 'jeu-de-ferme:date-test'

/** La date de test (« 2026-12-24 ») ou null. */
export function dateDeTest() {
  try {
    return localStorage.getItem(CLE_DATE_TEST)
  } catch {
    return null
  }
}

/** Active (texte « AAAA-MM-JJ ») ou retire (null) la date de test. */
export function choisirDateDeTest(texte) {
  try {
    if (texte) localStorage.setItem(CLE_DATE_TEST, texte)
    else localStorage.removeItem(CLE_DATE_TEST)
  } catch {
    /* mémoire inaccessible : tant pis */
  }
}

/** Aujourd'hui (ou le jour de test), à l'heure actuelle. */
export function dateDuJour() {
  const vraie = new Date()
  const test = dateDeTest()
  if (!test) return vraie
  const [a, m, j] = test.split('-').map(Number)
  if (!a || !m || !j) return vraie
  return new Date(a, m - 1, j, vraie.getHours(), vraie.getMinutes(), vraie.getSeconds())
}

/** « 2026-12-24 » : le jour, sous forme de texte (heure locale). */
export function cleDuJour(date = dateDuJour()) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const j = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${j}`
}

/** Millisecondes jusqu'au prochain minuit (heure locale). */
export function tempsAvantMinuit(date = new Date()) {
  const minuit = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return minuit - date
}

/**
 * Le dimanche de Pâques d'une année (calendrier grégorien).
 * Méthode de calcul classique dite « de Meeus » : une suite d'opérations
 * qui donne le mois et le jour, sans avoir besoin d'une table.
 */
export function dimancheDePaques(annee) {
  const a = annee % 19
  const b = Math.floor(annee / 100)
  const c = annee % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mois = Math.floor((h + l - 7 * m + 114) / 31)
  const jour = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(annee, mois - 1, jour)
}

// Un jour sans les heures (pour comparer des dates simplement).
const jourSeul = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const decaler = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Vrai si la date tombe pendant la période de la fête. */
function pendant(fete, date) {
  const jour = jourSeul(date)
  const q = fete.quand
  if (q.type === 'paques') {
    const p = dimancheDePaques(jour.getFullYear())
    return jour >= decaler(p, q.debut) && jour <= decaler(p, q.fin)
  }
  // Fête à date fixe : on essaie l'année de la date ET l'année d'avant
  // (pour les périodes à cheval sur deux années, ex. : 31 décembre → 2 janvier).
  for (const annee of [jour.getFullYear(), jour.getFullYear() - 1]) {
    const debut = new Date(annee, q.debut[0] - 1, q.debut[1])
    let fin = new Date(annee, q.fin[0] - 1, q.fin[1])
    if (fin < debut) fin = new Date(annee + 1, q.fin[0] - 1, q.fin[1])
    if (jour >= debut && jour <= fin) return true
  }
  return false
}

/** La fête du jour (ou null). S'il y en a deux, la première de la liste gagne. */
export function feteDuJour(date = dateDuJour()) {
  return FETES.find((f) => pendant(f, date)) || null
}

/** Texte lisible d'une date : « mardi 24 décembre 2026 ». */
export function texteDate(date = dateDuJour()) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
