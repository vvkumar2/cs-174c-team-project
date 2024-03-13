import {defs, tiny} from './utils/common.js';
const {Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture} = tiny;

export class Tree extends Shape {
    constructor(trunk_material, foliage_material) {
        super("position", "normal", "texture_coord");
        
        // Define the tree trunk as a Cylinder
        this.trunk = new defs.Capped_Cylinder(10, 10);

        // Define the foliage as a combination of Squares
        this.foliage = [];
        for (let i = 0; i < 3; i++) {
            this.foliage.push(new defs.Square());
        }

        // Use the passed materials for the tree trunk and foliage
        this.trunk_material = trunk_material;
        this.foliage_material = foliage_material;
    }

    // Method to draw the tree
    draw(context, program_state, transform = Mat4.identity()) {
        // Draw the trunk
        let trunk_transform = transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(0.5, 0.5, 7));
        this.trunk.draw(context, program_state, trunk_transform, this.trunk_material);
    
        // Position and draw the foliage
        let angle_offset = 0;
        for (let i = 0; i < this.foliage.length; i++) {
            // Calculate a swaying motion for the foliage
            let sway_angle = Math.sin(program_state.animation_time / 500 + i) * 0.3; // Sway back and forth by 0.1 radians
    
            let foliage_transform = transform.times(Mat4.translation(0, 5, 0))
                                               .times(Mat4.rotation(angle_offset + sway_angle, 0, 1, 0)) // Add the sway angle to the rotation
                                               .times(Mat4.scale(2, 2, 2));
            this.foliage[i].draw(context, program_state, foliage_transform, this.foliage_material);
            angle_offset += Math.PI / 3; // 60 degrees
        }
    }
 
    // Method to draw multiple trees
    drawMultiple(context, program_state, positions) {
        for (let position of positions) {
            this.draw(context, program_state, Mat4.translation(...position));
        }
    }
}
