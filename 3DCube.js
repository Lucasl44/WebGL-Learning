const { vec2, vec3, mat3, mat4, toRadian } = glMatrix;
//in order of line what each does:
//want to use medium precision on the first levels, less accuracy but faster
//vec2, vec3, vec4, represent pairs, triplets and 4 sets of floats that go together, vec2 has a x and a y
//gl_position takes 4 and has two from vertPosition
let vertexShadertext = 
[
"precision mediump float;",
"",
"attribute vec3 vertPosition;",
"attribute vec3 vertColor;",
"varying vec3 fragColor;",
"uniform mat4 mWorld;",
"uniform mat4 mView;",
"uniform mat4 mProj;",
"",
"void main()",
"{",
"   fragColor = vertColor;",
"   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
"}"
].join("\n");
//in lines above to get the vertices, the mworld is multiplied first then mView and finally mProj
//sets the color to the fragColor
let fragmentShaderText = 
[
"precision mediump float;",
"",
"varying vec3 fragColor;",
"void main()",
"{",
"   gl_FragColor = vec4(fragColor, 1.0);",
"}"
].join("\n");

const initDemo = () => {
    console.log("This is working");
    //below fetches the element from the HTML and then attempts to initialize WEBGL, changes based on browser
    let canvas = document.getElementById("game-surface");
    let gl = canvas.getContext("webgl");

    if(!gl) {
        console.log("WebGL not supported, without falling back on webGL")
        gl = canvas.getContext("experimental-webgl");
    };

    if(!gl) {
        alert("Your browser does not support WebGL");
    };

    //this is (red, green, blue, alpha) alpha will be 1.0 meaning opaque, 0 is invisible
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    //this sets up the above changes
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //create the shaders
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //sets the shader source, first param is the shader you want to set amd the second is how
    gl.shaderSource(vertexShader, vertexShadertext);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    //compiles the shaders set above
    gl.compileShader(vertexShader);

    //checks it has indeed been compiled and gives a error log if not
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling vertex shader", gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("ERROR compiling fragment shader", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //attaches the shaders to a program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    //error handling for linking
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR linking program", gl.getProgramInfoLog(program));
        return;
    };

    //validate for further testing, only do in development
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program", gl.getProgramInfoLog(program));
        return;
    }

    //create a buffer, set all the information the graphics card is going to be using
    const triangleVertices = 
    [//X, Y , Z        R G B
        0.0, 0.5, 0.0,   1.0, 1.0, 0.0,
        -0.5, -0.5, 0.0, 0.7, 0.0, 1.0,
        0.5, -0.5, 0.0,  0.1, 1.0, 0.6
    ];

    //create a chunk of memory to be allocated on the GPU
    const triangleVertexBufferObject = gl.createBuffer();
    //passing varible to graphics car and binding it to the one we created above
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    //specify the data to the active buffer, always uses the active buffer, the three parameters are: the type of buffer, specifies the points in 32 bits so can be read by webgl, sending the data once 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    //specify which program and the name of the attribute we are using
    const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    const colorAttribLocation = gl.getAttribLocation(program, "vertColor");


    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //number of elements per attribute, set to 2 on line 9
        gl.FLOAT, //type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an  individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //number of elements per attribute, set to 2 on line 9
        gl.FLOAT, //type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, //size of an  individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    //enables the attribute for use
    gl.enableVertexAttribArray(positionAttribLocation)
    gl.enableVertexAttribArray(colorAttribLocation)

    //telling webgl which program should be active
    gl.useProgram(program);

    //getting the name of the program we are using as well as the attribute
    const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    const matViewUniformLocation = gl.getUniformLocation(program, "mView");
    const matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    //the above and below: below three variables on CPU in RAm that are identity matrices that dont do any transformations, and above: locations for those spaces in the GPU 
    //setting the above values to all 0s, in a 16 entry array
    const worldMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    const projMatrix = new Float32Array(16);
    
    //the identity matrix, tell it youre creating an identity matrix, and give it the matrix you want to change
    
    //lookat is setting the camera position, look at docs for reference
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    //send above matrices to shader, working with matrix, its 4*4 in floats and a v, set which one you want to set, has to be gl.false for webgl, this is transpose. then the float32array that you want to send
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    //main render loop
    //updates as frequently as the computer can process it, in this case to rotate

    //says were going to draw in triangles, skip 0 vertexs, draw 3 vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};
