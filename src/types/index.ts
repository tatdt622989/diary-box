import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface Note {
  id: string;
  content: string;
  title: string;
  modelId: string;
  modelType: string;
  position: number;
}

export interface ToastMSG {
  type: string;
  content: string;
}

export interface NoteList {
  date: string;
  notes: Array<Note>;
  time: Array<string>;
}

export interface Model {
  name: string;
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  style: {
    color: object;
  },
  isUsed: boolean;
}

export interface SceneData {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  el: HTMLElement;
  controls: OrbitControls;
}

export interface DefaultModelNum {
  name: string;
  x: number;
  y: number;
  z: number;
}
