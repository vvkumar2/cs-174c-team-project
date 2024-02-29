import {defs, tiny} from './utils/common.js';
import {MainScene} from "./island-scene.js";

// Pull these names into this module's scope for convenience:
const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene,
    Canvas_Widget, Code_Widget, Text_Widget
} = tiny;

// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and common.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;

Object.assign(defs, {MainScene});

// (Can define Main_Scene's class here)

const Main_Scene = MainScene;
const Additional_Scenes = [];

export {Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs}