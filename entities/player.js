import { device, format } from "../setup.js";
import { module } from "../shader.js";

export const playerPipeline = device.createRenderPipeline({
    label: "player pipeline",
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

export const playerVertices = new Float32Array([0.0, 0.2, -0.1, 0.0, 0.1, 0.0]);
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
  layout: playerPipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: {
      buffer: playerXYBuffer
    },
  }],
});
