import { defs, tiny } from './utils/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export 
const random_pond_pos = 
function random_pond_pos(pond) {
    // random in circle of radius 200
    while (true) {
        const x = pond.swimmable_radius * (Math.random() - 0.5) + pond.center[0];
        // between -pond.depth and pond.surface_level
        const y = -pond.depth + (pond.surface_level + pond.depth) * Math.random() + pond.center[1];
        const z = pond.swimmable_radius * (Math.random() - 0.5) + pond.center[2];
        if (x * x + z * z < 200 * 200) {
            return vec3(x, y, z);
        }
    }
}

export
const random_land_pos =
function random_land_pos(ponds, height, buffer) {
    // random in circle of radius 200
    const radius = 200 - buffer;
    while (true) {
        const z = (2*Math.random() - 1) * radius;
        const x = (2*Math.random() - 1) * radius;
        let inPond = false;
        for (const pond of ponds) {
            const dx = pond.center[0] - x;
            const dz = pond.center[2] - z;
            if (dx * dx + dz * dz < pond.radius * pond.radius) {
                inPond = true;
                break;
            }
        }
        if (inPond) {
            continue;
        }
        if (x * x + z * z < radius * radius) {
            return vec3(x, height, z);
        }
    }
}