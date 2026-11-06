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
| La place des arbres / rochers | `src/donnees/ferme.js`      |
| Le dessin de l'icône          | `scripts/generer-icones.mjs` puis `npm run icones` |

## ✅ Jalon 2 — Monde (terminé)

### Ce qui est fait
- **La ferme extérieure** est organisée : des chemins de terre, la maison, l'étable rouge,
  la boutique au store rayé, un enclos (vide pour l'instant), un carré de potager (vide),
  un étang avec nénuphars, un puits, un banc, des panneaux, des fleurs et deux chaumières
  de villageois.
- **Entrer dans un bâtiment** : on touche le bâtiment (n'importe où dessus) et le personnage
  marche jusqu'à la porte, puis entre. Au clavier, il suffit d'avancer contre la porte.
  Le passage se fait avec un **fondu crème** (pas de noir, pas de flash) qui affiche le nom du lieu.
- **Trois intérieurs**, style « maison de poupée » (le mur de devant est bas pour bien voir) :
  - 🏠 la maison : lit, cheminée, cuisine, étagère, table et chaises, plantes ;
  - 🐄 l'étable : trois stalles prêtes pour les animaux, du foin, des seaux ;
  - 🧺 la boutique : le comptoir de Lila, des étagères, des sacs de graines, des paniers.
  Pour sortir : toucher la porte (ou le paillasson), ou avancer vers le bas au clavier.
- **Chargement à la demande** : chaque intérieur est dans son propre fichier, chargé et
  construit seulement la première fois qu'on y entre. Ensuite il reste en mémoire.
- **Villageois** :
  - Mamie Rose, Léon et le petit Théo se promènent, font des pauses, et rentrent parfois
    chez eux un moment avant de ressortir ;
  - Lila tient la boutique et se tourne vers nous quand on s'approche ;
  - ils disent bonjour quand on passe près d'eux, et parlent quand on les touche,
    dans des **bulles** avec leur nom (affichées au moins 4 secondes, plus pour les longues phrases).
- **Interface** : le nom du lieu s'affiche en haut à gauche. Une deuxième aide apparaît
  après le premier pas : « Touchez un bâtiment pour y entrer ». Toucher une chaumière fermée
  fait dire au personnage à qui elle appartient.
- **Optimisation** : les pièces immobiles d'un même bâtiment sont « collées » ensemble
  (beaucoup moins de travail pour le téléphone).

### Vérifications faites
- Construction sans erreur. Test automatique sur un téléphone simulé (Pixel 7) et un écran
  d'ordinateur : entrer et sortir des 3 bâtiments au toucher et au clavier, parler à Lila et
  aux villageois, toucher une chaumière, villageois qui se déplacent et rentrent chez eux,
  et **entrée dans la maison sans Internet** après une première visite. Aucune erreur.
- Comme au jalon 1, la vitesse mesurée dans le test (environ 19 images/s) n'est pas
  représentative : la machine de test dessine sans carte graphique. À vérifier sur un vrai
  téléphone lors de la mise en ligne.

### Où modifier quoi (en plus du jalon 1)
| Je veux changer…                                  | Fichier                    |
|---------------------------------------------------|----------------------------|
| La place des bâtiments, chemins, arbres, enclos…  | `src/donnees/ferme.js`     |
| Les villageois : noms, vêtements, phrases, balades | `src/donnees/pnj.js`      |
| Les meubles d'un intérieur                        | `src/lieux/maison.js`, `etable.js`, `boutique.js` |
| L'apparence des bâtiments                         | `src/modeles/batiments.js` |
| L'apparence des meubles                           | `src/modeles/mobilier.js`  |

## 📌 Décisions prises
- **Mise en ligne** : option 2 choisie. Le jeu sera publié sur GitHub Pages seulement au
  jalon 6. Le fichier de publication automatique est déjà prêt et attend ce moment.

## 🔜 Ce qui reste
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
