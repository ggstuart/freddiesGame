import { canvasBuffer, device, format } from "../setup.js";
import { module } from "../shader.js";

export const maxEnemys = 50;

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
