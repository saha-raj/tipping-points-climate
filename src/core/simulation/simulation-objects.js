import * as THREE from 'three';

export class SimulationObjects {
    constructor() {
        // Initialize materials, geometries, etc.
    }
    
    createEarth() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load texture
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('/assets/textures/1_earth_8k.jpg');

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
        });
        const earthMesh = new THREE.Mesh(geometry, material);
        
        return earthMesh;
    }
    
    createAtmosphere() {
        // Create hot atmosphere with N nonlinearly spaced layers
        const atmosphereHotNonlinear = new THREE.Group();
        const baseGeometry = new THREE.SphereGeometry(1, 64, 64);
        const numLayers = 12;

        for (let i = 0; i < numLayers; i++) {
            const t = i / (numLayers - 1);
            const scale = 1.07 + (0.25 * Math.pow(t, 2.5));
            const opacity = 0.1 * (0.5 - Math.pow(t, 3.5));
            
            const layer = new THREE.Mesh(
                baseGeometry,
                new THREE.MeshPhongMaterial({
                    color: 0xcae9ff,
                    transparent: true,
                    opacity: opacity,
                    shininess: 0
                })
            );

            layer.scale.set(scale, scale, scale);
            atmosphereHotNonlinear.add(layer);
        }
        
        return atmosphereHotNonlinear;
    }
    
    createSunLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(-10, 0, 0);  // Updated to match index.js
        return light;
    }
} 