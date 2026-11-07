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

## ✅ Jalon 3 — Potager et animaux (terminé)

### Ce qui est fait
- **Potager** : 8 parcelles. On touche une parcelle et une fiche s'ouvre en bas de l'écran
  pour **planter**, **arroser** ou **récolter**.
  - 6 cultures, avec 4 étapes visibles (graine, pousse, jeune plante, prête) :
    salade 4 min, carotte 8 min, fraise 15 min, tomate 25 min, maïs 40 min, citrouille 1 h ;
  - elles poussent en **temps réel, même jeu fermé** ;
  - **arroser est facultatif** : la plante pousse 2× plus vite pendant 10 minutes ;
    une plante oubliée ne fane jamais ;
  - chaque récolte rend **au moins une graine** : on n'en manque jamais ;
  - l'icône du légume apparaît au-dessus de la parcelle quand il est prêt.
- **Animaux** : 3 poules et 2 moutons dans l'enclos, 2 vaches dans l'étable.
  - Ils se promènent, picorent ou broutent.
  - Chacun a un **ventre** et une **humeur** (deux barres dans sa fiche). On peut le
    **nourrir**, lui donner une **friandise** (maïs, carotte ou salade) et le **caresser**.
  - Bien soignés, ils donnent des **œufs**, du **lait** ou de la **laine**. Une petite icône
    🥚 🥛 🧶 apparaît au-dessus d'eux, et on la ramasse en les touchant.
  - Ils **ne meurent jamais** et ne tombent jamais malades : s'ils ont faim ou s'ennuient,
    ils font juste une pause de production. Les textes restent doux (« Un petit creux… »).
  - Le foin et le grain sont **gratuits et illimités** dans la réserve près de l'enclos
    et dans le tas de foin de l'étable.
- **Sac (inventaire)** : bouton 🎒 en haut. Tout est rangé par catégorie : graines, récoltes,
  produits, nourriture.
- **Sauvegarde automatique** sur le téléphone, sans rien envoyer sur Internet :
  - toutes les 15 secondes s'il y a du changement, et dès que le jeu passe en arrière-plan ;
  - on reprend là où on s'était arrêté, même dans un bâtiment ;
  - si la sauvegarde est abîmée, elle est mise de côté (pas effacée), un message gentil
    s'affiche et une nouvelle partie commence.
- **Petits plus** : des textes qui s'envolent (« +3 🥕 », « 💕 »). La caméra se décale quand
  une fiche est ouverte pour garder le personnage visible. Toucher entre des animaux serrés
  choisit le bon.

### Vérifications faites
- Test automatique sur un téléphone simulé :
  - planter, arroser, récolter (récolte et graines ajoutées au sac) ;
  - prendre du grain à la réserve ;
  - ramasser un œuf, nourrir et caresser une poule ;
  - ouvrir le sac ;
  - fiche d'une vache dans l'étable.
- **Jeu fermé 10 minutes** (simulé) : la carotte est prête au retour.
- Rechargement : sac, plantes et position retrouvés.
- Sauvegarde abîmée : copie gardée de côté et message affiché.
- Tests des jalons 1 et 2 relancés : tout passe, y compris hors ligne. Aucune erreur.

### Où modifier quoi (en plus des jalons précédents)
| Je veux changer…                                     | Fichier                    |
|------------------------------------------------------|----------------------------|
| Les cultures (temps de pousse, récolte), l'arrosage  | `src/donnees/cultures.js`  |
| Les animaux (noms, nourriture, production, faim)     | `src/donnees/animaux.js`   |
| Les objets du sac (noms, icônes)                     | `src/donnees/objets.js`    |
| Les textes des fiches (potager, animaux, réserve)    | `src/jeu/fiches.js`        |
| La taille du potager (nombre de parcelles)           | `src/donnees/ferme.js`     |

## ✅ Jalon 4 — Économie et clients (terminé)

### Ce qui est fait
- **Pièces 🪙 et niveau ⭐**, affichés en haut à gauche, sous le nom du lieu. Toucher ce
  compteur ouvre **« Ma progression »** : niveau, barre d'expérience, ce qui se débloque
  au prochain niveau, petites statistiques.
- **Expérience** : on en gagne en récoltant, en ramassant les produits des animaux, en les
  nourrissant quand ils ont faim, et surtout en livrant des commandes. Un nouveau niveau
  s'annonce par une **petite fête** douce (une fenêtre, sans flash) qui liste les nouveautés.
- **La boutique de Lila** (on touche Lila ou son comptoir), avec deux onglets :
  - **Acheter** : des graines (+1 ou +5) et des animaux à adopter, avec une confirmation
    avant d'adopter. Ce qui n'est pas encore débloqué affiche 🔒 « Niveau 3 ».
    Places maximum : 6 poules, 4 moutons, 3 vaches.
    Un animal adopté apparaît tout de suite dans l'enclos ou l'étable, avec un prénom.
  - **Vendre** : récoltes, œufs, lait, laine (1 ou tout). La boutique rappelle combien il
    en faut pour les commandes en cours, pour ne pas tout vendre par erreur.
- **Commandes** : Mamie Rose, Léon et Théo ont chacun au plus une commande à la fois.
  - Une icône 📋 flotte au-dessus d'eux. On les touche pour voir la commande et la livrer.
  - On peut aussi tout livrer depuis le **tableau des commandes**, près de l'allée,
    sans avoir à chercher les villageois.
  - **Aucune limite de temps, aucune pénalité** : une commande attend aussi longtemps
    qu'il faut. Une nouvelle arrive 3 à 8 minutes après chaque livraison.
  - On ne demande que ce que le joueur peut produire : cultures débloquées et produits
    des animaux qu'il possède.
  - La toute première commande sert à apprendre : 2 salades pour Mamie Rose.
- **Ancienne partie** : une sauvegarde du jalon 3 est complétée automatiquement
  (pièces de départ, commandes) sans rien perdre.

### Vérifications faites
- Test automatique sur un téléphone simulé :
  - livrer une commande depuis le tableau (pièces et ⭐ gagnées) ;
  - passer au niveau 2 (fête affichée) et ouvrir « Ma progression » ;
  - acheter 5 graines, adopter une poule (elle apparaît dans l'enclos), vendre des œufs ;
  - commande de Léon avec son icône 📋 ;
  - reprise d'une ancienne sauvegarde.
- Tests des jalons 2 et 3 relancés : tout passe, y compris hors ligne. Aucune erreur.
- Corrigé en route : les bulles des villageois passaient devant les fenêtres, et la
  boutique ne se mettait pas à jour quand les pièces changeaient.

### Où modifier quoi (en plus des jalons précédents)
| Je veux changer…                                        | Fichier                     |
|---------------------------------------------------------|-----------------------------|
| Prix, niveaux de déblocage, expérience, noms des animaux | `src/donnees/economie.js`  |
| Clients, délai entre commandes, récompenses             | `src/donnees/commandes.js`  |
| Ce que disent les villageois quand ils commandent       | `src/donnees/pnj.js` (`demandes`) |
| Place du tableau des commandes                          | `src/donnees/ferme.js`      |

## ✅ Jalon 5 — Quêtes et fêtes (terminé)

### Ce qui est fait
- **Quêtes du jour** : bouton 📜 « Quêtes » en haut.
  - **3 quêtes par jour**, renouvelées **à minuit, heure du téléphone**. Exemples :
    « Récolter 4 fois au potager », « Faire 5 câlins aux animaux », « Livrer 1 commande ».
  - Une barre montre l'avancée. Quand une quête est finie, le personnage le dit, un petit
    nombre apparaît sur le bouton 📜, et on touche « 🎁 Recevoir » (pièces + ⭐).
  - Pas d'obligation : une quête finie mais oubliée est **donnée automatiquement** à minuit.
    Les quêtes sur les animaux ne sont proposées que s'il y en a à la ferme.
- **Fêtes**, décrites dans `src/donnees/fetes.js` : Nouvel An, Chandeleur, Saint-Valentin,
  **Pâques (calculée automatiquement chaque année)**, Fête de la musique, Fête nationale,
  Halloween, Noël. Pendant une fête :
  - une fenêtre l'annonce (une fois par jour) et son icône s'affiche à côté du nom du lieu ;
  - la ferme est décorée : œufs, sapin et cadeaux, citrouilles souriantes, cœurs,
    guirlandes de fanions ;
  - les villageois en parlent ;
  - certaines fêtes ajoutent une **quête spéciale**. À Pâques, il y a une **chasse aux œufs** :
    8 œufs cachés près des arbres, chacun rapporte des pièces, et ils se recachent chaque
    jour de fête.
- **Mode test caché** : dans « À propos », toucher **5 fois le numéro de version**
  (sans limite de temps entre les touchers). On peut :
  - choisir une date, ou sauter directement à une fête ;
  - passer au jour suivant (nouvelles quêtes) ;
  - revenir à la vraie date.
  Tant qu'une fausse date est active, une étiquette 🧪 reste visible en haut (la toucher
  rouvre le panneau). La fausse date ne change que le calendrier : les plantes et les
  animaux suivent toujours l'heure réelle.

### Vérifications faites
- **Calcul de Pâques** comparé aux vraies dates (1943, 2024 à 2027, 2038, 2285 : tout juste),
  et les 8 fêtes testées à leurs premiers et derniers jours, y compris le passage
  d'une année à l'autre pour le Nouvel An.
- Test automatique sur un téléphone simulé :
  - une quête avance, le nombre s'affiche sur 📜, la récompense est reçue ;
  - passage de minuit simulé : la récompense oubliée est bien donnée ;
  - le mode test s'ouvre par 5 touchers ; Pâques s'active avec sa quête spéciale et son
    annonce ; un œuf trouvé rapporte 5 pièces ;
  - Noël, Halloween, Fête nationale et Saint-Valentin sont décorés ;
  - le retour à la vraie date retire décor et étiquette 🧪.
- Tests des jalons 2, 3 et 4 relancés : tout passe, y compris hors ligne. Aucune erreur.

### Où modifier quoi (en plus des jalons précédents)
| Je veux changer…                                     | Fichier                    |
|------------------------------------------------------|----------------------------|
| Les fêtes (dates, messages, décor, quête spéciale)   | `src/donnees/fetes.js`     |
| Les quêtes du jour (textes, objectifs, récompenses)  | `src/donnees/quetes.js`    |
| L'emplacement des œufs de Pâques                     | `src/monde/decorations-fetes.js` |

## ✅ Jalon 6 — Finitions (terminé)

### Ce qui est fait
- **⚙️ Réglages** (bouton en haut), retenus sur l'appareil :
  - 🔊 sons activés ou coupés, et volume doux, moyen ou fort ;
  - 🕹️ joystick à l'écran (en bas à gauche, caché quand une fiche est ouverte) ;
  - 🔠 taille du texte : normale, grande, très grande ;
  - 🌀 animations normales ou réduites (suit le réglage du téléphone par défaut) ;
  - 🌗 ombres oui ou non, et 🔋 mode économie (image un peu moins fine, plus fluide).
  On y trouve aussi « ❓ Comment jouer » (petit guide) et « ℹ️ À propos », qui n'encombre
  plus la barre du haut.
- **Sons doux** fabriqués par le code : aucun fichier à télécharger, ils marchent hors ligne.
  Petits « pop », carillons, une pièce qui tinte, une courte mélodie au nouveau niveau.
- **Sauvegarde dans un fichier** (dans les Réglages) :
  - 📤 Exporter : le téléphone enregistre un petit fichier dans « Téléchargements » ;
  - 📥 Importer : un fichier d'un autre jeu est refusé, et on confirme avant de remplacer ;
  - 🆕 Nouvelle partie : double confirmation, avec le conseil d'exporter d'abord.
- **Optimisation** : le téléphone dessine maintenant environ **3 fois moins de pièces par
  image** (84 au lieu de 253 au départ). Les couleurs sont « peintes » sur les formes, ce qui
  permet de coller ensemble toutes les pièces qui ne bougent pas. Si le jeu reste lent les
  premières secondes, il propose une seule fois le mode économie.
- **Corrections** :
  - les boutons « cachés » (ex. : « Installer ») s'affichaient quand même ; c'est corrigé ;
  - une fenêtre ouverte depuis une autre passe maintenant toujours au premier plan.
- Version **1.0.0**.

### Vérifications faites
- Test automatique sur un téléphone simulé :
  - tous les réglages ;
  - le joystick fait marcher le personnage ;
  - export, puis import d'un fichier modifié (bien repris) ;
  - un mauvais fichier est refusé ;
  - nouvelle partie avec double confirmation ;
  - « Comment jouer », « À propos », et mode test toujours accessible.
- Tests des jalons 2 à 5 relancés : tout passe, y compris hors ligne. Aucune erreur.

### Où modifier quoi
| Je veux changer…                         | Fichier                     |
|------------------------------------------|-----------------------------|
| Les sons (notes, durée)                  | `src/moteur/sons.js`        |
| Les réglages par défaut                  | `src/jeu/reglages.js`       |
| Le texte de « Comment jouer »            | `src/ui/reglages.js`        |

## ✅ Après le jalon 6 — S'asseoir (version 1.1.0)

### Ce qui est fait
- **On peut s'asseoir** : on touche un banc, une chaise, un fauteuil ou une botte de foin.
  Le personnage y marche, se tourne, s'assoit les jambes pendantes, et dit parfois une
  petite phrase (« Ahh, on est bien ici 😌 »).
- **Pour se relever** : toucher le sol ailleurs, ou bouger au clavier ou au joystick.
- **Où s'asseoir** :
  - dehors, 4 bancs : près de l'allée, face à l'étang, au bord de l'enclos (pour regarder
    les animaux) et au bord de la route du village ;
  - dans la maison, les 2 chaises de la table et un nouveau fauteuil près de la cheminée ;
  - dans l'étable, la botte de foin de droite.
- Nouvelle quête du jour possible : « Se reposer sur un banc ou une chaise ».
- **Corrigé en route** :
  - les zones à toucher des bâtiments suivent mieux leur forme (murs, puis toit plus
    étroit) et ne « volent » plus les touchers des objets derrière eux ;
  - un personnage coincé contre un obstacle peut toujours en sortir au clavier.
- **Publication** : seule la branche `main` met à jour le jeu en ligne.

### Vérifications faites
- Test automatique : s'asseoir sur chaque type de siège, puis se relever en touchant le sol
  et au clavier ; la quête « se reposer » avance.
- Tests des jalons 2 à 6 relancés : tout passe, y compris hors ligne. Aucune erreur.

### Où modifier quoi
| Je veux changer…                          | Fichier                     |
|-------------------------------------------|-----------------------------|
| La place et l'orientation des bancs       | `src/donnees/ferme.js`      |
| Les phrases dites en s'asseyant           | `src/monde/sieges.js`       |

## 🚀 Mise en ligne (GitHub Pages)
Le jeu est en ligne : https://ferrusdantioch.github.io/jeu-de-ferme/
Le fichier `.github/workflows/publication.yml` le republie à chaque mise à jour de `main`.
Les nouveautés sont préparées sur une branche à part, puis fusionnées dans `main`.

**À faire une seule fois, dans GitHub :** Settings → Pages → « Build and deployment » →
Source : **GitHub Actions**. Tant que ce n'est pas fait, la publication échoue (croix rouge
dans l'onglet « Actions ») : c'est normal, et sans danger.

## 📌 Décisions prises
- **Jeu doux, sans échec** (jalon 3) : arrosage facultatif (bonus de vitesse), au moins une
  graine rendue à chaque récolte, nourriture des animaux gratuite et illimitée, animaux
  qui ne meurent jamais.
- **Commandes sans stress** (jalon 4) : jamais d'expiration ni de pénalité, une seule
  commande par villageois, livraison possible depuis le tableau des commandes.
- **Mode test** (jalon 5) : caché derrière 5 touchers sur le numéro de version ; il ne
  change que le calendrier (fêtes, quêtes), jamais la pousse ni les animaux.
- **Mise en ligne** : option 2 choisie (publication au jalon 6). Comme le dépôt n'a pas de
  branche `main`, la publication se fait depuis sa branche principale actuelle.

## 🔜 Ce qui reste
- Vérifier la fluidité sur le vrai téléphone, une fois le jeu en ligne.

## Commandes utiles (pour un développeur)
- `npm install` : installe les outils (une seule fois).
- `npm run dev` : lance le jeu en local pour le développement.
- `npm run build` : fabrique la version finale dans `dist/`.
- `npm run preview` : essaie la version finale en local.
