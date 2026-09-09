const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
    alert('WebGL não suportado!');
}

// Shaders básicos para desenhar pontos coloridos
const vsSource = `
            attribute vec2 aPosition;
            void main() {
                // Converter coordenadas de pixel (0 a largura/altura) para NDC (-1 a 1)
                float x = (aPosition.x / ${canvas.width}.0) * 2.0 - 1.0;
                float y = 1.0 - (aPosition.y / ${canvas.height}.0) * 2.0;
                gl_Position = vec4(x, y, 0.0, 1.0);
                gl_PointSize = 2.0; // Tamanho do pixel renderizado
            }
        `;

const fsSource = `
            precision mediump float;
            uniform vec3 uColor;
            void main() {
                gl_FragColor = vec4(uColor, 1.0);
            }
        `;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, createShader(gl, gl.VERTEX_SHADER, vsSource));
gl.attachShader(shaderProgram, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const positionBuffer = gl.createBuffer();
const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");
const uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");

// --- 2. CORES E ESTADOS ---
const colors = [
    [0.0, 0.0, 1.0], // 0: Azul
    [1.0, 1.0, 1.0], // 1: Branco
    [1.0, 0.0, 0.0], // 2: Vermelho
    [0.0, 1.0, 0.0], // 3: Verde
    [1.0, 1.0, 0.0], // 4: Amarelo
    [1.0, 0.5, 0.0], // 5: Laranja
    [0.5, 0.0, 0.5], // 6: Roxo
    [0.0, 1.0, 1.0], // 7: Ciano
    [1.0, 0.75, 0.8],// 8: Rosa
    [0.5, 0.5, 0.5]  // 9: Cinza
];

let currentColorIndex = 0;
let mode = 'R'; // 'R' para Reta, 'T' para Triângulo
let clicks = [];
let currentGeometry = []; // Armazena os pontos da figura atual

// --- 3. ALGORITMO DE BRESENHAM (RETAS) ---
function bresenhamLine(x0, y0, x1, y1) {
    let points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        points.push(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return points;
}

// --- 4. RENDERIZAÇÃO ---
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (currentGeometry.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(currentGeometry), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

        let rgb = colors[currentColorIndex];
        gl.uniform3f(uColorLocation, rgb[0], rgb[1], rgb[2]);

        // Desenha os pixels acumulados via Bresenham
        gl.drawArrays(gl.POINTS, 0, currentGeometry.length / 2);
    }
}

// --- 5. EVENTOS DE ENTRADA ---
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'R' || key === 'T') {
        mode = key;
        clicks = [];
        document.getElementById('info').innerHTML = `Modo atual: <b>${mode === 'R' ? 'Linha (R)' : 'Triângulo (T)'}</b> | Cor: <span id="colorBox" style="display:inline-block;width:12px;height:12px;background:rgb(${colors[currentColorIndex].map(v => v * 255).join(',')});"></span> | Teclas 0-9 para cor, R para Reta, T para Triângulo`;
    }

    if (!isNaN(e.key)) {
        currentColorIndex = parseInt(e.key);
        render();
        // Atualiza cor visual no HTML
        document.getElementById('colorBox').style.backgroundColor = `rgb(${colors[currentColorIndex].map(v => v * 255).join(',')})`;
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    clicks.push({ x, y });

    if (mode === 'R') {
        if (clicks.length === 2) {
            currentGeometry = bresenhamLine(clicks[0].x, clicks[0].y, clicks[1].x, clicks[1].y);
            clicks = []; // Reseta para o próximo desenho
            render();
        }
    } else if (mode === 'T') {
        if (clicks.length === 3) {
            // Triângulo formado por 3 linhas usando Bresenham
            let p1 = bresenhamLine(clicks[0].x, clicks[0].y, clicks[1].x, clicks[1].y);
            let p2 = bresenhamLine(clicks[1].x, clicks[1].y, clicks[2].x, clicks[2].y);
            let p3 = bresenhamLine(clicks[2].x, clicks[2].y, clicks[0].x, clicks[0].y);

            currentGeometry = [...p1, ...p2, ...p3];
            clicks = [];
            render();
        }
    }
});

// Inicialização: Linha inicial azul nas coordenadas (0,0) a (0,0) (ou ponto inicial)
currentGeometry = bresenhamLine(0, 0, 0, 0);
render();