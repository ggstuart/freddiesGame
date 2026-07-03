import { canvasBuffer, device } from "../setup.js";
// import { module } from "../shader.js";
import { pipeline } from "../pipeline.js";
import { Bullet } from "./bullets.js";

export const maxEnemys = 150;

const enemyVertices = new Float32Array([
    -0.025, 0.05,
    0.025, 0.05,
    0.0, 0.1,
    -0.05, 0.0,
    -0.025, 0.05,
    0.0, 0.0,
    0.0, 0.0,
    0.05, 0.0,
    0.025, 0.05,
]);

export const enemyVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: enemyVertices.byteLength,
});
device.queue.writeBuffer(enemyVertexBuffer, 0, enemyVertices);


// export const enemyXY = new Float32Array([0, 0]);
export const enemyXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: maxEnemys * 8 * Float32Array.BYTES_PER_ELEMENT
})

export const enemyBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: enemyXYBuffer} },
        { binding: 1, resource: { buffer: canvasBuffer } }
    ],
});


export class Enemy {
    constructor(x, y, maxSpeed, shootCooldown=2) {
        this.x = x;
        this.y = y;
        this.xSpeed = (Math.random() * 2 - 1) * maxSpeed;
        this.alive = true;
        this.bulletSpeed = -1;
        this.radius = 0.025;
        this.shootCooldown = shootCooldown;
        this.timeToShoot = this.shootCooldown * Math.random();
    }

    get leftEdge() { 
        return this.x - this.radius;
    }
    set leftEdge(newValue) {
        this.x = newValue + this.radius;
    }

    get rightEdge() { 
        return this.x + this.radius;
    }
    set rightEdge(newValue) {
        this.x = newValue - this.radius;
    }

    update(deltaTime) { 
        const hitLeft = this.leftEdge < -1;
        const hitRight = this.rightEdge > 1;
        if (hitLeft || hitRight) {
            this.xSpeed *= -1;
            this.y -= this.radius * 2;
        }
        if (hitLeft) this.leftEdge = -1;
        if (hitRight) this.rightEdge = 1;
        this.timeToShoot -= deltaTime;
        this.x += this.xSpeed * deltaTime;
    }

    spawnBullet() {
        this.timeToShoot = this.shootCooldown;
        return new Bullet(this.x, this.y, this.bulletSpeed);
    }

    get readyToShoot() { 
        return this.timeToShoot <= 0;
    }


    // get alive() { 
    //     return health > 0;
    // }
}

export function randomEnemy(maxEnemySpeed) {
    const x = Math.random() * 2 - 1;
    const y = 0.15 + Math.random() * 0.85;
    return new Enemy(x, y, maxEnemySpeed);

}