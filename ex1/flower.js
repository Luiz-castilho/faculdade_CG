const canvas = document.getElementById("flower");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

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

function makeTriangles(x1, y1, x2, y2, x3, y3) {
    return new Float32Array([
        x1, y1,
        x2, y2,
        x3, y3
    ])
}

function makePetals(xCentro, yCentro, raioE, raioI, num) {
    const vertices = []
    //divide o angulo pelo numero de petulas para que cada uma tenha uma posição diferente
    const angulo = 2 * Math.PI / num
    const largura = angulo / 1.6
    for (let i = 0; i < num; i++) {
        const x1 = xCentro + raioI * Math.cos(angulo * i)
        const y1 = yCentro + raioI * Math.sin(angulo * i)

        const x2 = xCentro + raioE * Math.cos(angulo * i + largura)
        const y2 = yCentro + raioE * Math.sin(angulo * i + largura)

        const x3 = xCentro + raioE * Math.cos(angulo * i - largura)
        const y3 = yCentro + raioE * Math.sin(angulo * i - largura)

        vertices.push(x1, y1, x2, y2, x3, y3)

    }
    return new Float32Array(vertices)
}

const vertices = new Float32Array([
    // Vertices do quadrado
    0.04, 0.2,
    -0.04, 0.2,
    -0.04, -0.8,
    0.04, -0.8
]);


// --------------------------------------------------
// 1. CORES
// --------------------------------------------------

const colors = new Float32Array([
    //Cores dos vértices do quadrado
    0.0, 1.0, 0.0, //vermelho
    0.0, 1.0, 0.0, //verde
    0.0, 1.0, 0.0, //azul
    0.0, 1.0, 0.0  //rosa
])

// --------------------------------------------------
// 1. INDICES
// --------------------------------------------------

const indices = new Uint16Array([
    //Indices dos dois triângulos que formam o quadrado
    0, 1, 2,
    0, 2, 3
])


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();
const segmentos = 50;
const infoCirco = makeCircle(0, 0.2, 0.1, segmentos);
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

const indicesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


// --------------------------------------------------
// 3. VERTEX SHADER
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


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

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


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

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


// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

// Objeto (quadrado) da base da flor:
//configuração 

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

gl.drawElements(
    gl.TRIANGLES,
    indices.length,
    gl.UNSIGNED_SHORT,
    0

);


// triangulos para as petulas
const numPetals = 16;
const infoPetals = makePetals(0, 0.2, 0.1, 0.45, numPetals)

const positionPetalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionPetalsBuffer)

gl.bufferData(gl.ARRAY_BUFFER, infoPetals, gl.STATIC_DRAW)

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.disableVertexAttribArray(colorLocation);
gl.vertexAttrib3f(colorLocation, 1, 1, 1);
gl.drawArrays(gl.TRIANGLES, 0, segmentos + 2);

//circulo

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
//
//gl.drawElements(
//   gl.TRIANGLE_FAN,
//   0,
//  segmentos + 2

//)
