/**
 * pwa.js — active le « service worker » et annonce les mises à jour.
 *
 * Le service worker est un petit programme que le navigateur garde sur l'appareil.
 * À la première visite, il enregistre tous les fichiers du jeu ; ensuite, le jeu
 * s'ouvre même sans Internet.
 *
 * Quand une nouvelle version est publiée, il la télécharge discrètement, puis
 * ATTEND : rien ne change tant que la personne n'a pas touché « Mettre à jour ».
 * C'est elle qui garde le contrôle (le jeu ne se recharge jamais tout seul).
 */
import { registerSW } from 'virtual:pwa-register'

/**
 * @param {object} o
 *  - surMiseAJour(appliquer) : appelée quand une nouvelle version est prête ;
 *    appeler `appliquer()` l'installe et relance le jeu.
 */
export function activerModeHorsLigne({ surMiseAJour } = {}) {
  // Le service worker ne fonctionne que sur un site sécurisé (https) ou en local.
  if (!('serviceWorker' in navigator)) return
  const appliquer = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (!surMiseAJour) return
      surMiseAJour(() => {
        appliquer(true) // installe la nouvelle version, puis recharge la page
        // Filet de sécurité : si rien ne s'est passé au bout de 3 secondes, on recharge
        // nous-mêmes (la nouvelle version est alors déjà en place).
        setTimeout(() => window.location.reload(), 3000)
      })
    },
    onRegisteredSW(adresse, enregistrement) {
      if (!enregistrement) return
      // On regarde s'il y a du nouveau chaque fois que le jeu revient au premier plan.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') enregistrement.update().catch(() => {})
      })
    },
  })
}
