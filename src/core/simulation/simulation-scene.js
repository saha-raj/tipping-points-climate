import * as THREE from 'three';
import { HEADER_X, HEADER_Y, DESC_X, DESC_Y } from '../../config/globalConfig.js';
import { ClimateModel } from './climate-model.js';
import { Plots } from './plots.js';
import { Controls } from './controls.js';
import { Scene3D } from './scene3d.js';

export class SimulationScene {
    constructor(container) {
        this.container = container;
        this.container.style.backgroundColor = '#1b263b';
        
        // Initialize climate model
        this.model = new ClimateModel();
    }
    
    activate() {
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
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
        
        // Initialize 3D scene in view container
        this.scene3d = new Scene3D(this.viewContainer);
        
        // Initialize plots and controls
        this.plots = new Plots();
        this.controls = new Controls(this.controlsContainer, params => this.handleParameterChange(params));
    }

    handleParameterChange(params) {
        // Reset simulation when parameters change
        this.scene3d.isSimulationRunning = false;
        
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
        const potentialValues = temps.map(t => 
            this.model.calculatePotential(t, greenhouse)
        );
        this.plots.updatePotentialPlot({
            temps,
            values: potentialValues,
            initialTemp
        }, equilibriumTemp);

        // Update 3D visualization
        this.scene3d.updateObjects({
            temperature: {
                initial: initialTemp,
                equilibrium: equilibriumTemp,
                temperatures: simulation.temperatures
            },
            greenhouse: greenhouse
        });
    }
    
    addControlsContainer() {
        const controlsContainer = document.createElement('div');
        Object.assign(controlsContainer.style, {
            position: 'absolute',
            left: `${HEADER_X}%`,
            top: '30%',
            width: '40%',
            height: 'auto',
            zIndex: '1',
            pointerEvents: 'auto',
            padding: '20px',
            boxSizing: 'border-box'
        });

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls-div';
        Object.assign(controlsDiv.style, {
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '20px',
            marginBottom: '20px'
        });

        // Slider container
        const sliderContainer = document.createElement('div');
        this.sliderContainer = sliderContainer;

        // Run button
        const runButton = document.createElement('button');
        runButton.textContent = 'Run';
        runButton.className = 'simulation-run-button';

        // Event listeners for button
        runButton.addEventListener('click', () => {
            Array.from(sliderContainer.getElementsByTagName('input'))
                .forEach(slider => slider.disabled = true);
            runButton.disabled = true;
            
            this.scene3d.onSimulationComplete = () => {
                Array.from(sliderContainer.getElementsByTagName('input'))
                    .forEach(slider => slider.disabled = false);
                runButton.disabled = false;
            };
            
            this.scene3d.runSimulation();
        });

        // Add elements in order
        controlsDiv.appendChild(sliderContainer);
        controlsDiv.appendChild(runButton);
        controlsContainer.appendChild(controlsDiv);

        // Plot container
        const plotContainer = document.createElement('div');
        plotContainer.id = 'potential-well-plot';
        const plotArea = document.createElement('div');
        plotArea.className = 'plot-area';
        plotContainer.appendChild(plotArea);
        controlsContainer.appendChild(plotContainer);

        this.uiContainer.appendChild(controlsContainer);
        this.controlsContainer = sliderContainer;
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
            zIndex: '1',
            pointerEvents: 'auto',
            padding: '10px',
            boxSizing: 'border-box'
        });
        this.uiContainer.appendChild(viewContainer);
        this.viewContainer = viewContainer;
    }
    
    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
