import { device, format } from "../setup.js";
import { module } from "../shader.js";

export const maxEnemys = 50;

export const enemysPipeline = device.createRenderPipeline({
    label: "enemys pipeline",
    layout: 'auto',
    vertex: {
        entryPoint: 'vsEnemys',
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
        entryPoint: 'fsEnemy',
        module,
        targets: [{ format }],
     },
})


let enemyvertices = new Float32Array([
    0.0, 0.01,      // top middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01,    // bottom right
    0.0, -0.03,     // bottom middle
    -0.01, -0.01,   // bottom left
    0.01, -0.01     // bottom right
])
export const enemyVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: enemyvertices.byteLength
})
device.queue.writeBuffer(enemyVertexBuffer, 0, enemyvertices);


// export const enemyXY = new Float32Array([0, 0]);
export const enemyXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: new Float32Array([0, 0]).byteLength
})

export const enemyBindGroup = device.createBindGroup({
  layout: enemysPipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: {
      buffer: enemyXYBuffer
    },
  }],
});
