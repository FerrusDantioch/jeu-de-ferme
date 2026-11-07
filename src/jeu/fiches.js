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
import { EXPERIENCE } from '../donnees/economie.js'
import { PNJ } from '../donnees/pnj.js'
import * as potager from './potager.js'
import * as elevage from './elevage.js'
import * as commandes from './commandes.js'
import { gagnerExperience } from './economie.js'
import { annoncer } from './evenements.js'
import { ESPECES_COMPAGNONS } from '../donnees/compagnons.js'

/** Affiche « +3 ⭐ » un peu après une action (le temps de lire le premier texte). */
function montrerExperience(bulles, objet, n, hauteur, delai = 900) {
  if (n > 0) setTimeout(() => bulles.flotter(objet, `+${n} ⭐`, hauteur), delai)
}

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
              const id = etat.d.parcelles[n].culture
              const r = potager.recolter(n)
              if (r) {
                bulles.flotter(objet, `+${r.recolte} ${r.culture.icone}`, 0.9)
                setTimeout(() => bulles.flotter(objet, `+${r.graines} 🌱`, 0.9), 500)
                montrerExperience(bulles, objet, gagnerExperience(EXPERIENCE.recolte[id] || 2), 0.9, 1000)
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
export function ficheAnimal(animal, { bulles, joueur, lieuReserve, renommer }) {
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
          if (elevage.ramasser(a)) {
            bulles.flotter(animal.modele, `+1 ${produit.icone}`, 1.2)
            montrerExperience(bulles, animal.modele, gagnerExperience(EXPERIENCE.ramasser), 1.2)
          }
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
          if (r) {
            bulles.flotter(animal.modele, r.friandise ? '😋💕' : '😋', 1.2)
            montrerExperience(bulles, animal.modele, gagnerExperience(EXPERIENCE.nourrir), 1.2)
          }
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
    if (renommer) {
      actions.push({
        icone: '✏️',
        texte: 'Changer son nom',
        faire: () => renommer(a),
      })
    }
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

// --- Commandes ---

const NOMS_CLIENTS = Object.fromEntries(PNJ.map((p) => [p.id, p.nom]))

/** Les lignes qui décrivent une commande (articles, récompense). */
function lignesCommande(commande) {
  const lignes = commande.articles.map((a) => {
    const o = infosObjet(a.id)
    const ai = Math.min(quantite(a.id), a.n)
    return { texte: `${ai >= a.n ? '✅' : '⬜'} ${o.icone} ${o.nom} : ${ai} / ${a.n}` }
  })
  lignes.push({ texte: `Récompense : 🪙 ${commande.pieces} · ⭐ ${commande.experience}`, discret: true })
  return lignes
}

/** Le bouton « Livrer » d'une commande. */
function actionLivrer(idClient, commande, { bulles, joueur, avecNom }) {
  const manque = commande.articles
    .filter((a) => quantite(a.id) < a.n)
    .map((a) => `${a.n - quantite(a.id)} ${infosObjet(a.id).icone}`)
  return {
    icone: '📦',
    texte: avecNom ? `Livrer à ${NOMS_CLIENTS[idClient]}` : 'Livrer',
    detail: manque.length ? `Il manque ${manque.join(', ')}` : 'Tout est prêt !',
    principal: manque.length === 0,
    desactive: manque.length > 0,
    faire: () => {
      const r = commandes.livrer(idClient)
      if (!r) return
      bulles.flotter(joueur.modele, `+${r.pieces} 🪙`, 1.7)
      montrerExperience(bulles, joueur.modele, r.experience, 1.7)
    },
  }
}

/**
 * Fiche des commandes : celle d'un villageois (idClient donné),
 * ou toutes à la fois (le tableau des commandes).
 */
export function ficheCommandes({ bulles, joueur, idClient = null }) {
  return () => {
    if (idClient) {
      const c = commandes.commandeDe(idClient)
      if (!c) return null // commande livrée : la fiche se ferme
      return {
        icone: '📋',
        titre: `Commande de ${NOMS_CLIENTS[idClient]}`,
        lignes: lignesCommande(c),
        actions: [actionLivrer(idClient, c, { bulles, joueur })],
      }
    }
    const enCours = commandes.commandesEnCours()
    if (enCours.length === 0) {
      return {
        icone: '📋',
        titre: 'Tableau des commandes',
        lignes: [{ texte: 'Pas de commande pour l’instant. Les villageois repasseront bientôt ! 🌷' }],
        actions: [],
      }
    }
    const lignes = []
    const actions = []
    for (const [id, c] of enCours) {
      lignes.push({ texte: `— ${NOMS_CLIENTS[id]} —` })
      lignes.push(...lignesCommande(c))
      actions.push(actionLivrer(id, c, { bulles, joueur, avecNom: true }))
    }
    lignes.push({ texte: 'Pas de limite de temps : livrez quand vous voulez.', discret: true })
    return { icone: '📋', titre: 'Tableau des commandes', lignes, actions }
  }
}

// --- Le compagnon (chat ou chien) ---

/**
 * Fiche du compagnon : le caresser, jouer avec lui, changer son nom.
 * @param {object} o { bulles, joueur, compagnon (l'entité), renommer }
 */
export function ficheCompagnon({ bulles, joueur, compagnon, renommer }) {
  const auHasard = (liste) => liste[Math.floor(Math.random() * liste.length)]
  return () => {
    const c = etat.d.compagnon
    if (!c) return null
    const e = ESPECES_COMPAGNONS[c.espece]
    return {
      icone: e.icone,
      titre: c.nom,
      lignes: [{ texte: `${c.nom} vous suit partout et s’assoit à côté de vous sur les bancs 💕`, discret: true }],
      actions: [
        {
          icone: '🤚',
          texte: 'Caresser',
          principal: true,
          faire: () => {
            compagnon.rejouir(joueur)
            joueur.regarderVers(compagnon.position.x, compagnon.position.z)
            bulles.flotter(compagnon.modele, '💕', 0.8)
            bulles.dire(compagnon.modele, auHasard(e.caresses), { nom: c.nom, hauteur: 0.9 })
            annoncer('caresser', { espece: c.espece })
          },
        },
        {
          icone: c.espece === 'chat' ? '🧶' : '🎾',
          texte: 'Jouer',
          faire: () => {
            compagnon.rejouir(joueur)
            compagnon.joie = 2.5 // il sautille plus longtemps
            bulles.dire(compagnon.modele, auHasard(e.jeux), { nom: c.nom, hauteur: 0.9 })
            annoncer('caresser', { espece: c.espece })
          },
        },
        { icone: '✏️', texte: 'Changer son nom', faire: () => renommer() },
      ],
    }
  }
}
