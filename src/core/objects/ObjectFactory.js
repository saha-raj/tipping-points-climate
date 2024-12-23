import * as THREE from 'three';

export class ObjectFactory {
    static createObject(config) {
        switch(config.type) {
            case '3dObject':
                return this.create3DObject(config);
            case 'header':
            case 'description':
                return this.createText(config);
            default:
                console.warn(`Unknown object type: ${config.type}`);
                return null;
        }
    }

    static createText(config) {
        const element = document.createElement('div');
        element.className = `text-element text-type-${config.type} text-element-${config.id}`;
        element.textContent = config.content;
        
        return {
            type: 'text',
            element: element
        };
    }

    static create3DObject(config) {
        if (config.id === 'earth') {
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = textureLoader.load('/assets/textures/map2.jpg');
            
            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                shininess: 30
            });
            
            const earthMesh = new THREE.Mesh(geometry, material);
            
            // Create atmosphere with lighting response
            const atmosphereGeometry = new THREE.SphereGeometry(1.1, 32, 32);
            const atmosphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                side: THREE.FrontSide,
                shininess: 1,       // Low shininess for softer light response
                emissive: 0x4f9aff, // Same as color for some self-glow
                emissiveIntensity: 0.4  // Subtle glow
            });
            
            const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            earthMesh.add(atmosphereMesh);
            
            return {
                type: '3d',
                object: earthMesh,
                extras: {
                    needsLight: true,
                    atmosphere: atmosphereMesh
                }
            };
        }
        return null;
    }
} 