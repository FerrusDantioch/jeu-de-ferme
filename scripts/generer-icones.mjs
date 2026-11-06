/**
 * generer-icones.mjs — fabrique les icônes de l'application (fichiers PNG).
 *
 * Utilisation (une seule fois, ou si on change le dessin) :  npm run icones
 *
 * Le dessin (une petite grange rouge sur une colline verte) est décrit par des formes
 * simples. Le script les « peint » pixel par pixel, sans aucun outil externe.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

// --- Le dessin : une liste de calques, du fond vers le premier plan ---
// Chaque calque : une couleur [r, g, b] et une fonction « le point (x, y) est-il dedans ? »
// x et y vont de 0 (gauche / haut) à 1 (droite / bas).
const dansTriangle = (px, py, [ax, ay], [bx, by], [cx, cy]) => {
  const s = (ax - cx) * (py - cy) - (ay - cy) * (px - cx)
  const t = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
  if (s < 0 !== t < 0 && s !== 0 && t !== 0) return false
  const d = (cx - bx) * (py - by) - (cy - by) * (px - bx)
  return d === 0 || d < 0 === s + t <= 0
}
const dansRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1

const calques = [
  { couleur: [205, 234, 247], dedans: () => true }, // ciel
  { couleur: [255, 236, 150], dedans: (x, y) => (x - 0.74) ** 2 + (y - 0.27) ** 2 < 0.075 ** 2 }, // soleil
  { couleur: [124, 196, 122], dedans: (x, y) => (x - 0.5) ** 2 / 0.75 ** 2 + (y - 1.15) ** 2 / 0.48 ** 2 < 1 }, // colline
  { couleur: [214, 92, 82], dedans: (x, y) => dansRect(x, y, 0.33, 0.47, 0.67, 0.75) }, // murs de la grange
  { couleur: [168, 66, 60], dedans: (x, y) => dansTriangle(x, y, [0.29, 0.49], [0.5, 0.3], [0.71, 0.49]) }, // toit
  { couleur: [255, 250, 240], dedans: (x, y) => dansRect(x, y, 0.44, 0.58, 0.56, 0.75) }, // porte (cadre blanc)
  { couleur: [150, 60, 55], dedans: (x, y) => dansRect(x, y, 0.46, 0.6, 0.54, 0.75) }, // porte
  { couleur: [255, 250, 240], dedans: (x, y) => (x - 0.5) ** 2 + (y - 0.42) ** 2 < 0.035 ** 2 }, // lucarne
]

/**
 * Peint l'icône à la taille demandée.
 * « marge » rétrécit le dessin vers le centre (pour la version « masquable » d'Android,
 * dont les bords peuvent être coupés en rond).
 */
function peindre(taille, marge = 0) {
  const pixels = Buffer.alloc(taille * taille * 4)
  const sur = 4 // sur-échantillonnage : 4×4 points par pixel pour des bords lisses
  for (let py = 0; py < taille; py++) {
    for (let px = 0; px < taille; px++) {
      let r = 0, g = 0, b = 0
      for (let sy = 0; sy < sur; sy++) {
        for (let sx = 0; sx < sur; sx++) {
          let x = (px + (sx + 0.5) / sur) / taille
          let y = (py + (sy + 0.5) / sur) / taille
          // Application de la marge : on « dézoome » autour du centre.
          x = 0.5 + (x - 0.5) / (1 - 2 * marge)
          y = 0.5 + (y - 0.5) / (1 - 2 * marge)
          let c = calques[0].couleur
          for (const calque of calques) if (calque.dedans(x, y)) c = calque.couleur
          r += c[0]; g += c[1]; b += c[2]
        }
      }
      const n = sur * sur
      const k = (py * taille + px) * 4
      pixels[k] = Math.round(r / n)
      pixels[k + 1] = Math.round(g / n)
      pixels[k + 2] = Math.round(b / n)
      pixels[k + 3] = 255
    }
  }
  return pixels
}

// --- Encodage au format PNG (format d'image standard) ---
const tableCRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const octet of buf) c = tableCRC[(c ^ octet) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function bloc(type, donnees) {
  const longueur = Buffer.alloc(4)
  longueur.writeUInt32BE(donnees.length)
  const typeEtDonnees = Buffer.concat([Buffer.from(type, 'ascii'), donnees])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeEtDonnees))
  return Buffer.concat([longueur, typeEtDonnees, crc])
}
function encoderPNG(taille, pixels) {
  const entete = Buffer.alloc(13)
  entete.writeUInt32BE(taille, 0)
  entete.writeUInt32BE(taille, 4)
  entete[8] = 8 // 8 bits par couleur
  entete[9] = 6 // rouge, vert, bleu + transparence
  const lignes = Buffer.alloc(taille * (taille * 4 + 1))
  for (let y = 0; y < taille; y++) {
    lignes[y * (taille * 4 + 1)] = 0 // pas de filtre
    pixels.copy(lignes, y * (taille * 4 + 1) + 1, y * taille * 4, (y + 1) * taille * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloc('IHDR', entete),
    bloc('IDAT', deflateSync(lignes, { level: 9 })),
    bloc('IEND', Buffer.alloc(0)),
  ])
}

// --- Fabrication des fichiers ---
const dossier = new URL('../public/icones/', import.meta.url)
mkdirSync(dossier, { recursive: true })
const icones = [
  ['icone-192.png', 192, 0],
  ['icone-512.png', 512, 0],
  ['icone-masquable-512.png', 512, 0.1],
  ['apple-touch-icon.png', 180, 0],
]
for (const [nom, taille, marge] of icones) {
  writeFileSync(new URL(nom, dossier), encoderPNG(taille, peindre(taille, marge)))
  console.log(`✔ ${nom} (${taille}×${taille})`)
}
