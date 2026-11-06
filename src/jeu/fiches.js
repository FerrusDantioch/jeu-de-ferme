/**
 * fiches.js — ce qu'affiche la fiche (le panneau du bas) pour chaque chose qu'on touche :
 * une parcelle du potager, un animal, une réserve de nourriture.
 *
 * Chaque fonction renvoie une « description » (voir src/ui/fiche.js) : titre, lignes,
 * boutons d'action. Les textes sont ici : vous pouvez les modifier librement.
 */
import { CULTURES, ARROSAGE } from '../donnees/cultures.js'
import { ESPECES, SOINS, PRISE_RESERVE } from '../donnees/animaux.js'
import { infosObjet } from '../donnees/objets.js'
import { etat } from './etat.js'
import { quantite, ajouter } from './inventaire.js'
import * as potager from './potager.js'
import * as elevage from './elevage.js'

/**
 * Fiche d'une parcelle du potager.
 * @param {number} n  numéro de la parcelle
 * @param {object} o  { bulles, objet (l'objet 3D de la parcelle), actualiser }
 */
export function ficheParcelle(n, { bulles, objet, actualiser }) {
  const apres = () => actualiser && actualiser()
  return () => {
    const vue = potager.observer(etat.d.parcelles[n])
    const arroser = {
      icone: '💧',
      texte: vue.humide ? 'Déjà arrosée' : 'Arroser',
      desactive: vue.humide,
      faire: () => {
        potager.arroser(n)
        bulles.flotter(objet, '💧', 0.8)
        apres()
      },
    }

    // Parcelle vide : on choisit quoi planter.
    if (vue.vide) {
      const graines = potager.grainesDisponibles()
      return {
        icone: '🟫',
        titre: 'Parcelle libre',
        lignes: graines.length
          ? [{ texte: 'Que voulez-vous planter ?', discret: true }]
          : [{ texte: 'Plus de graines dans le sac… La boutique en vendra bientôt !' }],
        actions: [
          ...graines.map(([id, nb]) => {
            const c = CULTURES[id]
            return {
              icone: c.icone,
              texte: c.nom,
              detail: `×${nb} · ${potager.texteDuree(c.minutes * 60000).replace('environ ', '')}`,
              faire: () => {
                if (potager.planter(n, id)) bulles.flotter(objet, '🌱', 0.8)
                apres()
              },
            }
          }),
          arroser,
        ],
      }
    }

    // Prête : on récolte.
    if (vue.prete) {
      return {
        icone: vue.culture.icone,
        titre: vue.culture.nom,
        lignes: [{ texte: 'Prête à récolter ! 🎉' }],
        actions: [
          {
            icone: '🧺',
            texte: 'Récolter',
            principal: true,
            faire: () => {
              const r = potager.recolter(n)
              if (r) {
                bulles.flotter(objet, `+${r.recolte} ${r.culture.icone}`, 0.9)
                setTimeout(() => bulles.flotter(objet, `+${r.graines} 🌱`, 0.9), 500)
              }
              apres()
            },
          },
        ],
      }
    }

    // En train de pousser.
    return {
      icone: vue.culture.icone,
      titre: vue.culture.nom,
      lignes: [
        { texte: potager.NOMS_STADES[vue.stade] },
        { barre: vue.fraction * 100, texte: `Prête dans ${potager.texteDuree(vue.resteMs)}` },
        {
          texte: vue.humide
            ? `💧 Terre bien arrosée : pousse ${ARROSAGE.bonus}× plus vite`
            : `Arroser est facultatif : ça la fait pousser ${ARROSAGE.bonus}× plus vite.`,
          discret: !vue.humide,
        },
      ],
      actions: [arroser],
    }
  }
}

/**
 * Fiche d'un animal.
 * @param {Animal} animal  l'animal dans le monde (voir entites/animal.js)
 * @param {object} o       { bulles, joueur }
 */
export function ficheAnimal(animal, { bulles, joueur, lieuReserve }) {
  const espece = ESPECES[animal.espece]
  const produit = infosObjet(espece.produit)
  const regarder = () => animal.regarder(joueur.position.x, joueur.position.z)
  return () => {
    const a = animal.fiche
    elevage.avancer(a)
    const lignes = [
      { barre: a.satiete, texte: `Ventre : ${elevage.texteVentre(a.satiete)}` },
      { barre: a.bonheur, texte: `Humeur : ${elevage.texteBonheur(a.bonheur)}` },
    ]
    if (a.produitPret) {
      lignes.push({ texte: `${produit.icone} ${produit.nom} à ramasser !` })
    } else if (a.satiete < SOINS.seuilProduction || a.bonheur < SOINS.seuilProduction) {
      lignes.push({ texte: `Fait une petite pause : un repas et un câlin, et ça repart !`, discret: true })
    } else {
      const reste = (espece.minutesProduction * 60 - a.production) * 1000
      lignes.push({ texte: `${produit.icone} ${produit.nom} dans ${potager.texteDuree(reste)}`, discret: true })
    }

    const actions = []
    if (a.produitPret) {
      actions.push({
        icone: produit.icone,
        texte: `Ramasser`,
        principal: true,
        faire: () => {
          if (elevage.ramasser(a)) bulles.flotter(animal.modele, `+1 ${produit.icone}`, 1.2)
          regarder()
          animal.rafraichirIcone()
        },
      })
    }
    const plein = a.satiete >= 97
    for (const id of espece.nourritures) {
      const o = infosObjet(id)
      const nb = quantite(id)
      actions.push({
        icone: o.icone,
        texte: plein ? 'Plus faim' : `${id === espece.friandise ? 'Friandise' : 'Donner'} : ${o.nom.toLowerCase()}`,
        detail: `${nb} dans le sac`,
        desactive: plein || nb === 0,
        faire: () => {
          const r = elevage.nourrir(a, id)
          if (r) bulles.flotter(animal.modele, r.friandise ? '😋💕' : '😋', 1.2)
          regarder()
          animal.rafraichirIcone()
        },
      })
    }
    actions.push({
      icone: '🤚',
      texte: 'Caresser',
      faire: () => {
        elevage.caresser(a)
        bulles.flotter(animal.modele, '💕', 1.2)
        regarder()
      },
    })
    if (quantite(espece.nourritures[0]) === 0) {
      lignes.push({ texte: `🌾 Il y a du foin et du grain gratuits dans la réserve ${lieuReserve}.`, discret: true })
    }
    return { icone: espece.icone, titre: `${a.nom} (${espece.nom.toLowerCase()})`, lignes, actions }
  }
}

/**
 * Fiche d'une réserve de nourriture (gratuite et sans limite).
 * @param {object} o { bulles, joueur }
 */
export function ficheReserve({ bulles, joueur }) {
  const prendre = (id) => ({
    icone: infosObjet(id).icone,
    texte: `Prendre ${PRISE_RESERVE} ${infosObjet(id).nom.toLowerCase()}`,
    faire: () => {
      ajouter(id, PRISE_RESERVE)
      bulles.flotter(joueur.modele, `+${PRISE_RESERVE} ${infosObjet(id).icone}`, 1.6)
    },
  })
  return () => ({
    icone: '🌾',
    titre: 'Réserve de nourriture',
    lignes: [
      { texte: 'De quoi nourrir les animaux, gratuitement et à volonté.' },
      { texte: `Dans le sac : 🌾 ${quantite('foin')} foin · 🌰 ${quantite('grain')} grain`, discret: true },
      { texte: 'Poules : grain · Vaches et moutons : foin', discret: true },
    ],
    actions: [prendre('foin'), prendre('grain')],
  })
}
