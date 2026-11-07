/**
 * progression.js — tout ce qui montre l'avancée du joueur :
 *  - le petit compteur en haut (🪙 pièces · ⭐ niveau) ;
 *  - la fenêtre « Ma progression » (quand on touche le compteur) ;
 *  - la petite fête quand on passe un niveau (douce : pas de flash, pas de son fort).
 */
import { etat } from '../jeu/etat.js'
import { progression, deblocagesDuNiveau, surNouveauNiveau } from '../jeu/economie.js'
import { NIVEAU_MAXIMUM } from '../donnees/economie.js'
import { creerFenetre, echapper } from './fenetre.js'
import { feteDuJour, texteDate } from '../jeu/calendrier.js'
import { prenom } from '../jeu/perso.js'
import { saisonDuJour, SAISONS } from '../jeu/temps.js'

/** « 1 récolte », « 3 récoltes » : met un s quand il faut. */
const pluriel = (n, mot, mots = `${mot}s`) => `${n} ${n > 1 ? mots : mot}`

/**
 * @param {HTMLElement} zoneCompteurs  l'endroit où écrire les compteurs
 * @param {HTMLElement} declencheur     l'élément qu'on touche pour ouvrir « Ma progression »
 */
export function creerProgression(zoneCompteurs, declencheur) {
  const fenetre = creerFenetre({ classe: 'panneau-progression' })
  const fete = creerFenetre({ classe: 'panneau-fete', texteFermer: 'Super !' })

  function barre(fraction) {
    const v = Math.round(Math.min(1, Math.max(0, fraction)) * 100)
    return `<div class="barre" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100">
      <div class="barre-plein" style="width:${v}%"></div></div>`
  }

  function listeDeblocages(n) {
    const liste = deblocagesDuNiveau(n)
    if (liste.length === 0) return ''
    return `<ul class="liste-deblocages">${liste.map((d) => `<li>${d.icone} ${echapper(d.nom)}</li>`).join('')}</ul>`
  }

  function actualiserCompteurs() {
    const p = progression()
    zoneCompteurs.textContent = `🪙 ${etat.d.pieces} · ⭐ Niv. ${p.niveau}`
  }

  function ouvrirProgression() {
    const p = progression()
    const s = etat.d.stats
    // Le prochain niveau qui débloque quelque chose.
    let prochain = null
    for (let n = p.niveau + 1; n <= NIVEAU_MAXIMUM && !prochain; n++) if (deblocagesDuNiveau(n).length) prochain = n
    fenetre.ouvrir(`
      <h2>⭐ Ma progression</h2>
      ${prenom() ? `<p>👤 <strong>${echapper(prenom())}</strong></p>` : ''}
      <p class="discret">📅 ${echapper(texteDate())} · ${SAISONS[saisonDuJour()].icone} ${SAISONS[saisonDuJour()].nom}${feteDuJour() ? ` · ${feteDuJour().icone} ${echapper(feteDuJour().nom)}` : ''}</p>
      <p><strong>Niveau ${p.niveau}</strong>${p.niveau < NIVEAU_MAXIMUM ? ` — encore ${p.manque} ⭐ pour le niveau ${p.niveau + 1}` : ''}</p>
      ${barre(p.fraction)}
      <p>🪙 <strong>${etat.d.pieces}</strong> pièces</p>
      ${prochain ? `<p>Au niveau ${prochain}, vous débloquerez :</p>${listeDeblocages(prochain)}` : ''}
      <p class="discret">🧺 ${pluriel(s.recoltes, 'récolte')} · 🥚 ${pluriel(s.produitsRamasses, 'produit ramassé', 'produits ramassés')} ·
      📦 ${pluriel(s.commandesLivrees, 'commande livrée', 'commandes livrées')} ·
      📜 ${pluriel(s.quetesReussies || 0, 'quête réussie', 'quêtes réussies')}</p>
      <p class="discret">Pour gagner des ⭐ : récolter, cueillir, pêcher, cuisiner, s’occuper des animaux,
      et surtout livrer des commandes 📋.</p>
      <div class="reglage-choix"><button class="bouton" data-ouvrir-carnet>📖 Mon carnet de collection</button></div>`)
  }

  declencheur.addEventListener('click', ouvrirProgression)
  etat.ecouter(actualiserCompteurs)
  actualiserCompteurs()

  // Nouveau niveau : une petite fenêtre de fête (on attend un peu que les textes s'envolent).
  surNouveauNiveau((n) => {
    setTimeout(() => {
      fete.ouvrir(`
        <h2>🎉 Niveau ${n} !</h2>
        <p>Bravo, votre ferme grandit !</p>
        ${deblocagesDuNiveau(n).length ? `<p>Nouveau chez Lila :</p>${listeDeblocages(n)}` : ''}`)
    }, 1200)
  })

  return { ouvrirProgression, actualiserCompteurs }
}
