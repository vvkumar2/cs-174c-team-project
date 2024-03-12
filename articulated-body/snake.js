
import { Articulated_Body_Base, Node, Arc, End_Effector } from './articulated-body.js';
import { defs, tiny } from '../utils/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'sphere': new defs.Subdivision_Sphere( 5 ),
};

export
const Articulated_Snake = 
class Articulated_Snake extends Articulated_Body_Base {
    constructor() {
        let sphere_shape = shapes['sphere'];
        let nodes = [];
        let arcs = [];

        // head node
        const head_transform = Mat4.scale(1, 1, 1);
        const head_node = new Node("head", sphere_shape, head_transform);
        // root->head
        const root_location = Mat4.translation(0, 0, 0);
        const root = new Arc("root", null, head_node, root_location);

        nodes.push(head_node);
        arcs.push(root);

        // add the only end-effector
        const head_end_local_pos = vec4(1, 0, 0, 1);
        const end_effector = new End_Effector("head", head_node, head_end_local_pos);
        head_node.end_effector = end_effector;

        // body nodes
        let prev_node = head_node;
        for (let i = 0; i < 5; i++) {
            let body_transform = Mat4.scale(1, 1, 1);
            body_transform.pre_multiply(Mat4.translation(1, 0, 0));
            const body_node = new Node("body" + i, sphere_shape, body_transform);
            // head->body
            const body_location = Mat4.translation(1, 0, 0);
            const body = new Arc("body" + i, prev_node, body_node, body_location);
            prev_node.children_arcs.push(body);
            prev_node = body_node;
            nodes.push(prev_node);
            arcs.push(body);
        }
        
        super(root, nodes, arcs, end_effector);
    }
}