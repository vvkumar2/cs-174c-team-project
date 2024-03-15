import { Articulated_Human } from './articulated-body/human.js';
import { Articulated_Snake } from './articulated-body/snake.js';
import { defs, tiny } from './utils/common.js';
import { Shape_From_File } from './utils/helper.js';
import { WeatherParticleSystem } from './weather-particle-system.js';
import { Tree } from './tree.js';
import { Fish, FishSchool } from './animals/fish.js';
import { random_island_pos } from './helpers.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;


export class MainScene extends Scene {
    constructor() {
        super();
    
        // Shapes
        this.shapes = {
            // Existing shapes
            ...this.shapes,
            // Road and sidewalk
            island: new defs.Capped_Cylinder(50, 100),
            water: new defs.Cube(),
            raindropSphere: new defs.Subdivision_Sphere(4),
            snowflakeSphere: new defs.Subdivision_Sphere(1),
            sun: new defs.Subdivision_Sphere(4),
        };

        this.weatherParticleSystem = new WeatherParticleSystem();
        this.isRaining = false;
        this.isSnowing = false;

        // Materials
        this.materials = {
            // Existing materials
            ...this.materials,
            
            island: new Material(new defs.Textured_Phong(1), {ambient: 0.8, diffusivity: 0.2, specularity: 0.3, texture: new Texture("assets/textures/grass-3.png")}),
            
            water: new Material(new defs.Textured_Phong(1), {ambient: 0.9, diffusivity: 0.8, specularity: 0.8, texture: new Texture("assets/textures/water-3.png")}),
            
            sun: new Material(new defs.Textured_Phong(1), {color: hex_color("#e8a425"), ambient: 1.0, diffusivity: 0.7, specularity: 1.0, texture: new Texture("assets/textures/sun.png")}),
            
            moon: new Material(new defs.Textured_Phong(1), {ambient: 1.0, diffusivity: 0.5, specularity: 1.0, texture: new Texture("assets/textures/moon.png")}),
            
            raindrop: new Material(new defs.Phong_Shader(), {color: hex_color("#9bdde8"), ambient: 0.6, diffusivity: 0.5, specularity: 1.0}),

            snowflake: new Material(new defs.Phong_Shader(), {color: hex_color("#ffffff"), ambient: 0.9, diffusivity: 0.8, specularity: 1.0}),

            snake: new Material(new defs.Fake_Bump_Map(), {ambient: 0.5, diffusivity: 1.0, specularity:1.0, texture: new Texture("assets/textures/snake.jpg")}),

            fish: new Material(new defs.Fake_Bump_Map(), {ambient: 0.5, diffusivity: 1.0, specularity: 1.0, texture: new Texture("assets/textures/fish.jpg")}),
            // fish_eye: new Material(new defs.Phong_Shader(), {color: hex_color("#000000"), ambient: 0.9, diffusivity: 0.8, specularity: 1.0}),
            fish_eye: new Material(new defs.Textured_Phong(), {ambient: 0.9, diffusivity: 0.8, specularity: 1.0, texture: new Texture("assets/textures/fisheye.jpeg")}),
      
            trunk_material: new Material(new defs.Textured_Phong(), {color: hex_color("#A52A2A"), ambient: 0.3, diffusivity: 0.5, specularity: 1.0, texture: new Texture("assets/textures/moon.png")}),

            foliage_material: new Material(new defs.Textured_Phong(), {color: hex_color("#90EE90"), ambient: 0.4, diffusivity: 0.1, specularity: 1.0, texture: new Texture("assets/textures/foliage.png")}),
      
        };

        // Initial camera location
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 6, -20), // eye position
            vec3(0, 0, 10), // at position
            vec3(0, 0, 1) // up direction
        );

        this.human = new Articulated_Human(this.materials.snowflake);
        this.snake = new Articulated_Snake(this.materials.snake);
        const num_fish_schools = 4;
        this.fish_schools = []
        for (let i = 0; i < num_fish_schools; i++) {
            this.fish_schools.push(new FishSchool(random_island_pos(5), this.materials.fish, this.materials.fish_eye));
        }

        this.tree = new Tree(this.materials.trunk_material, this.materials.foliage_material);
        this.treePositions = [];

        this.minCameraHeight = 6; // Define the minimum height of the camera above the island

    }   

    // Controls
    make_control_panel() {
        this.key_triggered_button("Forward", ["w"], () => {
            null;
        });
        this.key_triggered_button("Left", ["a"], () => {
            null;
        });
        this.key_triggered_button("Right", ["d"], () => {
            null;
        });
        this.key_triggered_button("Backward", ["s"], () => {
            null;
        });
        /*
        this.key_triggered_button("Restart", ["r"], () => {
            null;
        });
        */
        this.key_triggered_button("Rain/Snow", ["t"], () => {
            if (this.isRaining) {
                this.isRaining = false;
                this.isSnowing = true;
            } else if (this.isSnowing) {
                this.isSnowing = false;
            } else {
                this.isRaining = true;
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
                    if (distSquared < 30 * 30) { // Square of the minimum distance for efficiency
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
                this.treePositions.push([x, y, z]);
                attempts = 0; // Reset attempts for the next tree
            } while (tooClose && attempts <= 10); // Make sure we don't get stuck in an infinite loop
        }
    }

    checkCameraConstraints(cameraPosition) {
        // Constrain the camera's height
        cameraPosition[1] = Math.max(cameraPosition[1], this.minCameraHeight);
        return cameraPosition; // Return the constrained camera position
    }

    display(context, program_state) {
        // Store context
        if (!this.context) this.context = context.context;

        // Setup program state
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // Setup lighting
        let sun_position = vec4(500, 250, 600, 0);
        let brightness = (this.isRaining || this.isSnowing) ? 100 : 1000000;
        program_state.lights = [new Light(sun_position, color(0.99, 0.72, 0.15, 1), brightness)];
        
        // Sun light
        let sun_transform = Mat4.translation(500, 250, 600).times(Mat4.scale(40, 40, 40));
        let material = (this.isRaining || this.isSnowing) ? this.materials.moon : this.materials.sun;
        this.shapes.sun.draw(context, program_state, sun_transform, material);

        // Update time
        this.t = program_state.animation_time / 1000, this.dt = program_state.animation_delta_time / 1000;

        // Draw the island and rotate it by 90 degrees
        let island_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(Mat4.scale(200, 200, 1));
        this.shapes.island.draw(context, program_state, island_transform, this.materials.island);

        // Draw the water
        let water_transform = Mat4.translation(0, -5, -1).times(Mat4.scale(10000, 1, 10000));
        this.shapes.water.draw(context, program_state, water_transform, this.materials.water);

        console.log(this.isSnowing, this.isRaining)
        // Draw the rain
        if (this.isRaining) {
            this.weatherParticleSystem.update(this.shapes.raindropSphere, context, program_state, this.dt, -9.8);
            this.weatherParticleSystem.draw(context, program_state, this.materials.raindrop, 0.2);
        }
        else if (this.isSnowing) {
            this.weatherParticleSystem.update(this.shapes.snowflakeSphere, context, program_state, this.dt, -5);
            this.weatherParticleSystem.draw(context, program_state, this.materials.snowflake, 0.1);
        }

        this.human.draw(context, program_state);
        this.snake.update(this.dt);
        this.snake.draw(context, program_state);
        for (let i = 0; i < this.fish_schools.length; i++) {
            this.fish_schools[i].update(this.dt);
            this.fish_schools[i].draw(context, program_state);
        }

        // Draw the tree
        this.tree.draw(context, program_state, Mat4.translation(-10, 3, 2));

        // Example positions for the trees
        
        if (this.treePositions.length === 0) {
            this.addRandomTreePositions(50, 150);
        }
        // Draw multiple trees
        this.tree.drawMultiple(context, program_state, this.treePositions);

        // Check for camera constraints before setting the camera position
        let constrainedCameraPosition = this.checkCameraConstraints(program_state.camera_transform.times(vec4(0, 0, 0, 1)).to3());

        // Calculate the direction vector
        let direction = vec3(0, 0, 10); // Direction the camera is looking
        let upVector = vec3(0, 1, 0); // Up vector

        // Check if the direction vector is parallel to the up vector
        if (Math.abs(direction.normalized().dot(upVector.normalized())) > 0.999) {
            // Adjust the up vector to avoid parallelism
            upVector = vec3(0, 0, 1);
        }

        program_state.set_camera(Mat4.look_at(
            constrainedCameraPosition, // Updated eye position
            constrainedCameraPosition.plus(direction), // Updated at position
            upVector // Updated up direction
        ));
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

