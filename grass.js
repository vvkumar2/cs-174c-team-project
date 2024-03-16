import {defs, tiny} from './utils/common.js';
const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;

const shapes = {
    grass: new defs.Triangle(),
}

export class Grass {
    constructor(position, grass_material) {
        this.position = position;

        this.grass_material = grass_material;
        this.num_tuffs = Math.floor(2 + Math.random() * 2); // Number of tuffs of grass
        const size = 1.0 + Math.random() * 2.0;
        this.sizes = [];
        for (let i = 0; i < this.num_tuffs; i++) {
            this.sizes.push(size + (2*Math.random() - 1) * 0.5);
        }
        this.tilts = [];
        for (let i = 0; i < this.num_tuffs; i++) {
            this.tilts.push(Math.PI/6 + (2*Math.random() - 1) * Math.PI/12);
        }
        this.tilt_variation = Math.PI/6;
        this.animation_speed = 0.1 + Math.random() * 0.2;
        this.thetas = [];
        for (let i = 0; i < this.num_tuffs; i++) {
            this.thetas.push(2 * Math.PI * Math.random());
        }
        this.speeds = [];
        for (let i = 0; i < this.num_tuffs; i++) {
            this.speeds.push(0.2 + Math.random() * 0.3);
        }
        this.width = 0.1 + Math.random() * 0.3;
    }

    update(dt) {
        this.thetas = this.thetas.map((theta, i) => {
            return theta + this.speeds[i] * dt;
        });
    }

    // Method to draw the tree
    draw(context, program_state) {
        for (let i = 0; i < this.num_tuffs; i++) {
            const tilt = this.tilts[i] + Math.sin(this.thetas[i]) * this.tilt_variation;
            let transform = Mat4.translation(this.position[0], 0, this.position[2])
                .times(Mat4.rotation(i * 2 * Math.PI / this.num_tuffs, 0, 1, 0))
                .times(Mat4.rotation(tilt, 1, 0, 0))
                .times(Mat4.scale(this.width, this.sizes[i], this.width));
            shapes.grass.draw(context, program_state, transform, this.grass_material);
        }
    }
}
