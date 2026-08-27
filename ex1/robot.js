(() => {
    const canvas = document.getElementById("robot");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL 2 não é suportado.");
    }

    function makeRectangle(x1, y1, x2, y2) {
        return new Float32Array([
            x1, y1,
            x2, y1,
            x2, y2,
            x1, y2
        ])
    }
    function makeTriangle(x1, y1, x2, y2, x3, y3) {
        return new Float32Array([
            x1, y1,
            x2, y2,
            x3, y3
        ])
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

    //Configuração básica das formas
    const cabecaRobo = makeRectangle(-0.30, 0.05, 0.30, 0.7)
    const corpoRobo = makeRectangle(-0.30, 0.05, 0.30, -0.6)
    const bracoDireito = makeRectangle(0.3, 0.05, 0.7, -0.1)
    const bracoEsquerdo = makeRectangle(-0.3, 0.05, -0.7, -0.1)
    const pernaDireita = makeRectangle(0.3, -0.6, 0.16, -1)
    const pernaEsquerda = makeRectangle(-0.3, -0.6, -0.16, -1)
    const baseAntena = makeRectangle(0.1, 0.7, -0.1, 0.80)
    const caboAntena = makeRectangle(0.05, 0.7, -0.05, 1)

    const olhoEsquerdo = makeCircle(-0.20, 0.5, 0.08, 50)
    const olhoDireito = makeCircle(0.20, 0.5, 0.08, 50)

    const boca = makeRectangle(-0.15, 0.15, 0.15, 0.25)
    ''
    const dente1 = makeTriangle(-0.15, 0.15, -0.15, 0.25, -0.05, 0.15)
    const dente2 = makeTriangle(-0.05, 0.15, 0, 0.25, 0.05, 0.15)
    const dente3 = makeTriangle(0.05, 0.15, 0.15, 0.25, 0.15, 0.15)
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
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.disableVertexAttribArray(colorLocation);
    gl.vertexAttrib3f(colorLocation, 0.5, 0.5, 0.5);
    // Desenha a cabeca
    gl.bufferData(gl.ARRAY_BUFFER, cabecaRobo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.vertexAttrib3f(colorLocation, 0.25, 0.25, 0.25);
    // Desenha o corpo
    gl.bufferData(gl.ARRAY_BUFFER, corpoRobo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenha o braco direito
    gl.bufferData(gl.ARRAY_BUFFER, bracoDireito, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenha o braco direito
    gl.bufferData(gl.ARRAY_BUFFER, bracoEsquerdo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenha o braco direito
    gl.bufferData(gl.ARRAY_BUFFER, pernaDireita, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    // Desenha o braco direito
    gl.bufferData(gl.ARRAY_BUFFER, pernaEsquerda, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.vertexAttrib3f(colorLocation, 1, 1, 1);

    // Desenha o olho esquerdo
    gl.bufferData(gl.ARRAY_BUFFER, olhoEsquerdo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 52);

    // Desenha o olho direito
    gl.bufferData(gl.ARRAY_BUFFER, olhoDireito, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 52);

    gl.vertexAttrib3f(colorLocation, 0.7, 0.7, 0.7);
    // Desenha o cabo da antena
    gl.bufferData(gl.ARRAY_BUFFER, caboAntena, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.vertexAttrib3f(colorLocation, 0.5, 0.5, 0.5);
    // Desenha a base da antena
    gl.bufferData(gl.ARRAY_BUFFER, baseAntena, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.vertexAttrib3f(colorLocation, 0.7, 0.7, 0);
    // Desenha a boca
    gl.bufferData(gl.ARRAY_BUFFER, boca, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    //desenha os dentes
    gl.vertexAttrib3f(colorLocation, 0.8, 0.8, 0);
    gl.bufferData(gl.ARRAY_BUFFER, dente1, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);


    gl.bufferData(gl.ARRAY_BUFFER, dente2, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    gl.bufferData(gl.ARRAY_BUFFER, dente3, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
})()