import { defs, tiny } from './utils/common.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class WeatherParticle {
    constructor(position, sharedSphere, acceleration) {
        this.position = position;
        this.velocity = vec3(0, 0, 0); // Adjust as needed
        this.acceleration = vec3(0, acceleration, 0); // Gravity
        this.sphere = sharedSphere;
    }

    update(dt) {
        this.velocity = this.velocity.plus(this.acceleration.times(dt));
        this.position = this.position.plus(this.velocity.times(dt));
    }

    draw(context, program_state, material, scale) {
        let model_transform = Mat4.translation(...this.position).times(Mat4.scale(.1, scale, .1)); // Small
        this.sphere.draw(context, program_state, model_transform, material);
    }
}


export class WeatherParticleSystem {
    constructor() {
        this.particles = [];
        this.spawnRate = 140; // Adjust based on desired intensity
    }

    spawnParticle(sphere, acceleration) {
        try {
            this.particles.push(new WeatherParticle(vec3(Math.random() * 400 - 200, 75, Math.random() * 400 - 200), sphere, acceleration));
        }
        catch (e) {
            console.log(e);
        }

    }

    update(sphere, context, program_state, dt, acceleration) {
        // Spawn new raindrops based on spawn rate and dt
        for (let i = 0; i < this.spawnRate; i++) {
            this.spawnParticle(sphere, acceleration);
        }

        // Update each raindrop
        this.particles.forEach(particle => particle.update(dt));

        // Remove raindrops that have fallen below a certain height
        this.particles = this.particles.filter(particle => particle.position[1] > 0);

    }

    draw(context, program_state, material, scale) {
        for (let particle of this.particles) {
            particle.draw(context, program_state, material, scale);
        }
    }
}
