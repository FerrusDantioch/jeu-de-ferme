# 🌱 La Petite Ferme

Un jeu de ferme en 3D, **calme, mignon et sans stress**, à jouer sur téléphone (Android)
ou sur ordinateur, même sans Internet une fois installé.

Créé par **Ferrus Dantioch**.

## Ce qu'on peut faire
- 🌾 Cultiver un potager (6 cultures, qui poussent même quand le jeu est fermé).
- 🐔 S'occuper des poules, des moutons et des vaches (ils ne meurent jamais).
- 🧺 Acheter et vendre à la boutique de Lila, livrer les commandes des villageois.
- 🍎 Cueillir les fruits du verger, 🍳 cuisiner de bons plats, 🎣 pêcher à l'étang.
- 👤 Personnaliser son personnage, adopter un chat ou un chien qui suit partout.
- 🌼 Décorer la ferme, 📖 remplir son carnet de collection.
- 🌸 Vivre les saisons et le jour et la nuit, au rythme du téléphone.
- 📜 Faire les 3 quêtes du jour, fêter Pâques, Halloween, Noël…
- 💾 La partie est sauvegardée toute seule, et peut être exportée dans un fichier.

Sans publicité, sans achat, sans compte, sans collecte de données : tout reste sur l'appareil.

## Confort et contrôle
- 🔄 **Mettre à jour** : quand une nouvelle version est disponible, un bouton « Mettre à jour »
  apparaît en haut de l'écran. Le jeu ne se recharge jamais tout seul : c'est toi qui décides.
  La partie est sauvegardée juste avant.
- ✖️ Chaque fenêtre a une croix en haut à droite et un bouton « Fermer » toujours visible
  en bas (seul le contenu défile). Sur tablette, les fenêtres sont plus larges.
- 🎨 **Trois thèmes** (dans ⚙️ Réglages) : clair, sombre et violet nuit (les couleurs de
  l'Omni-système). Ils changent les fenêtres, les boutons et les textes.
- 🔆 **Luminosité** réglable : normale, douce, tamisée, très tamisée.
- 🔠 **Taille du texte** réglable : normale, grande, très grande.
- 💬 Tous les textes sont en français et te tutoient.
- ℹ️ **À propos** (dans ⚙️ Réglages) : version, licence, confidentialité, contact.

## Jouer
Le jeu est en ligne ici : https://ferrusdantioch.github.io/jeu-de-ferme/
Sur Android, ouvre l'adresse dans Chrome puis touche « 📲 Installer ».

## Publier une nouvelle version
1. Augmente le numéro de version dans `package.json` (ex. : 1.3.0 → 1.3.1).
2. Envoie les changements sur la branche `main` (ou fusionne la branche de travail dans `main`).
3. GitHub construit et publie le jeu tout seul : compte 1 à 2 minutes (onglet « Actions » du dépôt).
4. Sur la tablette, le bouton « 🔄 Mettre à jour » apparaît au lancement suivant
   (ou quand on revient sur le jeu).

## Pour un développeur
```bash
npm install      # installe les outils (une seule fois)
npm run dev      # lance le jeu en local
npm run build    # fabrique la version finale dans dist/
```
Le journal du projet (ce qui a été fait, où modifier quoi) est dans `JOURNAL.md`.

## Licence
© 2026 Ferrus Dantioch — [Creative Commons BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr) :
partage autorisé en citant l'auteur, sans usage commercial ni modification.
Le texte complet est dans le fichier `LICENSE`.
