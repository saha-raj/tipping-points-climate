import { sceneContent } from '../content/contentForExport.js';


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





// -----------------------------------------
// --------------- CONSTANTS ---------------    
// -----------------------------------------

const TRANSITION_DURATION_FRAC = 0.1;
const HEIGHT_MULTIPLIER = 300;

const EARTH_X = 50;  // Center of screen horizontally
const EARTH_Y = 50;  // Center of screen vertically

export const INTRO_HEAD_X = 5;
export const INTRO_HEAD_Y = 40;
export const INTRO_DESC_X = 5;
export const INTRO_DESC_Y = 60;

export const HEAD_X = 5;
export const HEAD_Y = 10;
export const DESC_X = HEAD_X;
export const DESC_Y = HEAD_Y + 10;

const SCROLL_dX = 0;
const SCROLL_dY = 100;

const SIM_SCENE_NUM = 7; // as in contentForExport.js

// -----------------------------------------
// -----------------------------------------



const NUM_SCENES = Math.max(
    ...Object.keys(sceneContent)
        .map(id => parseInt(id.split('-')[1]))
    ) + 1;  // +1 because we start counting from 0


const SCENE_DURATION = 1 / NUM_SCENES;
const TRANSITION_DURATION = SCENE_DURATION * TRANSITION_DURATION_FRAC;

export const SIM_SCENE_START_AT = (SIM_SCENE_NUM / NUM_SCENES);
export const SIM_SCENE_END_AT   = (SIM_SCENE_NUM + 1) / NUM_SCENES;
export const SIM_SCENE_LOCK_START_AT = SIM_SCENE_START_AT + TRANSITION_DURATION;
export const SIM_SCENE_LOCK_END_AT   = SIM_SCENE_END_AT;


export const SIM_SCENE_RETURN_BACK_AT = (SIM_SCENE_NUM - 1) / NUM_SCENES + TRANSITION_DURATION;
export const SIM_SCENE_FORWARD_TO_AT = SIM_SCENE_END_AT + TRANSITION_DURATION;

export const sceneConfig = {
    totalScenes: NUM_SCENES,
    heightPerScene: HEIGHT_MULTIPLIER,
    totalHeight: NUM_SCENES * HEIGHT_MULTIPLIER
};

export const defaults = {
    transition: {
        duration: TRANSITION_DURATION,
        opacity: { entry: 1, exit: 0, initial: 0 },
        entry: { duration: TRANSITION_DURATION },
        exit: { duration: TRANSITION_DURATION }
    },
    transform: { duration: TRANSITION_DURATION }
};

// Type-specific defaults
export const typeDefaults = {
    'intro-header': {
        position: { x: INTRO_HEAD_X, y: INTRO_HEAD_Y },
        initiallyVisible: true,
        transition: {
            entry_from: {
                x: INTRO_HEAD_X, y: INTRO_HEAD_Y,
                opacity: 1
            },
            exit_to: {
                x: INTRO_HEAD_X, y: INTRO_HEAD_Y - SCROLL_dY,
                opacity: 1
            }
        }
    },
    'intro-description': {
        position: { x: INTRO_DESC_X, y: INTRO_DESC_Y },
        initiallyVisible: true,
        transition: {
            entry_from: {
                x: INTRO_DESC_X, y: INTRO_DESC_Y,
                opacity: 1
            },
            exit_to: {
                x: INTRO_DESC_X, y: INTRO_DESC_Y - SCROLL_dY,
                opacity: 0
            }
        }
    },
    'header': {
        position: { x: HEAD_X, y: HEAD_Y },
        transition: {
            entry_from: {
                x: HEAD_X + SCROLL_dX, y: HEAD_Y + SCROLL_dY,
                opacity: 0
            },
            exit_to: {
                x: HEAD_X - SCROLL_dX, y: HEAD_Y - SCROLL_dY,
                opacity: 0
            }
        }
    },
    'description': {
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



/** @type {ObjectConfig[]} */

const configObjects = [

    {   // --------------------- EARTH ---------------------
        id: "earth",
        type: "3dObject",
        position: { x: EARTH_X, y: EARTH_Y },
        transition: {
            entry_from: { x: EARTH_X, y: EARTH_Y, at: 0, duration: 0.1 },
            exit_to: null
            // exit_to: { x: EARTH_X, y: EARTH_Y - SCROLL_dY, at: 0.9, duration: 0.01 }
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
            //     type: "translation",
            //     delta_x: 150, 
            //     delta_y: 100,
            //     at: 0.05, duration: 0.05
            // },
            {
                type: "camera_look",
                look_x: 20,     
                look_y: 38,     
                look_z: 0,     
                at: 0.9,       
                duration: 0.05 
            }

        ]
    },
    {
        id: "my-annotation",
        type: "annotation",
        content: "Your annotation text here",
        position: { x: 40, y: 20 },  // Screen coordinates
        transition: {
            entry_from: {
                x: 40, y: 20,  // Starting position
                at: 0.53,  // When to start appearing
                duration: 0.01,
                opacity: 0
            },
            exit_to: {
                x: 40, y: 20,  // Exit position (typically moves up)
                at: 0.58,  // When to start disappearing
                duration: 0.01,
                opacity: 0
            }
        }
    },

    {
        id: 'return-to-story',
        type: 'button',
        content: '⌃',
        position: {
            x: 50,
            y: 5
        },
        style: {
            // fontSize: '96px',
            cursor: 'pointer',
            border: 'none',
            padding: '10px',
            className: 'scroll-button scroll-button-up'
        },
        transition: {
            entry_from: {
                at: SIM_SCENE_START_AT + TRANSITION_DURATION,
                opacity: 0,
                duration: 0.001
            },
            exit_to: {
                at: SIM_SCENE_END_AT,
                opacity: 0,
                duration: 0.001
            }
        }
    },
    {
        id: 'forward-to-story',
        type: 'button',
        content: '⌃',
        position: {
            x: 50,
            y: 90
        },
        style: {
            // fontSize: '96px',
            cursor: 'pointer',
            border: 'none',
            padding: '10px',
            className: 'scroll-button scroll-button-down'
        },
        transition: {
            entry_from: {
                at: SIM_SCENE_START_AT + TRANSITION_DURATION,
                opacity: 0,
                duration: 0.001
            },
            exit_to: {
                at: SIM_SCENE_END_AT,
                opacity: 0,
                duration: 0.001
            }
        }
    },
    {   // --------------------- SIMULATION CONTROLS ---------------------
        id: "sim-controls",
        type: "sim-controls",
        position: {
            x: HEAD_X,    // Position on right side of screen
            y: HEAD_Y + 20     // Vertically centered
        },
        transition: {
            entry_from: {
                x: HEAD_X,
                y: HEAD_Y + SCROLL_dY,
                at: SIM_SCENE_START_AT,        
                opacity: 0,
                // duration: 0.01 
            },
            exit_to: {
                x: HEAD_X,
                y: HEAD_Y - SCROLL_dY,
                at: SIM_SCENE_END_AT,
                opacity: 0,
                // duration: 0.01 
            }
        }
    },
    {   // --------------------- POTENTIAL PLOT ---------------------
        id: "sim-v-plot",
        type: "sim-v-plot",
        position: {
            x: HEAD_X,
            y: HEAD_Y + 40
        },
        transition: {
            entry_from: {
                x: HEAD_X,
                y: HEAD_Y + SCROLL_dY,
                at: SIM_SCENE_START_AT,       
                opacity: 0,
                // duration: 0.01 
            },
            exit_to: {
                x: HEAD_X,
                y: HEAD_Y - SCROLL_dY,
                at: SIM_SCENE_END_AT,       
                opacity: 0,
                // duration: 0.01 
            }
        }
    }
];

export const extraConfig = [

    {
        id: "atmosphereHotNonlinear",
        entry: { at: 0 },
        exit: { at: 0.90 }
    },
    {
        id: "shadowCylinder",
        entry: { at: 0.5 },
        exit: { at: 0.6 }
    },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/water_world_pix.jpg',
    //     entry: { at: 0.32 },
    //     exit: { at: 0.88 }
    // },
    {
        id: "simAtmosphereHotNonlinear",
        entry: { at: 0.90 },
        exit: { at: 0.96 }
    },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/earth_noClouds.0330.jpg',
    //     entry: { at: 0.0 },
    //     exit: { at: 0.3 }
    // },
    {
        id: "earthTexture",
        file: 'public/assets/textures/rodinia_unpix.png',
        entry: { at: 0.254 },
        exit: { at: 0.96 }
    },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/earth_noClouds.0330.jpg',
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
        exit: { at: 0.65 },
        maxRadius: 0.9  // Maximum size of ice patches
    },
    {
        id: "simIceGroup",
        entry: { at: SIM_SCENE_START_AT },
        exit: { at: SIM_SCENE_END_AT },
        maxRadius: 0.2  // Maximum size of ice patches
    }
];


// Debug: log the content we're working with
// console.log('Scene content:', sceneContent);

// Only add timing to numbered header and description text objects
const textConfigObjects = Object.entries(sceneContent)
    .filter(([id]) => id.startsWith('header-') || id.startsWith('description-'))
    .map(([id, content]) => {
        const sceneNum = parseInt(id.split('-')[1]);
        const type = id === 'header-0' ? 'intro-header' : 
                  id === 'description-0' ? 'intro-description' :
                  id.startsWith('header') ? 'header' : 'description';
        
        // Set position based on type
        let position;
        if (type === 'intro-header') {
            position = { x: INTRO_HEAD_X, y: INTRO_HEAD_Y };
        } else if (type === 'intro-description') {
            position = { x: INTRO_DESC_X, y: INTRO_DESC_Y };
        } else if (type === 'header') {
            position = { x: HEAD_X, y: HEAD_Y };
        } else {
            position = { x: DESC_X, y: DESC_Y };
        }

        return {
            id,
            type,
            initiallyVisible: sceneNum === 0,
            position,  // Add the position
            content: content || '',
            transition: {
                entry_from: { at: SCENE_DURATION * sceneNum },
                exit_to: { at: SCENE_DURATION * (sceneNum + 1) }
            }
        };
    });

// Combine arrays, keeping original objects unchanged
export const globalConfig = [...configObjects, ...textConfigObjects];

// Debug: log the final arrays
// console.log('Config objects:', configObjects);
// console.log('Text config objects:', textConfigObjects);
// Debug: log the final config
// console.log('Final global config:', globalConfig);



