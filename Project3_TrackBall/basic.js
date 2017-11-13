window.onload = function(init)
            /* steps 1: prepare the canvas and get webgl context */
            var canvas = document.getElementById('my_canvas');
            var gl = canvas.getContext('experimental-webgl');
            
            /*steps 2: Define the geometry and store it in buffer objects */
            var vertices = [-0.5,0.5,-0.5,-0.5,0.0,-0.5,];
            
            //create a new buffer object
            var vertex_buffer = gl.createBuffer();
            
            //bind an empty array buffer to it
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            
            //pass the vertices data to the buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            //unbind the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            
            /*Steps 3: create and compile shader program */
            
            //vertex shader source code
            
            
            
            //create a vertex shader object
            var vertShader = gl.createShader(gl.VERTEX_SHADER);
            
            //attach vertex shader source code
            gl.shaderSource(vertShader, vertcode);
            
            //compile the vertex shader
            
            gl.compileShader(vertShader);
            
            //fragment shader source code

            
            //create fragment shader object
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            
            //attach fragment shader source code
            gl.shaderSource(fragShader,fragCode);
            
            //compile the fragment shader
            gl.compileShader(fragShader);
            
            //Create a shader program object to store combined shader program
            var shaderProgram = gl.createProgram();
            
            //attach a vertex shader
            gl.attachShader(shaderProgram, vertShader);
            
            //attach a fragment shader
            gl.attachShader(shaderProgram, fragShader);
            
            //link both programs
            
            gl.linkProgram(shaderProgram);
            
            //use the combined shader program object
            gl.useProgram(shaderProgram);
            
            /*step 4: associate the shader program to buffer objects */
            
            //bind vertex buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            
            //get the attribute location
            var coord = gl.getAttribLocation(shaderProgram, "coordinates");
            
            //point an attribute to the currently bound vertex buffer object
            gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
            
            //enable the attribute
            gl.enableVertexAttribArray(coord);
            
            /*steps 5: drawing the required objects(triangles) */
            
            //clear the canvas
            gl.clearColor(0.5, 0.5, 0.5, 0.9);
            
            //enable the depth test
            gl.enable(gl.DEPTH_TEST);
            
            //set the view port
            gl.viewport(0,0,canvas.width, canvas.height);
            
            //draw the triangles
            gl.drawArrays(gl.TRIANGLES, 0, 3);