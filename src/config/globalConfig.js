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
 * @property {string} type - "header" | "description" | "3dObject"
 * @property {string} [content] - Text content if applicable
 * @property {Position} position - Resting position
 * @property {Object} transition - Entry and exit transitions
 * @property {TransitionPoint} [transition.entry_from] - Entry transition
 * @property {TransitionPoint} [transition.exit_to] - Exit transition
 * @property {Transformation[]} [transformations] - Array of transformations
 */

// Define constants in percentage values (0-100)
const EARTH_X = 50;  // Center of screen horizontally
const EARTH_Y = 50;  // Center of screen vertically

export const HEADER_X = 5;  
export const HEADER_Y = 10;

export const DESC_X = HEADER_X;
export const DESC_Y = HEADER_Y + 10;

const SCROLL_dX = 0;
const SCROLL_dY = 100;



const NUM_SCENES = 6;
const SCENE_DURATION = 1/NUM_SCENES;          // Each scene is 1/n of total progress
const TRANSITION_DURATION_FRAC = 0.2;         // Transitions take 10% of scene duration
const TRANSITION_DURATION = SCENE_DURATION * TRANSITION_DURATION_FRAC;
const HEIGHT_MULTIPLIER = 300;  


// Scene Control
export const sceneControl = {
    numScenes: NUM_SCENES,
    sceneDuration: SCENE_DURATION,
    transitionDuration: TRANSITION_DURATION,
    heightMultiplier: HEIGHT_MULTIPLIER
};

// Scene Configuration
export const sceneConfig = {
    totalScenes: NUM_SCENES,
    heightPerScene: HEIGHT_MULTIPLIER,
    totalHeight: NUM_SCENES * HEIGHT_MULTIPLIER
};

// Type-specific defaults
export const typeDefaults = {
    header: {
        position: { x: HEADER_X, y: HEADER_Y },
        transition: {
            entry_from: {
                x: HEADER_X + SCROLL_dX,  y: HEADER_Y + SCROLL_dY,
                opacity: 0
            },
            exit_to: {
                x: HEADER_X - SCROLL_dX,  y: HEADER_Y - SCROLL_dY,
                opacity: 0
            }
        }
    },
    description: {
        position: { x: DESC_X, y: DESC_Y },
        transition: {
            entry_from: {
                x: DESC_X + SCROLL_dX, y: DESC_Y + SCROLL_dY,
                opacity: 0
            },
            exit_to: {
                x: DESC_X - SCROLL_dX, y: DESC_Y - SCROLL_dY,
                opacity: 0
            }
        }
    }
};

export const defaults = {
    transition: {
        duration: TRANSITION_DURATION,
        opacity: { entry: 1,  exit: 0, initial: 0  },
        entry:   { duration: TRANSITION_DURATION },
        exit:    { duration: TRANSITION_DURATION }
    },
    transform: { duration: TRANSITION_DURATION }
};

/** @type {ObjectConfig[]} */

export const globalConfig = [
    
    {   // --------------------- EARTH ---------------------
        id: "earth",
        type: "3dObject",
        position: { x: EARTH_X, y: EARTH_Y },
        transition: {
            entry_from: { x: EARTH_X, y: EARTH_Y, at: 0, duration: 0.1 },
            exit_to: null
        },
        transformations: [
            {
                type: "scale",
                scale_to: 0.1,
                at: 0.2, duration: 0.05
            },
            {
                type: "scale",
                scale_to: 1,
                at: 0.25, duration: 0.05
            },
            // {
            //     type: "scale",
            //     scale_to: 1,
            //     at: 0.75,
            // }
        ]
    },

    {   // --------------------- SCENE 1 ---------------------
        id: "header-1",
        type: "header",
        content: "Climate Tipping Points",
        position: { x: HEADER_X, y: HEADER_Y },
        transition: {
            entry_from: { 
                x: HEADER_X, y: HEADER_Y, 
                at: 0,duration: 0.001,opacity: 0
            },
            exit_to: { 
                x: HEADER_X, y: HEADER_Y - SCROLL_dY, 
                at: SCENE_DURATION, opacity: 0
            }
        }
    },
    {
        id: "description-1",
        type: "description",
        content: 
            "Modeling the Earth's Climate is a complex affair. " +
            "It involves many different physical processes, " + 
            "and many different types of data.",
        position: { x: DESC_X, y: DESC_Y },
        transition: {
            entry_from: { 
                x: DESC_X, y: DESC_Y, 
                at: 0, duration: 0.001, 
            },
            exit_to: { 
                x: DESC_X, y: DESC_Y - SCROLL_dY, 
                at: SCENE_DURATION, 
            }
        }
    },
    {   // --------------------- SCENE 2 ---------------------
        id: "header-2",
        type: "header",
        content: "A Pale Blue Dot",
        transition: {
            entry_from: { at: SCENE_DURATION },
            exit_to:    { at: SCENE_DURATION * 2 }
        }
    },
    {
        id: "description-2",
        type: "description",
        content: 
            "What we do to simplify",
        position: { x: DESC_X, y: DESC_Y },
        transition: {
            entry_from: { at: SCENE_DURATION },
            exit_to:    { at: SCENE_DURATION * 2 }           
        }
    },
    {   // --------------------- SCENE 3 ---------------------
        id: "header-3",
        type: "header",
        content: "Building (the simplest) Climate Model",
        transition: {
            entry_from: {  at: SCENE_DURATION * 2 },
            exit_to:    {  at: SCENE_DURATION * 3 }
        }
    },
    {
        id: "description-3",
        type: "description",
        content: 
            "Energy Balance",
        transition: {
            entry_from: {  at: SCENE_DURATION * 2 },
            exit_to:    {  at: SCENE_DURATION * 3 }
        }
    },
    {   // --------------------- SCENE 4 ---------------------
        id: "header-4",
        type: "header",
        content: "Incoming Energy",
        transition: {
            entry_from: {  at: SCENE_DURATION * 3 },
            exit_to:    {  at: SCENE_DURATION * 4 }
        }
    },
    {
        id: "description-4",
        type: "description",
        content: 
            "Ein, The Stefan-Boltzmann equation: $$P = \\beta A T^4$$ where $\\sigma$ is the Stefan-Boltzmann constant.",
        transition: {
            entry_from: {  at: SCENE_DURATION * 3 },
            exit_to:    {  at: SCENE_DURATION * 4 }
        }
    },
    {   // --------------------- SCENE 5 ---------------------
        id: "header-5",
        type: "header",
        content: "Outgoing Energy",
        transition: {
            entry_from: {  at: SCENE_DURATION * 4 },
            exit_to:    {  at: SCENE_DURATION * 5 }
        }
    },
    {
        id: "description-5",
        type: "description",
        content: 
            "Eout",
        transition: {
            entry_from: {  at: SCENE_DURATION * 4 },
            exit_to:    {  at: SCENE_DURATION * 5 }
        }
    },
    {   // --------------------- SCENE 6 ---------------------
        id: "header-6",
        type: "header",
        content: "Tipping Points",
        transition: {
            entry_from: {  at: SCENE_DURATION * 5 },
            exit_to:    {  at: SCENE_DURATION * 6 }
        }
    },
    {
        id: "description-6",
        type: "description",
        content: 
            "Critical Transitions",
        transition: {
            entry_from: {  at: SCENE_DURATION * 5 },
            exit_to:    {  at: SCENE_DURATION * 6 }
        }
    },
    // {   
    //     id: "simulation-button",
    //     type: "button",
    //     content: "Enter Simulation",
    //     position: { x: 50, y: 50 },
    //     transition: {
    //         entry_from: { at: 0.98, opacity: 0 },
    //         exit_to: { at: 1, opacity: 0 }
    //     }
    // }
    {
        id: 'return-to-story',
        type: 'button',
        content: '↑',
        position: {
            x: 50,
            y: 5
        },
        style: {
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '10px'
        },
        transition: {
            entry_from: {
                at: 0.85,
                opacity: 0,
                duration: 0.2
            },
            exit_to: {
                at: 0.98,
                opacity: 0,
                duration: 0.2
            }
        }
    },
    {
        id: 'forward-to-story',
        type: 'button',
        content: '↓',
        position: {
            x: 50,
            y: 95  // Positioned at bottom
        },
        style: {
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '10px'
        },
        transition: {
            entry_from: {
                at: 0.85,
                opacity: 0,
                duration: 0.2
            },
            exit_to: {
                at: 0.98,
                opacity: 0,
                duration: 0.2
            }
        }
    }
];

export const extraConfig = [
    // {
    //     id: "atmosphere",
    //     entry: { at: 0 },
    //     exit: { at: 0.9 }    
    // },
    {
        id: "atmosphereHotNonlinear",
        entry: { at: 0 },
        exit: { at: 0.95 }    
    },
    {
        id: "shadowCylinder",
        entry: { at: 0.5 },
        exit: { at: 0.6 }    
    },
    {
        id: "earthTexture",
        file: '/assets/textures/water_world_pix.jpg',
        entry: { at: 0.32 },
        exit: { at: 0.9 }    
    },
    // {
    //     id: "earthTexture",
    //     file: '/assets/textures/earth_noClouds.0330.jpg',
    //     entry: { at: 0.4 },
    //     exit: { at: 0.6 }    
    // },
    {
        id: "iceGroup",
        entry: { at: 0.27 },
        exit: { at: 0.35 },
        maxRadius: 0.7  // Maximum size of ice patches
    },
    {
        id: "iceGroup",
        entry: { at: 0.55 },
        exit: { at: 0.85 },
        maxRadius:1  // Maximum size of ice patches
    }
];

