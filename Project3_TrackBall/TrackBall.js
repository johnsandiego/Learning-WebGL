var tb_trackingMouse = false;
var tb_trackballMove = false;
var tb_redrawContinue = false;


var gl;

window.onload = function init(){
    
    //the usual to get webgl going
    canvas = document.getElementById("gl-canvas");
    gl = WebGLDebugUtils.setupWebGL(canvas);
    
    if(!gl){alert("Webgl isn't available")}
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);
    
    gl.enable(gl.DEPTH_TEST);
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    //***************//initialize trackball event //listeners
    
    tb_Start
}