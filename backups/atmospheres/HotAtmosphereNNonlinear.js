import * as THREE from 'three';

export class HotAtmosphereNNonlinear {
    constructor(radius) {
        this.mesh = new THREE.Group();
        
        const baseGeometry = new THREE.SphereGeometry(radius * 1.15, 64, 64);
        const numLayers = 10;

        for (let i = 0; i < numLayers; i++) {
            // Nonlinear scaling - more layers near surface
            const t = i / (numLayers - 1);
            const scale = 1 + (0.15 * Math.pow(t, 2));  // Quadratic spacing
            
            // Nonlinear opacity - more opaque near surface
            const opacity = 0.3 * (1 - Math.pow(t, 1.5));  // Higher power = faster falloff
            
            const layer = new THREE.Mesh(
                baseGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0xff3300,
                    transparent: true,
                    opacity: opacity,
                    side: THREE.FrontSide,
                    blending: THREE.AdditiveBlending
                })
            );
            
            layer.scale.set(scale, scale, scale);
            this.mesh.add(layer);
        }
    }
} 