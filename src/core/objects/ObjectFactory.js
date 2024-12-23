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
                shininess: 100,
                bumpScale: 0.05,           // Adjust surface bumpiness
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            return {
                type: '3d',
                object: mesh,
                extras: {
                    needsLight: true
                }
            };
        }
        return null;
    }
} 