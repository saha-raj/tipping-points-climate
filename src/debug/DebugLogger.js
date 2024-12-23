export class DebugLogger {
    constructor() {
        this.lastLoggedProgress = -1;
        this.logThreshold = 0.01; // Log every 1% change
    }

    logProgress(progress) {
        // Only log if progress has changed by threshold amount
        if (Math.abs(progress - this.lastLoggedProgress) >= this.logThreshold) {
            console.log(`Scroll Progress: ${(progress * 100).toFixed(2)}%`);
            this.lastLoggedProgress = progress;
        }
    }

    logObjectState(id, state) {
        console.log(`%cObject: ${id}`, 'color: #4CAF50; font-weight: bold');
        console.log({
            position: state.position,
            opacity: state.opacity,
            transforms: state.transforms,
            visible: state.visible
        });
    }
} 