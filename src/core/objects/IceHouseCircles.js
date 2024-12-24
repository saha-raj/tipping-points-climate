export class IceHouseCircles {
    constructor(config) {
        this.N_seeds = config.N_seeds || 10;  // Default to 10 seeds if not specified
        this.growthRate = config.growth_rate || 1;
        
        // Create container for ice circles
        this.element = document.createElement('div');
        this.element.className = 'ice-container';
        console.log('Creating ice container:', this.element); // Debug line
        
        // Create seed points
        this.seeds = [];
        for (let i = 0; i < this.N_seeds; i++) {
            const circle = document.createElement('div');
            circle.className = 'ice-circle';
            this.element.appendChild(circle);
            console.log('Creating ice circle:', i); // Debug line
            
            // Distribute evenly (for now just in a grid, we can improve later)
            const x = (i % 3) * 33;  // Simple 3x3 grid
            const y = Math.floor(i / 3) * 33;
            circle.style.left = `${x}%`;
            circle.style.top = `${y}%`;
            
            this.seeds.push(circle);
        }
    }

    // Method to update ice growth based on progress
    updateGrowth(progress) {
        const size = Math.max(10, progress * this.growthRate * 100); // Minimum 10px, max 100px when progress is 1
        this.seeds.forEach(circle => {
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;
        });
    }
} 