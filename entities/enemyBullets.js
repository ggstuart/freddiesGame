import { canvasBuffer, device, format } from "../setup.js";
import { module } from "../shader.js";

export const maxEnemyBullets = 50;

export const enemyBulletsPipeline = device.createRenderPipeline({
    label: "enemyBullets pipeline",
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


let enemyBulletvertices = new Float32Array([
    0.0, 0.01,      // top middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01,    // bottom right
    0.0, -0.03,     // bottom middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01     // bottom right
])
export const enemyBulletVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: enemyBulletvertices.byteLength
})
device.queue.writeBuffer(enemyBulletVertexBuffer, 0, enemyBulletvertices);


// export const enemyBulletXY = new Float32Array([0, 0]);
export const enemyBulletXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: maxenemyBullets * 8 * Float32Array.BYTES_PER_ELEMENT
})

export const enemyBulletBindGroup = device.createBindGroup({
  layout: enemyBulletsPipeline.getBindGroupLayout(0),
    entries: [
        { binding: 0, resource: { buffer: enemyBulletXYBuffer} },
        { binding: 1, resource: { buffer: canvasBuffer } }
    ],
});
