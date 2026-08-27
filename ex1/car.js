(() => {
    const canvas = document.getElementById("car");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL 2 não é suportado.");
    }
    //funções para facilitar a criação das formas
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
    //configuração básica das formas
    const verticesBuffer = gl.createBuffer();
    const segmentos = 50;
    const infoCirco = makeCircle(0.6, -0.7, 0.2, segmentos);
    const infoCirco2 = makeCircle(-0.6, -0.7, 0.2, segmentos);
    const retanguloCarro = makeRectangle(-0.85, -0.7, 0.85, -0.35)
    const trianguloCabine = makeTriangle(0.30, -0.35, 0.70, -0.35, 0.30, 0.1)
    const retanguloCabine = makeRectangle(0.30, -0.35, -0.60, 0.1)
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


    //limpa a tela
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



    // Desenha o retangulo 
    gl.vertexAttrib3f(colorLocation, 1.0, 0.0, 0.0); // Cor Vermelha (R, G, B)
    gl.bufferData(gl.ARRAY_BUFFER, retanguloCarro, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Desenha a cabine
    gl.bufferData(gl.ARRAY_BUFFER, trianguloCabine, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Desenha o retangulo da cabine
    gl.bufferData(gl.ARRAY_BUFFER, retanguloCabine, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Muda a cor para amarelo
    gl.vertexAttrib3f(colorLocation, 1, 1, 0);
    // 1º Círculo
    gl.bufferData(gl.ARRAY_BUFFER, infoCirco, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, segmentos + 2);

    // 2º Círculo
    gl.bufferData(gl.ARRAY_BUFFER, infoCirco2, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, segmentos + 2);


})();