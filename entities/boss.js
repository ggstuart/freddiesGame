import { canvasBuffer, device } from "../setup.js";
// import { module } from "../shader.js";
import { pipeline } from "../pipeline.js";
import { Bullet } from "./bullets.js";

const bossVertices = new Float32Array([
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

export const bossVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: bossVertices.byteLength,
});
device.queue.writeBuffer(bossVertexBuffer, 0, bossVertices);


// export const bossXY = new Float32Array([0, 0]);
export const bossXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: 100 * 8 * Float32Array.BYTES_PER_ELEMENT
})

export const bossBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: bossXYBuffer} },
        { binding: 1, resource: { buffer: canvasBuffer } }
    ],
});

export class Boss {
    constructor(x, y, shootCooldown=0.15) {
        this.x = x;
        this.y = y;
        this.xSpeed = Math.random() + 1;
        this.bulletSpeed = -1;
        this.radius = 0.05;
        this.HP = 5;
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


    get alive() { 
        return this.HP > 0;
    }
}

export function bossSpawner() {
    const x = 0;
    const y = 0.5;
    return new Boss(x, y);

}