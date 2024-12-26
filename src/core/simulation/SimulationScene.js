import * as THREE from 'three';
import { HEADER_X, HEADER_Y, DESC_X, DESC_Y } from '../../config/globalConfig.js';
import { ClimateModel } from './ClimateModel.js';
// import { Parameters } from './controls/Parameters.js';
import { Plots } from './plots.js';

export class SimulationScene {
    constructor(container) {
        this.container = container;
        
        // Initialize climate model
        this.model = new ClimateModel();
        
        // Setup THREE.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#1a759f');
        
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    activate() {
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // Add renderer's canvas
        this.container.appendChild(this.renderer.domElement);
        
        // Create and add UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none';
        this.container.appendChild(this.uiContainer);
        
        // Add UI elements
        this.addHeader();
        this.addDescription();
        this.addControlsContainer();
        this.addViewContainer();
        this.addReturnButton();
        
        // Initialize controls and plot
        this.parameters = new Parameters(this.controlsContainer, this.model, () => {
            this.potentialPlot.update();
        });
        
        this.potentialPlot = new PotentialPlot(this.controlsContainer, this.model);
        
        // Start animation
        this.animate();
    }
    
    addControlsContainer() {
        const controlsContainer = document.createElement('div');
        Object.assign(controlsContainer.style, {
            position: 'absolute',
            left: '0',
            top: '30%',
            width: '40%',
            height: '65%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Semi-transparent dark background
            border: '1px solid white',
            zIndex: '1',
            pointerEvents: 'auto',
            padding: '20px',
            boxSizing: 'border-box'
        });
        this.uiContainer.appendChild(controlsContainer);
        this.controlsContainer = controlsContainer;
    }
    
    addHeader() {
        const header = document.createElement('h1');
        header.textContent = "Climate Model Simulation";
        header.className = 'text-element text-type-header';
        header.style.left = `${HEADER_X}%`;
        header.style.top = `${HEADER_Y}%`;
        this.uiContainer.appendChild(header);
    }
    
    addDescription() {
        const description = document.createElement('p');
        description.textContent = "Adjust parameters to explore how changes affect global temperature.";
        description.className = 'text-element text-type-description';
        description.style.left = `${DESC_X}%`;
        description.style.top = `${DESC_Y}%`;
        this.uiContainer.appendChild(description);
    }
    
    addReturnButton() {
        const button = document.createElement('button');
        button.textContent = 'Return to Story';
        button.style.position = 'absolute';
        button.style.top = '20px';
        button.style.left = '20px';
        button.style.zIndex = '1';          // Ensure it's above canvas
        button.style.pointerEvents = 'auto'; // Make button clickable
        button.addEventListener('click', () => {
            if (this.onReturnToStory) this.onReturnToStory();
        });
        this.uiContainer.appendChild(button);
    }
    
    addViewContainer() {
        const viewContainer = document.createElement('div');
        Object.assign(viewContainer.style, {
            position: 'absolute',
            right: '0',
            top: '30%',  // Below header and description
            width: '55%',
            height: '65%',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',  // Semi-transparent green
            border: '1px solid white',
            zIndex: '1'
        });
        this.uiContainer.appendChild(viewContainer);
        this.viewContainer = viewContainer;
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
