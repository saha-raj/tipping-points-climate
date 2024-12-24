import * as THREE from 'three';

export class ShadowCylinder {
    constructor(config) {
        this.object = new THREE.Group();

        // Main cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(1.02, 1.02, 2, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, shadowMaterial);
        
        cylinder.position.z = -1;
        cylinder.rotation.x = Math.PI / 2;

        // End cap
        const capGeometry = new THREE.CircleGeometry(1.02, 32);
        const cap = new THREE.Mesh(capGeometry, shadowMaterial);
        
        cap.position.z = -2;
        cap.rotation.x = Math.PI / 2;

        this.object.add(cylinder);
        this.object.add(cap);

        // Initial state
        this.object.visible = false;
    }

    getMesh() {
        return this.object;
    }
} 