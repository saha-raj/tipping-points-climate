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
        
        // Create ice patches with initial zero scale
        const iceGroup = this.createIcePatches();
        earthMesh.add(iceGroup);
        
        // Add method to update ice caps
        earthMesh.updateIceCaps = (albedo) => {
            const MIN_ALBEDO = 0.13;
            const MAX_ALBEDO = 0.57;
            const scale = Math.max(0, Math.min(1, 
                (albedo - MIN_ALBEDO) / (MAX_ALBEDO - MIN_ALBEDO)
            ));
            
            iceGroup.children.forEach(icePatch => {
                icePatch.scale.set(scale, scale, 1);
            });
        };
        
        return earthMesh;
    }
    
    createIcePatches() {
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
            
            const iceMaterial = new THREE.MeshPhongMaterial({
                color: 0xdee2e6,
                side: THREE.DoubleSide,
                blending: THREE.NoBlending,
                depthWrite: true,    // write to the depth buffer
                alphaTest: 0.5       // discard fragments with low alpha
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

        iceGroup.visible = true;
        return iceGroup;
    }
    
    createAtmosphere() {
        // Create hot atmosphere with N nonlinearly spaced layers
        const atmosphereHotNonlinear = new THREE.Group();
        const baseGeometry = new THREE.SphereGeometry(1, 64, 64);
        const numLayers = 12;

        for (let i = 0; i < numLayers; i++) {
            const t = i / (numLayers - 1);
            const scale = 1.07 + (0.25 * Math.pow(t, 2.5));
            const baseOpacityFunction = 0.5 - Math.pow(t, 3.5);
            
            // k0 will be set dynamically in updateObjects
            const layer = new THREE.Mesh(
                baseGeometry,
                new THREE.MeshPhongMaterial({
                    color: 0xcae9ff,
                    transparent: true,
                    opacity: 0.1 * baseOpacityFunction,  // Initial opacity with k0 = 0.1
                    shininess: 0
                })
            );

            // Store the base opacity function for later scaling
            layer.userData.baseOpacityFunction = baseOpacityFunction;

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

    scaleIceRadius(albedo) {
        const MIN_ALBEDO = 0.13;
        const MAX_ALBEDO = 0.57;
        return Math.max(0, Math.min(1, 
            (albedo - MIN_ALBEDO) / (MAX_ALBEDO - MIN_ALBEDO)
        ));
    }

    updateIceCaps(albedo) {
        const scale = this.scaleIceRadius(albedo);
        this.children.forEach(icePatch => {
            icePatch.scale.set(scale, scale, 1);
        });
    }
} 