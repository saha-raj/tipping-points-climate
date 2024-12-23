/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} TransitionPoint
 * @property {number} x
 * @property {number} y
 * @property {number} at - Scroll progress when transition starts (0-1)
 * @property {number} duration - Duration of transition in scroll progress (0-1)
 */

/**
 * @typedef {Object} Transformation
 * @property {string} type - "scale" | "translation" | "rotation"
 * @property {number} at - Scroll progress when transform starts (0-1)
 * @property {number} duration - Duration of transform in scroll progress (0-1)
 * @property {number} [scale_to] - Target scale for "scale" type
 * @property {number} [delta_x] - X translation for "translation" type
 * @property {number} [delta_y] - Y translation for "translation" type
 * @property {number} [rotate_to] - Target rotation for "rotation" type
 */

/**
 * @typedef {Object} ObjectConfig
 * @property {string} id - Unique identifier
 * @property {string} [content] - Text content if applicable
 * @property {Position} position - Resting position
 * @property {Object} transition - Entry and exit transitions
 * @property {TransitionPoint} [transition.entry_from] - Entry transition
 * @property {TransitionPoint} [transition.exit_to] - Exit transition
 * @property {Transformation[]} [transformations] - Array of transformations
 */

/** @type {ObjectConfig[]} */
export const globalConfig = [
    {
        id: "header-1",
        content: "Welcome",
        position: { x: 20, y: 30 },
        transition: {
            entry_from: { x: 20, y: 160, at: 0, duration: 0.05 },
            exit_to: { x: 20, y: -160, at: 0.8, duration: 0.05 }
        }
    },
    {
        id: "earth",
        position: { x: 50, y: 85 },
        transition: {
            entry_from: { x: 50, y: 85, at: 0, duration: 0.05},
            exit_to: null
        },
        transformations: [
            {
                type: "scale",
                scale_to: 3,
                at: 0.5,
                duration: 0.1,
            },

            {
                type: "translation",
                delta_x: 20,
                delta_y: 10,
                at: 0.2,
                duration: 0.1
            }
        ]
    }
];
