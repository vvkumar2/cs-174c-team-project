
import { Articulated_Body_Base, Node, Arc, End_Effector } from './articulated-body.js';
import { defs, tiny } from '../utils/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'sphere': new defs.Subdivision_Sphere( 5 ),
};

export
const Articulated_Human = 
class Articulated_Human extends Articulated_Body_Base {
    constructor(material) {
        let sphere_shape = shapes['sphere'];
        let nodes = [];
        let arcs = [];

        // torso node
        const torso_transform = Mat4.scale(1, 2.5, 0.5);
        const torso_node = new Node("torso", sphere_shape, material, torso_transform);
        // root->torso
        const root_location = Mat4.translation(0, 5, 5);
        const root = new Arc("root", null, torso_node, root_location);

        // head node
        let head_transform = Mat4.scale(.6, .6, .6);
        head_transform.pre_multiply(Mat4.translation(0, .6, 0));
        const head_node = new Node("head", sphere_shape, material, head_transform);
        // torso->neck->head
        const neck_location = Mat4.translation(0, 2.5, 0);
        const neck = new Arc("neck", torso_node, head_node, neck_location);

        // right upper arm node
        let ru_arm_transform = Mat4.scale(1.2, .2, .2);
        ru_arm_transform.pre_multiply(Mat4.translation(1.2, 0, 0));
        const ru_arm_node = new Node("ru_arm", sphere_shape, material, ru_arm_transform);
        // torso->r_shoulder->ru_arm
        const r_shoulder_location = Mat4.translation(0.6, 2, 0);
        const r_shoulder = new Arc("r_shoulder", torso_node, ru_arm_node, r_shoulder_location);
        r_shoulder.set_dof(true, true, true);

        // right lower arm node
        let rl_arm_transform = Mat4.scale(1, .2, .2);
        rl_arm_transform.pre_multiply(Mat4.translation(1, 0, 0));
        const rl_arm_node = new Node("rl_arm", sphere_shape, material, rl_arm_transform);
        // ru_arm->r_elbow->rl_arm
        const r_elbow_location = Mat4.translation(2.4, 0, 0);
        const r_elbow = new Arc("r_elbow", ru_arm_node, rl_arm_node, r_elbow_location);
        r_elbow.set_dof(true, true, false);

        // right hand node
        let r_hand_transform = Mat4.scale(.4, .3, .2);
        r_hand_transform.pre_multiply(Mat4.translation(0.4, 0, 0));
        const r_hand_node = new Node("r_hand", sphere_shape, material, r_hand_transform);
        // rl_arm->r_wrist->r_hand
        const r_wrist_location = Mat4.translation(2, 0, 0);
        const r_wrist = new Arc("r_wrist", rl_arm_node, r_hand_node, r_wrist_location);
        r_wrist.set_dof(true, false, true);

        // add the only end-effector
        const r_hand_end_local_pos = vec4(0.8, 0, 0, 1);
        const end_effector = new End_Effector("right_hand", r_wrist, r_hand_end_local_pos);
        r_wrist.end_effector = end_effector;

        // left upper arm node
        let lu_arm_transform = Mat4.scale(1.2, .2, .2);
        lu_arm_transform.pre_multiply(Mat4.translation(-1.2, 0, 0));
        const lu_arm_node = new Node("lu_arm", sphere_shape, material, lu_arm_transform);
        // torso->l_shoulder->lu_arm
        const l_shoulder_location = Mat4.translation(-0.6, 2, 0);
        const l_shoulder = new Arc("l_shoulder", torso_node, lu_arm_node, l_shoulder_location);

        // left lower arm node
        let ll_arm_transform = Mat4.scale(1, .2, .2);
        ll_arm_transform.pre_multiply(Mat4.translation(-1, 0, 0));
        const ll_arm_node = new Node("ll_arm", sphere_shape, material, ll_arm_transform);
        // lu_arm->l_elbow->ll_arm
        const l_elbow_location = Mat4.translation(-2.4, 0, 0);
        const l_elbow = new Arc("l_elbow", lu_arm_node, ll_arm_node, l_elbow_location);

        // left hand node
        let l_hand_transform = Mat4.scale(.4, .3, .2);
        l_hand_transform.pre_multiply(Mat4.translation(-0.4, 0, 0));
        const l_hand_node = new Node("l_hand", sphere_shape, material, l_hand_transform);
        // ll_arm->l_wrist->l_hand
        const l_wrist_location = Mat4.translation(-2, 0, 0);
        const l_wrist = new Arc("l_wrist", ll_arm_node, l_hand_node, l_wrist_location);

        // right upper leg node
        let ru_leg_transform = Mat4.scale(.3, 0.7, .3);
        ru_leg_transform.pre_multiply(Mat4.translation(0.3, -0.5, 0));
        const ru_leg_node = new Node("ru_leg", sphere_shape, material, ru_leg_transform);
        // torso->r_hip->ru_leg
        const r_hip_location = Mat4.translation(0.3, -2, 0);
        const r_hip = new Arc("r_hip", torso_node, ru_leg_node, r_hip_location);

        // right lower leg node
        let rl_leg_transform = Mat4.scale(.3, 0.7, .3);
        rl_leg_transform.pre_multiply(Mat4.translation(0.3, 0.2, 0));
        const rl_leg_node = new Node("rl_leg", sphere_shape, material, rl_leg_transform);
        // ru_leg->r_knee->rl_leg
        const r_knee_location = Mat4.translation(0, -2, 0);
        const r_knee = new Arc("r_knee", ru_leg_node, rl_leg_node, r_knee_location);

        // right foot node
        let r_foot_transform = Mat4.scale(.6, .3, .3);
        r_foot_transform.pre_multiply(Mat4.translation(0.3, 0.0, 0.0));
        const r_foot_node = new Node("r_foot", sphere_shape, material, r_foot_transform);
        // rl_leg->r_ankle->r_foot
        const r_ankle_location = Mat4.translation(0, -0.7, 0);
        const r_ankle = new Arc("r_ankle", rl_leg_node, r_foot_node, r_ankle_location);

        // left upper leg node  
        let lu_leg_transform = Mat4.scale(.3, 0.7, .3);
        lu_leg_transform.pre_multiply(Mat4.translation(-0.3, -0.5, 0));
        const lu_leg_node = new Node("lu_leg", sphere_shape, material, lu_leg_transform);
        // torso->l_hip->lu_leg
        const l_hip_location = Mat4.translation(-0.3, -2, 0);
        const l_hip = new Arc("l_hip", torso_node, lu_leg_node, l_hip_location);
        
        // left lower leg node
        let ll_leg_transform = Mat4.scale(.3, 0.7, .3);
        ll_leg_transform.pre_multiply(Mat4.translation(-0.3, 0.2, 0));
        const ll_leg_node = new Node("ll_leg", sphere_shape, material, ll_leg_transform);
        // lu_leg->l_knee->ll_leg
        const l_knee_location = Mat4.translation(0, -2, 0);
        const l_knee = new Arc("l_knee", lu_leg_node, ll_leg_node, l_knee_location);

        // left foot node
        let l_foot_transform = Mat4.scale(.6, .3, .3);
        l_foot_transform.pre_multiply(Mat4.translation(-0.3, 0.0, 0.0));
        const l_foot_node = new Node("l_foot", sphere_shape, material, l_foot_transform);
        // ll_leg->l_ankle->l_foot
        const l_ankle_location = Mat4.translation(0, -0.7, 0);
        const l_ankle = new Arc("l_ankle", ll_leg_node, l_foot_node, l_ankle_location);

        // Add all nodes, arcs, and end-effectors to the arrays
        nodes.push(torso_node, head_node, ru_arm_node, rl_arm_node, r_hand_node, lu_arm_node, ll_arm_node, l_hand_node, ru_leg_node, rl_leg_node, r_foot_node, lu_leg_node, ll_leg_node, l_foot_node);
        arcs.push(root, neck, r_shoulder, r_elbow, r_wrist, l_shoulder, l_elbow, l_wrist, r_hip, r_knee, r_ankle, l_hip, l_knee, l_ankle);

        super(root, nodes, arcs, end_effector);
    }
}