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
            
            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                // shininess: 30,
                // emissive: 0x4f9aff,
                // emissiveIntensity: 0.3,

            });
            const earthMesh = new THREE.Mesh(geometry, material);
            
            // ------------------------------------------------------------ 
            // Create regular atmosphere 
            // ------------------------------------------------------------ 
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
            
            // ------------------------------------------------------------ 
            // Create hot atmosphere with 3 linearly spaced layers
            // ------------------------------------------------------------ 
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
            
            // ------------------------------------------------------------ 
            // Create hot atmosphere with N nonlinearly spaced layers
            // ------------------------------------------------------------ 
            const atmosphereHotNonlinear = new THREE.Group();
            const baseGeometry = new THREE.SphereGeometry(1, 64, 64);
            const numLayers = 15;

            for (let i = 0; i < numLayers; i++) {
                const t = i / (numLayers - 1);
                const scale = 1.07 + (0.25 * Math.pow(t, 2.5));
                const opacity = 0.1 * (0.5 - Math.pow(t, 3.5));
                
                const layer = new THREE.Mesh(
                    baseGeometry,
                    new THREE.MeshPhongMaterial({
                        color: 0xbde0fe, // cool
                        color: 0xcae9ff,
                        transparent: true,
                        opacity: opacity,
                        shininess: 0,
                        // blending: THREE.AdditiveBlending, // Adds colors together, good for glows
                        // Other blending options:
                        // blendingTHREE.NormalBlending //- Default
                        // THREE.MultiplyBlending - Multiplies colors together
                        // THREE.SubtractiveBlending - Subtracts colors
                        // THREE.CustomBlending - Custom blend functions
                    })
                );
                layer.scale.set(scale, scale, scale);
                atmosphereHotNonlinear.add(layer);
            }
            
            atmosphereHotNonlinear.visible = false;
            earthMesh.add(atmosphereHotNonlinear);

            // ------------------------------------------------------------ 
            // Create shadow cylinder and end cap   
            // ------------------------------------------------------------ 
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
            
            // ------------------------------------------------------------ 
            // Create ice patches
            // ------------------------------------------------------------ 
            const iceGroup = new THREE.Group();
            const NUM_ICE_PATCHES = 360*10;
            const SPHERE_RADIUS = 1.01; // Slightly above Earth's surface

            // Generate random points on sphere
            for (let i = 0; i < NUM_ICE_PATCHES; i++) {
                // Random spherical coordinates
                const theta = Math.random() * Math.PI * 2; // Random longitude (0 to 2π)
                const phi = Math.acos(2 * Math.random() - 1); // Random latitude (arccos method for uniform distribution)
                
                // Convert to Cartesian coordinates
                const x = SPHERE_RADIUS * Math.cos(theta) * Math.sin(phi);
                const y = SPHERE_RADIUS * Math.sin(theta) * Math.sin(phi);
                const z = SPHERE_RADIUS * Math.cos(phi);

                // Create irregular polygon
                const numSides = Math.floor(Math.random() * 4) + 4; // 4-7 sides
                const vertices = [];
                const baseRadius = 0.1;
                
                // Create irregular vertices
                for (let j = 0; j < numSides; j++) {
                    const angle = (j / numSides) * Math.PI * 2;
                    // Vary radius between 0.7 and 1.3 of base radius
                    const radius = baseRadius * (0.3 + Math.random() * 1.9);
                    vertices.push(new THREE.Vector2(
                        radius * Math.cos(angle),
                        radius * Math.sin(angle)
                    ));
                }

                // Create geometry from vertices
                const shape = new THREE.Shape(vertices);
                const iceGeometry = new THREE.ShapeGeometry(shape);
                
                const iceMaterial = new THREE.MeshBasicMaterial({
                    color: 0xdee2e6,
                    // transparent: true,
                    // opacity: 0.4,
                    side: THREE.DoubleSide,
                });
                
                const icePatch = new THREE.Mesh(iceGeometry, iceMaterial);
                
                // Random rotation
                const randomRotation = Math.random() * Math.PI * 2;
                icePatch.rotation.z = randomRotation;
                
                // Position and orient ice patch
                icePatch.position.set(x, y, z);
                icePatch.lookAt(0, 0, 0); // Orient perpendicular to surface
                
                iceGroup.add(icePatch);
            }

            iceGroup.visible = false;
            earthMesh.add(iceGroup);

            return {
                type: '3dObject',
                object: earthMesh,
                extras: {
                    needsLight: true,
                    atmosphere: atmosphereMesh,
                    atmosphereHot: atmosphereHot,
                    atmosphereHotNonlinear: atmosphereHotNonlinear, 
                    shadowCylinder: shadowCylinder,
                    material: material,
                    iceGroup: iceGroup
                }
            };
        }
        return null;
    }
} 