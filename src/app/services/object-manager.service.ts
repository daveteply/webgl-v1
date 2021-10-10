import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Scene } from 'three';

@Injectable({
  providedIn: 'root',
})
export class ObjectManagerService {
  box: THREE.BoxGeometry;
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;

  meshAdded = false;

  constructor() {
    this.box = new THREE.BoxGeometry();
    this.material = new THREE.MeshStandardMaterial({ color: 'purple' });
    this.mesh = new THREE.Mesh(this.box, this.material);
  }

  public UpdateShapes(scene: Scene): void {
    if (!this.meshAdded) {
      scene.add(this.mesh);
      this.meshAdded = true;
    }

    this.mesh.rotateX(0.02);
    this.mesh.rotateY(0.03);
  }
}
