import { device, format, context } from "./setup.js";
import { module } from "./shader.js";

const pipeline = device.createRenderPipeline({
    label: "player pipeline",
    layout: 'auto',
    vertex: {
        entryPoint: 'vs',
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
        entryPoint: 'fs',
        module,
        targets: [{ format }],
     },
})

const playerVertices = new Float32Array([0.0, 0.2, -0.1, 0.0, 0.1, 0.0]);
const playerVertexBuffer = device.createBuffer({
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  size: playerVertices.byteLength
})
device.queue.writeBuffer(playerVertexBuffer, 0, playerVertices);


const playerXY = new Float32Array([0, 0]);
const playerBuffer = device.createBuffer({
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    size: playerXY.byteLength
})

let bulletvertices = new Float32Array([0.0, 0.01, -0.01, -0.01, 0.01, -0.01])
const bulletVertexBuffer = device.createBuffer({
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    size: bulletvertices.byteLength
})
device.queue.writeBuffer(bulletVertexBuffer, 0, bulletvertices);

const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: {
      buffer: playerBuffer
    },
  }],
});


let x = 0;
let y = -1;
let left = false;
let right = false;
let shoot = false;
const speed = 0.02;

window.addEventListener('keydown', ev => { 
    if (ev.key == "a") left = true;
    if (ev.key == "d") right = true;
    if (ev.key == " ") shoot = true;
})

window.addEventListener('keyup', ev => { 
    if (ev.key == "a") left = false;
    if (ev.key == "d") right = false;
    if (ev.key == " ") shoot = false;
})



function update() { 
    // event handlers edit the player location in playerXY
    x += (right - left) * speed;
    const playerXY = new Float32Array([x, y]);
    device.queue.writeBuffer(playerBuffer, 0, playerXY);
}

export function render() {

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our encoder' });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass({
        label: 'basic canvas renderPass',
        colorAttachments: [
            {
                clearValue: [0.1, 0.1, 0.1, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: context.getCurrentTexture().createView()
            },
        ],
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, playerVertexBuffer);
    // pass.setVertexBuffer(0, bulletVertexBuffer)
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);  // call our vertex shader 3 times
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}

function frame() { 
    update();
    render();
    requestAnimationFrame(frame);
}

frame();