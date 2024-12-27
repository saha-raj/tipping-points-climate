import * as THREE from 'three';
import { SimulationObjects } from './simulation-objects.js';

export class Scene3D {
    constructor(container) {
        this.container = container;
        this.factory = new SimulationObjects();
        
        // Setup THREE.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1b263b);  // Set black background
        
        this.camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.x = -4;
        this.camera.position.y = 3.2;
        this.camera.position.z = 3;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true  // Enable transparency
        });
        this.renderer.setClearColor(0x1b263b, 1);  // Set clear color to black
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        
        // Create objects
        this.earth = this.factory.createEarth();
        // Set initial tilt
        this.earth.rotation.z = 23.5 * Math.PI / 180;
        
        // Create rotation axis aligned with tilt
        this.rotationAxis = new THREE.Vector3(0, 1, 0)
            .applyAxisAngle(new THREE.Vector3(0, 0, 1), 23.5 * Math.PI / 180)
            .normalize();
        
        this.atmosphere = this.factory.createAtmosphere();
        this.sunLight = this.factory.createSunLight();
        
        // Add objects to scene
        this.scene.add(this.earth);
        this.scene.add(this.atmosphere);
        this.scene.add(this.sunLight);
        
        // Start animation
        this.animate();
    }
    
    updateObjects({ temperature, greenhouse }) {
        // Update atmosphere opacity based on greenhouse
        this.atmosphere.children.forEach(layer => {
            const baseOpacity = layer.material.opacity;  // Keep original relative opacity
            const scale = (greenhouse - 0.3) / (0.45 - 0.3);  // Scale greenhouse to 0-1
            layer.material.opacity = baseOpacity * scale;
        });
        
        // Update ice caps based on temperature
        if (this.earth.updateIceCaps) {
            this.earth.updateIceCaps(temperature);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate earth around tilted axis
        const rotationSpeed = 0.005;
        this.earth.rotateOnWorldAxis(this.rotationAxis, rotationSpeed);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Handle window resize
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
} 