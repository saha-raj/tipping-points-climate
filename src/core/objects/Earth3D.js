import * as THREE from 'three';

export class Earth3D {
    constructor(config) {
        // Create Earth sphere only
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('/assets/textures/earth_noClouds.0330_cutout.jpg');
        earthTexture.colorSpace = 'srgb';
        
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture
        });
        
        this.object = new THREE.Mesh(geometry, material);
        this.object.rotation.z = 23.5 * Math.PI / 180;
        
        // No child creation, no state management
        this.object.visible = false;
    }

    // No update method - state managed by LifecycleManager
} 