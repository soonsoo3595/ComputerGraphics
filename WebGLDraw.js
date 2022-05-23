// Vertex shader program
var VSHADER_SOURCE =
 'attribute vec4 a_Position;\n' +
 'attribute vec4 a_Color;\n' +
 'varying vec4 v_Color;\n' +
 "uniform mat4 uProjMatrix;" +
 "uniform mat4 uViewMatrix;" +
 "uniform mat4 uWorldMatrix;" +
 
 'void main() {\n' +
  ' gl_Position = uProjMatrix * uViewMatrix * uWorldMatrix * a_Position;\n' +
  ' v_Color = a_Color;\n' +
  ' gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
'precision mediump float;\n' + 
'varying vec4 v_Color;\n' + 

 'void main() {\n' +
  ' gl_FragColor = v_Color;\n' +
  '}\n';

var point = 1;

var vertices = new Float32Array([
      point, point, point, // v0
      -point, point, point, // v1
      -point, -point, point, // v2
      point,  -point, point, // v3
      point, -point, -point, // v4
      point,  point, -point, // v5
      -point,  point, -point, // v6
      -point, -point, -point, // v7
]);
  
var colors = new Float32Array([
      1, 1, 1,
      1, 0, 1,
      1, 0, 0,
      1, 1, 0,
      1, 1, 0,
      0, 1, 0,
      0, 1, 1,
      0, 0, 1,
      0, 0, 0
]);

var indices = new Uint8Array([
      0,1,2,  0,2,3,
      0,3,4,  0,4,5,
      0,5,6,  0,6,1,
      1,6,7,  1,7,2,
      7,4,3,  7,3,2,
      4,7,6,  4,6,5
]);
    

var canvas = null;
// Get the rendering context for WebGL
var gl = null;

var vertex_Buffer;
var color_buffer;
var index_Buffer;

var a_Position;
var a_Color;

var viewMatrix;
var uViewMatrix;

var eye = new Float32Array([0.0,0.0,10.0]);
var at = new Float32Array([0.0,0.0,0.0]);
var up = new Float32Array([0.0,1.0,0.0]);

window.onkeydown = checkKey;

function main() {

    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl');

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    vertex_Buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();
    index_Buffer = gl.createBuffer();

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Create a projection matrix
    var projMatrix = mat4.create();
    var fov =  100.0 * Math.PI / 180.0;
    var aspect = 1;
    var near = 0.1;
    var far = 500;
    mat4.perspective(projMatrix, fov, aspect, near, far);

    // Get the uProjMatrix location variable
    var uProjMatrix = gl.getUniformLocation(gl.program, "uProjMatrix");
    if (uProjMatrix === null)
    {
        console.log("Failed to get the uProjMatrix location variable.");
        return false;
    }
 
    // Send the projection matrix to the video card memory
    gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);
 
    // Create a view matrix
    viewMatrix = mat4.create();
    
    mat4.lookAt(
        viewMatrix,
        eye, at, up
    ); 
    
    // Get the uProjMatrix location variable
    uViewMatrix = gl.getUniformLocation(gl.program, "uViewMatrix");
    if (uViewMatrix === null)
    {
        console.log("Failed to get the uViewMatrix location variable.");
        return false;
    }
 
    // Send the projection matrix to the video card memory
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

     // Clear <canvas>
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(100.0);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    var x,y,z;
    x = 5; y = 0; z = 0;
    createCube(x,y,z);
    x = -5; y = 0; z = 0;
    createCube(x,y,z);
    
}

var draw = function()
{   
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_Buffer);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_BYTE,0);
}

function checkKey(ev)
{
    switch(ev.keyCode)
    {
        case 49:{
            eye[1] = eye[1] + 0.1;
            break;
        }
        case 50:{
            eye[1] = eye[1] - 0.1;
            break;
        }
        case 51:{
            eye[2] = eye[2] + 0.1;
            break;
        }
        case 52:{
            eye[2] = eye[2] - 0.1;
            break;
        }
    }
    mat4.lookAt(
        viewMatrix,
        eye, at, up
    );
    
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 
    var x,y,z;
    x = 5; y = 0; z = 0;
    createCube(x,y,z);
    x = -5; y = 0; z = 0;
    createCube(x,y,z);    
}

function createCube(x,y,z)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_Buffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    var WorldMatrix = new Matrix4();
    WorldMatrix.translate(x,y,z);

    var uWorldMatrix = gl.getUniformLocation(gl.program, "uWorldMatrix");
    if (uWorldMatrix === null)
    {
        console.log("Failed to get the uWorldMatrix location variable.");
        return false;
    }
    gl.uniformMatrix4fv(uWorldMatrix, false, WorldMatrix.elements);
    draw();
}