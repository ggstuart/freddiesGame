import { device, format, context } from "./setup.js";
import { module } from "./shader.js";
import { enemysPipeline, enemyBindGroup, enemyVertexBuffer, enemyXYBuffer } from "./entities/enemy.js";
import { playerPipeline, playerVertexBuffer, playerBindGroup, playerXY, playerXYBuffer, playerVertices } from "./entities/player.js";
import { maxBullets, bulletsPipeline, bulletVertexBuffer, bulletBindGroup, bulletXYBuffer } from "./entities/bullets.js";

const player = {
    x: 0,
    y: -1,
    left: false,
    right: false
}

const enemy = {
    x: 0,
    y: 0.6,

}

let shoot = false;
const speed = 0.02;
const bulletSpeed = 0.0025;
let bullets = [];
let enemyArr = []

window.addEventListener('keydown', ev => { 
    if (ev.key == "a") player.left = true;
    if (ev.key == "d") player.right = true;
})

window.addEventListener('keyup', ev => { 
    if (ev.key == "a") player.left = false;
    if (ev.key == "d") player.right = false;
})
window.addEventListener('click', ev => {
    if (bullets.length < maxBullets) { 
        bullets.push([player.x, player.y+0.2]);
    }
})

function update() { 
    player.x += (player.right - player.left) * speed;
    bullets = bullets.filter(b => b[1] < 1).map(b => [b[0], b[1] + bulletSpeed]);
    enemyArr = enemyArr.map(b => b[1]  - enemySpeed * 2).map(b => [b[1] + enemySpeed, b[0]])
    const playerXY = new Float32Array([player.x, player.y]);
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

    // bullets
    if (bullets.length) {   
        
        pass.setPipeline(bulletsPipeline);
        pass.setVertexBuffer(0, bulletVertexBuffer);
        pass.setBindGroup(0, bulletBindGroup);
        pass.draw(6, bullets.length);  // call our vertex shader 3 times
    }

    // enemy



    // player
    pass.setPipeline(playerPipeline);
    pass.setVertexBuffer(0, playerVertexBuffer);
    pass.setBindGroup(0, playerBindGroup);
    pass.draw(playerVertices.byteLength / 8);  // call our vertex shader 3 times


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