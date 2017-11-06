var gl;
var tb_eye;
var tb_up;
var tb_at;
var tb_fov;
var tb_speed;
var eye;
var up;
var at;
var tb_startX;
var tb_startY;
var tb_trackingMove = false;
var tb_trackballMove = false;
var tb_redrawContinue = false;
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLDebugUtils.setupWebGL(canvas);
    
    if( gl){
        alert("webgl isn't available");
    }
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.enable(gl.DEPTH_TEST);
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    tb_Start(); //tb_mouseButtonDown, tb_mouseButtonUp, tb_mouseMotion
    tb_eye = eye;
    tb_up = up;
    tb_at = at;
    tb_fov = 30;
    tb_speed = 1.1;
    
    NumVertices = colorCube(); 
    
        // Buffers for colors and vertices
     CubeColorBuffer = gl.createBuffer();
     gl.bindBuffer( gl.ARRAY_BUFFER, CubeColorBuffer );
     gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColors), gl.STATIC_DRAW );
    //...............
    CubeColorLoc = gl.getAttribLocation( program, "vColor" );
     gl.vertexAttribPointer( CubeColorLoc, 4, gl.FLOAT, false, 0, 0 );
     gl.enableVertexAttribArray( CubeColorLoc );
    //...............
     CubeVertexBuffer = gl.createBuffer();
     gl.bindBuffer( gl.ARRAY_BUFFER, CubeVertexBuffer );
     gl.bufferData( gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW );
    //...............
     CubeVertexLoc = gl.getAttribLocation( program, "vPosition" );
     gl.vertexAttribPointer( CubeVertexLoc, 4, gl.FLOAT, false, 0, 0 );
     gl.enableVertexAttribArray( CubeVertexLoc );
    
    MVM_loc = gl.getUniformLocation(program, "MVM");
    PM_loc = gl.getUniformLocation(program, "PM");
    //PM     = ortho(left, right, bottom, top, near, far);
    //PM     = perspective(tb_fov,1.,.1, 20.);
    //gl.uniformMatrix4fv(PM_loc, false, flatten(PM)); // later ...

 render();  
    
    
}

function render()
{   var temp = mat4();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    PM = perspective(tb_fov,1.,.1, 20.);
    gl.uniformMatrix4fv(PM_loc, false, flatten(PM) );
    MVM = lookAt(tb_eye,tb_at,tb_up);
    orient = mat4();
    orient = mult(orient, tbMatrix());
    MVM = mult(MVM, orient);
    gl.uniformMatrix4fv(MVM_loc, false, flatten(MVM) );
    gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices);
    tb_idle();
}

function tb_Start()
{ 
  canvas.onmousedown  = tb_mouseButtonDown;
  document.onmouseup  = tb_mouseButtonUp;
  document.onmousemove = tb_mouseMotion;
  tb_windowWidth    = canvas.width;
  tb_windowHeight   = canvas.height;
}

function tb_mouseButtonDown(event)
{ 
    var x = event.clientX;
  var y = event.clientY;
  tb_startMotion( x, y);
}

function tb_mouseButtonUp(event)
{ 
    var x = event.clientX;
  var y = event.clientY;
  tb_stopMotion( x, y);
}

function tb_startMotion( x, y)
{
    tb_trackingMouse = true;
    tb_redrawContinue = false;
    tb_startX    = x;
    tb_startY    = y;
    tb_lastPos    = tb_ptov(x, y,
    tb_windowWidth, tb_windowHeight);
    tb_trackballMove = true;
}

function tb_stopMotion( x, y)
{
    tb_trackingMouse = false;
 if (tb_startX = x || tb_startY = y)
 { 
    tb_redrawContinue = true;
    tb_angle /= 20.0;
    if(tb_spinFlag) // prevents spinning
        tb_redrawContinue = false;
 }
 else
 { tb_angle     = 0.0;
  tb_redrawContinue = false;
  tb_trackballMove  = false;
 }
}

function tb_ptov( x, y, width, height)
{
     var d, a;
     var v = vec3();
    // project x,y onto a hemi-sphere centered within width, height
     v[0] = -(2.0*x - width) / width;
     v[1] = -(height - 2.0*y) / height;
    // ensure that we are inside the circle on the z = 0 plane
     d = v[0]*v[0] + v[1]*v[1];
     if(d < 1.0)
       v[2] = Math.sqrt(1 - d);
     else v[2] = 0.0;
     v = normalize(v);
     return v;
}

function tb_mouseMotion( event )
{
    var x = event.clientX;
 var y = event.clientY;
 var curPos;
 var d;
 curPos = tb_ptov(x, y, tb_windowWidth,
          tb_windowHeight);
    
    if(tb_trackingMouse)
    { 
      d = subtract(curPos, tb_lastPos);
      var a = dot(d,d);
      if (a > 0)
      { tb_angle = tb_speed*90*Math.sqrt(a);
       tb_axis = cross(tb_lastPos, curPos);
       tb_axis = normalize(tb_axis);
       tb_lastPos = curPos;
      }
      window.requestAnimFrame(render);
    }  
}

function tbMatrix()
{
    var temp = tb_transform; // NOTE1
 tb_transform = tbRotatef(tb_angle,
  tb_axis[0], tb_axis[1], tb_axis[2]);
 tb_transform = mult( tb_transform, temp );
 return tb_transform;
}

function tbRotatef( angle, ax, ay, az)
{
     var d = Math.sqrt(ax*ax + ay*ay + az*az);
     if(d > 0)
     { 
        var theta = -angle;
        var result = rotate(theta, ax, ay, az);
        return result;
     }
     else
     { 
        return mat4();
     }
}

function tb_idle()
{
    if (tb_redrawContinue)
        window.requestAnimFrame(render);
}