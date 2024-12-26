import * as THREE from 'three';
import { HEADER_X, HEADER_Y, DESC_X, DESC_Y } from '../../config/globalConfig.js';
import { ClimateModel } from './climate-model.js';
import { Plots } from './plots.js';
import { Controls } from './controls.js';

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
        
        // Initialize plots and controls
        this.plots = new Plots();
        this.controls = new Controls(this.controlsContainer, params => this.handleParameterChange(params));
        
        // Start animation
        this.animate();
    }

    handleParameterChange(params) {
        const { greenhouse, initialTemp } = params;

        // Run simulation
        const YEAR_IN_SECONDS = 365 * 24 * 3600;
        const SIMULATION_TIME = 10 * YEAR_IN_SECONDS;
        const timeSteps = 1000;
        const dt = SIMULATION_TIME / timeSteps;

        const simulation = this.model.simulateTemperature(
            initialTemp, 
            greenhouse,
            timeSteps,
            dt
        );
        const equilibriumTemp = simulation.temperatures[simulation.temperatures.length - 1];

        // Update plots
        const temps = this.model.generateTempRange();
        const rates = temps.map(t => this.model.calculateDeltaT(t, greenhouse));
        
        const phaseData = {
            temperatures: temps,
            rates: rates,
            initialTemp
        };
        this.plots.updateEquilibriumPlot(phaseData, equilibriumTemp);

        // Update potential well plot
        const potentialValues = temps.map(t => 
            this.model.calculatePotential(t, greenhouse)
        );
        this.plots.updatePotentialPlot({
            temps,
            values: potentialValues,
            initialTemp
        }, equilibriumTemp);
    }
    
    addControlsContainer() {
        const controlsContainer = document.createElement('div');
        Object.assign(controlsContainer.style, {
            position: 'absolute',
            left: '0',
            top: '30%',
            width: '40%',
            height: '65%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
        button.style.zIndex = '1';
        button.style.pointerEvents = 'auto';
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
            top: '30%',
            width: '55%',
            height: '65%',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            border: '1px solid white',
            zIndex: '1',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box'
        });

        // Create equilibrium plot container
        const equilibriumPlot = document.createElement('div');
        equilibriumPlot.id = 'equilibrium-plot';
        const equilibriumPlotArea = document.createElement('div');
        equilibriumPlotArea.className = 'plot-area';
        equilibriumPlot.appendChild(equilibriumPlotArea);
        equilibriumPlot.style.flex = '1';
        viewContainer.appendChild(equilibriumPlot);

        // Create potential well plot container
        const potentialWellPlot = document.createElement('div');
        potentialWellPlot.id = 'potential-well-plot';
        const potentialWellPlotArea = document.createElement('div');
        potentialWellPlotArea.className = 'plot-area';
        potentialWellPlot.appendChild(potentialWellPlotArea);
        potentialWellPlot.style.flex = '1';
        viewContainer.appendChild(potentialWellPlot);

        this.uiContainer.appendChild(viewContainer);
        this.viewContainer = viewContainer;
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
