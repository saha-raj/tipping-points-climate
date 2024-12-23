import * as THREE from 'three';

export class ObjectFactory {
    static createObject(config) {
        switch(config.type) {
            case '3dObject':
                return this.create3DObject(config);
            case 'header':
            case 'description':
            case 'annotation':
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
            
            // Create shadow cylinder
            const cylinderLength = 5;  // Adjusted for visibility
            const cylinderGeometry = new THREE.CylinderGeometry(1.01, 1.01, cylinderLength, 32);  // Slightly larger to prevent z-fighting
            const cylinderMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const shadowCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            
            // Create end cap
            const capGeometry = new THREE.CircleGeometry(1, 32);
            const capMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide
            });
            const endCap = new THREE.Mesh(capGeometry, capMaterial);
            
            // Position at far end of cylinder
            endCap.position.y = -cylinderLength/2;  // Move to far end
            endCap.rotation.x = Math.PI/2;  // Rotate to face outward
            
            shadowCylinder.add(endCap);
            
            // Rotate cylinder to align with X axis and position it
            shadowCylinder.rotation.z = Math.PI/2;
            // By default, cylinder is centered at origin, so we need to move it by half its length + earth radius
            shadowCylinder.position.x = (cylinderLength/2);
            
            return {
                type: '3d',
                object: earthMesh,
                extras: {
                    needsLight: true,
                    atmosphere: atmosphereMesh,
                    shadowCylinder: shadowCylinder
                }
            };
        }
        return null;
    }
} 