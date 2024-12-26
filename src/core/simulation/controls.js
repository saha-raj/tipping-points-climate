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
        greenhouseDiv.style.marginBottom = '20px';
        
        const greenhouseLabel = document.createElement('div');
        greenhouseLabel.textContent = 'Greenhouse Parameter:';
        greenhouseLabel.style.color = 'white';
        
        this.greenhouseValue = document.createElement('span');
        this.greenhouseValue.style.color = 'white';
        this.greenhouseValue.style.marginLeft = '10px';
        
        this.greenhouseSlider = document.createElement('input');
        this.greenhouseSlider.type = 'range';
        this.greenhouseSlider.min = '0';
        this.greenhouseSlider.max = '0.8';
        this.greenhouseSlider.step = '0.01';
        this.greenhouseSlider.value = MODEL_PARAMS.DEFAULT_GREENHOUSE;
        
        greenhouseDiv.appendChild(greenhouseLabel);
        greenhouseDiv.appendChild(this.greenhouseValue);
        greenhouseDiv.appendChild(this.greenhouseSlider);
        
        // Create temperature control
        const tempDiv = document.createElement('div');
        tempDiv.style.marginBottom = '20px';
        
        const tempLabel = document.createElement('div');
        tempLabel.textContent = 'Initial Temperature (K):';
        tempLabel.style.color = 'white';
        
        this.tempValue = document.createElement('span');
        this.tempValue.style.color = 'white';
        this.tempValue.style.marginLeft = '10px';
        
        this.tempSlider = document.createElement('input');
        this.tempSlider.type = 'range';
        this.tempSlider.min = MODEL_PARAMS.MIN_TEMP.toString();
        this.tempSlider.max = MODEL_PARAMS.MAX_TEMP.toString();
        this.tempSlider.step = '0.1';
        this.tempSlider.value = MODEL_PARAMS.DEFAULT_TEMP;

        tempDiv.appendChild(tempLabel);
        tempDiv.appendChild(this.tempValue);
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
