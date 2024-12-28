import * as d3 from 'd3';

export class SimPlot {
    constructor(container) {
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.width = 300 - this.margin.left - this.margin.right;
        this.height = 200 - this.margin.top - this.margin.bottom;

        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.plotArea = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Add axes
        this.plotArea.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`);

        this.plotArea.append('g')
            .attr('class', 'y-axis');
    }

    updatePotentialPlot(data, equilibriumTemp) {
        const x = d3.scaleLinear()
            .domain([Math.min(...data.temps), Math.max(...data.temps)])
            .range([0, this.width]);

        const y = d3.scaleLinear()
            .domain([Math.min(...data.values), Math.max(...data.values)])
            .range([this.height, 0]);

        this.plotArea.select('.x-axis').call(d3.axisBottom(x));
        this.plotArea.select('.y-axis').call(d3.axisLeft(y));

        const line = d3.line()
            .x((d, i) => x(data.temps[i]))
            .y(d => y(d));

        this.plotArea.selectAll('.line').remove();
        this.plotArea.append('path')
            .datum(data.values)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    }
} 