import { device, format, context } from "./setup.js";
import { module } from "./shader.js";

import { playerPipeline, playerVertexBuffer, playerBindGroup, playerXY, playerXYBuffer } from "./player.js";
import { bulletsPipeline, bulletVertexBuffer, bulletBindGroup, bulletXY, bulletXYBuffer } from "./bullets.js";

let x = 0;
let y = -1;
let left = false;
let right = false;
let shoot = false;
const speed = 0.02;
const bulletSpeed = 0.01;
let bullets = [];
const maxBullets = 50;

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
    x += (right - left) * speed;
    if (shoot && bullets.length < maxBullets) { 
        bullets.push([x, y+0.2]);
    }
    bullets = bullets.filter(b => b[1] < 1).map(b => [b[0], b[1] + bulletSpeed]);
    const playerXY = new Float32Array([x, y]);
    const bulletXY = new Float32Array(bullets.flat());
    device.queue.writeBuffer(bulletXYBuffer, 0, bulletXY);
    device.queue.writeBuffer(playerXYBuffer, 0, playerXY);
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

    // // bullets
    if (bullets.length) {   
        console.log("!!");
        
        pass.setPipeline(bulletsPipeline);
        pass.setVertexBuffer(0, bulletVertexBuffer);
        pass.setBindGroup(0, bulletBindGroup);
        pass.draw(3, bullets.length);  // call our vertex shader 3 times
    }

    // player
    pass.setPipeline(playerPipeline);
    pass.setVertexBuffer(0, playerVertexBuffer);
    pass.setBindGroup(0, playerBindGroup);
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