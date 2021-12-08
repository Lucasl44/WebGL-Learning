//in order of line what each does:
//want to use medium precision on the first levels, less accuracy but faster
//vec2, vec3, vec4, represent pairs, triplets and 4 sets of floats that go together, vec2 has a x and a y
//gl_position takes 4 and has two from vertPosition
let vertexShadertext = 
[
"precision mediump float;",
"",
"attribute vec2 vertPosition;",
"",
"void main()",
"{",
"   gl_Position = vec4(vertPosition, 0.0, 1.0);",
"}"
].join("\n");

//sets the color to the fragColor
let fragmentShaderText = 
[
"precision mediump float;",
"",
"void main()",
"{",
"   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
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
        alert("Your browswer does not support WebGL");
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
};

// const vertexShader = (vertPosition, vertColor) => {
//     //sets fragColor to whatever the vertex color was, and position sets where on the rendering canvas you want to draw that vertix
//     return {
//         fragColor: vertColor,
//         gl_position: [vertPosition.x, vertPosition.y, 0.0, 1.0]
//     };
// }