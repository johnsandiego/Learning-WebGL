/* In some parts of this code I have adapted pieces of code from both 
the online code for the Interactive Graphics Textbook by EDWARD ANGEL, University of New Mexico, and DAVE SHREINER, ARM, Inc. 

as well as syntax and concepts learned from an online beginners tutorial by Indigo Code on Youtube at:
https://www.youtube.com/watch?v=kB0ZVUrI4Aw&list=PLjcVFFANLS5zH_PeKC6I8p0Pt1hzph_rt

as well as code snippets from the slides in class posted on Blackboard

I will be marking specific pieces of code directly copied from these sources, but concepts learned that
I have adapted (changed quite a bit) I have left unmarked.
*/
var gl;
var vertices = [];
var targetVert = [];
var numSides;
var program;
var boxSize;
var radius;
var vx = 0;
var vy = 0;
var x = 0;
var y = 0;
var g = -9.81;
var dt = 1;
var vertexPos;
var circleVertexBuffer;
var targetLoc;
var targetVertexBuffer;
var sliderX = 0;
var sliderY = 0;
var move = false; 
var scoreNum = 0;
var box;
var boxLoc;
var boxBuffer;
var colorLoc;
var color;

window.onload = function Init() {

	var canvas = document.getElementById('ball-canvas');

	//////From Indigo code 
	gl = canvas.getContext('webgl');
	if (!gl) { gl = canvas.getContext('experimental-webgl');} //(this piece of code is used as a backup in case the user is on Microsoft Edge or Internet Explorer)
	//////

	if ( !gl ) { alert( "WebGL couldn't load." ); }

	gl.clearColor(.9, .9, 0.45, 1.0);
	gl.clear( gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT );

 	//// From Edward Angel && Dave Shreiner 
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	////


	//// From slides in class
	boxSize = .95;
	//buffer box around canvas
	var right = .95; var left = -.95;
	var top = .95; var bottom = -.95;
	box = [ vec2( left, bottom ),
				vec2( left, top ),
				vec2( right, bottom ),
				vec2( right, top ) ];

	// box buffers 
	boxBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, boxBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(box), gl.STATIC_DRAW );

	boxLoc = gl.getAttribLocation( program, "vPos" );
	gl.vertexAttribPointer( boxLoc, 2, gl.FLOAT, false, 0, 0);
	////

	//Color of box
	colorLoc = gl.getUniformLocation(program,"vColor");
	colorBuffer = gl.createBuffer();
	color = [];
	for (var i=0; i < 4; i++) {
      color = color.concat([0.0, 0.0, 1.0, 1.0]);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
	//


	//buffer for circle
	numSides = 50;
	createCircle(numSides);

	circleVertexBuffer = gl.createBuffer(); //send to the GPU
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW); //will use whichever object was last bound

	vertexPos = gl.getAttribLocation(program, 'vPos');
	gl.vertexAttribPointer( //6 parameters for positions
		vertexPos,      //Attribute location
		2, 						//Number of elements per attribute -this is a vec2 so we have 2 
		gl.FLOAT, 				//Type of elements
		gl.FALSE,				//Whether or not data is normalized
		0,						//Size of an individual vertex 
		0						//Offset from the beginning of a single vertex to this attribute
	);
	//////////////


	//buffer for target
	targetVert = [ vec2( .95, .1 ),
				vec2( .95, .5 ),
				vec2( 1, .1 ),
				vec2( 1, .5 ) ];

	targetVertexBuffer = gl.createBuffer(); //send to the GPU
	gl.bindBuffer(gl.ARRAY_BUFFER, targetVertexBuffer);
	//Float32array is to specify type so we have correct type
	gl.bufferData(gl.ARRAY_BUFFER, flatten(targetVert), gl.STATIC_DRAW); //will use whichever object was last bound

	targetLoc = gl.getAttribLocation(program, 'vPos');
	gl.vertexAttribPointer( targetLoc, 2, gl.FLOAT, gl.FALSE, 0, 0	);
	//////////


	//sliders and buttons
	document.getElementById("dx-slider").onchange = function(event) {
		if(!move){
        	sliderX =  event.target.value;
    	}
    };
    document.getElementById("dy-slider").onchange = function(event) {
    	if(!move){
        	sliderY =  event.target.value;
    	}
    };
    document.getElementById( "shoot-ball" ).onclick = function () {
	    if(!move){
	        move = true;
	        vx = parseInt(sliderX);
	        vy = parseInt(sliderY);
	    }
    };
    document.getElementById( "reset-ball" ).onclick = function () {
        resetPos();
    };
    //////

	resetPos(); //starting position

	render();
}

function createCircle(fans)
{
	radius = .1;

	for (var i = 0; i <= fans; i++)
	{
	 vertices.push(vec2( (Math.cos(2*Math.PI*(i/fans)) * radius), (Math.sin(2*Math.PI*(i/fans)) * radius)) );
	}
}

function resetPos(){
	//initial position
	move = false;
	x = -.75;
	y = -.75;
	vx = 0;
	vy = 0;
	var translate = [-0.65, -0.6, 0.0, 0.0];
	var translation = gl.getUniformLocation(program, 'translation');
	var uniform = gl.getUniform(program, translation);
	gl.uniform4f(translation, translate[0], translate[1], translate[2], translate[3]);
	uniform = gl.getUniform(program, translation);
}

var render = function(){

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	var score = document.getElementById("score-count");
	idle();
	drawBox();
	drawCircle();
	drawTarget();
	score.innerHTML = scoreNum; //sends score to page
	window.requestAnimFrame(render);
}

//// Modified from in class slides
function idle(){
// Move the ball
	if(move){      //has the "Fire!" button been pressed?
		dt = 0.01;
		vx += - (0.005 * vx) //air drag
		vy += g * dt - (0.005 * vy); //air drag
		x += vx * dt;
		y += vy * dt;
		// Damping occurs every frame
		if(move) { vx *= 0.99999; vy *= 0.99999;}

		//collision with target (touches .95 which is boxsize and is between .1 and .5 in the y direction which is where target is)
		if (x > boxSize - radius && y >= .1 && y <= .5){scoreNum++; resetPos();}

		// "Collision" code
		if(x > boxSize - radius){ x = boxSize - radius; vx = -vx;} //Collide right

		if(x < -boxSize + radius){ x = -boxSize + radius; vx = -vx;} //Collide left

		if(y > boxSize - radius){ y = boxSize - radius; vy = -vy;} //Collide top

		if(y < -boxSize + radius){ y = -boxSize + radius; vy = -vy;} //Collide bottom

	}
	else{
		resetPos();
	}
}
////

function drawBox(){
	// Initialize uniforms
	gl.bindBuffer( gl.ARRAY_BUFFER, boxBuffer );
	gl.vertexAttribPointer( boxLoc, 2, gl.FLOAT, false, 0, 0);

	/*var current_color = vec4(0.0, 0.0, 0.0, 1.0);*/

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0.0, 0.0)

    gl.enableVertexAttribArray( colorLoc );
	gl.enableVertexAttribArray( boxLoc );


	var translate = [0.0, 0.0, 0.0, 0.0];
	var translation = gl.getUniformLocation(program, 'translation');
	var uniform = gl.getUniform(program, translation);
	gl.uniform4f(translation, translate[0], translate[1], translate[2], translate[3]);
	uniform = gl.getUniform(program, translation);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(colorLoc);
	gl.disableVertexAttribArray(boxLoc);
}

function drawCircle(){
	gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
	vertexPos = gl.getAttribLocation(program, 'vPos');
	gl.vertexAttribPointer( //6 parameters for positions
		vertexPos,      //Attribute location
		2, 						//Number of elements per attribute -this is a vec2 so we have 2 
		gl.FLOAT, 				//Type of elements
		gl.FALSE,				//Whether or not data is normalized
		0,						//Size of an individual vertex 
		0						//Offset from the beginning of a single vertex to this attribute
	);
	var translate = [x, y, 0.0, 0.0];
	var translation = gl.getUniformLocation(program, 'translation');
	var uniform = gl.getUniform(program, translation);
	gl.uniform4f(translation, translate[0], translate[1], translate[2], translate[3]);
	uniform = gl.getUniform(program, translation);
	gl.enableVertexAttribArray(vertexPos);
	gl.drawArrays( gl.TRIANGLE_FAN, 0, numSides );
	gl.disableVertexAttribArray(vertexPos);
}

function drawTarget(){
	// Initialize uniforms
	gl.bindBuffer( gl.ARRAY_BUFFER, targetVertexBuffer );
	gl.vertexAttribPointer( targetLoc, 2, gl.FLOAT, false, 0, 0);

	/*var current_color = vec4(0.0, 0.0, 0.0, 1.0);*/

/*	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0.0, 0.0)

    gl.enableVertexAttribArray( colorLoc );*/
	gl.enableVertexAttribArray( targetLoc );


	var translate = [0.0, 0.0, 0.0, 0.0];
	var translation = gl.getUniformLocation(program, 'translation');
	var uniform = gl.getUniform(program, translation);
	gl.uniform4f(translation, translate[0], translate[1], translate[2], translate[3]);
	uniform = gl.getUniform(program, translation);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(targetLoc);
}