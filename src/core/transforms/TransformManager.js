import { lerp, lerpPosition, calculateProgress } from '../../utils/interpolation';
import { defaults } from '../../config/globalConfig';

export class TransformManager {
    /**
     * @param {Object} transform - Transform configuration
     * @param {string} transform.type - Type of transformation
     * @param {number} transform.at - Start progress
     * @param {number} transform.duration - Duration of transform
     */
    static calculateTransform(transform, currentProgress) {
        // Use default duration if not specified
        const duration = transform.duration || defaults.transform.duration;
        
        const progress = calculateProgress(
            currentProgress,
            transform.at,
            transform.at + duration
        );

        switch (transform.type) {
            case 'scale':
                return {
                    type: 'scale',
                    value: lerp(1, transform.scale_to, progress)
                };
            
            case 'translation':
                return {
                    type: 'translation',
                    value: {
                        x: lerp(0, transform.delta_x || 0, progress),
                        y: lerp(0, transform.delta_y || 0, progress)
                    }
                };
            
            case 'rotation':
                return {
                    type: 'rotation',
                    value: lerp(0, transform.rotate_to || 0, progress)
                };
            
            default:
                return null;
        }
    }

    /**
     * @param {Array} transformations - Array of transformation configs
     * @param {number} scrollProgress - Current scroll progress (0-1)
     */
    static getActiveTransforms(transformations, scrollProgress) {
        if (!transformations?.length) return [];

        const activeTransforms = {};

        // Process transforms in order, allowing later ones to override
        transformations.forEach(transform => {
            const duration = transform.duration || defaults.transform.duration;
            const isActive = scrollProgress >= transform.at && 
                           scrollProgress <= (transform.at + duration);

            if (isActive) {
                const calculated = this.calculateTransform(transform, scrollProgress);
                if (calculated) {
                    activeTransforms[calculated.type] = calculated.value;
                }
            }
        });

        return activeTransforms;
    }
}
