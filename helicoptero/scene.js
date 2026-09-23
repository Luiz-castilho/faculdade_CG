// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Figura que será exibida
        this.helicopterBody = new HelicopterBody();
        this.helicopterTopShaft = new HelicopterTopShaft();
        this.helicopterTail = new HelicopterTail();
        this.helicopterPropellers = new HelicopterPropellers();
        this.helicopterTailPropeller = new HelicopterTailPropeller();

        this.theta = 0.0;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotationY = 0; // 0 = Direita, Math.PI = Esquerda
    }

    move(dx, dy, dz = 0) {
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;
    }

    setDirection(dir) {
        if (dir === "left") {
            this.rotationY = Math.PI; // Roda 180° no eixo Y para a esquerda
        } else if (dir === "right") {
            this.rotationY = 0; // Roda para 0° (direita)
        }
    }

    update() {
        this.theta += 0.01;

        // Translação + Rotação de Orientação/Sentido
        let globalTranslation = m4.translation(
            this.position.x,
            this.position.y,
            this.position.z
        );
        let baseMatrix = m4.multiply(
            globalTranslation,
            m4.yRotation(this.rotationY)
        );

        // Corpo e cauda acompanham a matriz base
        this.helicopterBody.update(baseMatrix);
        this.helicopterTail.update(baseMatrix);

        // Haste e hélices combinam a matriz base com a rotação das pás (theta)
        this.helicopterTopShaft.update(
            m4.multiply(baseMatrix, m4.yRotation(this.theta))
        );

        this.helicopterPropellers.update(
            m4.multiply(baseMatrix, m4.yRotation(this.theta))
        );

        // Transformação local da hélice traseira + matriz base
        let t1 = m4.translation(-0.70, 0, -0.06);
        let r = m4.zRotation(this.theta);
        let t2 = m4.translation(0.70, 0, 0.06);
        let localTransform = m4.multiply(t2, m4.multiply(r, t1));

        this.helicopterTailPropeller.update(
            m4.multiply(baseMatrix, localTransform)
        );
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}