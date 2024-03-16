
import { Articulated_Body_Base, Node, Arc, End_Effector } from './articulated-body.js';
import { defs, tiny } from '../utils/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    sphere: new defs.Subdivision_Sphere( 5 ),
};

export
const Articulated_Snake = 
class Articulated_Snake extends Articulated_Body_Base {
    constructor(material) {
        let sphere_shape = shapes['sphere'];
        let nodes = [];
        let arcs = [];

        const tail_width = 0.03 + 0.03 * Math.random();
        const bulge_width = 0.2 + 0.4 * Math.random();
        const head_width = 0.10 + 0.1 * Math.random();
        const width_bulge_location = 0.75;
        const node_length = 0.3 + 0.2 * Math.random();
        const num_nodes = 30 + Math.floor(50 * Math.random());
        const width_bulge_index = Math.floor(num_nodes * width_bulge_location);

        const body_location = Mat4.translation(node_length, 0, 0);
        // head node
        const head_node = new Node("head", sphere_shape, material, Mat4.scale(node_length, tail_width, tail_width));
        // root->head
        const root_location = Mat4.translation(0, 1, 0);
        const root = new Arc("root", null, head_node, root_location);
        root.set_dof(false, true, false);

        nodes.push(head_node);
        arcs.push(root);

        // body nodes
        let prev_node = head_node;
        let prev_arc = root;
        for (let i = 0; i < num_nodes - 1; i++) {
            const name = "body" + i;
            const width = (i <= width_bulge_index) ? (
                 tail_width + (bulge_width - tail_width) * i / width_bulge_index
            ) : (
                bulge_width + (head_width - bulge_width) * (i - width_bulge_index) / (num_nodes - width_bulge_index)
            );
            const body_node = new Node(name, sphere_shape, material, Mat4.scale(node_length, width, width));
            const body = new Arc(name, prev_node, body_node, body_location.copy());
            body.set_dof(false, true, false);
            prev_node = body_node;
            prev_arc = body;
            nodes.push(body_node);
            arcs.push(body);
        }

        // add the only end-effector
        const body_end_local_pos = vec4(1, 0, 0, 1);
        const end_effector_body = new End_Effector("body" + 5, prev_node, body_end_local_pos);
        prev_arc.end_effector = end_effector_body;
        
        super(root, nodes, arcs, end_effector_body);
        this.min_width = tail_width;
        this.max_width = bulge_width;
        this.node_length = node_length;
        this.num_nodes  = num_nodes;
        this.fixed_arc = this.arcs[Math.floor(this.num_nodes * 0.5)];
        this.u = 0; 
        this.curve_speed = 1.0  + 1.0 * (Math.random());
        this.animation_speed = 1;
        this.curviness_factor = 0.5 + 1.0 * (Math.random());
        this.start_curviness = 0.6;
        this.end_curviness = 1.8;

        this.update_matrices();
        this.position_offset = (this.getPosition().minus(this.root.global_matrix.times(vec4(0, 0, 0, 1)).to3())).norm();
    }

    getPosition() {
        // get position of center node
        const center_node = this.arcs[Math.floor(this.num_nodes * 0.5)];
        return center_node.global_matrix.times(vec4(0, 0, 0, 1)).to3();
    }

    set_animation_speed(speed) {
        this.animation_speed = speed;
    }

    update(dt) {
        // only one underlying parameter
        this.u += this.curve_speed * this.animation_speed * dt;
        if (this.u > 2 * Math.PI) {
            this.u -= 2 * Math.PI;
        }
        for (let i = 1; i < this.arcs.length; i++) { 
            const curviness = this.curviness_factor * this.start_curviness + (this.end_curviness - this.start_curviness) * i / this.num_nodes;
            const theta = curviness * Math.sin(i * this.node_length + this.u) * this.node_length;
            const arc = this.arcs[i]; 
            arc.update_articulation([theta]); 
        }
        // correct rotations with the root's dof
        this.update_matrices();
        const m = Mat4.inverse(this.root.global_matrix).times(this.fixed_arc.global_matrix);
        const delta = m.times(vec4(0,0,0,1)).to3();
        const angle = Math.atan2(delta[2], delta[0]);
        this.root.articulation_matrix = Mat4.rotation(angle, 0, 1, 0);
    }
}