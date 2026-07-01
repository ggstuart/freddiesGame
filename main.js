import { device, format, context } from "./setup.js";
import { module } from "./shader.js";
import { enemysPipeline, enemyBindGroup, enemyVertexBuffer, enemyXYBuffer } from "./entities/enemy.js";
import { playerPipeline, playerVertexBuffer, playerBindGroup, playerXY, playerXYBuffer, playerVertices } from "./entities/player.js";
import { maxBullets, bulletsPipeline, bulletVertexBuffer, bulletBindGroup, bulletXYBuffer } from "./entities/bullets.js";

function randomEnemy() {
    return {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
    }
}

function makeEntityData(x, y, color) {
    return [x, y, 0, 0, ...color];
}

const player = {
    x: 0,
    y: -1,
    left: false,
    right: false,
    speed: 1
}


let shoot = false;
const bulletSpeed = 2;
const nEnemies = 5;
let bullets = [];
let enemies = Array.from({length: nEnemies}, () => randomEnemy())
let enemySpeed = 0
let enemyHP = 1

console.log(enemies);


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

function update(deltaTime) { 
    // console.log(deltaTime);
    
    player.x += (player.right - player.left) * player.speed * deltaTime;
    bullets = bullets.filter(b => b[1] < 1).map(b => [b[0], b[1] + bulletSpeed * deltaTime]);
    const playerXY = new Float32Array(makeEntityData(player.x, player.y, [0.2, 0.2, 1, 1]));
    const bulletXY = new Float32Array(bullets.flatMap(([x, y]) => makeEntityData(x, y, [1, 1, 0, 1])));
    const enemyXY = new Float32Array(enemies.flatMap(e => makeEntityData(e.x, e.y, [1, 0, 0, 1])));
    device.queue.writeBuffer(bulletXYBuffer, 0, bulletXY);
    device.queue.writeBuffer(playerXYBuffer, 0, playerXY);
    device.queue.writeBuffer(enemyXYBuffer, 0, enemyXY);
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
    if (enemies.length) {
        
        pass.setPipeline(enemysPipeline);
        pass.setVertexBuffer(0, enemyVertexBuffer);
        pass.setBindGroup(0, enemyBindGroup);
        pass.draw(6, enemies.length)
    }


    // player
    pass.setPipeline(playerPipeline);
    pass.setVertexBuffer(0, playerVertexBuffer);
    pass.setBindGroup(0, playerBindGroup);
    pass.draw(playerVertices.byteLength / 8, 1);


    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}

let p;
function frame(ts) { 
    const deltaTime = ts - p || 0; 
    p = ts;
    update(deltaTime / 1000);
    render();
    requestAnimationFrame(frame);
}

frame();