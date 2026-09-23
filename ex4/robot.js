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
        ]);
    }

    // Quadrilátero livre (útil para membros inclinados no passo)
    function makeQuad(x1, y1, x2, y2, x3, y3, x4, y4) {
        return new Float32Array([
            x1, y1,
            x2, y2,
            x3, y3,
            x4, y4
        ]);
    }

    function makeTriangle(x1, y1, x2, y2, x3, y3) {
        return new Float32Array([
            x1, y1,
            x2, y2,
            x3, y3
        ]);
    }

    function makeCircle(xCentro, yCentro, raio, segmentos) {
        const vertices = [xCentro, yCentro];
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i * 2 * Math.PI) / segmentos;
            const x = xCentro + raio * Math.cos(angulo);
            const y = yCentro + raio * Math.sin(angulo);
            vertices.push(x, y);
        }
        return new Float32Array(vertices);
    }

    class Renderer {

        constructor(gl, program) {
            this.gl = gl;
            this.program = program;

            this.positionLocation =
                gl.getAttribLocation(
                    program,
                    "aPosition"
                );

            this.colorLocation =
                gl.getUniformLocation(
                    program,
                    "uColor"
                );

            this.viewTransformLocation =
                gl.getUniformLocation(
                    program,
                    "u_viewTransform"
                );

            this.modelTransformLocation =
                gl.getUniformLocation(
                    program,
                    "u_modelTransform"
                );

            this.viewTransform =
                m3.identity();

            this.verticesBuffer =
                gl.createBuffer();
        }

        defineViewTransform(viewTransform) {
            this.viewTransform =
                viewTransform;
        }

        draw(object) {
            const gl = this.gl;

            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                this.verticesBuffer
            );

            gl.bufferData(
                gl.ARRAY_BUFFER,
                object.vertices,
                gl.STATIC_DRAW
            );

            gl.enableVertexAttribArray(
                this.positionLocation
            );

            gl.vertexAttribPointer(
                this.positionLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.uniform3fv(
                this.colorLocation,
                object.color
            );

            gl.uniformMatrix3fv(
                this.modelTransformLocation,
                false,
                object.modelTransform
            );

            gl.uniformMatrix3fv(
                this.viewTransformLocation,
                false,
                this.viewTransform
            );

            gl.drawArrays(
                gl.TRIANGLES,
                0,
                object.vertices.length / 2
            );
        }
    }

    class ObjectScene {
        constructor(vertices, color) {
            this.vertices = vertices;
            this.color = color
            this.modelTransform = modelTransform;

        }
        UpdateModelTransform(modelTransform) {
            this.modelTransform = modelTransform;
        }
    }

    class RobotBody extends ObjectScene {
        constructor(vertices, color) {
            super(vertices, color);
        }
        UpdateModelTransform(modelTransform) {
            super.UpdateModelTransform(modelTransform);
        }
    }
    class RobotLeg extends ObjectScene {
        constructor(vertices, color) {
            super(vertices, color);
        }
        UpdateModelTransform(modelTransform) {
            super.UpdateModelTransform(modelTransform);
        }
    }
    class RobotArm extends ObjectScene {
        constructor() {
            super(vertices, color);
        }
        UpdateModelTransform(modelTransform) {
            super.UpdateModelTransform(modelTransform);
        }
    }
    class RobotHead extends ObjectScene {
        constructor() {
            super(vertices, color);
        }
        UpdateModelTransform(modelTransform) {
            super.UpdateModelTransform(modelTransform);
        }
    }



    // --------------------------------------------------
    // GEOMETRIAS DO ROBÔ DE PERFIL (POSE DE PASSO)
    // --------------------------------------------------

    // 1. Membros de trás (inclinados para trás)
    const pernaTras = makeQuad(-0.06, -0.45, 0.06, -0.45, -0.18, -0.85, -0.30, -0.85);
    const peTras = makeRectangle(-0.35, -0.85, -0.15, -0.92);
    const bracoTras = makeQuad(-0.04, 0.05, 0.08, 0.05, -0.16, -0.35, -0.28, -0.35);

    // 2. Tronco e Cabeça (perfil)
    const corpoRobo = makeRectangle(-0.16, 0.10, 0.16, -0.45);
    const cabecaRobo = makeRectangle(-0.18, 0.10, 0.18, 0.62);

    // 3. Antena
    const baseAntena = makeRectangle(-0.06, 0.62, 0.06, 0.70);
    const caboAntena = makeRectangle(-0.02, 0.70, 0.02, 0.88);

    // 4. Detalhes do rosto (apenas o lado direito visível)
    const olhoLateral = makeCircle(0.08, 0.44, 0.07, 40);
    const bocaLateral = makeRectangle(0.12, 0.18, 0.18, 0.28); // boca saindo na ponta direita
    const dente1 = makeTriangle(0.12, 0.28, 0.18, 0.28, 0.15, 0.23);
    const dente2 = makeTriangle(0.12, 0.18, 0.18, 0.18, 0.15, 0.23);

    // 5. Membros da frente (inclinados para a frente)
    const pernaFrente = makeQuad(-0.06, -0.45, 0.06, -0.45, 0.28, -0.85, 0.16, -0.85);
    const peFrente = makeRectangle(0.12, -0.85, 0.36, -0.92);
    const bracoFrente = makeQuad(-0.04, 0.05, 0.08, 0.05, 0.24, -0.35, 0.12, -0.35);

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

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const colorLocation = gl.getAttribLocation(program, "aColor");

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.disableVertexAttribArray(colorLocation);

    // --------------------------------------------------
    // DESENHO (Em camadas: Fundo -> Centro -> Frente)
    // --------------------------------------------------

    // Membros do fundo (mais escuros para dar profundidade)
    gl.vertexAttrib3f(colorLocation, 0.15, 0.15, 0.15);
    gl.bufferData(gl.ARRAY_BUFFER, bracoTras, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.bufferData(gl.ARRAY_BUFFER, pernaTras, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bufferData(gl.ARRAY_BUFFER, peTras, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Tronco
    gl.vertexAttrib3f(colorLocation, 0.25, 0.25, 0.25);
    gl.bufferData(gl.ARRAY_BUFFER, corpoRobo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Cabeça
    gl.vertexAttrib3f(colorLocation, 0.5, 0.5, 0.5);
    gl.bufferData(gl.ARRAY_BUFFER, cabecaRobo, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Antena
    gl.bufferData(gl.ARRAY_BUFFER, baseAntena, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.vertexAttrib3f(colorLocation, 0.7, 0.7, 0.7);
    gl.bufferData(gl.ARRAY_BUFFER, caboAntena, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Boca e dentes (de perfil)
    gl.vertexAttrib3f(colorLocation, 0.7, 0.7, 0.0);
    gl.bufferData(gl.ARRAY_BUFFER, bocaLateral, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.vertexAttrib3f(colorLocation, 0.9, 0.9, 0.0);
    gl.bufferData(gl.ARRAY_BUFFER, dente1, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
    gl.bufferData(gl.ARRAY_BUFFER, dente2, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    // Olho
    gl.vertexAttrib3f(colorLocation, 1.0, 1.0, 1.0);
    gl.bufferData(gl.ARRAY_BUFFER, olhoLateral, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 42);

    // Membros da frente (iluminados normalmente)
    gl.vertexAttrib3f(colorLocation, 0.25, 0.25, 0.25);
    gl.bufferData(gl.ARRAY_BUFFER, pernaFrente, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.bufferData(gl.ARRAY_BUFFER, peFrente, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.vertexAttrib3f(colorLocation, 0.35, 0.35, 0.35);
    gl.bufferData(gl.ARRAY_BUFFER, bracoFrente, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
})();