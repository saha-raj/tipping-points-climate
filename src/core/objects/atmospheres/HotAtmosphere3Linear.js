import * as THREE from 'three';

export class HotAtmosphere3Linear {
    constructor(radius) {
        this.mesh = new THREE.Group();  // Container for all hot atmosphere layers
        
        const hotLayers = [
            { radius: radius * 1.1,  opacity: 0.2, intensity: 0.9 },
            { radius: radius * 1.12, opacity: 0.15, intensity: 0.4 },
            { radius: radius * 1.15, opacity: 0.1, intensity: 0.2 }
        ];
        
        hotLayers.forEach(layer => {
            const geometry = new THREE.SphereGeometry(layer.radius, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                color: 0xff4800,  // More reddish for heat
                transparent: true,
                opacity: layer.opacity,
                side: THREE.DoubleSide,
                shininess: 0,
                emissive: 0xff4800,
                emissiveIntensity: layer.intensity,
                blending: THREE.AdditiveBlending
            });
            const mesh = new THREE.Mesh(geometry, material);
            this.mesh.add(mesh);
        });
    }
} 