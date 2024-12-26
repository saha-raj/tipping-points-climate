import * as THREE from 'three';
import { HEADER_X, HEADER_Y, DESC_X, DESC_Y } from '../../config/globalConfig.js';

export class SimulationScene {
    constructor(container) {
        this.container = container;
        
        // Create UI container that sits on top of the canvas
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none';  // Let clicks pass through to canvas
        this.container.appendChild(this.uiContainer);
        
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
        
        // Add text elements
        this.addHeader();
        this.addDescription();
        
        // Add return button
        this.addReturnButton();
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
    
    activate() {
        // Store existing elements we want to keep
        const existingElements = Array.from(this.container.children).filter(
            child => child.tagName === 'LINK' || child.tagName === 'STYLE'
        );
        
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
        this.addReturnButton();
        
        // Start animation
        this.animate();
        
        console.log('Simulation activated:', {
            container: this.container,
            uiContainer: this.uiContainer,
            children: this.uiContainer.children,
            cssElements: existingElements
        });
    }
    
    deactivate() {
        // Stop animation loop
        cancelAnimationFrame(this.animationFrame);
        
        // Remove renderer and button
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
