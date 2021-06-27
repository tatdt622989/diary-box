import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface Note {
  id: string;
  content: string;
  title: string;
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
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  color: ModelColor;
  isUsed: boolean;
  passive: boolean;
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

export interface Product {
  name: string;
  color: object;
  displayName: string;
  price: number;
}

export interface Products {
  [key: string]: Product;
}

export interface UserData {
  pointInfo: PointInfo;
  email: string;
  name: string;
  modelData: Array<Model>;
  noteData: Array<Note>;
}

export interface PointInfo {
  balance: number;
  lastGet: string;
  pointCounter: number;
}

export interface ModelColor {
  [key: string]: string;
}

export interface LoadedModel {
  [key: string]: THREE.Object3D;
}

export interface Accounting {
  type: string;
  title: string;
  tag: string;
  price: number;
  icon: string;
}

export interface Accountings {
  [key: string]: Array<Accounting>;
}

export interface Amount {
  [key: string]: number;
}
