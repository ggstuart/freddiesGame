import { pipeline } from "../pipeline.js";
import { canvasBuffer, device } from "../setup.js";

export const maxBullets = 3000;

let bulletvertices = new Float32Array([
    0.0, 0.01,      // top middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01,    // bottom right
    0.0, -0.03,     // bottom middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01     // bottom right
])
export const bulletVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: bulletvertices.byteLength
})
device.queue.writeBuffer(bulletVertexBuffer, 0, bulletvertices);

export const bulletXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: maxBullets * 8 * Float32Array.BYTES_PER_ELEMENT
})

export const bulletBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: bulletXYBuffer } },
        { binding: 1, resource: { buffer: canvasBuffer } }
    ],
});


export class Bullet {
    constructor(x, y, ySpeed) {
        this.x = x;
        this.y = y;
        this.ySpeed = ySpeed;
        this.radius = 0.02;
        this.alive = true;
    }

    update(deltaTime) { 
        this.y += this.ySpeed * deltaTime;
    }
}
