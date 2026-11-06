/**
 * fondu.js — le fondu doux quand on passe une porte.
 *
 * L'écran se voile d'une couleur crème (pas de noir brutal, pas de flash),
 * le nom du lieu s'affiche au milieu, puis le voile se lève sur le nouveau lieu.
 * Si le téléphone demande « moins d'animations », le changement est presque instantané.
 */

const DUREE = 450 // durée du fondu, en millisecondes

export function creerFondu() {
  const voile = document.createElement('div')
  voile.id = 'fondu'
  voile.setAttribute('aria-hidden', 'true')
  const titre = document.createElement('div')
  titre.className = 'fondu-titre'
  voile.appendChild(titre)
  document.body.appendChild(voile)

  const moinsDAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
  const attendre = (ms) => new Promise((ok) => setTimeout(ok, moinsDAnimations.matches ? Math.min(ms, 60) : ms))

  return {
    /** Voile l'écran et affiche le nom du lieu de destination. */
    async fermer(texte = '') {
      titre.textContent = texte
      voile.classList.add('visible')
      await attendre(DUREE)
    },
    /** Lève le voile. */
    async ouvrir() {
      voile.classList.remove('visible')
      await attendre(DUREE)
    },
    /** Attend un petit moment (écran voilé). */
    patienter: attendre,
  }
}
