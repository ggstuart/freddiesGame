import { device, format } from "./setup.js";
import { module } from "./shader.js";

export const bulletsPipeline = device.createRenderPipeline({
    label: "bullets pipeline",
    layout: 'auto',
    vertex: {
        entryPoint: 'vsBullets',
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
        entryPoint: 'fsBullet',
        module,
        targets: [{ format }],
     },
})


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


export const bulletXY = new Float32Array([0, 0]);
export const bulletXYBuffer = device.createBuffer({
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: bulletXY.byteLength * 50
})

export const bulletBindGroup = device.createBindGroup({
  layout: bulletsPipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: {
      buffer: bulletXYBuffer
    },
  }],
});
