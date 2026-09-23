(() => {
    const canvas = document.getElementById("robot2");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        throw new Error("WebGL 2 não é suportado.");
    }

    // --- Funções geradoras de geometria local ---
    // Cria retângulo centrado ou com pivô no topo
    function makeBox(w, h, pivotX = 0.5, pivotY = 0.5) {
        const x1 = -w * pivotX;
        const y1 = -h * (1.0 - pivotY);
        const x2 = w * (1.0 - pivotX);
        const y2 = h * pivotY;
        return new Float32Array([
            x1, y2,
            x2, y2,
            x2, y1,
            x1, y1
        ]);
    }

    function makeCircle(raio, segmentos) {
        const vertices = [0, 0];
        for (let i = 0; i <= segmentos; i++) {
            const angulo = (i * 2 * Math.PI) / segmentos;
            vertices.push(raio * Math.cos(angulo), raio * Math.sin(angulo));
        }
        return new Float32Array(vertices);
    }

    // --- Geometrias do Robô de Perfil ---
    // Dimensões proporcionais para visão lateral
    const geomCabeca = makeBox(0.40, 0.45);
    const geomCorpo = makeBox(0.36, 0.55);

    // Membros com pivô (0.5, 1.0) no topo para facilitar a rotação/articulação
    const geomBraco = makeBox(0.12, 0.45, 0.5, 1.0);
    const geomPerna = makeBox(0.14, 0.45, 0.5, 1.0);
    const geomPe = makeBox(0.20, 0.08, 0.3, 1.0); // sapato estendido para a frente

    const geomBaseAntena = makeBox(0.12, 0.08);
    const geomCaboAntena = makeBox(0.04, 0.20);
    const geomOlho = makeCircle(0.065, 32);
    const geomBocaLateral = makeBox(0.06, 0.08);

    // --- Shaders com Matriz de Transformação 3x3 ---
    const vertexShaderSource = `#version 300 es
    in vec2 aPosition;
    uniform mat3 uMatrix;

    void main() {
        vec3 pos = uMatrix * vec3(aPosition, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
    }
    `;

    const fragmentShaderSource = `#version 300 es
    precision mediump float;
    uniform vec3 uColor;
    out vec4 outColor;

    void main() {
        outColor = vec4(uColor, 1.0);
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

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const matrixLocation = gl.getUniformLocation(program, "uMatrix");
    const colorLocation = gl.getUniformLocation(program, "uColor");

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // --- Funções utilitárias de Matrizes 2D ---
    function mult(a, b) {
        const out = new Float32Array(9);
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                out[r * 3 + c] =
                    a[r * 3 + 0] * b[0 * 3 + c] +
                    a[r * 3 + 1] * b[1 * 3 + c] +
                    a[r * 3 + 2] * b[2 * 3 + c];
            }
        }
        return out;
    }

    function translation(tx, ty) {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ]);
    }

    function rotation(angRad) {
        const c = Math.cos(angRad);
        const s = Math.sin(angRad);
        return new Float32Array([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]);
    }

    function drawShape(geom, count, matrix, color, mode = gl.TRIANGLE_FAN) {
        gl.bufferData(gl.ARRAY_BUFFER, geom, gl.DYNAMIC_DRAW);
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        gl.uniform3fv(colorLocation, color);
        gl.drawArrays(mode, 0, count);
    }

    // --- Loop de Animação ---
    let startTime = performance.now();

    function render() {
        const time = (performance.now() - startTime) * 0.005;

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        // Oscilações da caminhada
        const walkAngle = Math.sin(time) * 0.45; // amplitude das pernas e braços
        const bobbing = Math.abs(Math.sin(time * 2)) * 0.03; // pequeno quique vertical

        // Cores (paleta original mantida, com sombras para membros esquerdos/fundo)
        const corCabeca = [0.5, 0.5, 0.5];
        const corCorpo = [0.25, 0.25, 0.25];
        const corBracoFrente = [0.35, 0.35, 0.35];
        const corBracoFundo = [0.20, 0.20, 0.20]; // mais escuro por estar atrás
        const corPernaFrente = [0.25, 0.25, 0.25];
        const corPernaFundo = [0.15, 0.15, 0.15];
        const corBoca = [0.7, 0.7, 0.0];
        const corOlho = [1.0, 1.0, 1.0];

        // 1. BRAÇO DE FUNDO (Esquerdo)
        let mBracoFundo = translation(-0.02, 0.02 + bobbing);
        mBracoFundo = mult(mBracoFundo, rotation(-walkAngle));
        drawShape(geomBraco, 4, mBracoFundo, corBracoFundo);

        // 2. PERNA DE FUNDO (Esquerda)
        let mPernaFundo = translation(0.0, -0.3 + bobbing);
        mPernaFundo = mult(mPernaFundo, rotation(-walkAngle));
        drawShape(geomPerna, 4, mPernaFundo, corPernaFundo);
        // Pé de fundo
        let mPeFundo = mult(mPernaFundo, translation(0.04, -0.45));
        drawShape(geomPe, 4, mPeFundo, corPernaFundo);

        // 3. CORPO
        let mCorpo = translation(0.0, -0.05 + bobbing);
        drawShape(geomCorpo, 4, mCorpo, corCorpo);

        // 4. CABEÇA E DETALHES
        let mCabeca = translation(0.02, 0.38 + bobbing);
        drawShape(geomCabeca, 4, mCabeca, corCabeca);

        // Olho (Deslocado para o lado direito da face)
        let mOlho = mult(mCabeca, translation(0.10, 0.08));
        drawShape(geomOlho, 34, mOlho, corOlho);

        // Boca / Grade (Na lateral frontal inferior)
        let mBoca = mult(mCabeca, translation(0.18, -0.12));
        drawShape(geomBocaLateral, 4, mBoca, corBoca);

        // Antena
        let mBaseAntena = mult(mCabeca, translation(-0.02, 0.26));
        drawShape(geomBaseAntena, 4, mBaseAntena, [0.5, 0.5, 0.5]);

        let mCaboAntena = mult(mCabeca, translation(-0.02, 0.38));
        drawShape(geomCaboAntena, 4, mCaboAntena, [0.7, 0.7, 0.7]);

        // 5. PERNA DA FRENTE (Direita)
        let mPernaFrente = translation(0.0, -0.3 + bobbing);
        mPernaFrente = mult(mPernaFrente, rotation(walkAngle));
        drawShape(geomPerna, 4, mPernaFrente, corPernaFrente);
        // Pé da frente
        let mPeFrente = mult(mPernaFrente, translation(0.04, -0.45));
        drawShape(geomPe, 4, mPeFrente, corPernaFrente);

        // 6. BRAÇO DA FRENTE (Direito)
        let mBracoFrente = translation(0.02, 0.02 + bobbing);
        mBracoFrente = mult(mBracoFrente, rotation(walkAngle));
        drawShape(geomBraco, 4, mBracoFrente, corBracoFrente);

        requestAnimationFrame(render);
    }

    render();
})();