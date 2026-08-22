const canvas = document.getElementById("car");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

function makeCircle(xCentro, yCentro, raio, segmentos) {
    const vertices = [xCentro, yCentro];
    for (let i = 0; i <= segmentos; i++) {
        const angulo = (i * 2 * Math.PI) / segmentos
        const x = xCentro + raio * Math.cos(angulo)
        const y = yCentro + raio * Math.sin(angulo)
        vertices.push(x, y)
    }
    return new Float32Array(vertices)
}

const verticesBuffer = gl.createBuffer();
const segmentos = 50;
const infoCirco = makeCircle(0, 0.2, 0.1, segmentos);
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);


// --------------------------------------------------
// SHADERS
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = aColor;
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );


gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
const positionCircle = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionCircle);
gl.enableVertexAttribArray(positionLocation);

gl.bufferData(gl.ARRAY_BUFFER, infoCirco, gl.STATIC_DRAW)

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);
gl.disableVertexAttribArray(colorLocation);
gl.vertexAttrib3f(colorLocation, 1, 1, 0);
gl.drawArrays(gl.TRIANGLE_FAN, 0, segmentos + 2);