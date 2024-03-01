import { defs, tiny } from './utils/common.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Raindrop {
    constructor(position, sharedSphere) {
        this.position = position;
        this.velocity = vec3(0, 0, 0); // Adjust as needed
        this.acceleration = vec3(0, -9.8, 0); // Gravity
        this.sphere = sharedSphere;
    }

    update(dt) {
        this.velocity = this.velocity.plus(this.acceleration.times(dt));
        this.position = this.position.plus(this.velocity.times(dt));
    }

    draw(context, program_state, materials) {
        let model_transform = Mat4.translation(...this.position).times(Mat4.scale(.1, .15, .1)); // Small
        this.sphere.draw(context, program_state, model_transform, materials.raindrop);
    }
}


export class RainParticleSystem {
    constructor() {
        this.raindrops = [];
        this.spawnRate = 140; // Adjust based on desired intensity
    }

    spawnRaindrop(sphere) {
        try {
            this.raindrops.push(new Raindrop(vec3(Math.random() * 400 - 200, 75, Math.random() * 400 - 200), sphere));
        }
        catch (e) {
            console.log(e);
        }

    }

    update(sphere, context, program_state, dt) {
        console.log(this.raindrops.length150)
        // Spawn new raindrops based on spawn rate and dt
        for (let i = 0; i < this.spawnRate; i++) {
            this.spawnRaindrop(sphere);
        }

        // Update each raindrop
        this.raindrops.forEach(raindrop => raindrop.update(dt));

        // Remove raindrops that have fallen below a certain height
        this.raindrops = this.raindrops.filter(raindrop => raindrop.position[1] > 0);

    }

    draw(context, program_state, materials) {
        for (let raindrop of this.raindrops) {
            raindrop.draw(context, program_state, materials);
        }
    }
}
