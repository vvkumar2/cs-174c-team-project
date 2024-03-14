import { defs, tiny } from '../utils/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    end_effector: new defs.Subdivision_Sphere( 5 ),
};

const materials = {
    end_effector: new Material(new defs.Phong_Shader(), {
        ambient: .2, diffusivity: 1, specularity:  1, color: color( 1,0,0,1 )
    }),
};

const DEBUG_MODE = false;

export
const Articulated_Body_Base = 
class Articulated_Body_Base {
    constructor(root, nodes, arcs, end_effector) {
        this.root = root;
        this.nodes = nodes;
        this.arcs = arcs;
        this.end_effector = end_effector;

        // count dofs
        this.dof = 0;
        for (const arc of this.arcs) {
            this.dof += arc.num_dof();
        }
        this.Jacobian = null;
        this.theta = new Array(this.dof).fill(0);
        this.apply_theta();

        this.inverse_kinematics_tolerance = 1e-3;
        this.inverse_kinematics_speed = 1;
    }

    set_location(location_matrix) {
        this.root.location_matrix = location_matrix;
    }

    // mapping from global theta to each joint theta
    apply_theta() {
        // for each node, feed exactly the right amount of theta
        let index = 0;
        for (const arc of this.arcs) {
            const dof = arc.num_dof();
            arc.update_articulation(this.theta.slice(index, index + dof));
            index += dof;
        }
    }

    calculate_Jacobian() {
        let J = new Array(3);
        for (let i = 0; i < 3; i++) {
            J[i] = new Array(this.dof);
        }

        const current_theta = this.theta.slice();
        const current_x = this.get_end_effector_position();
        const delta_theta_i = 0.01;
        // console.log("start", current_theta, current_x);
        for (let i = 0; i < this.dof; i++) {
            this.theta = current_theta.slice();
            this.theta[i] += delta_theta_i;
            this.apply_theta();
            const x = this.get_end_effector_position();
            const dx = x.minus(current_x);
            // console.log(i, this.theta, dx.times(1 / delta_theta_i));
            J[0][i] = dx[0] / delta_theta_i;
            J[1][i] = dx[1] / delta_theta_i;
            J[2][i] = dx[2] / delta_theta_i;
        }
        this.theta = current_theta.slice();
        this.apply_theta();

        // let J_string = "";
        // for (let i = 0; i < 3; i++) {
        //     let J_row = "";
        //     for (let j = 0; j < this.dof; j++) {
        //         J_row += J[i][j].toExponential(2) + " ";
        //     }
        //     J_string += J_row + "\n";
        // }
        // console.log(J_string);

        return J; // 3x7 in my case.
    }

    calculate_delta_theta(J, dx) {
        const A = math.multiply(math.transpose(J), J);
        // Add ones to A's diagonal
        for (let i = 0; i < this.dof; i++) {
            A[i][i] += 1;
        }
        console.log(A);
        const b = math.multiply(math.transpose(J), dx);
        // console.log(b);
        const x = math.lusolve(A, b)
        // console.log(x);

        return x;
    }

    update_matrices() {
        this.matrix_stack = [];
        this._rec_update(this.root, Mat4.identity());
    }

    get_end_effector_position() {
        // in this example, we only have one end effector.
        this.update_matrices();
        const v = this.end_effector.global_position; // vec4
        return vec3(v[0], v[1], v[2]);
    }

    _rec_update(arc, matrix) {
        if (arc !== null) {
            const L = arc.location_matrix;
            const A = arc.articulation_matrix;
            matrix.post_multiply(L.times(A));
            arc.global_matrix = matrix.copy();
            this.matrix_stack.push(matrix.copy());

            if (arc.end_effector !== null) {
                arc.end_effector.global_position = matrix.times(arc.end_effector.local_position);
            }

            const node = arc.child_node;
            const T = node.transform_matrix;
            matrix.post_multiply(T);

            matrix = this.matrix_stack.pop();
            for (const next_arc of node.children_arcs) {
                this.matrix_stack.push(matrix.copy());
                this._rec_update(next_arc, matrix);
                matrix = this.matrix_stack.pop();
            }
        }
    }

    draw(webgl_manager, uniforms) {
        this.matrix_stack = [];
        this._rec_draw(this.root, Mat4.identity(), webgl_manager, uniforms);
    }

    _rec_draw(arc, matrix, webgl_manager, uniforms) {
        if (arc !== null) {
            const L = arc.location_matrix;
            const A = arc.articulation_matrix;
            matrix.post_multiply(L.times(A));
            this.matrix_stack.push(matrix.copy());

            const node = arc.child_node;
            const T = node.transform_matrix;
            matrix.post_multiply(T);
            node.shape.draw(webgl_manager, uniforms, matrix, node.material);

            if (arc.end_effector !== null && DEBUG_MODE) {
                // Draw the end effector as a dot
                let v = matrix.times(arc.end_effector.local_position);
                let transform = Mat4.translation(v[0], v[1], v[2]).times(Mat4.scale(0.1, 0.1, 0.1));
                shapes.end_effector.draw(webgl_manager, uniforms, transform, materials.end_effector);
            }

            matrix = this.matrix_stack.pop();
            for (const next_arc of node.children_arcs) {
                this.matrix_stack.push(matrix.copy());
                this._rec_draw(next_arc, matrix, webgl_manager, uniforms);
                matrix = this.matrix_stack.pop();
            }
        }
    }

    inverse_kinematics(target_x) {
        console.log("starting inverse kinematics")
        console.log("target_x", target_x);
        let x = this.get_end_effector_position();
        let E_x = target_x.minus(x);
        console.log("x", x);
        let count = 0;
        let last_Ex = E_x.norm();
        while (E_x.norm() > this.inverse_kinematics_tolerance) {
            let dx = E_x.times(this.inverse_kinematics_speed);
            // convert to math.js format
            console.log(count);
            // console.log("E_x", E_x.norm());
            let delta_E_x = (E_x.norm() - last_Ex) / last_Ex;
            if (E_x.norm() - last_Ex > 0) {
                // error
                // throw new Error("increasing delta E_x norm.");
            }
            console.log("E_x", E_x.norm().toExponential(2), "diff E_x", delta_E_x.toExponential(2));
            last_Ex = E_x.norm();
            dx = [[dx[0]], [dx[1]], [dx[2]]]; 
            console.log(dx);
            const J = this.calculate_Jacobian();
            // console.log(dx);
            const dtheta = this.calculate_delta_theta(J, dx);
            // norm of dtheta
            // console.log(dtheta);
            const direction = new Array(this.dof);
            let norm = 0;
            for (let i = 0; i < direction.length; i++) {
                direction[i] = dtheta[i][0];
                norm += direction[i] ** 2.0;
            }
            norm = norm ** 0.5;
            // console.log("dtheta", norm);
            // this.update_theta(dtheta);
            // this.theta = this.theta.map((v, i) => v + dtheta[i][0]);
            for (let i = 0; i < this.theta.length; i++) {
                this.theta[i] += dtheta[i][0];
            }
            this.apply_theta();
            let x = this.get_end_effector_position();
            E_x = target_x.minus(x);
            console.log("x", x);
            count += 1;
            if (count > 10) {
                // throw new Error("Inverse kinematics did not converge within 1000 iterations.");
                console.log("Inverse kinematics did not converge within 10 iterations.");
                break;
            }
        }
    }
}

export
const Node =
class Node {
    constructor(name, shape, material, transform) {
        this.name = name;
        this.shape = shape;
        this.material = material;
        this.transform_matrix = transform;
        this.children_arcs = [];
    }
}

export
const Arc =
class Arc {
    constructor(name, parent, child, location) {
        this.name = name;
        this.parent_node = parent;
        if (this.parent_node !== null) {
            this.parent_node.children_arcs.push(this);
        }
        this.child_node = child;
        this.location_matrix = location;
        this.articulation_matrix = Mat4.identity();
        this.end_effector = null;
        this.dof = {
            Rx: false,
            Ry: false,
            Rz: false,
        }
        this.global_matrix = null;
    }

    // Here I only implement rotational DOF
    set_dof(x, y, z) {
        this.dof.Rx = x;
        this.dof.Ry = y;
        this.dof.Rz = z;
    }

    num_dof() {
        return (this.dof.Rx ? 1 : 0) + (this.dof.Ry ? 1 : 0) + (this.dof.Rz ? 1 : 0);
    }

    update_articulation(theta) {
        this.articulation_matrix = Mat4.identity();
        let index = 0;
        if (this.dof.Rx) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 1, 0, 0));
            index += 1;
        }
        if (this.dof.Ry) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 1, 0));
            index += 1;
        }
        if (this.dof.Rz) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 0, 1));
            index += 1;
        }
        if (index !== theta.length) {
            throw new Error("theta does not match the number of DOF");
        }
    }
}

export
const End_Effector =
class End_Effector {
    constructor(name, parent, local_position) {
        this.name = name;
        this.parent = parent;
        this.local_position = local_position;
        this.global_position = null;
    }
}