
import { Articulated_Body_Base, Node, Arc, End_Effector } from './articulated-body.js';
import { defs, tiny } from '../utils/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Matrix, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    sphere: new defs.Subdivision_Sphere( 5 ),
    tetrahedron: new defs.Tetrahedron(),
    triangle: new defs.Triangle(),
};

export
const Articulated_Fish = 
class Articulated_Fish extends Articulated_Body_Base {
    constructor(body_material, eye_material) {
        let nodes = [];
        let arcs = [];

        const size = 3.0;
        const length = 1.0 * size;
        const height = 0.5 * size;
        const width = 0.2 * size;

        // body node
        const body_transform = Mat4.scale(length, height, width);
        const body_node = new Node("head", shapes.sphere, body_material, body_transform);
        nodes.push(body_node);
        // root->body
        const root_location = Mat4.translation(-4, 7, 0).times(Mat4.rotation(7 * Math.PI / 8, 0, 1, 0));
        const root = new Arc("root", null, body_node, root_location);
        root.set_dof(false, true, false);
        arcs.push(root);

        // fin
        const fin_size = 0.5 * size;
        const fin_sheer = Matrix.of(
            [1, -1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]);
        const fin_transform = fin_sheer.times(Mat4.scale(fin_size, fin_size, fin_size));
        const top_fin_node = new Node("top_fin", shapes.triangle, body_material, fin_transform.times(Mat4.scale(0.8,0.8,0.8)));
        nodes.push(top_fin_node);
        const top_fin_location = Mat4.translation(-fin_size/2, height*0.8, 0);
        const top_fin_arc = new Arc("top_fin", body_node, top_fin_node, top_fin_location);
        top_fin_arc.set_dof(true, false, false);
        arcs.push(top_fin_arc);

        const left_fin_node = new Node("left_fin", shapes.triangle, body_material, fin_transform);
        nodes.push(left_fin_node);
        const left_fin_location = Mat4.translation(length/5-fin_size/2, -height/3, width * 0.8).times(Mat4.rotation(-Math.PI / 2, -1, 0, 0)).times(Mat4.rotation(Math.PI/4, 1, 0, 0));
        const left_fin_arc = new Arc("left_fin", body_node, left_fin_node, left_fin_location);
        left_fin_arc.set_dof(true, false, false);
        arcs.push(left_fin_arc);

        const right_fin_node = new Node("right_fin", shapes.triangle, body_material, fin_transform);
        nodes.push(right_fin_node);
        const right_fin_location = Mat4.translation(length/5-fin_size/2, -height/3, -width * 0.8).times(Mat4.rotation(Math.PI / 2, -1, 0, 0));
        const right_fin_arc = new Arc("right_fin", body_node, right_fin_node, right_fin_location);
        right_fin_arc.set_dof(true, false, false);
        arcs.push(right_fin_arc);

        const tail_fin_transform = Mat4.scale(1,1.5,1).times(fin_transform);
        const top_tail_fin_node = new Node("top_tail_fin", shapes.triangle, body_material, tail_fin_transform);
        nodes.push(top_tail_fin_node);
        const top_tail_fin_location = Mat4.translation(-length*0.8, -fin_size/2, 0).times(Mat4.rotation(Math.PI / 2, 0, 0, 1));
        const top_tail_fin_arc = new Arc("top_tail_fin", body_node, top_tail_fin_node, top_tail_fin_location);
        top_tail_fin_arc.set_dof(true, false, false);
        arcs.push(top_tail_fin_arc);

        const bottom_tail_fin_node = new Node("bottom_tail_fin", shapes.triangle, body_material, Mat4.scale(-1,1,1).times(tail_fin_transform));
        nodes.push(bottom_tail_fin_node);
        const bottom_tail_fin_location = Mat4.translation(-length*0.8, fin_size/2, 0).times(Mat4.rotation(Math.PI / 2, 0, 0, 1));
        const bottom_tail_fin_arc = new Arc("bottom_tail_fin", body_node, bottom_tail_fin_node, bottom_tail_fin_location);
        bottom_tail_fin_arc.set_dof(true, false, false);
        arcs.push(bottom_tail_fin_arc);

        // eye
        const eye_size = 0.12 * size;
        const eye_transform = Mat4.scale(eye_size, eye_size, eye_size).times(Mat4.rotation(Math.PI / 16, 0, 1, 0)).times(Mat4.rotation(Math.PI / 2, 0, 0, 1)).times(Mat4.rotation(-Math.PI / 2, 0, 1, 0));
        const left_eye_node = new Node("left_eye", shapes.sphere, eye_material, eye_transform);
        nodes.push(left_eye_node);
        const left_eye_location = Mat4.translation(length*0.5, height*0.4, width*0.5);
        const left_eye_arc = new Arc("left_eye", body_node, left_eye_node, left_eye_location);
        left_eye_arc.set_dof(false, false, false);
        arcs.push(left_eye_arc);

        const right_eye_node = new Node("right_eye", shapes.sphere, eye_material, Mat4.scale(1,1,-1).times(eye_transform));
        nodes.push(right_eye_node);
        const right_eye_location = Mat4.translation(length*0.5, height*0.4, -width*0.5);
        const right_eye_arc = new Arc("right_eye", body_node, right_eye_node, right_eye_location);
        right_eye_arc.set_dof(false, false, false);
        arcs.push(right_eye_arc);

        


        // add the only end-effector
        const body_end_local_pos = vec4(1, 0, 0, 1);
        const end_effector = new End_Effector("nose", body_node, body_end_local_pos);
        root.end_effector = end_effector;
        
        super(root, nodes, arcs, end_effector);
        this.height = height;
        this.width = width;
        this.length = length;
        this.body_u = 0;
        this.fin_u = 0;
        this.body_wiggle_speed = 2;
        this.body_wiggle_size = 1.5;
        this.fin_wiggle_speed = 10;
        this.fin_wiggle_size = 0.4;
    }

    update(dt) {
        this.body_u = (this.body_u + this.body_wiggle_speed * dt) % (2 * Math.PI);
        this.fin_u = (this.fin_u + this.fin_wiggle_speed * dt) % (2 * Math.PI);
        const body_theta = Math.sin(this.body_u) * this.body_wiggle_size;
        const fin_theta = Math.sin(this.fin_u) * this.fin_wiggle_size;
        this.arcs[0].update_articulation([body_theta]);
        this.arcs[1].update_articulation([fin_theta]);
        this.arcs[2].update_articulation([fin_theta]);
        this.arcs[3].update_articulation([-fin_theta]);
        this.arcs[4].update_articulation([fin_theta]);
        this.arcs[5].update_articulation([fin_theta]);
    }
}
