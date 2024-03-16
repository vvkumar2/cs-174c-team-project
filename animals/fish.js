import {defs, tiny} from '../utils/common.js';
import {Articulated_Fish} from '../articulated-body/articulated-fish.js';
const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;

const shapes = {
    center: new defs.Subdivision_Sphere(3),
    drift: new defs.Subdivision_Sphere(3),
}

const materials = {
    school_center: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#00FF00")
    }),
    center: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#FF0000")
    }),
    drift: new Material(new defs.Phong_Shader(), {
        ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#FFFF00")
    }),
}

export class Fish {
    constructor(position, articulated_fish, pond) {
        this.pond = pond;
        this.max_speed = 3;
        this.position = position;
        this.velocity = vec3(1, 0, 0);
        this.acceleration = vec3(0, 0, 0);
        this.articulated_fish = articulated_fish;
        this.sync_articulated_fish();

        this.drift = vec3(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5));

        this.DEBUG_MODE = false;
    }

    sync_articulated_fish() {
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
        try {
            var location_matrix = Mat4.inverse(Mat4.look_at(this.position, this.position.plus(normal_dir), binormal_dir));
            this.articulated_fish.set_location(location_matrix);
            const speed = this.velocity.norm();
            this.articulated_fish.set_animation_speed(Math.min(1, speed/this.max_speed));    
        } catch (e) {
            console.log(e);
        }
    }

    update(dt) {
        // update drift
        const drift_variation = 0.03;
        const drift_mag = 0.3;
        this.drift = this.drift.plus(vec3(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)).times(drift_variation));
        this.drift = this.drift.normalized();
        // provide random walk component based on drift
        this.acceleration = this.acceleration.plus(this.drift.times(drift_mag));

        // discourage vertical movement
        this.acceleration[1] = this.acceleration[1]*0.15;

        // discourage movement through walls of pond
        const distance_from_center = this.position.minus(this.pond.swim_center).norm();
        if (distance_from_center > this.pond.swimmable_radius || this.position[1] > this.pond.surface_level || this.position[1] < -this.pond.depth) {
            const direction = this.pond.swim_center.minus(this.position).normalized();
            this.acceleration = this.acceleration.plus(direction.times(10));
            this.drift = direction;
        }

        this.velocity = this.velocity.plus(this.acceleration.times(dt));
        // cap speed
        if (this.velocity.norm() > this.max_speed) {
            this.velocity = this.velocity.normalized().times(this.max_speed);
        }
        this.position = this.position.plus(this.velocity.times(dt));

        this.sync_articulated_fish();
        this.articulated_fish.update(dt);

        // Reset acceleration
        this.acceleration = vec3(0, 0, 0);
    }

    draw(webgl_manager, uniforms) {
        this.articulated_fish.draw(webgl_manager, uniforms);

        // if debugging, draw velocity, drift, acceleration all relative to fish
        if (this.DEBUG_MODE) {
            const drift_pos = this.position.plus(this.drift.times(1));
            const transform = Mat4.translation(drift_pos[0], drift_pos[1], drift_pos[2]).times(Mat4.scale(0.05, 0.05, 0.05));
            shapes.drift.draw(webgl_manager, uniforms, transform, materials.drift);
        }
    }
}

export class FishSchool {
    constructor(position, pond, fish_count, fish_size, body_material, eye_material) {
        this.pond = pond;
        
        const spread = 5;
        this.position = position;
        this.velocity = vec3(2, 0, 0);
        this.max_speed = 1.0;
        this.acceleration = vec3(0, 0, 0);
        this.drift = vec3(0, 0, 0);
        this.drift_variation = 0.05;
        this.drift_mag = 0.3;

        this.fish = [];
        this.fish_size = fish_size;
        this.min_size = fish_size - 0.1;
        this.max_size = fish_size + 0.1;

        this.distance_fluctuation_speed = 2 * Math.PI / 40;
        this.min_distance = fish_size;
        this.max_distance = fish_size * 10;
        this.u = 0;

        this.DEBUG_MODE = false;

        for (let i = 0; i < fish_count; i++) {
            // random offset from location
            const offset = vec3(Math.random() * spread - spread/2, Math.random() * spread - spread/2, Math.random() * spread - spread/2);
            const size = this.min_size + Math.random() * (this.max_size - this.min_size);
            const articulated_fish = new Articulated_Fish(body_material, eye_material, size);
            const fish = new Fish(this.position.plus(offset), articulated_fish, pond);
            fish.DEBUG_MODE = this.DEBUG_MODE;
            this.fish.push(fish);
        }
    }

    update(dt) {
        this.u = (this.u + this.distance_fluctuation_speed * dt) % (2 * Math.PI);

        // random walk
        this.drift = this.drift.plus(vec3(2 * (Math.random() - 0.5), 0, 2 * (Math.random() - 0.5)).times(this.drift_variation));
        this.drift = this.drift.normalized();
        // this.acceleration = this.acceleration.plus(this.drift.times(this.drift_mag));
        this.velocity = this.velocity.plus(this.drift.times(this.drift_mag));
        // cap speed
        if (this.velocity.norm() > this.max_speed) {
            this.velocity = this.velocity.normalized().times(this.max_speed);
        }

        // update the center
        this.velocity = this.velocity.plus(this.acceleration.times(dt));
        this.position = this.position.plus(this.velocity.times(dt));

        // bounce off the walls
        const distance_from_center = this.position.minus(this.pond.swim_center).norm();
        if (distance_from_center > this.pond.swimmable_radius || this.position[1] > this.pond.surface_level) {
            this.velocity = this.velocity.times(-1);
            this.drift = this.drift.times(-1);
        }
        // keep fish near the surface
        if (this.position[1] < -this.pond.depth) {
            this.velocity = this.velocity.times(-1);
            this.drift = this.drift.times(-1);
        }

        // fish are attracted to each other
        const attraction = 3;
        const repulsion = 5;
        const ideal_distance = this.min_distance + (this.max_distance - this.min_distance) * (Math.sin(this.u) + 1)/2;
        for (let i = 0; i < this.fish.length; i++) {
            for (let j = i+1; j < this.fish.length; j++) {
                const fish1 = this.fish[i];
                const fish2 = this.fish[j];
                const delta = fish2.position.minus(fish1.position);
                const distance = delta.norm();
                const direction = delta.normalized();
                const attraction_force = direction.times(attraction/Math.pow(distance+ideal_distance,2));
                const repulsion_force = direction.times(repulsion/Math.pow(distance,4));
                fish1.acceleration = fish1.acceleration.plus(attraction_force.minus(repulsion_force));
                fish2.acceleration = fish2.acceleration.minus(attraction_force.minus(repulsion_force));
            }
        }
        // all fish are attracted to the center, when they are too far away
        const center_attraction = 3;
        const target_distance = 3 * this.fish_size;
        for (let fish of this.fish) {
            const delta = this.position.minus(fish.position);
            const distance = delta.norm();
            const direction = delta.normalized();
            // penalize for being half the target distance away or more
            const attraction_force = direction.times(center_attraction * Math.max(0, Math.min(1, distance/target_distance - 0.5)));
            fish.acceleration = fish.acceleration.plus(attraction_force);
        }

        for (let fish of this.fish) {
            fish.update(dt);
        }
    }

    draw(webgl_manager, uniforms) {
        for (let fish of this.fish) {
            fish.draw(webgl_manager, uniforms);
        }

        // draw center if debugging
        if (this.DEBUG_MODE) {  
            let transform = Mat4.translation(this.position[0], this.position[1], this.position[2]).times(Mat4.scale(0.1, 0.1, 0.1));
            shapes.center.draw(webgl_manager, uniforms, transform, materials.school_center);
            const drift_pos = this.position.plus(this.drift.times(1));
            let drift_transform = Mat4.translation(drift_pos[0], drift_pos[1], drift_pos[2]).times(Mat4.scale(0.05, 0.05, 0.05));
            shapes.center.draw(webgl_manager, uniforms, drift_transform, materials.center);
        }
    }
}