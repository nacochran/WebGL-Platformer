
// simple no-operation function
function noop() {
  console.log('Undefined function.');
}

/* 
 * Game Class
 */
class Game {
  constructor (config) {
    this.levelData = config.levelData || [];
    this.mapPalette = config.mapPalette || {};
    this.level = 1;
    this.viewCamera = null;
    this.player1 = null;

    this.airFriction = 0.1;
    this.g = 0.2;

    this.entities = [];
  }
}

let game = new Game({});

/* 
 * Actor Class
*/
class Actor {
  constructor(config) {
    // position and orientation
    this.pos = VL.new(config.x, config.y, config.z);
    this.size = VL.new(config.width, config.height, config.depth);
    this.rot = VL.new(0, 0, 0);
    // transformation matrix for transforming the vertices of geometry in world space
    this.tMatrix = config.tMatrix || m4.identity();

    // movement
    this.vel = VL.new(0, 0, 0);
    this.acc = VL.new(0, 0, 0);
    this.rotVel = VL.new(0, 0, 0);
    this.rotAcc = VL.new(0, 0, 0);
    this.tVel = 8; // terminal (free falling) velocity
    this.maxSpeed = 5; // max speed of the player
    this.dragForce = game.airFriction;

    // tracking collisions with objects
    this.onObject = false;
    this.onTime = 0;
  }

  setTransformationMatrix() {
    // Convert rotation angles from degrees to radians
    var angleX = degToRad(this.rot.x);
    var angleY = degToRad(this.rot.y);
    var angleZ = degToRad(this.rot.z);

    // Create rotation matrices for each axis
    var rotationX = m4.xRotation(angleX);
    var rotationY = m4.yRotation(angleY);
    var rotationZ = m4.zRotation(angleZ);

    // Multiply rotation matrices together to get the combined rotation matrix
    var rotationMatrix = m4.multiply(rotationZ, m4.multiply(rotationY, rotationX));

    // Create a translation matrix based on position
    var translationMatrix = m4.translation(this.pos.x, this.pos.y, this.pos.z);

    // Multiply rotation matrix by translation matrix to get the final transformation matrix
    var finalMatrix = m4.multiply(rotationMatrix, translationMatrix);
    this.tMatrix = finalMatrix;
  }

  applyGravity() {
    this.acc.y = (this.vel.y < this.tVel) ? -game.g : 0;
  }

  applyDrag() {
    this.onObject = (this.onTime++ > 5) ? false : this.onObject;
    this.dragForce = (this.onObject) ? this.dragForce : game.airFriction;
  }

  updateX() {
    this.pos.x += this.vel.x;
    this.vel.x += this.acc.x;
  }

  updateY(activateJump) {
    if (activateJump && abs(this.vel.y) < 0.1 && abs(this.acc.y) < 0.1) {
        this.vel.y = -5;
    }

    this.applyGravity();

    this.pos.y += this.vel.y;
    this.vel.y += this.acc.y;
  }

  updateZ() {
    this.pos.z += this.vel.z;
    this.vel.z += this.acc.z;
  }
}

/*
 * Player Class
*/
class Player extends Actor {
  constructor(config) {
    super(config);
  }

  createGeometry() {
    var colors = [
          [55, 207, 25], // Front face color
          [55, 207, 25],   // Back face color
          [55, 207, 25],  // Top face color
          [55, 207, 25],  // Bottom face color
          [55, 207, 25],  // Right face color
          [55, 207, 25]  // Left face color
        ];

    var s = this.size.x;
    // using a cube based on the player's width... assuming the player is a cube right now
    cube(s/2, s/2, s/2, s, colors, this);
    
  }

  // rotate counterclockwise / clockwise
  rotate(activateLeft, activateRight) {
    if (activateLeft) {
      this.rot.y++;
    } else if (activateRight) {
      this.rot.y--;
    }
  }

  update() {
    // orientation player
    this.rotate(keys.pressed('left'), keys.pressed('right'));

    // move and collide x
    //this.updateX();

    // move and collide y
    //this.updateY(keys.pressed('jump'));

    // move and collide z
    //this.updateZ();

    this.setTransformationMatrix();
  }
}

var player;

/* 
 * Block Class
*/
class Block {
  constructor (config) {
    this.position = config.position;
    this.size = config.size || 100;
    this.type = config.type || 'stone';
  }

  createGeometry() {
    var colors = [];
    switch (this.type) {
      case 'stone':
        colors = [
          [200, 200, 200], // Front face color
          [200, 200, 200],   // Back face color
          [200, 200, 200],  // Top face color
          [200, 200, 200],  // Bottom face color
          [200, 200, 200],  // Right face color
          [200, 200, 200]  // Left face color
        ];
    }
    cube(...this.position, this.size, colors);
  }
}
let blocks = [];

/* 
 * Levels
*/
let levels = [];
let level = 1;

class Level {
  constructor (config) {
    this.design = config.design || noop;
    this.createGeometry = config.createGeometry || noop;
    this.name = config.name;
  }

  create() {
    this.design();
    this.createGeometry();
  }
}

/*
* Camera Class
*/
class Camera {
  constructor() {
    this.position = [0, 0, 500];
    this.rotation = [0, 0];
    this.target = [0, 0, 0];
    // in radians
    this.fieldOfView = degToRad(60);
    this.zNear = 1;
    this.zFar = 2000;
  }

  view(gl) {
    // 1. Model --> View --> Projection
    // 2. Matrix multiplication goes right from left
    // gl_Position = projection * view * model * aPosition

    // Define the aspect ratio
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    // Compute the projection matrix
    var projectionMatrix = m4.perspective(this.fieldOfView, aspect, this.zNear, this.zFar);

    // Compute the view matrix
    var up = [0, 1, 0];
    var viewMatrix = m4.inverse(m4.lookAt(this.position, this.target, up));

    // Compute the final matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    return viewProjectionMatrix;
  }

  // updates target based on camera's position & angle
  updateTarget() {
    var yaw = this.rotation[0];
    var pitch = this.rotation[1];

    var direction = [
      Math.cos(pitch) * Math.sin(yaw),
      Math.sin(pitch),
      Math.cos(pitch) * Math.cos(yaw)
    ];

    // Normalize the direction vector
    direction = normalize(direction);

    // Update the target position
    this.target = [
      this.position[0] + direction[0],
      this.position[1] + direction[1],
      this.position[2] - direction[2]
    ];
  }

  // sets target manually
  setTarget(x, y, z) {
    this.target = [x, y, z];

    // Calculate the direction vector from the position to the target
    var direction = subtractVectors(this.target, this.position);

    // Calculate the yaw and pitch angles
    var yaw = Math.atan2(direction[0], direction[2]);
    var pitch = Math.atan2(direction[1], Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2]));

    // Update the camera rotation
    this.rotation = [yaw, pitch];
  }

  updatePosition(speed) {
    // Calculate the direction vector from the position to the target
    var direction = subtractVectors(this.target, this.position);

    // Normalize the direction vector
    direction = normalize(direction);

    // Update the camera position by moving towards the target
    this.position[0] += speed * direction[0];
    this.position[1] += speed * direction[1];
    this.position[2] += speed * direction[2];

    // Update the target based on the new position
    this.updateTarget();
  }

  updateRotation(deltaX, deltaY) {
    this.rotation[0] += deltaX;
    this.rotation[1] += deltaY;

    this.updateTarget();
  }
}

/*
 * Keymanager Class
*/
class KeyManager {
  constructor() {
    this.keys = {};
    this.keyCodeMap = {};
    this.current = {};
    this.recording = false;
    this.inputData = [];
    this.records = [];
    
    // playing back a record
    this.playRecord = [];
    this.pressedKeys = [];
    this.playing = false;
    this.paused = false;
    this.time = 0;
    this.startTime = 0;
    this.completeRecord = false;
  }

  register(key, name, keyCode) {
    this.keys[key] = { keyCode: keyCode, name: name };
    this.keyCodeMap[keyCode] = key;
  }

  pressed(selector) {
    if(typeof selector === 'string') {
      if (this.keys[selector]) {
        selector = (
            this.keys[selector] &&
            this.keys[selector].keyCode
        );
      }
    }
    if (!selector) {
        return false;
    }
    return this.current[selector];
  }

  keyPressed(keyCode) {
    if (!this.playing && !this.current[keyCode]) {
      this.current[keyCode] = true;
      if (this.recording) {
          var startTime = Date.now() - this.startTime;
          this.inputData.push({ keyCode: keyCode, startTime: startTime });
      }
    }
  }

  keyReleased(keyCode) {
    //println('key released: ' + this.keyCodeMap[keyCode] + ", date: " + (Date.now() - this.startTime));
            
    if (!this.playing && this.current[keyCode]) {
      delete this.current[keyCode];
      if (this.recording) {
          // Iterate over all recorded inputs
          for (var i = this.inputData.length - 1; i >= 0; i--) {
              var input = this.inputData[i];
              if (input.keyCode === keyCode && !input.endTime) {
                  // Set the end time for the corresponding key press
                  input.endTime = Date.now() - this.startTime;
                  break; // Stop iterating after setting the end time
              }
          }
      }
    }
  }
}
