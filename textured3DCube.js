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
"attribute vec2 vertTexCoord;",
"varying vec2 fragTexCoord;",
"uniform mat4 mWorld;",
"uniform mat4 mView;",
"uniform mat4 mProj;",
"",
"void main()",
"{",
"   fragTexCoord = vertTexCoord;",
"   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);",
"}"
].join("\n");
//in lines above to get the vertices, the mworld is multiplied first then mView and finally mProj
//sets the color to the fragColor
let fragmentShaderText = 
[
"precision mediump float;",
"",
"varying vec2 fragTexCoord;",
"uniform sampler2D sampler;",
"",
"void main()",
"{",
"   gl_FragColor = texture2D(sampler, fragTexCoord);",
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
    //Depth test is to not draw faces that appear behind others
    gl.enable(gl.DEPTH_TEST);
    //stops extra math being done in background unnecessarily
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.back);

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
    const boxVertices = 
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];

    //which vertices form triangles
    const boxIndices = 
    [
        //top
        0, 1, 2,
        0, 2, 3,

        //left
        5, 4, 6,
        6, 4, 7,

        //right
        8, 9, 10,
        8, 10, 11,

        //front
        13, 12, 14,
        15, 14, 12,

        //back
        16, 17, 18,
        16, 18, 19,

        //bottom
        21, 20, 22,
        22, 20, 23
];

    //create a chunk of memory to be allocated on the GPU
    const triangleVertexBufferObject = gl.createBuffer();
    //passing varible to graphics car and binding it to the one we created above
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    //specify the data to the active buffer, always uses the active buffer, the three parameters are: the type of buffer, specifies the points in 32 bits so can be read by webgl, sending the data once 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    const boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    //specify which program and the name of the attribute we are using
    const positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    const texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");


    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //number of elements per attribute, set to 2 on line 9
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an  individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation, //Attribute location
        2, //number of elements per attribute, set to 2 on line 9
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an  individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    //enables the attribute for use
    gl.enableVertexAttribArray(positionAttribLocation)
    gl.enableVertexAttribArray(texCoordAttribLocation)

    //create texture
    const boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("crate-image"));

    gl.bindTexture(gl.TEXTURE_2D, null);


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
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    //send above matrices to shader, working with matrix, its 4*4 in floats and a v, set which one you want to set, has to be gl.false for webgl, this is transpose. then the float32array that you want to send
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    let xRotationMatrix = new Float32Array(16);
    let yRotationMatrix = new Float32Array(16);


    //main render loop
    //updates as frequently as the computer can process it, in this case to rotate
    let identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    let angle = 0;
    const loop = () => {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        //just says multiple x by y and apply it to world
        mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    //says were going to draw in triangles, skip 0 vertexs, draw 3 vertices
};
