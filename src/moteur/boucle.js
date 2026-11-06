/**
 * boucle.js — la « boucle de jeu ».
 *
 * Un jeu vidéo, c'est un dessin animé qui se redessine sans arrêt (environ 60 fois par seconde).
 * À chaque image, on : 1) met à jour le monde (déplacements…), 2) redessine l'écran.
 */
import * as THREE from 'three'

export function demarrerBoucle(miseAJour) {
  const horloge = new THREE.Timer()
  horloge.connect(document) // met l'horloge en pause quand l'onglet est caché

  function image(temps) {
    horloge.update(temps)
    // On limite le pas de temps : si le téléphone a « figé » une seconde,
    // on évite que le personnage fasse un grand bond.
    const dt = Math.min(horloge.getDelta(), 0.1)
    miseAJour(dt)
  }

  // setAnimationLoop : Three.js appelle « image » avant chaque rafraîchissement de l'écran.
  return image
}
