# Project Report: Into the Unknown

## Team Members
- David Davini: 805290571
- Varun Kumar:  805780536
- Hae Won Cho: 205394251
- Rebecca Heo: 805333858

## Introduction to Our Project

Inspired by the game “Abyssrium,” our project "Into the Unknown" is a web-based simulation game that immerses players in a 3D animated world. Set on a mysterious floating island rich with a diverse ecosystem and intriguing creatures, the game allows players to explore and interact with their surroundings in ways that captivate and engage. Our project aims to deliver a visually appealing, interactive experience, leveraging the power of TinyGL, HTML, JavaScript, and GLSL to bring our animated scene to life in the browser.

## Algorithms Used

### 1. Frenet Frames for Fish Orientation

Frenet Frames provide a mathematical means to define a frame of reference along a curve, making it an invaluable tool for animating objects moving along paths in a 3D space. We applied Frenet Frames to dynamically determine each fish's orientation, enabling natural, fluid movements in our simulated aquatic environment. The implementation of Frenet Frames involves computing the tangent (T), normal (N), and binormal (B) vectors along the fish's path. These vectors are essential for defining the orientation of the fish at any point along its trajectory, ensuring that movements and turns are realistically portrayed.

The core of our Frenet Frame implementation lies in calculating these vectors based on the fish's velocity and acceleration. We determine the tangent direction as the normalized velocity vector, indicating the direction of motion. The binormal direction, chosen to be upwards (`vec3(0, 1, 0)`), ensures stability in the fish's roll. The normal direction is then calculated as the cross product of the binormal and tangent vectors, finalizing the orthogonal basis for the fish's orientation.

### 2. Discrete Fluid Model for Fish Movement

The Discrete Fluid Model is a computational approach to simulating fluid dynamics, focusing on the interactions between individual particles or entities and the fluid medium they move through. It is crucial for simulating realistic fish movement within their aquatic environment. It considers the forces acting on each fish due to water currents, allowing for dynamic, lifelike swimming behaviors. In our implementation, this model primarily influences the fish's acceleration and velocity, simulating the interaction with the surrounding water.

Key to our application of the Discrete Fluid Model is the introduction of a 'drift' component to each fish's movement. This drift represents the influence of water currents, providing a randomized, yet natural, component to the fish's trajectory. By adjusting the drift over time and applying it to the fish's acceleration, we achieve a compelling simulation of fish swimming against and with currents.

Following is an example of how we calculated and used the drift component.
```javascript
update(dt) {
    this.drift = this.drift.plus(vec3(2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5), 2 * (Math.random() - 0.5)).times(drift_variation));
    this.acceleration = this.acceleration.plus(this.drift.times(drift_mag));
    this.velocity = this.velocity.plus(this.acceleration.times(dt));
    if (this.velocity.norm() > this.max_speed) {
        this.velocity = this.velocity.normalized().times(this.max_speed);
    }
    this.position = this.position.plus(this.velocity.times(dt));
    this.sync_articulated_fish();
}
```

### 3. Collision Detection for Character Interaction
Our game enhances the interaction between the player and the island's environment through precise collision detection algorithms. Our collision detection algorithm operates by defining bounding volumes around the game's objects. For simplicity and efficiency, we chose spherical bounding volumes, characterized by their center points and radii. This choice allows for a straightforward distance-based overlap check, suitable for the predominantly rounded shapes within our island environment. Our character cannot move into any object's bounding volume.

The core of our collision detection system is the ```isCollision``` function. This function calculates the Euclidean distance between the centers of two objects and compares it to the sum of their radii. If the distance is less than this sum, a collision is detected, indicating that the player has come into contact with an object.

### 4. Particle Systems for Environmental Effects

Particle systems are a technique used in computer graphics to simulate fuzzy phenomena, which are challenging to depict with conventional rendering techniques. Each particle in a system represents a small portion of the phenomenon and is governed by physical laws. When thousands of these particles are rendered together, they create the illusion of a continuous substance or effect, such as raindrops falling or snowflakes drifting through the air.

To enrich the island's atmosphere, we integrated particle systems to simulate rain and snow. For our weather effects, each particle is modeled as a small sphere with its own position, velocity, and lifespan. These properties allow us to simulate the behavior of individual raindrops or snowflakes. Particles are generated at random positions above the scene and fall under the influence of gravity, with their speed and direction adjusted to create a natural-looking effect.

This system dynamically updates the position of each particle based on its velocity and the acceleration due to gravity. It also manages the lifecycle of particles, spawning new ones to replace those that have "fallen out" of the scene.

### 5. Articulated Kinematics for Snake and Fish Animation
Articulated kinematics deals with the motion of interconnected rigid bodies, or "links," which are joined by joints to form a kinematic chain. This principle is commonly applied in the animation of characters and creatures with complex, segmented bodies. For snakes, the unique slithering movement, characterized by lateral undulations and smooth, continuous body curves, is a prime example of articulated kinematics in action. Similarly, for fish, the fluid swimming motions, including tail flicks and body bends, can be accurately replicated using this technique.

We first create the articulated body made up of nodes and arcs. Each node represents a segment of the creature's body, while arcs connect these nodes and allow for rotation and translation based on defined degrees of freedom.

The snake animation is constructed using a series of connected segments, where the motion of each segment is determined by its preceding segment. This creates a smooth, realistic slithering motion. The body of the snake is segmented into nodes connected by arcs, each with a specific rotation angle that simulates the muscle contractions and movements of a real snake.

The fish animation utilizes a similar approach, with the added complexity of fin movements and tail wiggles that are characteristic of fish swimming. The articulated body of the fish is designed to reflect the undulatory motion of real fish. Specific nodes and arcs are dedicated to simulating the fish's fins and tail, allowing for detailed and varied movements.

## Challenges
One significant challenge we encountered was optimizing the game's performance to maintain a smooth frame rate. Initially, the complex scene, with numerous objects requiring frequent updates and rendering, significantly impacted performance. Our solution involved implementing a visibility culling mechanism, where only objects within the player's immediate field of view and close vicinity are updated and rendered. This optimization significantly improved frame rates without compromising the game's visual quality or depth.

Another challenge ... [Add one more challenge]

## Contributions
[We need to write about what each team member contributed]

## Conclusion
"Into the Unknown" dispalys our team's creative vision. By integrating advanced computer animation algorithms, we have crafted an engaging and visually stunning simulation game. This project not only challenged us to apply and extend our knowledge of 3D animation and web development but also provided invaluable insights into performance optimization and user interaction design. As we look to the future, we are excited to explore further enhancements and continue pushing the boundaries of what is possible in web-based gaming.