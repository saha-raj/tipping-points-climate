export class Parameters {
    constructor(container, model, onChange) {
        this.container = container;
        this.model = model;
        this.onChange = onChange;
        
        // Create sliders container
        this.slidersContainer = document.createElement('div');
        Object.assign(this.slidersContainer.style, {
            padding: '20px',
            color: 'white'
        });
        this.container.appendChild(this.slidersContainer);
        
        // Create sliders
        this.createGreenHouseSlider();
        this.createTemperatureSlider();
    }
    
    createGreenHouseSlider() {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '20px';
        
        const label = document.createElement('label');
        label.textContent = 'Greenhouse Parameter (g): ';
        label.style.display = 'block';
        
        const slider = document.createElement('input');
        Object.assign(slider, {
            type: 'range',
            min: 0.5,
            max: 1.5,
            step: 0.01,
            value: this.model.g
        });
        
        const value = document.createElement('span');
        value.textContent = this.model.g.toFixed(2);
        
        slider.addEventListener('input', () => {
            const g = parseFloat(slider.value);
            value.textContent = g.toFixed(2);
            this.model.updateParams(g, this.model.T);
            if (this.onChange) this.onChange();
        });
        
        wrapper.appendChild(label);
        wrapper.appendChild(slider);
        wrapper.appendChild(value);
        this.slidersContainer.appendChild(wrapper);
    }
    
    createTemperatureSlider() {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '20px';
        
        const label = document.createElement('label');
        label.textContent = 'Temperature (°C): ';
        label.style.display = 'block';
        
        const slider = document.createElement('input');
        Object.assign(slider, {
            type: 'range',
            min: -20,
            max: 30,
            step: 0.1,
            value: this.model.T
        });
        
        const value = document.createElement('span');
        value.textContent = this.model.T.toFixed(1);
        
        slider.addEventListener('input', () => {
            const T = parseFloat(slider.value);
            value.textContent = T.toFixed(1);
            this.model.updateParams(this.model.g, T);
            if (this.onChange) this.onChange();
        });
        
        wrapper.appendChild(label);
        wrapper.appendChild(slider);
        wrapper.appendChild(value);
        this.slidersContainer.appendChild(wrapper);
    }
}
