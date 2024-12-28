import * as THREE from 'three';

export class IceHouse {
    constructor(radius, config) {
        this.radius = radius;
        this.config = config;
        this.seeds = this.generateSeeds(config.numSeeds);
        this.mesh = new THREE.Group();
        this.initPolygons();
    }

    generateSeeds(n) {
        const seeds = [];
        for(let i = 0; i < n; i++) {
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            const vertices = this.generatePolygonVertices(
                theta, 
                phi, 
                Math.floor(Math.random() * 4) + 4, // 4-8 sides
                this.config.initialSize
            );
            
            seeds.push({
                center: new THREE.Vector3(
                    this.radius * Math.sin(phi) * Math.cos(theta),
                    this.radius * Math.sin(phi) * Math.sin(theta),
                    this.radius * Math.cos(phi)
                ),
                vertices: vertices,
                sides: vertices.length,
                growthRate: this.config.growthRate * (Math.random() * 0.5 + 0.75) // Some variation
            });
        }
        return seeds;
    }

    generatePolygonVertices(theta, phi, sides, size) {
        const vertices = [];
        const angleStep = (2 * Math.PI) / sides;
        
        // Ensure size is valid and positive
        size = Math.max(0.01, Math.min(size, this.config.maxSize || 0.3));
        
        // Ensure angles are valid
        theta = isNaN(theta) ? 0 : theta;
        phi = isNaN(phi) ? Math.PI/2 : phi;
        
        // Calculate normalized direction vectors
        const normal = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        ).normalize();
        
        // Create perpendicular vectors for the polygon plane
        let tangent = new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0);
        if (Math.abs(phi) < 0.01 || Math.abs(phi - Math.PI) < 0.01) {
            tangent.set(1, 0, 0);
        }
        tangent.normalize();
        
        const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

        // Generate vertices
        for(let i = 0; i < sides; i++) {
            const angle = i * angleStep;
            const x = size * Math.cos(angle);
            const y = size * Math.sin(angle);
            
            const vertex = new THREE.Vector3()
                .addScaledVector(tangent, x)
                .addScaledVector(bitangent, y)
                .add(normal);
                
            vertex.normalize();
            vertex.multiplyScalar(this.radius);
            
            // Verify vertex values
            if (isNaN(vertex.x) || isNaN(vertex.y) || isNaN(vertex.z)) {
                console.error('Invalid vertex:', {
                    theta, phi, size,
                    normal: normal.toArray(),
                    tangent: tangent.toArray(),
                    bitangent: bitangent.toArray(),
                    x, y
                });
                // Use fallback vertex
                vertex.set(this.radius, 0, 0);
            }
            
            vertices.push(vertex);
        }
        
        return vertices;
    }

    initPolygons() {
        this.seeds.forEach(seed => {
            const geometry = new THREE.BufferGeometry();
            
            // Create vertices array for triangle fan
            const vertices = [];
            vertices.push(seed.center.x, seed.center.y, seed.center.z);
            seed.vertices.forEach(v => {
                vertices.push(v.x, v.y, v.z);
            });
            vertices.push(seed.vertices[0].x, seed.vertices[0].y, seed.vertices[0].z);
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            const polygon = new THREE.Mesh(geometry, material);
            this.mesh.add(polygon);
        });
    }

    update(progress, earthScale = 1) {
        // Ensure progress is between 0 and 1
        progress = Math.max(0, Math.min(progress, 1));
        
        this.mesh.children.forEach((polygon, index) => {
            const seed = this.seeds[index];
            const size = (this.config.initialSize + (progress * seed.growthRate)) / earthScale;
            
            try {
                const newVertices = this.generatePolygonVertices(
                    Math.atan2(seed.center.y, seed.center.x),
                    Math.acos(seed.center.z / this.radius),
                    seed.sides,
                    size
                );
                
                // Create vertices array for triangle fan
                const vertices = [];
                vertices.push(seed.center.x, seed.center.y, seed.center.z);
                newVertices.forEach(v => {
                    vertices.push(v.x, v.y, v.z);
                });
                vertices.push(newVertices[0].x, newVertices[0].y, newVertices[0].z);
                
                // Verify no NaN values
                if (vertices.some(v => isNaN(v))) {
                    console.error('NaN vertices detected:', vertices);
                    return;
                }
                
                polygon.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                polygon.geometry.attributes.position.needsUpdate = true;
                polygon.geometry.computeBoundingSphere();
            } catch (error) {
                console.error('Error updating ice polygon:', error);
            }
        });
    }
} 