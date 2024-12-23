import * as THREE from 'three';

export class ObjectFactory {
    static createObject(config) {
        switch(config.id) {
            case 'earth':
                return this.createEarth();
            case 'moon':
                return this.createMoon();
            default:
                return this.createText(config);
        }
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

    static createText(config) {
        const element = document.createElement('div');
        element.className = `text-element text-element-${config.id}`;
        element.textContent = config.content;
        
        // Add any specific styling based on config
        if (config.style) {
            Object.assign(element.style, config.style);
        }

        return {
            type: 'text',
            element: element
        };
    }
} 