import * as THREE from 'three';

export class Atmosphere {
    constructor(config) {
        this.object = new THREE.Group();

        // Regular atmosphere layer
        const regularGeometry = new THREE.SphereGeometry(1.1, 64, 64);
        const regularMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.FrontSide,
            shininess: 1,
            emissive: 0x4f9aff,
            emissiveIntensity: 0.4
        });
        const regularAtmosphere = new THREE.Mesh(regularGeometry, regularMaterial);
        this.object.add(regularAtmosphere);

        // Hot atmosphere layer
        const hotGeometry = new THREE.SphereGeometry(1.15, 64, 64);
        const hotMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.1,
            side: THREE.FrontSide,
            shininess: 1,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });
        const hotAtmosphere = new THREE.Mesh(hotGeometry, hotMaterial);
        this.object.add(hotAtmosphere);

        // Initial state
        this.object.visible = false;
    }

    getMesh() {
        return this.object;
    }
} 