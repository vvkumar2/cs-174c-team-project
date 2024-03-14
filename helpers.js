import { defs, tiny } from './utils/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export 
const random_island_pos = 
function random_island_pos(height) {
    // random in circle of radius 200
    while (true) {
        const x = 200 * (Math.random() - 0.5);
        const z = 200 * (Math.random() - 0.5);
        if (x * x + z * z < 200 * 200) {
            return vec3(x, height, z);
        }
    }
}