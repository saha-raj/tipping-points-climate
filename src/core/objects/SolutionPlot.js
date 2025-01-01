import * as d3 from 'd3';

export class SolutionPlot {
    constructor(config) {
        // Create container element
        this.element = document.createElement('div');
        this.element.className = 'plot-area';
        this.element.style.position = 'absolute';
        
        // Set position if provided
        if (config.position) {
            this.element.style.left = `${config.position.x}%`;
            this.element.style.top = `${config.position.y}%`;
        }

        // Store config and set margins
        this.config = config;
        this.margins = { top: 40, right: 40, bottom: 60, left: 60 };

        // Get CSS variables (same as PotentialPlot for consistency)
        const style = getComputedStyle(document.documentElement);
        this.DOT_RADIUS = style.getPropertyValue('--dot-radius');
        this.LINE_COLOR = style.getPropertyValue('--plot-line-color');
        this.LINE_WIDTH = style.getPropertyValue('--plot-line-width');
        this.TEXT_COLOR = style.getPropertyValue('--text-color');
        this.MAIN_FONT = style.getPropertyValue('--main-font');

        // Initialize data array
        this.timeSeriesData = [];

        // Setup the plot
        this.setupPlot(this.element);
        
        // Add this new line to initialize the axes and point
        this.initializeAxesAndPoint(292); // Default temperature from slider

        // Initialize with default values from config
        this.initializeState(config.initialTemp);
    }

    setupPlot(container) {
        const width = 400;
        const height = width * 0.8;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const plotArea = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        // Add axes
        plotArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - this.margins.top - this.margins.bottom})`);
        
        plotArea.append('g')
            .attr('class', 'y-axis');

        // Add labels
        svg.append('text')
            .attr('class', 'x-label')
            .attr('text-anchor', 'middle')
            .attr('x', width/2)
            .attr('y', height - 10)
            .text('Time Steps');

        svg.append('text')
            .attr('class', 'y-label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height/2)
            .attr('y', 20)
            .text('Temperature (K)');

        // Update styling for axes
        plotArea.select('.x-axis')
            .style('font-size', '0.8rem')
            .style('font-family', this.MAIN_FONT)
            .style('color', this.TEXT_COLOR);

        plotArea.select('.y-axis')
            .style('font-size', '0.8rem')
            .style('font-family', this.MAIN_FONT)
            .style('color', this.TEXT_COLOR);

        // Update labels with correct styling
        svg.selectAll('.x-label, .y-label')
            .style('font-size', '0.9rem')
            .style('font-weight', '500')
            .style('font-family', this.MAIN_FONT)
            .style('fill', this.TEXT_COLOR);

        this.plot = { svg, plotArea, width, height };
    }

    updatePlot(newTemp, timeStep) {
        console.log('updatePlot called with:', { newTemp, timeStep });
        console.log('Before push:', this.timeSeriesData);
        
        // Add new data point
        this.timeSeriesData.push({ time: timeStep, temp: newTemp });
        console.log('After push:', this.timeSeriesData);

        const { svg, plotArea, width, height } = this.plot;
        const plotWidth = width - this.margins.left - this.margins.right;
        const plotHeight = height - this.margins.top - this.margins.bottom;

        // Update scales
        const x = d3.scaleLinear()
            .domain([0, Math.max(20, d3.max(this.timeSeriesData, d => d.time))])
            .range([0, plotWidth]);

        const y = d3.scaleLinear()
            .domain([220, 320])  // Same range as temperature slider
            .range([plotHeight, 0]);

        // Update axes
        plotArea.select('.x-axis')
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => Math.round(d)));
        
        plotArea.select('.y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => Math.round(d)));

        // Debug the actual data structure
        console.log('Data structure:', JSON.stringify(this.timeSeriesData[0]));
        
        // Create line generator
        const line = d3.line()
            .x(d => x(d.time))
            .y(d => y(d.temp));

        // Proper D3 enter/update/exit pattern
        let path = plotArea.selectAll('.temp-line').data([this.timeSeriesData]);
        
        // Enter new path if it doesn't exist
        path.enter()
            .append('path')
            .attr('class', 'temp-line')
            .style('fill', 'none')
            .style('stroke', this.LINE_COLOR)
            .style('stroke-width', this.LINE_WIDTH)
            .merge(path)  // Merge with update selection
            .attr('d', line);

        // Update or create current point
        let point = plotArea.selectAll('.current-point').data([this.timeSeriesData[this.timeSeriesData.length - 1]]);
        
        if (point.empty()) {
            point = plotArea.append('circle')
                .attr('class', 'current-point')
                .attr('r', this.DOT_RADIUS)
                .style('fill', this.LINE_COLOR);
        }

        point
            .attr('cx', d => x(d.time))
            .attr('cy', d => y(d.temp));
    }

    reset() {
        console.log('Reset called. Current data:', this.timeSeriesData);
        this.timeSeriesData = [];
        const { plotArea } = this.plot;
        plotArea.selectAll('.temp-line, .current-point').remove();
        console.log('After reset:', this.timeSeriesData);
    }

    initializeAxesAndPoint(initialTemp) {
        console.log('Initializing with temp:', initialTemp);
        const { plotArea, width, height } = this.plot;
        const plotWidth = width - this.margins.left - this.margins.right;
        const plotHeight = height - this.margins.top - this.margins.bottom;

        // Set up initial scales
        const x = d3.scaleLinear()
            .domain([0, 20])
            .range([0, plotWidth]);

        const y = d3.scaleLinear()
            .domain([220, 320])
            .range([plotHeight, 0]);

        // Draw initial axes
        plotArea.select('.x-axis')
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => Math.round(d)));
        
        plotArea.select('.y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => Math.round(d)));

        // Add initial point
        this.timeSeriesData = [{ time: 0, temp: initialTemp }];
        
        plotArea.append('circle')
            .attr('class', 'current-point')
            .attr('r', this.DOT_RADIUS)
            .style('fill', this.LINE_COLOR)
            .attr('cx', x(0))
            .attr('cy', y(initialTemp));
    }

    initializeState(initialTemp) {
        // Set initial visualization state based on temperature
        const isIce = initialTemp < 273;
        
        // Update initial point and data
        this.timeSeriesData = [{ time: 0, temp: initialTemp }];
        
        const { plotArea } = this.plot;
        const plotWidth = this.plot.width - this.margins.left - this.margins.right;
        const plotHeight = this.plot.height - this.margins.top - this.margins.bottom;

        // Set up initial scales
        const x = d3.scaleLinear()
            .domain([0, 20])
            .range([0, plotWidth]);

        const y = d3.scaleLinear()
            .domain([220, 320])
            .range([plotHeight, 0]);

        // Draw initial axes
        plotArea.select('.x-axis')
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d => Math.round(d)));
        
        plotArea.select('.y-axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => Math.round(d)));

        // Add initial point
        plotArea.append('circle')
            .attr('class', 'current-point')
            .attr('r', this.DOT_RADIUS)
            .style('fill', this.LINE_COLOR)
            .attr('cx', x(0))
            .attr('cy', y(initialTemp));
    }

    updateParameter(param, value) {
        // Update parameter without resetting visualization state
        this[param] = value;
        
        // Only update what needs to change
        if (param === 'g') {
            this.updateGDependentElements(value);
        }
    }
} 