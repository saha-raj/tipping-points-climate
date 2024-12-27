import * as THREE from 'three';
import { SimulationObjects } from './simulation-objects.js';
import { MODEL_PARAMS } from './constants.js';

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
        
        this.isSimulationRunning = false;
        this.simulationData = null;
        this.currentTimeStep = 0;
        
        // Only animate earth rotation, not simulation
        this.animate();
    }
    
    updateObjects({ temperature, greenhouse }) {
        // Store simulation data but don't animate yet
        this.simulationData = {
            temperatures: temperature.temperatures,
            greenhouse: greenhouse
        };
        
        // Update atmosphere opacity based on greenhouse
        this.atmosphere.children.forEach(layer => {
            const baseOpacityFunction = layer.userData.baseOpacityFunction;
            const k0 = 0.1 + (0.4 * (greenhouse - 0.35) / (0.45 - 0.35));
            layer.material.opacity = k0 * baseOpacityFunction;
        });
        
        // Update ice caps based on initial temperature
        if (this.earth.updateIceCaps) {
            const albedo = this.calculateAlbedo(temperature.initial);
            console.log('Initial temperature:', temperature.initial);
            console.log('Calculated albedo:', albedo);
            this.earth.updateIceCaps(albedo);
        }
    }
    
    runSimulation() {
        this.isSimulationRunning = true;
        this.currentTimeStep = 0;
        this.animateSimulation();
    }
    
    animateSimulation() {
        if (!this.isSimulationRunning || !this.simulationData) return;
        
        if (this.currentTimeStep < this.simulationData.temperatures.length - 1) {
            const currentTemp = this.simulationData.temperatures[this.currentTimeStep];
            const nextTemp = this.simulationData.temperatures[this.currentTimeStep + 1];
            
            // Check if we're close to equilibrium
            if (Math.abs(nextTemp - currentTemp) < 0.01) {
                this.isSimulationRunning = false;
                this.onSimulationComplete?.();  // Notify simulation-scene
                return;
            }
            
            const albedo = this.calculateAlbedo(currentTemp);
            this.earth.updateIceCaps(albedo);
            
            this.currentTimeStep++;
            setTimeout(() => this.animateSimulation(), 50);
        } else {
            this.isSimulationRunning = false;
            this.onSimulationComplete?.();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Only rotate earth, don't update simulation
        const rotationSpeed = 0.005;
        this.earth.rotateOnWorldAxis(this.rotationAxis, rotationSpeed);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    calculateAlbedo(temperature) {
        const { A1, A2, T_CRIT, DELTA_T } = MODEL_PARAMS;
        console.log('MODEL_PARAMS:', MODEL_PARAMS);
        console.log('Temperature:', temperature);
        console.log('Parameters:', { A1, A2, T_CRIT, DELTA_T });
        
        const albedo = A1 - 0.5 * A2 * (1 + Math.tanh((temperature - T_CRIT) / DELTA_T));
        console.log('Calculated albedo:', albedo);
        return albedo;
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