import * as d3 from 'd3';

export class PotentialPlot {
    constructor(container, model) {
        this.container = container;
        this.model = model;
        
        // Create SVG container for plot
        this.margin = {top: 20, right: 30, bottom: 40, left: 50};
        this.width = container.clientWidth - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom;
        
        this.svg = d3.create('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
            
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            
        // Add axes
        this.xScale = d3.scaleLinear()
            .domain([-20, 30])
            .range([0, this.width]);
            
        this.yScale = d3.scaleLinear()
            .domain([-2000, 2000])
            .range([this.height, 0]);
            
        g.append('g')
            .attr('transform', `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale))
            .append('text')
            .attr('x', this.width/2)
            .attr('y', 35)
            .attr('fill', 'white')
            .text('Temperature (°C)');
            
        g.append('g')
            .call(d3.axisLeft(this.yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -this.height/2)
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text('Potential');
            
        // Add line for potential curve
        this.line = g.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
            
        // Add point for current state
        this.point = g.append('circle')
            .attr('r', 5)
            .attr('fill', 'red');
            
        // Style axes
        this.svg.selectAll('.axis line')
            .style('stroke', 'white');
        this.svg.selectAll('.axis path')
            .style('stroke', 'white');
        this.svg.selectAll('.axis text')
            .style('fill', 'white');
            
        // Add to container
        container.appendChild(this.svg.node());
        
        // Initial update
        this.update();
    }
    
    update() {
        // Generate data points
        const points = [];
        for (let T = -20; T <= 30; T += 0.1) {
            points.push({
                T: T,
                V: this.model.potential(T, this.model.g)
            });
        }
        
        // Update line
        this.line.datum(points)
            .attr('d', d3.line()
                .x(d => this.xScale(d.T))
                .y(d => this.yScale(d.V))
            );
            
        // Update point
        const currentV = this.model.potential(this.model.T, this.model.g);
        this.point
            .attr('cx', this.xScale(this.model.T))
            .attr('cy', this.yScale(currentV));
    }
}
