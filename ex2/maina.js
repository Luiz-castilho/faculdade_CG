const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });


if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const canvasCoordinates = document.getElementById('canvasCoordinates');
const webglCoordinates = document.getElementById('webglCoordinates');
const colorBox = document.getElementById('colorBox');
const ColorName = document.getElemetById('ColorName');


let verices = new Float32Array([0.0, 0.0]);
let colors = new Float32Array([
    1.0, 1.0, 1.0
]);

let pointSizes = new Float32Array([10.0]);
let pointSizes_aux = 10.0;


const verticesBuffer = gl.createBuffer();
const colorsBuffer = gl.createBuffer();
const pointSizesBuffer = gl.createBuffer();


canvas.addEventListener()
let pontos = [];
let pontoInicial = 0.0;
let pontoFinal = 0.0;






function Bresenham(x1, y1, x2, y2, colors) {
    dx = x1 - x2;
    dy = y2 - y1;
    p = 2 * dy - dx;
    incInf = 2 * dy;
    incSup = 2 * (dy - dx);
    x = x1;
    y = y1;
    //escrever no pixel
    while (x < x2) {
        if (p < 0) {
            p = p + incInf;

        }
        else {
            p = p + incSup;
            y++;
        }
        x++;
        //escreve no pixel
    }

}


}






//teclado
function keyboardClick(event) {

    switch (event.key) {
        case "ArrowUp":
            pointSizes_aux += 5.0;
            pointSizes = new Float32Array([pointSizes_aux])
            break;
        case "ArrowDown":
            pointSizes_aux -= 5.0;
            if (pointSizes_aux < 1.0) {
                pointSizes_aux = 1.0;
            }
            pointSizes = new Float32Array([pointSizes_aux])
            break;
        case "r":
            func_type = "reta"
            break;
        case "t":
            func_type = "triangulo"
            break;

        case "0":
            colors = new Float32Array([
                1.0, 1.0, 1.0
            ]);
            colorBox.style.backgroundColor = "white";
            break;

        case "1":
            colors = new Float32Array([
                1.0, 0.0, 0.0
            ]);
            colorBox.style.backgroundColor = "red";
            break;

        case "2":
            colors = new Float32Array([
                0.0, 1.0, 0.0
            ]);
            colorBox.style.backgroundColor = "green";
            break;

        case "3":
            colors = new Float32Array([
                0.0, 0.0, 1.0
            ]);
            colorBox.style.backgroundColor = "blue";
            break;

        case "4":
            colors = new Float32Array([
                1.0, 1.0, 0.0
            ]);
            colorBox.style.backgroundColor = "yellow";
            break;

        case "5":
            colors = new Float32Array([
                1.0, 0.0, 1.0
            ]);
            colorBox.style.backgroundColor = "magenta";
            break;

        case "6":
            colors = new Float32Array([
                0.0, 1.0, 1.0
            ]);
            colorBox.style.backgroundColor = "cyan";
            break;

        case "7":
            colors = new Float32Array([
                1.0, 0.5, 0.0
            ]);
            colorBox.style.backgroundColor = "orange";
            break;

        case "8":
            colors = new Float32Array([
                0.5, 0.0, 1.0
            ]);
            colorBox.style.backgroundColor = "purple";
            break;

        case "9":
            colors = new Float32Array([
                1.0, 0.4, 0.7
            ]);
            colorBox.style.backgroundColor = "pink";
            break;

        default:
            return;
    }
}

//atualiza cores
gl.bindBuffer(
    gl.ARRAY_BUFFER,
    colorsBuffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);


