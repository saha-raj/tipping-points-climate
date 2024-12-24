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
        
        // Check if content contains LaTeX
        if (config.content.match(/\$\$(.*?)\$\$|\$(.*?)\$/)) {
            element.innerHTML = config.content;  // Use innerHTML for LaTeX
            // Queue MathJax processing if it's ready
            if (window.MathJax && window.MathJax.typesetPromise) {
                MathJax.typesetPromise([element]).catch((err) => {
                    console.warn('MathJax processing failed:', err);
                    element.textContent = config.content;  // Fallback to plain text
                });
            } else {
                // If MathJax isn't ready, queue for later processing
                window.addEventListener('load', () => {
                    if (window.MathJax && window.MathJax.typesetPromise) {
                        MathJax.typesetPromise([element]).catch((err) => {
                            console.warn('MathJax processing failed:', err);
                            element.textContent = config.content;
                        });
                    }
                });
            }
        } else {
            element.textContent = config.content;  // Keep existing behavior for non-LaTeX
        }
        
        return {
            type: 'text',
            element: element
        };
    }

    static create3DObject(config) {
        if (config.id === 'earth') {
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = textureLoader.load('/assets/textures/earth_noClouds.0330_cutout.jpg');
            // const earthTexture = textureLoader.load('/assets/textures/map2.jpg');
            // 
            
            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                // shininess: 30,
                // emissive: 0x4f9aff,
                // emissiveIntensity: 0.3,

            });
            
            const earthMesh = new THREE.Mesh(geometry, material);
            
            // Create regular atmosphere (keep existing code)
            const atmosphereGeometry = new THREE.SphereGeometry(1.1, 64, 64);
            const atmosphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                side: THREE.FrontSide,
                shininess: 1,
                emissive: 0x4f9aff,
                emissiveIntensity: 0.4
            });
            const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            
            // Create hot atmosphere with multiple layers
            const atmosphereHot = new THREE.Group();  // Container for all hot atmosphere layers
            
            const hotLayers = [
                { radius: 1.1,  opacity: 0.2, intensity: 0.9 },
                { radius: 1.12, opacity: 0.15, intensity: 0.4 },
                { radius: 1.15, opacity: 0.1, intensity: 0.2 }
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
                atmosphereHot.add(mesh);
            });
            
            // Add both to earth but hide initially
            earthMesh.add(atmosphereMesh);
            earthMesh.add(atmosphereHot);
            atmosphereMesh.visible = false;  // Start invisible
            atmosphereHot.visible = false;   // Start invisible
            
            // Create shadow cylinder
            const cylinderLength = 4;  // Adjusted for visibility
            const cylinderGeometry = new THREE.CylinderGeometry(1.01, 1.01, cylinderLength, 64);  // Slightly larger to prevent z-fighting
            const cylinderMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const shadowCylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            
            // Create end cap
            const capGeometry = new THREE.CircleGeometry(1, 64);
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
            
            shadowCylinder.visible = false;  // Start invisible
            earthMesh.add(shadowCylinder);
            
            return {
                type: '3dObject',
                object: earthMesh,
                extras: {
                    needsLight: true,
                    atmosphere: atmosphereMesh,
                    atmosphereHot: atmosphereHot,
                    shadowCylinder: shadowCylinder,
                    material: material  // Store material reference
                }
            };
        }
        return null;
    }
} 