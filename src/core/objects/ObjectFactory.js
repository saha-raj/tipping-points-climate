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
            return this.createEarth();
        }
        // Add other 3D object types as needed
        return null;
    }

    static createEarth() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            shininess: 30
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
} 