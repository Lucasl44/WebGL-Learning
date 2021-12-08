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
};

const vertexShader = (vertPosition, vertColor) => {
    //sets fragColor to whatever the vertex color was, and position sets where on the rendering canvas you want to draw that vertix
    return {
        fragColor: vertColor,
        gl_position: [vertPosition.x, vertPosition.y, 0.0, 1.0]
    };
}