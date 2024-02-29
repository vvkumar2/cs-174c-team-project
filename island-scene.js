import { defs, tiny } from './utils/common.js';
import { Shape_From_File } from './utils/helper.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

// class Skateboard extends Shape {
//     constructor() {
//         super("position", "normal", "texture_coord");
//         // Main body of the skateboard
//         this.body = new defs.Cube();

//         // Rounded edges (using spheres)
//         this.edge1 = new defs.Subdivision_Sphere(4);
//         this.edge2 = new defs.Subdivision_Sphere(4);

//         // Wheels (using spheres)
//         this.wheel = new defs.Subdivision_Sphere(4);
//     }

//     draw(context, program_state, model_transform, material_board, material_wheels) {
//         // Adjust these values based on the size of your skateboard
//         let length = 1.25, width = 0.03, height = 0.35;

//         // Draw the main body
//         let body_transform = model_transform.times(Mat4.scale(length, width, height));
//         this.body.draw(context, program_state, body_transform, material_board);

//         // Draw the rounded edges
//         let edge_transform = model_transform.times(Mat4.translation(length, 0, 0))
//                                             .times(Mat4.scale(height, width, height));
//         this.edge1.draw(context, program_state, edge_transform, material_board);

//         edge_transform = model_transform.times(Mat4.translation(-length, 0, 0))
//                                          .times(Mat4.scale(height, width, height));
//         this.edge2.draw(context, program_state, edge_transform, material_board);

//         let wheel_radius = 0.1;
//         let wheel_thickness = 0.06;
//         let wheel_transform;

//         wheel_transform = model_transform.times(Mat4.translation(1, -0.1, 0.3))
//                                 .times(Mat4.scale(wheel_radius, wheel_radius, wheel_thickness));
//         this.wheel.draw(context, program_state, wheel_transform, material_wheels);

//         wheel_transform = model_transform.times(Mat4.translation(1, -0.1, -0.3))
//                                 .times(Mat4.scale(wheel_radius, wheel_radius, wheel_thickness));
//         this.wheel.draw(context, program_state, wheel_transform, material_wheels);

//         wheel_transform = model_transform.times(Mat4.translation(-1, -0.1, 0.3))
//                                 .times(Mat4.scale(wheel_radius, wheel_radius, wheel_thickness));
//         this.wheel.draw(context, program_state, wheel_transform, material_wheels);

//         wheel_transform = model_transform.times(Mat4.translation(-1, -0.1, -0.3))
//                                 .times(Mat4.scale(wheel_radius, wheel_radius, wheel_thickness));
//         this.wheel.draw(context, program_state, wheel_transform, material_wheels);
//     }
// }


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
            // sidewalk: new defs.Cube(),
            // dashed_line: new defs.Cube(),
            // // Obstacles
            // obstacleFence: new Shape_From_File("assets/objects/fence.obj"),
            // obstacleBench: new Shape_From_File("assets/objects/bench_high_res.obj"),
            // obstacleTrafficCone: new Shape_From_File("assets/objects/traffic_cone.obj"),
            // obstacleBarricade: new Shape_From_File("assets/objects/concrete_barrier.obj"),
            // obstacleTires: new Shape_From_File("assets/objects/tire_stack.obj"),
            // building: new defs.Cube(),
            // lampPost: new Shape_From_File("assets/objects/street_lamp.obj"),
            sun: new defs.Subdivision_Sphere(4),
        };

        // Materials
        this.materials = {
            // Existing materials
            ...this.materials,
            // Road
            island: new Material(new defs.Textured_Phong(1), {ambient: 0.8, diffusivity: 0.2, specularity: 0.3, texture: new Texture("assets/textures/grass-3.png")}),
            water: new Material(new defs.Textured_Phong(1), {ambient: 0.9, diffusivity: 0.8, specularity: 0.8, texture: new Texture("assets/textures/water-3.png")}),
            // sky: new Material(new defs.Textured_Phong(1), {ambient: 0.9, diffusivity: 0.8, specularity: 0.8, texture: new Texture("assets/textures/sky-3.png")}),
            // water: new Material(new defs.Textured_Phong(1), {ambient: 0.6, diffusivity: 0.2, texture: new Texture("assets/textures/water.jpg")}),
            // siewalk: new Material(new defs.Textured_Phong(1), {ambient: .8, texture: new Texture("assets/textures/sidewalk.jpg")}),
            // // Obstacles
            // obstacleFence: new Material(new defs.Textured_Phong(1), {ambient: .7, diffusivity: 0.2,
            //     specularity: 0.3, texture: new Texture("assets/textures/wood_bench.png")}),
            // obstacleBench: new Material(new defs.Textured_Phong(1), {ambient: .8, diffusivity: 0,
            //     specularity: 0.5, texture: new Texture("assets/textures/wood_fence.jpg")}),
            // water: new Material(new defs.Phong_Shader(),
            //     {ambient: 0.4, diffusivity: 0.6, color: hex_color("#0f5e9c")}),
            // obstacleBus: new Material(new defs.Textured_Phong(), {ambient: .7, diffusivity: 0.6}),
            // buildingOffice: new Material(new defs.Textured_Phong(1), {ambient: .8, 
            //     texture: new Texture("assets/textures/office.png")}),
            // building1: new Material(new defs.Textured_Phong(1), {ambient: .8, 
            //     texture: new Texture("assets/textures/building1.jpg")}),
            // building2: dnew Material(new defs.Textured_Phong(1), {ambient: .8, 
            //     texture: new Texture("assets/textures/building2.jpg")}),
            // building3: new Material(new defs.Textured_Phong(1), {ambient: .8, 
            //     texture: new Texture("assets/textures/building3.jpg")}),
            sun: new Material(new defs.Phong_Shader(), 
                {color: hex_color("#FDB813"), ambient: 1.0, diffusivity: 1.0, specularity: 1.0}),
            // obstacleBarricade:  new Material(new defs.Textured_Phong(1), {ambient: .8, diffusivitiy: 0.2, specularity: 0,
            //     texture: new Texture("assets/textures/concrete.png")}),
            // obstacleTires: new Material(new defs.Phong_Shader(), {color: hex_color("#12100b"), ambient: 0.5, 
            //     diffusivity: 0.9, specularity: 0}),
            // lampPost: new Material(new defs.Phong_Shader(), {color: hex_color("#889bba"), ambient: 0.8, 
            //     diffusivity: 0.6, specularity: 0.4})
        };

        // Initial camera location
        this.initial_camera_location = Mat4.look_at(
            vec3(0, 80, -120), // eye position
            vec3(0, 0, 10), // at position
            vec3(0, 0, 1) // up direction
        );

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
        this.key_triggered_button("Jump", ["s"], () => {
            null;
        });
        this.key_triggered_button("Restart", ["r"], () => {
            null;
        });
    }


    display(context, program_state) {
        // Setup program state
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // Setup lighting
        let sun_position = vec4(500, 250, 600, 0);
        program_state.lights = [new Light(sun_position, color(0.99, 0.72, 0.15, 1), 1000000)];
        
        // Sun light
        let sun_transform = Mat4.translation(500, 250, 600).times(Mat4.scale(40, 40, 40));
        this.shapes.sun.draw(context, program_state, sun_transform, this.materials.sun);


        this.t = program_state.animation_time / 1000, this.dt = program_state.animation_delta_time / 1000;

        // Draw the island and rotate it by 90 degrees
        let island_transform = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(Mat4.translation(0, 0, -1)).times(Mat4.scale(200, 200, 1));
        this.shapes.island.draw(context, program_state, island_transform, this.materials.island);
        // Draw the water
        let water_transform = Mat4.translation(0, -5, -1).times(Mat4.scale(10000, 1, 10000));
        this.shapes.water.draw(context, program_state, water_transform, this.materials.water);
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

