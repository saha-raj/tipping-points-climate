import * as THREE from 'three';

export class RegularAtmosphere {
    constructor(radius) {
        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.1, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.FrontSide,
            shininess: 1,
            emissive: 0x4f9aff,
            emissiveIntensity: 0.4
        });
        this.mesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    }
} 