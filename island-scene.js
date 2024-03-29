import { Articulated_Human } from './articulated-body/human.js';
import { Articulated_Snake } from './articulated-body/articulated-snake.js';
import { defs, tiny } from './utils/common.js';
import { Shape_From_File } from './utils/helper.js';
import { WeatherParticleSystem } from './weather-particle-system.js';
import { Tree } from './tree.js';
import { Fish, FishSchool } from './animals/fish.js';
import { Snake } from './animals/snake.js';
import { random_land_pos, random_pond_pos } from './helpers.js';
import { Grass } from './grass.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

class Pond {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
        this.swimmable_radius = radius;
        this.surface_level = -1;
        this.depth = 15;
        this.swim_center = vec3(center[0], (this.surface_level-this.depth)/2, center[2]);
    }
}

export class MainScene extends Scene {
    constructor() {
        super();
    
        // Shapes
        this.shapes = {
            // Existing shapes
            ...this.shapes,
            // Road and sidewalk
            island: new defs.Capped_Cylinder(1, 100),
            water: new defs.Cube(),
            raindropSphere: new defs.Subdivision_Sphere(4),
            snowflakeSphere: new defs.Subdivision_Sphere(1),
            sun: new defs.Subdivision_Sphere(4),
            pond: new defs.Regular_2D_Polygon(1, 100),
            plane: new defs.Cube(),
            cube: new defs.Cube(),
            pondWall: new defs.Cylindrical_Tube(50, 100),
        };

        this.DEBUG_MODE = false;

        this.weatherParticleSystem = new WeatherParticleSystem();
        this.isRaining = false;
        this.isSnowing = false;

        // Materials
        this.materials = {
            // Existing materials
            ...this.materials,
            
            island: new Material(new defs.Textured_Phong(1), {ambient: 0.8, diffusivity: 0.0, specularity: 0.0, texture: new Texture("assets/textures/grass-6.png")}),
            
            water: new Material(new defs.Textured_Phong(1), {ambient: 0.9, diffusivity: 0.8, specularity: 0.8, texture: new Texture("assets/textures/water-4.png")}),
            
            sun: new Material(new defs.Textured_Phong(1), {color: hex_color("#e8a425"), ambient: 1.0, diffusivity: 0.7, specularity: 1.0, texture: new Texture("assets/textures/sun.png")}),
            
            moon: new Material(new defs.Textured_Phong(1), {ambient: 1.0, diffusivity: 0.5, specularity: 1.0, texture: new Texture("assets/textures/moon.png")}),
            
            raindrop: new Material(new defs.Phong_Shader(), {color: hex_color("#9bdde8"), ambient: 0.6, diffusivity: 0.5, specularity: 1.0}),

            snowflake: new Material(new defs.Phong_Shader(), {color: hex_color("#ffffff"), ambient: 0.9, diffusivity: 0.8, specularity: 1.0}),

            grass: new Material(new defs.Phong_Shader(), {color: color(0.0, 0.2, 0.0, 1.0), ambient: 0.9, diffusivity: 0.8, specularity: 1.0, texture: new Texture("assets/textures/grass-small.png")}),
            
            snake: new Material(new defs.Fake_Bump_Map(), {ambient: 0.7, diffusivity: 1.0, specularity:1.0, texture: new Texture("assets/textures/snake.jpg")}),

            fish_grey: new Material(new defs.Fake_Bump_Map(), {ambient: 0.5, diffusivity: 1.0, specularity: 1.0, texture: new Texture("assets/textures/fish.jpg")}),

            fish_yellow: new Material(new defs.Fake_Bump_Map(), {ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),

            fish_red: new Material(new defs.Fake_Bump_Map(), {color: color(0.5, 0.0, 0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_blue: new Material(new defs.Fake_Bump_Map(), {color: color(0.0, 0.0, 0.5, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_purple: new Material(new defs.Fake_Bump_Map(), {color: color(0.5, 0.0, 0.5, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_pink: new Material(new defs.Fake_Bump_Map(), {color: color(1.0, 0.0, 0.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_white: new Material(new defs.Fake_Bump_Map(), {color: color(1.0, 1.0, 1.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_black: new Material(new defs.Fake_Bump_Map(), {color: color(0.0, 0.0, 0.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_orange: new Material(new defs.Fake_Bump_Map(), {color: color(1.0, 0.5, 0.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_brown: new Material(new defs.Fake_Bump_Map(), {color: color(0.5, 0.25, 0.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),
            fish_light_blue: new Material(new defs.Fake_Bump_Map(), {color: color(0.0, 0.5, 1.0, 1.0), ambient: 0.5, diffusivity: 0.7, specularity: 0.0, texture: new Texture("assets/textures/fish-yellow.jpg")}),

            fish_green: new Material(new defs.Fake_Bump_Map(), {ambient: 0.5, diffusivity: 1.0, specularity: 1.0, texture: new Texture("assets/textures/fish-green.jpg")}),
            // fish_eye: new Material(new defs.Phong_Shader(), {color: hex_color("#000000"), ambient: 0.9, diffusivity: 0.8, specularity: 1.0}),
            fish_eye: new Material(new defs.Textured_Phong(), {ambient: 0.9, diffusivity: 0.8, specularity: 1.0, texture: new Texture("assets/textures/fisheye.jpeg")}),
      
            trunk_material: new Material(new defs.Textured_Phong(), {color: hex_color("#A52A2A"), ambient: 0.3, diffusivity: 0.5, specularity: 1.0, texture: new Texture("assets/textures/moon.png")}),

            foliage_material: new Material(new defs.Textured_Phong(), {color: hex_color("#ADD8E6"), ambient: 0.6, diffusivity: 0.1, specularity: 1.0, texture: new Texture("assets/textures/foliage.png")}),

            pondWaterTransparent: new Material(new defs.Textured_Phong(), { color: color(0.4, 0.7, 1, 0.05), ambient: 0.2, diffusivity: 0.8, specularity: 0.9, texture: new Texture("assets/textures/water-small.png") }),

            pondWaterOpaque: new Material(new defs.Textured_Phong(), { color: color(0.4, 0.7, 1, 1), ambient: 0.2, diffusivity: 0, specularity: 0, texture: new Texture("assets/textures/water-small.png") }),

            debug: new Material(new defs.Phong_Shader(), {color: hex_color("#FF0000"), ambient: 0.5, diffusivity: 0.5, specularity: 1.0}),
        };

        // Initial camera location
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 6, -20), // eye position
            vec3(0, 0, 10), // at position
            vec3(0, 0, 1) // up direction
        );

        // distance at which entities are updated
        this.entityUpdateDistance = 100;
        this.plantUpdateDistance = 30;
        this.veryCloseDistance = 20;
        this.inViewBuffer = 0.2;
        this.weatherParticleUpdateDistance = 150;
        this.firstUpdate = true; // update everything on the first frame
        this.human = new Articulated_Human(this.materials.snowflake);
        this.ponds = [
            new Pond(vec3(56, 0, -122), 55),
            new Pond(vec3(111, 0, 22), 30),
            new Pond(vec3(-100, 0, -51), 45),
            new Pond(vec3(36, 0, -25), 35),
            new Pond(vec3(-68, 0, 110), 35),
        ];
        this.num_snakes = 40;
        this.snakes = []
        for (let i = 0; i < this.num_snakes; i++) {
            const articulated_snake = new Articulated_Snake(this.materials.snake);
            this.snakes.push(new Snake(random_land_pos(this.ponds, 0.2, 5), articulated_snake));
        }
        const fish_materials = [
            this.materials.fish_grey,
            this.materials.fish_yellow,
            this.materials.fish_green,
            this.materials.fish_red,
            this.materials.fish_blue,
            this.materials.fish_purple,
            this.materials.fish_pink,
            this.materials.fish_white,
            this.materials.fish_black,
            this.materials.fish_orange,
            this.materials.fish_brown,
            this.materials.fish_light_blue,
        ]
        let material_index = 0;
        this.fish_schools = []
        for (const pond of this.ponds) {
            const num_fish_schools = Math.floor(Math.random() * (6-4) + 4);
            for (let i = 0; i < num_fish_schools; i++) {
                const center = random_pond_pos(pond);
                const fish_count = (i == 0) ? 7 : Math.floor(Math.random() * (7-3) + 3);
                const fish_material = fish_materials[material_index % fish_materials.length];
                material_index++;
                const fish_size = 2.0 - (2.0-0.5) * fish_count / 10;
                this.fish_schools.push(new FishSchool(center, pond, fish_count, fish_size, fish_material, this.materials.fish_eye));
            }
        }

        this.grasses = [];
        this.num_grass = 3000;
        for (let i = 0; i < this.num_grass; i++) {
            this.grasses.push(new Grass(random_land_pos(this.ponds, 0, 5), this.materials.grass));
        }
        this.grasses.push(new Grass(vec3(1,0, 1), this.materials.grass));

        this.usingKeyboardControls = false;

        this.tree = new Tree(this.materials.trunk_material, this.materials.foliage_material);
        this.treePositions = [];

        // movement
        this.movingForward = false;
        this.movingBackwards = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.turningLeft = false;
        this.turningRight = false;
        this.turningUp = false;
        this.turningDown = false;
        this.rotateDir = 0;

        // Camera
        this.godMode = false;
        this.minCameraHeight = 6; // Define the minimum height of the camera above the island
        this.movementSpeed = 20; // Units per second, while pressing
        this.rotationAngleUpDown = 1.0; // Degrees (in radians) per second, while pressing
        this.rotationAngleLeftRight = 0.6;
        this.camera_position = vec3(0, 6, -20); // Initial camera position
        this.camera_orientation = Mat4.look_at(vec3(0, 6, -20), vec3(0, 0, 10), vec3(0, 1, 0));
        this.camera_yaw = 0
        this.camera_pitch = 0

        // Jumping
        this.isJumping = false;
        this.jumpInitialVelocity = 30; // Initial upward velocity
        this.gravity = 30; // Gravity, pulling the camera back down
        this.jumpVerticalOffset = 0; // Current vertical offset from the starting position
        this.jumpTime = 0; // Time since the jump started

        // FPS calc
        this.target_fps = 30;
        this.avg_dt_beta = 0.95;
        this.avg_dt = 0;
    }   

    // Controls
    make_control_panel() {
        if (!this.godMode) {
            this.key_triggered_button("Move Forward", ["w"], () => {
                this.movingForward = true;
            }, undefined, () => {
                this.movingForward = false;
            });

            this.key_triggered_button("Move Backward", ["s"], () => {
                this.movingBackwards = true;
            }, undefined, () => {
                this.movingBackwards = false;
            });

            this.key_triggered_button("Move Left", ["a"], () => {
                this.movingLeft = true;
            }, undefined, () => {
                this.movingLeft = false;
            });

            this.key_triggered_button("Move Right", ["d"], () => {
                this.movingRight = true;
            }, undefined, () => {
                this.movingRight = false;
            });

            this.key_triggered_button("Look Left", ["ArrowLeft"], () => {
                this.turningLeft = true;
            }, undefined, () => {
                this.turningLeft = false;
            });
        
            this.key_triggered_button("Look Right", ["ArrowRight"], () => {
                this.turningRight = true;
            }, undefined, () => {
                this.turningRight = false;
            });

            this.key_triggered_button("Look Up", ["ArrowUp"], () => {
                this.turningUp = true;
            }, undefined, () => {
                this.turningUp = false;
            });
        
            this.key_triggered_button("Look Down", ["ArrowDown"], () => {
                this.turningDown = true;
            }, undefined, () => {
                this.turningDown = false;
            });

            
            this.key_triggered_button("Jump", [" "], () => {
                if (!this.isJumping) { // Start the jump only if not already jumping
                    this.isJumping = true;
                    this.jumpTime = 0; // Reset the timer at the start of the jump
                }
            });
        }
    
        /*
        this.key_triggered_button("Restart", ["r"], () => {
            null;
        });
        */

        this.key_triggered_button("Rain/Snow", ["t"], () => {
            if (this.isRaining) {
                this.isRaining = false;
                this.isSnowing = true;
                this.weatherStartTime = this.t;
            } else if (this.isSnowing) {
                this.isSnowing = false;
            } else {
                this.isRaining = true;
                this.weatherStartTime = this.t;
            }

            if (this.isRaining || this.isSnowing) {
                this.context.clearColor(0.12, 0.15, 0.4, 1.0);
            } else {
                this.context.clearColor(0.46, 0.73, 0.95, 1);
            }    
        });
    }

    addRandomTreePositions(count, radius) {
        let attempts = 0;
        for (let i = 0; i < count; i++) {
            let tooClose;
            do {
                tooClose = false;
                // Generate random angle between 0 and 2π radians
                let angle = Math.random() * 2 * Math.PI;
                // Generate random distance from center, up to the radius, with a buffer to avoid edge placement
                let distance = Math.random() * (radius - 10);
                // Calculate x and z positions
                let x = Math.cos(angle) * distance;
                let z = Math.sin(angle) * distance;
                // Assume a constant y position as in your existing data
                let y = 3;
    
                // Check if the new position is too close to existing trees
                for (let pos of this.treePositions) {
                    let dx = pos[0] - x;
                    let dz = pos[2] - z;
                    let distSquared = dx * dx + dz * dz;
                    if (distSquared < 30 * 30) {
                        tooClose = true;
                        break;
                    }
                }

                for (const pond of this.ponds) {
                    const pos = pond.center;
                    let dx = pos[0] - x;
                    let dz = pos[2] - z;
                    let distSquared = dx * dx + dz * dz;
                    if (distSquared < pond.radius * pond.radius) {
                        tooClose = true;
                        break;
                    }
                }
    
                // If too close, increment attempts and possibly skip to avoid infinite loops
                if (tooClose) {
                    attempts++;
                    if (attempts > 10) {
                        console.log("Too many attempts, skipping to next tree.");
                        break;
                    }
                    continue;
                }
    
                // Add the new position if it's not too close to others
                this.treePositions.push(vec3(x, y, z));
                attempts = 0; // Reset attempts for the next tree
            } while (tooClose && attempts <= 10); // Make sure we don't get stuck in an infinite loop
        }
    }

    isClose(pos, updateDistance) {
        let delta = pos.minus(this.camera_position);
        delta[1] = 0; // flatten the y-coords
        return delta.norm() < updateDistance
    }

    isVeryClose(pos) {
        return this.isClose(pos, this.veryCloseDistance)
    }
    
    inView(pos, flatten) {
        let delta = pos.minus(this.camera_eye);
        let forward = this.camera_forward.copy();
        if (flatten) {
            delta[1] = 0; // flatten the y-coords
            forward[1] = 0; // flatten the y-coords    
        }
        // determine if the position is in view of the camera
        const cos_theta = (delta).dot(forward) / (forward.norm() * delta.norm());
        const theta = Math.acos(cos_theta);
        return theta < (1+this.inViewBuffer) * Math.max(this.fov_x, this.fov_y) / 2
    }

    shouldUpdate(pos) {
        return this.firstUpdate || (this.isClose(pos, this.entityUpdateDistance) && this.inView(pos, false))
            || this.isVeryClose(pos);
    }

    shouldUpdatePlant(pos) {
        return this.firstUpdate || (this.isClose(pos, this.plantUpdateDistance) && this.inView(pos, false));
    }
    
    shouldDraw(pos) {
        // close objects might not have their center in view
        // but should be drawn because they might still be in view
        return this.inView(pos, true) || this.isVeryClose(pos)
    }

    shouldUpdateWeatherParticle(pos) {
        const timeBuffer = 10;
        const weatherJustStarted = (this.t - this.weatherStartTime) < timeBuffer;
        return this.isClose(pos, this.weatherParticleUpdateDistance)
    }

    shouldDrawWeatherParticle(pos) {
        return this.isClose(pos, this.weatherParticleUpdateDistance) && this.inView(pos, true)
    }

    display(context, program_state) {
        // Update time
        this.t = program_state.animation_time / 1000, this.dt = program_state.animation_delta_time / 1000;
        
        // FPS calculation
        if (this.firstUpdate) {
            this.avg_dt = this.dt;
        }
        this.avg_dt = this.avg_dt_beta * this.avg_dt + (1 - this.avg_dt_beta) * this.dt;
        const fps = 1 / this.avg_dt;
        const fpsElement = document.getElementById('fps');
        fpsElement.textContent = fps.toFixed(0);

        // Store context
        if (!this.context) this.context = context.context;

        // Setup program state
        if (!context.scratchpad.controls && this.godMode) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }
        this.fov_y = Math.PI / 4;
        this.aspect = context.width / context.height;
        this.fov_x = this.fov_y * this.aspect;
        program_state.projection_transform = Mat4.perspective(
            this.fov_y, this.aspect, .1, 1000);

        // Movement
        let moveDir = 0;
        let moveSidewaysDir = 0;
        if (this.movingForward && !this.detectCollision()) {
            moveDir += 1;
        } else if (this.movingBackwards) {
            moveDir -= 1;
        }
        if (this.movingLeft) {
            moveSidewaysDir += 1;
        } else if (this.movingRight) {
            moveSidewaysDir -= 1;
        }

        let turnDir = 0;
        if (this.turningLeft) {
            turnDir += 1;
        } else if (this.turningRight) {
            turnDir -= 1;
        }
        let pitchDir = 0;
        if (this.turningUp) {
            pitchDir += 1;
        } else if (this.turningDown) {
            pitchDir -= 1;
        }

        const forwardDirection = vec3(Math.sin(this.camera_yaw), 0, Math.cos(this.camera_yaw));
        const speed = this.movementSpeed * moveDir * this.dt;
        this.camera_position = this.camera_position.plus(forwardDirection.times(speed));
        const sidewaysDirection = vec3(Math.cos(this.camera_yaw), 0, -Math.sin(this.camera_yaw));
        const sidewaysSpeed = this.movementSpeed * moveSidewaysDir * this.dt;
        this.camera_position = this.camera_position.plus(sidewaysDirection.times(sidewaysSpeed));

        this.camera_yaw += this.rotationAngleUpDown * turnDir * this.dt;
        this.camera_pitch += this.rotationAngleLeftRight * pitchDir * this.dt;
        // clamp between -pi/2+epsilon and pi/2-epsilon
        const epsilon = 0.1;
        this.camera_pitch = Math.min(Math.PI/2-epsilon, Math.max(-Math.PI/2+epsilon, this.camera_pitch));
        
        // Check for camera constraints before setting the camera position
        if (this.usingKeyboardControls) {
            let constrainedCameraPosition = this.checkCameraConstraints(program_state.camera_transform.times(vec4(0, 0, 0, 1)).to3());

            let direction = vec3(0, 0, 10); // Direction the camera is looking
            let upVector = vec3(0, 1, 0); // Up vector

            if (Math.abs(direction.normalized().dot(upVector.normalized())) > 0.999) {
                upVector = vec3(0, 0, 1);
            }

            program_state.set_camera(Mat4.look_at(
                constrainedCameraPosition, // Updated eye position
                constrainedCameraPosition.plus(direction), // Updated at position
                upVector // Updated up direction
            ));
        }

        // Update the camera position
        if (this.isJumping) {
            // Update the jump time
            this.jumpTime += this.dt;

            // Calculate the vertical position using the formula: y = v0*t - 0.5*g*t^2
            this.jumpVerticalOffset = (this.jumpInitialVelocity * this.jumpTime) - (0.5 * this.gravity * this.jumpTime * this.jumpTime);

            // If the jumpVerticalOffset is back to 0 or less, the jump is over
            if (this.jumpVerticalOffset <= 0) {
                this.isJumping = false;
                this.jumpVerticalOffset = 0;
            }
        }

        // Apply the jumpVerticalOffset to the camera position
        this.camera_eye = this.camera_position.plus(vec3(0, this.jumpVerticalOffset, 0)); // Add the jumpVerticalOffset to the Y-axis
        this.camera_forward = vec3(
            Math.sin(this.camera_yaw) * Math.cos(this.camera_pitch), // X component
            Math.sin(this.camera_pitch), // Y component, affected by pitch
            Math.cos(this.camera_yaw) * Math.cos(this.camera_pitch) // Z component
        );
        const at = this.camera_eye.plus(this.camera_forward);
        const up = vec3(0, 1, 0);

        if (!this.godMode) {
            program_state.set_camera(Mat4.look_at(this.camera_eye, at, up));
        }

        // Setup lighting
        let sun_position = vec4(500, 250, 600, 0);
        let brightness = (this.isRaining || this.isSnowing) ? 100 : 1000000;
        program_state.lights = [new Light(sun_position, color(0.99, 0.72, 0.15, 1), brightness)];
        
        // Sun light
        let sun_transform = Mat4.translation(500, 250, 600).times(Mat4.scale(40, 40, 40));
        let material = (this.isRaining || this.isSnowing) ? this.materials.moon : this.materials.sun;
        this.shapes.sun.draw(context, program_state, sun_transform, material);

        // Draw the island and rotate it by 90 degrees
        let island_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(Mat4.translation(0, 0, 10)).times(Mat4.scale(200, 200, 20));
        this.shapes.island.draw(context, program_state, island_transform, this.materials.island);

        // Draw the water
        let water_transform = Mat4.translation(0, -5, -1).times(Mat4.scale(10000, 1, 10000));
        this.shapes.water.draw(context, program_state, water_transform, this.materials.water);

        // Draw the rain
        if (this.isRaining) {
            this.weatherParticleSystem.update(this.shapes.raindropSphere, context, program_state, this.dt, -9.8, (pos) => this.shouldUpdateWeatherParticle(pos));
            this.weatherParticleSystem.draw(context, program_state, this.materials.raindrop, 0.2, (pos) => this.shouldDrawWeatherParticle(pos));
        }
        else if (this.isSnowing) {
            this.weatherParticleSystem.update(this.shapes.snowflakeSphere, context, program_state, this.dt, -5, (pos) => this.shouldUpdateWeatherParticle(pos));
            this.weatherParticleSystem.draw(context, program_state, this.materials.snowflake, 0.1, (pos) => this.shouldDrawWeatherParticle(pos));
        }

        /*this.human.draw(context, program_state);*/

        for (let i = 0; i < this.snakes.length; i++) {
            if (this.shouldUpdate(this.snakes[i].getPosition())) {
                this.snakes[i].update(this.dt, this.ponds);
            }
            if (this.shouldDraw(this.snakes[i].getPosition())) {
                this.snakes[i].draw(context, program_state);
            }
        }
        for (let i = 0; i < this.fish_schools.length; i++) {
            if (this.shouldUpdate(this.fish_schools[i].position)) {
                this.fish_schools[i].update(this.dt, vec3(-68, 10, 110), 25);
            }
            this.fish_schools[i].draw(context, program_state, (pos) => this.shouldDraw(pos));              
        }

        for (let i = 0; i < this.grasses.length; i++) {
            if (this.shouldUpdatePlant(this.grasses[i].position)) {
                this.grasses[i].update(this.dt);
            }
            if (this.shouldDraw(this.grasses[i].position)) {
                this.grasses[i].draw(context, program_state);
            }
        }

        if (this.treePositions.length === 0) {
            this.addRandomTreePositions(30, 150);
        }
        // Draw multiple trees
        for (const position of this.treePositions) {
            if (this.shouldDraw(position)) {
                this.tree.draw(context, program_state, position);
            }
        }

        for (const pond of this.ponds) {
            const pos = pond.center;
            const islandDepth = 40; // im just guessing
            if (this.DEBUG_MODE) {
                this.shapes.cube.draw(context, program_state, Mat4.translation(pos[0], pos[1], pos[2]).times(Mat4.scale(1, 1, 1)), this.materials.debug);
            }
            const pondTransform = Mat4.translation(pos[0], pos[1]-0.1, pos[2]).times(Mat4.scale(pond.radius-1,1,pond.radius-1)).times(Mat4.rotation(Math.PI / 2,1,0,0));
            const pondWallTransform = Mat4.translation(pos[0], pos[1]-islandDepth/2, pos[2]).times(Mat4.scale(pond.radius,islandDepth,pond.radius)).times(Mat4.rotation(Math.PI / 2,1,0,0));
            const pondBottomTransform = Mat4.translation(pos[0], pos[1]-islandDepth/2+1, pos[2]).times(Mat4.scale(pond.radius,1,pond.radius)).times(Mat4.rotation(Math.PI / 2,1,0,0));
            this.shapes.pondWall.draw(context, program_state, pondWallTransform, this.materials.pondWaterOpaque);
            this.shapes.pond.draw(context, program_state, pondBottomTransform, this.materials.pondWaterOpaque);
            // Don't draw the top of the pond. It covers up the fish
            // this.shapes.pond.draw(context, program_state, pondTransform, this.materials.pondWaterTransparent);
        
        }
        this.firstUpdate = false; // no longer the first frame
    }

    detectCollision() {
        // Player (camera) as an entity
        const player = { position: this.camera_position, radius: 0.5 }; 
    
        // Check collision with trees
        let isFound = false;
        for (let tree of this.treePositions) {
            const t = { position: vec3(...tree), radius: 2.5 };
            if (this.isCollision(player, t)) {
                // console.log("Collided with a tree!");
                isFound = true;
                break; // Stop checking further if collision is found
            }
        }

        // Check collision with snakes
        for (let snake of this.snakes) {
            const s = { position: snake.getPosition(), radius: 3.5 };
            if (this.isCollision(player, s)) {
                // console.log("Collided with a snake!");
                isFound = true;
                break; // Stop checking further if collision is found
            }
        }

        // Check collision with ponds
        for (let pond of this.ponds) {
            const p = { position: pond.center, radius: pond.radius * 0.7 };
            if (this.isCollision(player, p)) {
                // console.log("Collided with a pond!");
                isFound = true;
                break; // Stop checking further if collision is found
            }
        }
    
        return isFound;
    }

    isCollision(obj1, obj2) {
        const dx = obj1.position[0] - obj2.position[0];
        // const dy = obj1.position[1] - obj2.position[1];
        const dz = obj1.position[2] - obj2.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        const sum = obj1.radius + obj2.radius;

        return distance < sum;
    }
}


class Gouraud_Shader extends Shader {
    
    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          
        }`;
    }
}

