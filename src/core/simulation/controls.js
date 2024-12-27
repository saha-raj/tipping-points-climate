import { MODEL_PARAMS } from './constants.js';

export class Controls {
    constructor(container, onParameterChange) {
        this.container = container;
        this.onParameterChange = onParameterChange;
        this.setupControls();
    }

    setupControls() {
        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.style.padding = '20px';
        this.container.appendChild(controlsDiv);

        // Create greenhouse control
        const greenhouseDiv = document.createElement('div');
        greenhouseDiv.className = 'slider-container';
        
        // Create label container for label and value side by side
        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-container';
        
        const greenhouseLabel = document.createElement('div');
        greenhouseLabel.textContent = 'Greenhouse Effect (g)';
        greenhouseLabel.className = 'slider-label';
        
        this.greenhouseValue = document.createElement('span');
        this.greenhouseValue.className = 'value-display';
        
        // Add label and value to label container
        labelContainer.appendChild(greenhouseLabel);
        labelContainer.appendChild(this.greenhouseValue);
        
        this.greenhouseSlider = document.createElement('input');
        this.greenhouseSlider.type = 'range';
        this.greenhouseSlider.min = '0.3';
        this.greenhouseSlider.max = '0.45';
        this.greenhouseSlider.step = '0.01';
        this.greenhouseSlider.value = MODEL_PARAMS.DEFAULT_GREENHOUSE;
        
        // Add components to container
        greenhouseDiv.appendChild(labelContainer);
        greenhouseDiv.appendChild(this.greenhouseSlider);

        // Create temperature control
        const tempDiv = document.createElement('div');
        tempDiv.className = 'slider-container';
        
        const tempLabelContainer = document.createElement('div');
        tempLabelContainer.className = 'label-container';
        
        const tempLabel = document.createElement('div');
        tempLabel.textContent = 'Temperature (K)';
        tempLabel.className = 'slider-label';
        
        this.tempValue = document.createElement('span');
        this.tempValue.className = 'value-display';
        
        tempLabelContainer.appendChild(tempLabel);
        tempLabelContainer.appendChild(this.tempValue);
        
        this.tempSlider = document.createElement('input');
        this.tempSlider.type = 'range';
        this.tempSlider.min = MODEL_PARAMS.MIN_TEMP.toString();
        this.tempSlider.max = MODEL_PARAMS.MAX_TEMP.toString();
        this.tempSlider.step = '0.1';
        this.tempSlider.value = MODEL_PARAMS.DEFAULT_TEMP;

        tempDiv.appendChild(tempLabelContainer);
        tempDiv.appendChild(this.tempSlider);

        // Add controls to container
        controlsDiv.appendChild(greenhouseDiv);
        controlsDiv.appendChild(tempDiv);

        // Setup event listeners
        this.greenhouseSlider.addEventListener('input', () => {
            this.updateValueDisplay(this.greenhouseValue, parseFloat(this.greenhouseSlider.value).toFixed(2));
            this.broadcastParameters();
        });

        this.tempSlider.addEventListener('input', () => {
            this.updateValueDisplay(this.tempValue, Math.round(parseFloat(this.tempSlider.value)));
            this.broadcastParameters();
        });

        // Initial display update
        this.updateValueDisplay(this.greenhouseValue, MODEL_PARAMS.DEFAULT_GREENHOUSE.toFixed(2));
        this.updateValueDisplay(this.tempValue, Math.round(MODEL_PARAMS.DEFAULT_TEMP));
        this.broadcastParameters();
    }

    updateValueDisplay(element, value) {
        element.textContent = value;
    }

    getParameters() {
        return {
            greenhouse: parseFloat(this.greenhouseSlider.value),
            initialTemp: parseFloat(this.tempSlider.value)
        };
    }

    broadcastParameters() {
        this.onParameterChange(this.getParameters());
    }
}