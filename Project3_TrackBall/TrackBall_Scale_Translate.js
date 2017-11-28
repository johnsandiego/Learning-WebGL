//***************************************************************************************************
//TrackBall, Translate, Scale
//Author: John San Diego
//Assignment 03
//COS 460
//Brief: This is a program which lets you rotate a cube using the mouse pointer.
//       You can translate and scale the cube.
//Controls:
//          To use trackball position mouse pointer over the cube then click and drag to rotate.
//          To scale +/- press Q/E
//          To Translate the Cubes position press W - UP, A - Left, D - Right, S - DOWN.
//Reference: I learned and modified code by ander spitman which is the author of the book.
//Bug: Scale is not working. I need help. I have it all setup up but its not scaling.
//****************************************************************************************************

var gl;
var canvas;

var NumVertices  = 36;

var points = [];
var colors = [];

var rotationMatrix;
var rotationMatrixLoc;

var translationMatrix;
var translationMatrixLoc;

var scaleMatrix;
var scaleMatrixLoc;
//                                         **************GLOBAL VARIABLES************************
var  angle = 0.0;
var  axis = [0, 0, 1];

var trackingMouse = false;
var trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;
var xPos = 0.0;
var yPos = 0.0;
var zPos = 0.0;
var sPosX = .5;
var sPosY = .5;
var sPosZ = .5;

var vPosition;
var program;

//var mvMatrix = mat4.create();
//var pMatrix = mat4.create();

//helps me debugs the webgl aspect
function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

// where webgl is initialize and set upped.
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //scaling matrix
    scaleMatrix =  new Float32Array([
            sPosX,   0.0,  0.0,  0.0,
            0.0,  sPosY,   0.0,  0.0,
            0.0,  0.0,  sPosZ,   0.0,
            xPos,  yPos,     zPos,     1.0  
         ]);
    
    xPos = 1.9;
    yPos = 1.5;
    zPos = 3;
    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vColor = gl.getAttribLocation( program, "vColor" );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    
    //create buffer for color
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    /* ===========Associating shaders to buffer objects============*/
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //creating buffer for position
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    /* ===========Associating shaders to buffer objects============*/
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    //create matrix for rotation of cube
    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "rotation");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    
    //creates matrix for translation and scaling of cube
    translationMatrix = mat4();
    translationMatrixLoc = gl.getUniformLocation(program, "PVM");
    gl.uniformMatrix4fv(translationMatrixLoc, false, scaleMatrix);
    
    
    //listens to mouse movement mousedown
    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });
    
    // listens to mouse up movement
    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });
    
    //listens to mouse movement
    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );

    render();

}

//*********************************************************
//Takes care of all the keypress events
//detects the pressing of keys in the input field.
//need your help just using regular keyboard press and not using a input field in html
function handleKeys(event) {
    var x = event.which || event.keyCode;
    if (x == 119) {
        // w
        yPos += 0.3;
        console.log("y: " + yPos);
        console.log("translationMatrixLoc: " + translationMatrixLoc);
        
    }
    if (x == "97") {
        // a
        xPos -= 0.3;
        console.log("x: " + xPos);
    }
    if (x == "100") {
        // d
        xPos += 0.3;
        console.log("x: " + xPos);
    }
    if (x == "115") {
        // s
        yPos -= 0.3;
        console.log("y: " + yPos);
    }
    if (x == "113") {
        // q
        sPosX += 1.0;
        sPosY += 1.0;
        sPosZ += 1.0;
        console.log(" x: " + sPosX + " y: " + sPosY + " z: " + sPosZ);
    }
    if (x == "101") {
        // e
        sPosX -= 1.0;
        sPosY -= 1.0;
        sPosZ -= 1.0;
        console.log(" x: " + sPosX + " y: " + sPosY + " z: " + sPosZ + " scalingMatrix" + scaleMatrix);
    }

}

//Reference: ander spitman author of book
//*************START CODE***********************************************
function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

         lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
    render();
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

//****************END CODE*********************************************

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if(trackballMove){
        axis = normalize(axis);
        rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
        gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    gl.uniformMatrix4fv(translationMatrixLoc,false, scaleMatrix);

    
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
    requestAnimFrame(render);
}