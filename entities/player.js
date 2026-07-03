import { canvasBuffer, device } from "../setup.js";
import { Bullet } from "./bullets.js";
import { pipeline } from "../pipeline.js";

export const playerVertices = new Float32Array([
  0.0, 0.075,
  -0.1, 0.0,
  0.1, 0.0,
  0.1, 0.0,
  0.05 , 0.125,
  0.0, 0.075,
  -0.1, 0.0,
  -0.05 , 0.125,
  0.0, 0.075



]);
export const playerVertexBuffer = device.createBuffer({
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  size: playerVertices.byteLength
})
device.queue.writeBuffer(playerVertexBuffer, 0, playerVertices);


export const playerXY = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0]);
export const playerXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: playerXY.byteLength
})
device.queue.writeBuffer(playerXYBuffer, 0, playerXY);

export const playerBindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: playerXYBuffer} },
        { binding: 1, resource: { buffer: canvasBuffer } }
    ],
});

export class Player {
    constructor(shootCooldown = 0.05) { 
        this.x = 0;
        this.y = -1;
        this.left = false;
        this.right = false;
        this.shoot = false;
        this.radius = 0.035
        this.speed = 1;
        this.bulletSpeed = 2;
        this.shootCooldown = shootCooldown;
        this.timeToShoot = this.shootCooldown * Math.random();
    }

    update(deltaTime) { 
        this.x += (this.right - this.left) * this.speed * deltaTime;
    
        //PAC-MAN
        if (1 <= this.x || this.x <= -1) {
            this.x *= -0.99
        }
        this.timeToShoot -= deltaTime;
    }


    spawnBullet() { 
        this.timeToShoot = this.shootCooldown;
        return new Bullet(this.x, this.y, this.bulletSpeed);
    }

    get readyToShoot() { 
        return this.timeToShoot <= 0;
    }
}
