/************************************************
*Bouncing Ball with gravity and scoring
*Author: JOHN SAN DIEGO
*CLASS: COS 460 project 2
*Brief: able to create the ball using subdivision.
*       able to bounce the ball with gravity.
*       used vertex shader and fragment shader to create shapes.
*       used glMatrix-0.9.5.min.js
*Bugs:  unable to perfect the physics of the ball it always jitters when it get really close to the floor
*     
*       
****************************************************/


//***********************************
//global variables
var gl;

var gravity = -9.8;
var ballRadius = 10;
var ballBounces = 0;
var horiValue = 0;
var vertValue = 0;
var isPlaying = false;
var fire;
var restart;
var bounceVal;
var scoreTotal;
var horiSlider;
var vertSlider;
var horiSliderInput;
var vertSliderInput;
var borderVertexPositionBuffer;

var square;

//************************************
//STEP 1 - CREATE CANVAS AND GET THE CONTEXT OF WEBGL
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialize WebGL, sorry "); //ALERT THE USER IF WEBGL IS ENABLED OR DISABLED
    }
}

//*************************************************
//GET METHOD TO RETRIEVE THE SHADER FROM THE HTML FILE
//
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
    //***********************
    //this is used to debug the program. print error on the web browser console
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    

}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrix2 = mat4.create();
var pMatrix2 = mat4.create();


function setMatrixUniforms(mMatrix,pMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mMatrix);
}



var circleVertexPositionBuffer;
var targetVertexBuffer;

//**********************BEGIN OF CODE**********************************
//AUTHOR:Anton Pantev
//Creates sub divided 2d circle
function createCircle() {
    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    
    // number of triangles for the subdivision
    var numTris2 = 50;

    vertices = [
         0.0,  0.0,  0.0,
         1.0,  0.0,  0.0
    ];
    
    var degPerTri = (2 * Math.PI) / numTris2;
    
    for(var i = 0; i < numTris2; i++) {
        var index = 2*3 + i*3
        var angle = degPerTri * (i+1);

        vertices[index] = Math.cos(angle); 
        vertices[index+1] = Math.sin(angle); 
        vertices[index+2] = 0; 
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    circleVertexPositionBuffer.itemSize = 3;
    circleVertexPositionBuffer.numItems = numTris2 + 2;
    

}


function createTarget(){
    
    targetVertexBuffer = gl.createBuffer(); //send to the GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, targetVertexBuffer);
    
    // number of triangles for the subdivision
    var numTris = 50;

    vertices2 = [
         0.0,  0.0,  0.0,
         1.0,  0.0,  0.0
    ];
    
    var degPerTri = (2 * Math.PI) / numTris;
    
    for(var i = 0; i < numTris; i++) {
        var index = 2*3 + i*3
        var angle = degPerTri * (i+1);

        vertices2[index] = Math.cos(angle); 
        vertices2[index+1] = Math.sin(angle); 
        vertices2[index+2] = 0; 
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
    targetVertexBuffer.itemSize = 3;
    targetVertexBuffer.numItems = numTris + 2;
}

//*****************END OF CODE*********************


var y = 0.0;
var x = -4.0;
var acc = -0.8;
var lastTime = 0;
var dy = 0.0;
var dx = 0.0;
function drawCircle() {
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    mat4.translate(mvMatrix, [x, y, -15.0]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(mvMatrix, pMatrix);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertexPositionBuffer.numItems);
    //gl.disableVertexAttribArray(mvMatrix);

}

function drawTarget() {
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix2);

    mat4.translate(mvMatrix2, [3, -3, -15.0]);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, targetVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, targetVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(mvMatrix2, pMatrix2);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, targetVertexBuffer.numItems);
    //gl.disableVertexAttribArray(mvMatrix2);
    console.log("drawing target");

}

function drawScene(){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.identity(mvMatrix);
    mat4.identity(mvMatrix2);
    drawCircle();
    drawTarget();
}



function Restart(){
    isPlaying = false;
    ballBounces = 0;
    bouncesLabel.innerHTML = "No. of bounce: " + ballBounces;
    y = 0.0;
    x = -4.0;
    acc = -0.8;
    lastTime = 0;
    dy = 0;
    dx = 0;

    
}
function Fire(){
    isPlaying = true;
    //y = 0.0;
    //x = -4.0;
    acc = -0.8;
    lastTime = 0;

}


//****************************************
//creates the gets the html values
//does the ball bouncing physics with gravity
//assigned the value of the slider to speed variable
//increments ball bounce everytime it bounces.
  function animate() {
     fire = document.getElementById("fire");
     restart = document.getElementById("restart");
     bounceVal = document.getElementById("bouncesLabel");
     scoreTotal = document.getElementById("scoreLabel");
     horiSlider = document.getElementById("horizontal").value;
     vertSlider = document.getElementById("vertical").value;
     horiSliderInput = document.getElementById("horizontalInput");
     vertSliderInput = document.getElementById("verticalInput");
     dx = horiSlider;
    //dy = vertSlider;
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
//this will calculate the velocity average over time
        horiSliderInput.innerHTML = "horizontal speed: " + horiSlider;
        vertSliderInput.innerHTML = "vertical speed: " + vertSlider;
        if(y > 5 || y < -5){
            dy = -dy;
            ballBounces += 1;
            bounceVal.innerHTML = "No. of bounce: " + ballBounces;
        }else{
            dy += acc-gravity * (elapsed/1000);
           if(acc > -62){
            
            acc += acc * elapsed/1000;
           }
        }
        if(x > 5 || x < -5){
            dx = -dx;   
        }
        //checks for target collision
        if(y <= -3 && x >= 3){
            Restart();
            scoreTotal++;
            scoreTotal.innerHTML = "Score: " + scoreTotal;
        }
    y += dy * elapsed / 1000;
    x += dx * elapsed / 1000;
    }
    lastTime = timeNow;      
    console.log("y : " + y + "    " + "x: " + x);

  }

//******************************
//animates the circle
//
function tick() {

        requestAnimFrame(tick);
        drawScene();
        
    //checks if test has been pressed
    if(isPlaying){
        animate();
    }
}
 
//initilize the canvas 
//init webgl, shaders, buffers
//clears the buffer
//enables the animation
function webGLStart() {
    var canvas = document.getElementById("canvas");


    initGL(canvas);
    initShaders();
    createCircle();
    createTarget();

    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}