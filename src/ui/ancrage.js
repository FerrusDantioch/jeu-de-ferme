/**
 * ancrage.js — petit outil : trouve où se trouve, sur l'écran, un point au-dessus
 * d'un objet 3D. Sert aux bulles de paroles et aux petites icônes.
 */
import * as THREE from 'three'

const point = new THREE.Vector3()

/**
 * @param {THREE.Object3D} objet
 * @param {number} hauteur  hauteur au-dessus de l'objet, en mètres
 * @param {THREE.Camera} camera
 * @returns {{x:number, y:number, visible:boolean}} position en pixels
 */
export function positionEcran(objet, hauteur, camera) {
  objet.getWorldPosition(point)
  point.y += hauteur
  point.project(camera)
  const visible = point.z <= 1 && Math.abs(point.x) <= 1.2 && Math.abs(point.y) <= 1.2
  return {
    x: (point.x * 0.5 + 0.5) * window.innerWidth,
    y: (-point.y * 0.5 + 0.5) * window.innerHeight,
    visible,
  }
}

/** Vrai si l'objet et tous ses parents sont visibles (et qu'il est bien dans la scène). */
export function estAffiche(objet) {
  let o = objet
  for (; o; o = o.parent) {
    if (!o.visible) return false
    if (o.isScene) return true
  }
  return false
}
