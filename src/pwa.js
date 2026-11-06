/**
 * pwa.js — active le « service worker ».
 *
 * Le service worker est un petit programme que le navigateur garde sur le téléphone.
 * À la première visite, il enregistre tous les fichiers du jeu ; ensuite, le jeu
 * s'ouvre même sans Internet. Quand une nouvelle version est publiée, il la
 * télécharge discrètement et l'utilise au lancement suivant.
 */
import { registerSW } from 'virtual:pwa-register'

export function activerModeHorsLigne() {
  // Le service worker ne fonctionne que sur un site sécurisé (https) ou en local.
  if (!('serviceWorker' in navigator)) return
  registerSW({ immediate: true })
}
