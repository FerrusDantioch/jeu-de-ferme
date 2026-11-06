/**
 * gestionnaire.js — le « gestionnaire de lieux » : il fait passer d'un lieu à l'autre
 * (dehors → maison → dehors…) avec un fondu doux.
 *
 * Chaque intérieur est rangé dans son propre fichier et n'est CHARGÉ et CONSTRUIT
 * que la première fois qu'on y entre (« chargement à la demande ») :
 * le jeu démarre plus vite et le téléphone garde de la mémoire.
 * Ensuite, le lieu est gardé en mémoire : la deuxième visite est immédiate.
 */

// La liste des lieux et le fichier de chacun. Pour ajouter un lieu : une ligne ici,
// un fichier dans src/lieux/, et un bâtiment qui y mène dans src/donnees/ferme.js.
const CHARGEURS = {
  exterieur: () => import('./exterieur.js'),
  maison: () => import('./maison.js'),
  etable: () => import('./etable.js'),
  boutique: () => import('./boutique.js'),
}

// Après un changement de lieu, petit temps de répit avant de pouvoir repasser une porte
// (évite de ressortir aussitôt si on garde une touche enfoncée).
const REPIT_APRES_PORTE = 0.6
// Distance à la porte en dessous de laquelle on la passe.
const DISTANCE_PORTE = 0.75

/**
 * @param {object} ctx
 *  - scene : la scène 3D
 *  - changerAmbiance(ambiance) : change le ciel / la lumière (voir rendu.js)
 *  - personnage : le joueur
 *  - placerCamera(position) : recentre la caméra d'un coup
 *  - fondu, bulles, marqueur : outils d'interface
 *  - surChangement(lieu) : appelé à chaque nouveau lieu (optionnel)
 */
export function creerGestionnaireLieux(ctx) {
  const { scene, changerAmbiance, personnage, placerCamera, fondu, bulles, marqueur } = ctx
  const lieux = new Map() // id → promesse du lieu construit
  let actuel = null
  let enTransition = false
  let repit = 0

  /** Charge et construit un lieu (une seule fois), puis le garde en mémoire. */
  function obtenir(id) {
    if (!lieux.has(id)) {
      const chargeur = CHARGEURS[id]
      if (!chargeur) return Promise.reject(new Error(`Lieu inconnu : « ${id} »`))
      const promesse = chargeur().then((module) => module.creerLieu({ bulles }))
      // En cas d'échec, on oublie la promesse pour pouvoir réessayer plus tard.
      promesse.catch(() => lieux.delete(id))
      lieux.set(id, promesse)
    }
    return lieux.get(id)
  }

  /** Installe un lieu à l'écran et y place le personnage. */
  function activer(lieu, idArrivee) {
    if (actuel) scene.remove(actuel.groupe)
    actuel = lieu
    scene.add(lieu.groupe)
    changerAmbiance(lieu.ambiance)
    personnage.grille = lieu.grille
    const arrivee = lieu.arrivees[idArrivee] || Object.values(lieu.arrivees)[0]
    personnage.placer(arrivee.x, arrivee.z, arrivee.angle)
    personnage.porteVisee = null
    placerCamera(personnage.position)
    bulles.toutRetirer()
    marqueur.cacher()
    repit = REPIT_APRES_PORTE
    if (ctx.surChangement) ctx.surChangement(lieu)
  }

  /** Premier lieu, au lancement du jeu (sans fondu : l'écran de chargement est encore là). */
  async function demarrer(id = 'exterieur', idArrivee = 'depart') {
    activer(await obtenir(id), idArrivee)
  }

  /** Passe une porte : fondu, changement de lieu, fondu inverse. */
  async function passerPorte(porte) {
    if (enTransition || repit > 0) return
    enTransition = true
    personnage.arreter()
    try {
      // On charge le lieu PENDANT que l'écran s'assombrit (on gagne du temps).
      const [lieu] = await Promise.all([obtenir(porte.vers), fondu.fermer(porte.titre)])
      activer(lieu, porte.arrivee)
      await fondu.patienter(250) // le temps de lire le nom du lieu
      await fondu.ouvrir()
    } catch (erreur) {
      console.error('Impossible de changer de lieu :', erreur)
      await fondu.ouvrir()
      bulles.dire(personnage.modele, 'Oups… cette porte est coincée. Réessaie dans un instant !', {
        hauteur: 1.8,
      })
    } finally {
      enTransition = false
    }
  }

  /**
   * Au clavier : si le personnage est collé à une porte et pousse vers elle, il entre.
   * @param {{x:number, z:number}} direction  direction demandée au clavier
   */
  function verifierPortesClavier(direction) {
    if (!actuel || enTransition || repit > 0) return
    const p = personnage.position
    for (const porte of actuel.portes) {
      const n = porte.normale
      const dx = p.x - porte.x
      const dz = p.z - porte.z
      // On mesure l'écart sur le côté de la porte, et l'avance vers elle.
      // La zone est assez large : pas besoin d'être parfaitement en face.
      const ecartCote = Math.abs(dx * n.z - dz * n.x)
      const avance = dx * n.x + dz * n.z
      const proche = ecartCote < 1.0 && avance > -0.6
      const versLaPorte = direction.x * n.x + direction.z * n.z > 0.5
      if (proche && versLaPorte) {
        passerPorte(porte)
        return
      }
    }
  }

  /** Appelée à chaque image. */
  function miseAJour(dt) {
    repit = Math.max(0, repit - dt)
    if (!actuel) return
    for (const pnj of actuel.pnj) pnj.miseAJour(dt, personnage)
    if (actuel.miseAJour) actuel.miseAJour(dt)
  }

  return {
    get actuel() {
      return actuel
    },
    get enTransition() {
      return enTransition
    },
    DISTANCE_PORTE,
    demarrer,
    passerPorte,
    verifierPortesClavier,
    miseAJour,
  }
}
