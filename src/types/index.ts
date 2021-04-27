import * as THREE from 'three';

export interface Note {
  id: string;
  content: string;
  title: string;
  modelId: string,
  modelType: string,
  position: number,
}

export interface ToastMSG {
  type: string;
  content: string;
}

export interface NoteList {
  date: string,
  notes: Array<Note>,
  time: Array<string>,
}

export interface Model {
  name: string,
  id: string,
  position: {
    x: number,
    y: number,
    z: number,
  }
}

export interface SceneData {
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  el: HTMLElement,
}

export interface LoadProvider {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  el: HTMLElement;
}
