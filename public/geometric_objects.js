
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
    gl_object.positions.push(vertices[indices[i] * 3] + hs, vertices[indices[i] * 3 + 1] + hs, vertices[indices[i] * 3 + 2] + hs);
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

function cylinder(x, y, z, radius, height, colorsArrayForEachFace, targetObject, segments = 36) {
  // create new object to be rendered by WebGL
  let gl_object = { 
    positions: [], 
    colors: [], 
    normals: [],
    targetObject: targetObject
  };

  var hs = height / 2; // half-height
  var angleStep = (2 * Math.PI) / segments;
  
  // Top and bottom vertices
  for (var i = 0; i <= segments; i++) {
    var angle = i * angleStep;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    // Top circle
    gl_object.positions.push(x + radius * cos, y + hs, z + radius * sin);
    // Bottom circle
    gl_object.positions.push(x + radius * cos, y - hs, z + radius * sin);
  }

  // Side vertices
  for (var i = 0; i <= segments; i++) {
    var angle = i * angleStep;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    // Top edge
    gl_object.positions.push(x + radius * cos, y + hs, z + radius * sin);
    // Bottom edge
    gl_object.positions.push(x + radius * cos, y - hs, z + radius * sin);
  }

  // Colors for top, bottom, and side
  var topColor = colorsArrayForEachFace[0];
  var bottomColor = colorsArrayForEachFace[1];
  var sideColor = colorsArrayForEachFace[2];

  // Add colors
  for (var i = 0; i <= segments; i++) {
    gl_object.colors.push(...topColor);
    gl_object.colors.push(...bottomColor);
  }
  
  for (var i = 0; i <= segments; i++) {
    gl_object.colors.push(...sideColor);
    gl_object.colors.push(...sideColor);
  }

  // Normals
  for (var i = 0; i <= segments; i++) {
    gl_object.normals.push(0, 1, 0); // Top normals
    gl_object.normals.push(0, -1, 0); // Bottom normals
  }

  for (var i = 0; i <= segments; i++) {
    var angle = i * angleStep;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    gl_object.normals.push(cos, 0, sin);
    gl_object.normals.push(cos, 0, sin);
  }

  // Indices for top and bottom
  for (var i = 0; i < segments; i++) {
    gl_object.indices.push(i, i + 1, segments + 1); // Top face
    gl_object.indices.push(segments + 2 + i, segments + 2 + i + 1, 2 * segments + 2); // Bottom face
  }

  // Indices for side
  for (var i = 0; i < segments; i++) {
    var start = 2 * (segments + 1) + 2 * i;
    gl_object.indices.push(start, start + 1, start + 2);
    gl_object.indices.push(start + 1, start + 3, start + 2);
  }

  // add new object to render array to be iterated through
  gl_objects.push(gl_object);
}
