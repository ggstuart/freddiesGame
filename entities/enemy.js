import { canvasBuffer, device, format } from "../setup.js";
import { module } from "../shader.js";
import { Bullet } from "./bullets.js";

export const maxEnemys = 150;

export const enemysPipeline = device.createRenderPipeline({
    label: "enemys pipeline",
    layout: 'auto',
    vertex: {
        entryPoint: 'vsEntity',
        module,
        buffers: [
            {
                arrayStride: 8,
                attributes: [
                    {shaderLocation: 0, offset: 0, format: "float32x2"}
                ]
            }
        ]
    },
    fragment: {
        entryPoint: 'fsEntity',
        module,
        targets: [{ format }],
     },
})


let enemyvertices = new Float32Array([
    0.05, 0.05,      // top middle
    -0.05, 0.05,   // bottom left
    0.05, -0.05,    // bottom right
    0.05, -0.05,     // bottom middle
    -0.05, -0.05,   // bottom left
    -0.05, 0.05     // bottom right
])
export const enemyVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: enemyvertices.byteLength * 3
})
device.queue.writeBuffer(enemyVertexBuffer, 0, enemyvertices);


// export const enemyXY = new Float32Array([0, 0]);
export const enemyXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: maxEnemys * 8 * Float32Array.BYTES_PER_ELEMENT
})

export const enemyBindGroup = device.createBindGroup({
    layout: enemysPipeline.getBindGroupLayout(0),
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
        this.shootCooldown = shootCooldown;
        this.timeToShoot = this.shootCooldown * Math.random();
    }

    update(deltaTime) { 
        if (this.x < -1 || this.x > 1) {
            this.xSpeed *= -1;
        }
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