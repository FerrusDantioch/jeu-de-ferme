# Journal du projet — La Petite Ferme

*(nom provisoire, modifiable dans `src/config.js`)*

## ✅ Jalon 1 — Socle (terminé)

### Ce qui est fait
- **Projet** : Vite + Three.js en JavaScript, code commenté en français, en petits fichiers.
- **Scène 3D** : un pré d'herbe, un chemin de terre, des arbres, des rochers et une clôture,
  le tout fabriqué en formes simples (« low-poly »). Les décors répétés sont dessinés
  « en instances » (plus rapide).
- **Personnage** : fermier ou fermière à chapeau de paille, avec une animation de marche
  (bras et jambes qui se balancent) et une légère respiration à l'arrêt.
- **Caméra** : vue de dessus en biais, qui suit le personnage en douceur, sans jamais tourner.
  Elle recule un peu quand le téléphone est tenu en hauteur.
- **Déplacement** :
  - toucher (ou cliquer) le sol : le personnage y va tout seul en **contournant les obstacles** ;
  - toucher un obstacle : il va au point libre le plus proche ;
  - un cercle blanc montre la destination, puis s'efface ;
  - au clavier : flèches, **Z Q S D** (ou W A S D).
- **Interface** : bulle d'aide au démarrage, bouton « À propos » (auteur : Ferrus Dantioch),
  bouton « Installer » qui apparaît quand le téléphone le permet. Boutons de 56 px minimum.
- **PWA** : manifest, icônes (dont une version ronde pour Android), service worker.
  Testé : le jeu se recharge **sans Internet** après une première visite.
- **Performance** : densité de pixels plafonnée (1,5), ombres simples, peintures partagées.
- **Publication** : fichier `.github/workflows/publication.yml` prêt pour GitHub Pages
  (se déclenche quand la branche `main` est mise à jour).

### Vérifications faites
- Construction du jeu sans erreur (`npm run build`).
- Test automatique sur un téléphone simulé (Pixel 7) et un écran d'ordinateur :
  déplacement au toucher, à la souris, au clavier, contournement d'un rocher,
  fenêtre « À propos », service worker actif, relance hors ligne : tout est bon.

### Où modifier quoi
| Je veux changer…              | Fichier                     |
|-------------------------------|-----------------------------|
| Le nom du jeu, l'auteur       | `src/config.js`             |
| La vitesse du personnage      | `src/config.js`             |
| Les couleurs                  | `src/modeles/materiaux.js`  |
| La place des arbres / rochers | `src/monde/terrain.js`      |
| Le dessin de l'icône          | `scripts/generer-icones.mjs` puis `npm run icones` |

## 📌 Décisions prises
- **Mise en ligne** : option 2 choisie. Le jeu sera publié sur GitHub Pages seulement au
  jalon 6. Le fichier de publication automatique est déjà prêt et attend ce moment.

## 🔜 Ce qui reste
- **Jalon 2 — Monde** : ferme extérieure, maison / étable / boutique, entrée et sortie avec fondu,
  PNJ qui marchent.
- **Jalon 3 — Potager et animaux** : plantation, arrosage, croissance en temps réel, récolte,
  soins des animaux, inventaire, sauvegarde.
- **Jalon 4 — Économie et clients** : boutique, commandes, pièces, expérience.
- **Jalon 5 — Quêtes** : quotidiennes, puis calendrier des fêtes avec mode de test de date.
- **Jalon 6 — Finitions** : sons, réglages (joystick, taille du texte, réduire les animations,
  ombres), optimisation mobile, export / import de sauvegarde, publication finale.

## Commandes utiles (pour un développeur)
- `npm install` : installe les outils (une seule fois).
- `npm run dev` : lance le jeu en local pour le développement.
- `npm run build` : fabrique la version finale dans `dist/`.
- `npm run preview` : essaie la version finale en local.
