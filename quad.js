var gl;

window.onload = function init(){
    
   var canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('experimental-webgl');
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var vertices = [
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0,
        0.5,0.5,0.0];
    
    var indices = [3,2,1,3,1,0];
    
    var vertices2 = [
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0,
        0.5,0.5,0.0];
    
    var indices2 = [3,2,1,3,1,0];
    
    var vertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    var vertexBuffer2 = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    var vertexShader = getShader(gl, "vertex-Shader");
    var fragmentShader = getShader(gl, "fragment-Shader");
    
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.useProgram(program);
    
    var indexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    var indexBuffer2 = gl.createBuffer();
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);
    
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices2), gl.STATIC_DRAW);
    
    var coord = gl.getAttribLocation(program, "vPosition");
    
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(coord);
    
    gl.clearColor(.5,.5,.5, 1);
    
    gl.enable(gl.DEPTH_TEST);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.viewport(0,0,canvas.width, canvas.height);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    
}

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

