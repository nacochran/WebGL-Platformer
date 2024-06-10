
// objects in these array are rendered by GL.TRIANGLES
var gl_objects = [];

function cube(x, y, z, size, colorsArrayForEachFace, targetObject) {
  // create new object to be rendered by WebGL
  // for now we just include a single positions/colors/normals array, although we can 
  let gl_object = { 
    positions: [], 
    colors: [], 
    normals: [],
    targetObject: targetObject
  };

  var hs = size / 2; // half-size
  var vertices = [
    // Front face
    -hs, -hs,  hs,
     hs, -hs,  hs,
     hs,  hs,  hs,
    -hs,  hs,  hs,
    // Back face
    -hs, -hs, -hs,
    -hs,  hs, -hs,
     hs,  hs, -hs,
     hs, -hs, -hs,
    // Top face
    -hs,  hs, -hs,
    -hs,  hs,  hs,
     hs,  hs,  hs,
     hs,  hs, -hs,
    // Bottom face
    -hs, -hs, -hs,
     hs, -hs, -hs,
     hs, -hs,  hs,
    -hs, -hs,  hs,
    // Right face
     hs, -hs, -hs,
     hs,  hs, -hs,
     hs,  hs,  hs,
     hs, -hs,  hs,
    // Left face
    -hs, -hs, -hs,
    -hs, -hs,  hs,
    -hs,  hs,  hs,
    -hs,  hs, -hs,
  ];

  // Normals for each vertex of each face
  var faceNormals = [
    // Front face
    [ 0,  0,  1],
    // Back face
    [ 0,  0, -1],
    // Top face
    [ 0,  1,  0],
    // Bottom face
    [ 0, -1,  0],
    // Right face
    [ 1,  0,  0], 
    // Left face
    [-1,  0,  0], 
  ];

  // Translate vertices to assigned position
  for (var i = 0; i < vertices.length; i += 3) {
    vertices[i] += x;
    vertices[i + 1] += y;
    vertices[i + 2] += z;
  }

  // Indices for drawing the cube with TRIANGLES
  var indices = [
    0, 1, 2,  0, 2, 3,    // front
    4, 5, 6,  4, 6, 7,    // back
    8, 9, 10, 8, 10,11,   // top
    12,13,14, 12,14,15,   // bottom
    16,17,18, 16,18,19,   // right
    20,21,22, 20,22,23    // left
  ];

  // Add vertices to positions.triangles array
  for (var i = 0; i < indices.length; i++) {
    gl_object.positions.push(vertices[indices[i] * 3], vertices[indices[i] * 3 + 1], vertices[indices[i] * 3 + 2]);
  }

  // Add colors to colors.triangles array
  for (var i = 0; i < 6; i++) {
    var color = colorsArrayForEachFace[i];
    for (var j = 0; j < 6; j++) { // 6 vertices per face
      gl_object.colors.push(color[0], color[1], color[2]);
    }
  }

  // Add normals to normals.triangles arrayfor (var i = 0; i < 6; i++) {
  for (var i = 0; i < 6; i++) {
    var normal = faceNormals[i];
    for (var j = 0; j < 6; j++) { // 6 vertices per face
      gl_object.normals.push(normal[0], normal[1], normal[2]);
    }
  }

  // add new object to render array to be iterated through
  gl_objects.push(gl_object);
}


// // Create cubes with different colors for each face
// cube(0, 0, 100, 100, [
//   [200,  70, 120], // Front face color
//   [80, 70, 200],   // Back face color
//   [70, 200, 210],  // Top face color
//   [210, 100, 70],  // Bottom face color
//   [200, 200, 70],  // Right face color
//   [160, 160, 220]  // Left face color
// ]);

// cube(-100, 150, 100, 100, [
//   [200,  70, 120], // Front face color
//   [80, 70, 200],   // Back face color
//   [70, 200, 210],  // Top face color
//   [210, 100, 70],  // Bottom face color
//   [200, 200, 70],  // Right face color
//   [160, 160, 220]  // Left face color
// ]);

// cube(100, 150, 100, 100, [
//   [200,  70, 120], // Front face color
//   [80, 70, 200],   // Back face color
//   [70, 200, 210],  // Top face color
//   [210, 100, 70],  // Bottom face color
//   [200, 200, 70],  // Right face color
//   [160, 160, 220]   // Left face color
// ]);