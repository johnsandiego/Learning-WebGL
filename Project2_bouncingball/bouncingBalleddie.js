//Custom Objects
function DrawableSquare(x, y, l, h, r, g, b) {
    //Position of bottom left corner
    this.x = x;
    this.y = y;
    //Size
    this.l = l;
    this.h = h;
    //Color
    this.red = r;
    this.green = g;
    this.blue = b;
}

//Returns the vertex positions in proper order for rendering using triangles.
DrawableSquare.prototype.getVertexPositions = function () {
    var positions = [
        this.x, this.y + this.h,
        this.x + this.l, this.y + this.h,
        this.x, this.y,
        this.x, this.y,
        this.x + this.l, this.y + this.h,
        this.x + this.l, this.y,
    ];
    return positions;
}

//Returns the color of the square. Alpha is always fixed
DrawableSquare.prototype.getColor = function () {
    var color = [this.red, this.green, this.blue, 1.0];
    return color;
}

//Globals
var gl;
var canvas;
var vertexShader;
var fragmentShader;
var glProgram;
var positionAttributeLocation;
var resolutionUniformLocation;
var colorUniformLocation;
var lastTime = 0;

//Ball Physics
var startPos = [100, 300];
var fired = false;
var ballX = 100;
var ballY = 100;
var ballVx = 50;
var ballVy = 10;
var ballR = 20;
var ballBounces = 0;
var ballPoints = 0;
var accelValue = 0.7;
var g = -9.8;

//HTML
var scoreLabel;
var bouncesLabel;
var vxLabel;
var vyLabel;
var vxSlider;
var vySlider;

var squares = [
    new DrawableSquare(0, 0, 500, 30, 1, 0, 0),         //Top Wall
    new DrawableSquare(0, 470, 500, 30, 1, 0, 0),       //Bot Wall
    new DrawableSquare(0, 30, 30, 470, 1, 0, 0),        //Left Wall
    new DrawableSquare(470, 30, 30, 470, 1, 0, 0),      //Right Wall
    new DrawableSquare(470, 230, 30, 100, 0, 1, 1),     //Target Square
];

//Launch the ball
function FireBall() {
    fired = true;
    ballX = startPos[0];
    ballY = startPos[1];
    ballVx = vxSlider.value;
    ballVy = vySlider.value / 100;
}

//Reset everything
function Reset() {
    fired = false;
    ballVx = 0;
    ballVy = 0;
    lastTime = 0;
    ballBounces = 0;
    bouncesLabel.innerHTML = "Bounces: 0";
}

//Update the label above the x velocity slider
function UpdateVXSliderLabel() {
    var value = vxSlider.value;
    vxLabel.innerHTML = "X Velocity: " + value;
}

//Update the label above the y velocty slider
function UpdateVYSliderLabel() {
    var value = vySlider.value;
    vyLabel.innerHTML = "Y Velocity: " + value;
}

//Called when the body loads.
function main() {
    scoreLabel = document.getElementById("scoreLabel");
    bouncesLabel = document.getElementById("bouncesLabel");
    vxLabel = document.getElementById("VxLabel");
    vyLabel = document.getElementById("VyLabel");
    vxSlider = document.getElementById("VxSlider");
    vySlider = document.getElementById("VySlider");

    UpdateVXSliderLabel();
    UpdateVYSliderLabel();

    if (InitGL()) {
        RunGL();
        tick();
        drawScene();
    }
}

//Finds reference to canvas / webGL.
function InitGL() {
    canvas = document.getElementById("canvas");

    //Ensure a canvas was actually found
    if (!canvas) {
        alert("Error: No canvas found.");
        return false;
    }

    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    //Check to see if WebGL was found
    if (!gl) {
        alert("Error: No WebGL instance found");
        return false;
    }

    return true;
}

function RunGL() {
    gl.clearColor(0, 0, 0, 1);

    //Pulls the content from the shader scripts above into variables.
    var vertexShaderSource = document.getElementById("vertexShader").text;
    var fragmentShaderSource = document.getElementById("fragmentShader").text;

    //Now compile them
    vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    //Build the GLSL program.
    glProgram = createProgram(gl, vertexShader, fragmentShader);

    //The following stuff supplies data to the GLSL program
    positionAttributeLocation = gl.getAttribLocation(glProgram, "a_position");
    resolutionUniformLocation = gl.getUniformLocation(glProgram, "u_resolution");
    colorUniformLocation = gl.getUniformLocation(glProgram, "u_color");
}

//Create and compile the shader for use by GL
function createShader(gl, type, source) {
    var shader = gl.createShader(type);

    //Indicate shader source and attempt to compile it.
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    //Check if the shader successfully compiled.
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    //If it did return the new shader
    if (success) {
        return shader;
    }

    //Else log an error
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

//Links the two shaders into a gl program
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();

    //Attach both the required shaders to the program.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    //Check if it was successful and if so return the new program.
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    //Failed. Log error
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

//Runs every animation frame.
function tick() {
    //Sets this to be called again when browser is ready
    requestAnimationFrame(tick);

    //Update ball
    if (fired) {
        UpdateBallPosition();
    }
    drawScene();
}

//Update position of the ball.
function UpdateBallPosition() {
    var timeNow = new Date().getTime();

    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        var deltaTime = elapsed / 100.0;

        //If ball hits wall. Flip x
        if (ballX < (30 + ballR) || ballX > (470 - ballR)) {
            ballVx = -ballVx;
            ballX = ballX < 10 ? 10 : ballX;
            ballX = ballX > 490 ? 490 : ballX;
            ballBounces += 1;
            bouncesLabel.innerHTML = "Bounces: " + ballBounces;
        }

        //Ball hit bottom
        if (ballY < (30 + ballR) || ballY > (470 - ballR)) {
            ballVy = -ballVy;
            ballY = ballY < 10 ? 10 : ballY;
            ballY = ballY > 490 ? 490 : ballY;
            ballBounces += 1;
            bouncesLabel.innerHTML = "Bounces: " + ballBounces;
        }
        else {
            ballVy += (g-accelValue) * deltaTime;
            
            accelValue += deltaTime;
        }
        console.log("ballVy: "+ ballVy + "  " + "accelaration: "+ accelValue);
        //Update ball position.
        ballX += ballVx * deltaTime;
        ballY += -ballVy * deltaTime;

        //Check if ball hit target
        if (ballX > (470 - ballR) && ballY > 230 && ballY < 330) {
            ballPoints += 1;
            scoreLabel.innerHTML = "Score: " + ballPoints;
            Reset();
        }

    }
    lastTime = timeNow;
}

//Draw a single frame of the scene.
function drawScene() {
    //Set resolution and clear it.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(glProgram);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    //Draw objects here
    for(i = 0; i < squares.length; i++){
        drawSquare(squares[i]);
    }

    //Draw ball
    if (fired) {
        drawCircle(ballX, ballY, ballR);
    }
}

//Draw a drawableSquare to the screen.
function drawSquare(square) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    //Load vertex positions
    var positions = square.getVertexPositions();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    //Load vertex color
    var color = square.getColor();
    gl.uniform4f(colorUniformLocation, color[0], color[1], color[2], color[3]);

    //Need to tell GL how to to pull data from the buffer
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;                           //2 components per iteration
    var type = gl.FLOAT;                    //what the data types are
    var normalize = false;                  //don't normalize data
    var stride = 0;                         //0 = move forward size * sizeof(type) to get next position
    var offset = 0;                         //Start at the beginning of the buffer

    //This binds the current ARRAY_BUFFER to the attribute. We can now safely rebind ARRAY_BUFFER
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    //Lastly ask webGL to execute the program
    var primitizeType = gl.TRIANGLES;       //When the vShader is ran 3 times, webGL will draw a triangle.
    var offset = 0;
    var count = 6;                          //Execute the vShader 3 times. This is vertex count
    gl.drawArrays(primitizeType, offset, count);
}

function drawCircle(x, y, r) {
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    //Build Circle Vertices
    var positions = [];
    var vertexCount = 100;
    for (var i = 0; i < vertexCount; i++) {
        positions.push(x + r * Math.cos((i / vertexCount) * 2.0 * Math.PI));
        positions.push(y + r * Math.sin((i / vertexCount) * 2.0 * Math.PI));
    }

    positions.push(positions[0]);
    positions.push(positions[1]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    //Load vertex color
    gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);

    //Need to tell GL how to to pull data from the buffer
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;                           //2 components per iteration
    var type = gl.FLOAT;                    //what the data types are
    var normalize = false;                  //don't normalize data
    var stride = 0;                         //0 = move forward size * sizeof(type) to get next position
    var offset = 0;                         //Start at the beginning of the buffer

    //This binds the current ARRAY_BUFFER to the attribute. We can now safely rebind ARRAY_BUFFER
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    //Lastly ask webGL to execute the program
    var primitizeType = gl.TRIANGLE_FAN;       //When the vShader is ran 3 times, webGL will draw a triangle.
    var offset = 0;
    gl.drawArrays(primitizeType, offset, vertexCount);
}