import {defs, tiny} from '../utils/common.js';
import {Articulated_Snake} from '../articulated-body/articulated-snake.js';
const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;

const shapes = {
    center: new defs.Subdivision_Sphere(3),
    drift: new defs.Subdivision_Sphere(3),
}

const materials = {
    center: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#FF0000")
    }),
    drift: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#FFFF00")
    }),
}

export class Snake {
    constructor(position, articulated_snake) {
        this.default_speed = 3;
        this.max_speed = 5;
        this.position = position;
        this.velocity = vec3(1, 0, 0);
        this.acceleration = vec3(0, 0, 0);
        this.articulated_snake = articulated_snake;
        this.sync_articulated_snake();

        this.drift = vec3(2 * (Math.random() - 0.5), 0, 2 * (Math.random() - 0.5));

        this.DEBUG_MODE = false;
    }

    getPosition() {
        return this.articulated_snake.getPosition();
    }

    sync_articulated_snake() {
        // Calculate Frenet frame
        const tangent_dir = this.velocity.normalized();
        const BINORMAL_UP = true;
        if (BINORMAL_UP) {
            var binormal_dir = vec3(0, 1, 0);
            var normal_dir = binormal_dir.cross(tangent_dir);
        } else {
            var normal_dir = this.acceleration.minus(tangent_dir.times(tangent_dir.dot(this.acceleration)));
            if (normal_dir.norm() > 1e-6) {
                normal_dir = normal_dir.normalized();
            } else {
                normal_dir = vec3(0, -1, 0);
            }
            var binormal_dir = tangent_dir.cross(normal_dir);
        }
        // Create location matrix based on Frenet frame
        const location_matrix = Mat4.inverse(Mat4.look_at(this.position, this.position.plus(normal_dir), binormal_dir));
        
        this.articulated_snake.set_location(location_matrix);
        const speed = this.velocity.norm();
        this.articulated_snake.set_animation_speed(speed/this.default_speed);
    }


    update(dt) {
        // update drift
        const drift_variation = 0.03;
        const drift_mag = 0.3;
        this.drift = this.drift.plus(vec3(2 * (Math.random() - 0.5), 0, 2 * (Math.random() - 0.5)).times(drift_variation));
        this.drift = this.drift.normalized();
        // provide random walk component based on drift
        this.acceleration = this.acceleration.plus(this.drift.times(drift_mag));

        this.velocity = this.velocity.plus(this.acceleration.times(dt));
        // cap speed
        if (this.velocity.norm() > this.max_speed) {
            this.velocity = this.velocity.normalized().times(this.max_speed);
        }
        this.position = this.position.plus(this.velocity.times(dt));

        this.sync_articulated_snake();
        this.articulated_snake.update(dt);

        // Reset acceleration
        this.acceleration = vec3(0, 0, 0);
    }

    draw(webgl_manager, uniforms) {
        this.articulated_snake.draw(webgl_manager, uniforms);

        // if debugging, draw velocity, drift, acceleration all relative to fish
        if (this.DEBUG_MODE) {
            const drift_pos = this.position.plus(this.drift.times(1));
            const transform = Mat4.translation(drift_pos[0], drift_pos[1], drift_pos[2]).times(Mat4.scale(0.05, 0.05, 0.05));
            shapes.drift.draw(webgl_manager, uniforms, transform, materials.drift);
        }
    }
}
