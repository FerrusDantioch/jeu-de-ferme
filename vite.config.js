/**
 * vite.config.js — configuration de Vite, l'outil qui « assemble » le jeu.
 *
 * Vite prend tous nos petits fichiers et en fabrique un site web optimisé
 * (dans le dossier dist/) prêt à être mis en ligne.
 */
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { NOM_DU_JEU, NOM_COURT, COULEUR_THEME, COULEUR_FOND } from './src/config.js'

// Numéro de version lu dans package.json (affiché dans « À propos »).
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

/**
 * Petit module maison : remplace %NOM_DU_JEU% dans index.html
 * par le nom défini dans src/config.js (un seul endroit à modifier).
 */
function injecterNomDuJeu() {
  return {
    name: 'injecter-nom-du-jeu',
    transformIndexHtml(html) {
      return html
        .replaceAll('%NOM_DU_JEU%', NOM_DU_JEU)
        .replaceAll('%COULEUR_THEME%', COULEUR_THEME)
    },
  }
}

export default defineConfig({
  // Chemins « relatifs » : le jeu fonctionnera aussi bien à la racine d'un site
  // que dans un sous-dossier (c'est le cas sur GitHub Pages : /jeu-de-ferme/).
  base: './',

  // Rend le numéro de version disponible dans le code du jeu.
  define: {
    'import.meta.env.VITE_VERSION': JSON.stringify(version),
  },

  plugins: [
    injecterNomDuJeu(),

    // Module PWA : fabrique le « manifest » (carte d'identité de l'appli)
    // et le « service worker » (petit programme qui garde le jeu en mémoire
    // sur le téléphone pour qu'il marche sans Internet).
    VitePWA({
      // « prompt » : une nouvelle version est téléchargée en arrière-plan, mais elle
      // n'est installée que lorsque la personne touche « Mettre à jour » (voir src/pwa.js).
      registerType: 'prompt',
      includeAssets: ['icones/icone.svg', 'icones/apple-touch-icon.png', 'images/logo-omni-systeme.webp'],
      manifest: {
        name: NOM_DU_JEU,
        short_name: NOM_COURT,
        description: 'Un jeu de ferme calme et mignon.',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone', // s'ouvre en plein écran, comme une vraie appli
        orientation: 'any',
        background_color: COULEUR_FOND,
        theme_color: COULEUR_THEME,
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icones/icone-masquable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // version adaptée aux icônes rondes d'Android
          },
        ],
      },
      workbox: {
        // Dès la toute première visite, le service worker s'occupe de la page ouverte
        // (le jeu marche alors hors ligne sans attendre un deuxième lancement).
        clientsClaim: true,
        // Tout ce qui compose le jeu est mis en mémoire pour le mode hors ligne.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,webmanifest}'],
        // Three.js est un gros fichier : on autorise jusqu'à 5 Mo par fichier.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      // Pendant le développement, on laisse la PWA de côté (évite les surprises de cache).
      devOptions: { enabled: false },
    }),
  ],

  build: {
    // Avertir seulement si un fichier dépasse 900 Ko (Three.js est volumineux).
    chunkSizeWarningLimit: 900,
  },
})
