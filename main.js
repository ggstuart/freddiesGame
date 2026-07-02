import { device, format, context, canvas, canvasBuffer } from "./setup.js";
import { module } from "./shader.js";
import { enemyBindGroup, enemyVertexBuffer, enemyXYBuffer, randomEnemy, Enemy } from "./entities/enemy.js";
import { playerVertexBuffer, playerBindGroup, playerXY, playerXYBuffer, playerVertices, Player } from "./entities/player.js";
import { maxBullets, bulletVertexBuffer, bulletBindGroup, bulletXYBuffer } from "./entities/bullets.js";
import { pipeline } from "./pipeline.js";
import { bossBindGroup, bossSpawner, bossVertexBuffer, bossXYBuffer } from "./entities/boss.js";

function gameOver() {
    enemies = []
    bosses = []
    wave = 0
    maxEnemySpeed = 1
    player.x = 0
    updateWaveDisplay();
}

function makeEntityData(x, y, color) {
    return [x, y, 0, 0, ...color];
}

function updateWaveDisplay() {
    const waveIndicator = document.getElementById('wave-indicator');
    if (waveIndicator) {
        waveIndicator.textContent = `Wave ${wave}`;
    }
}

function spawnEnemy() {  
    enemies.push(randomEnemy(maxEnemySpeed));
}

let int;
function spawnWave(wave) {
    bullets = [];
    if (wave % 5 == 0) {
        console.log("spawning boss");
        
        bosses = Array.from({length: wave / 5}, () => bossSpawner())
    } else {
        console.log("spawning enemies");

        enemies = Array.from({ length: wave * 2 }, () => randomEnemy(maxEnemySpeed))        
    }
}

function isColliding(object1, object2) {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    return Math.hypot(dx, dy) < object1.radius + object2.radius;
}

const player = new Player();

let maxEnemySpeed = 1;
let bullets = [];
let enemies = [];
let bosses = []
let wave = 0;
updateWaveDisplay();
// gameOver();

window.addEventListener('keydown', ev => { 
    if (ev.key.toLowerCase() == "a") player.left = true;
    if (ev.key.toLowerCase() == "d") player.right = true;
})

window.addEventListener('keyup', ev => { 
    if (ev.key.toLowerCase() == "a") player.left = false;
    if (ev.key.toLowerCase() == "d") player.right = false;
})
window.addEventListener('click', ev => {
    if (bullets.length < maxBullets && player.readyToShoot) { 
        bullets.push(player.spawnBullet());
    }
})

function update(deltaTime) { 
    // console.log(deltaTime);

    player.update(deltaTime);
    if (enemies.length == 0 && bosses.length == 0) {
        wave++;
        console.log(wave);
        updateWaveDisplay();
        spawnWave(wave);
    }

    bullets.forEach(bullet => bullet.update(deltaTime));
    bullets = bullets.filter(bullet => {
        return bullet.y < 1 && bullet.y > -1
    });        

    enemies.forEach(enemy => {
        enemy.update(deltaTime, canvas);
        if (enemy.y < -1) {
           gameOver()  
        }
        if (enemy.readyToShoot) {
            bullets.push(enemy.spawnBullet());
        }
    })

    bosses.forEach(boss => {
        boss.update(deltaTime, canvas);
        if (boss.y < -1) {
            gameOver()
        }
        if (boss.readyToShoot) {
            bullets.push(boss.spawnBullet());
        }
    })

    // collision
    for (const bullet of bullets) {
        if (isColliding(bullet, player) && bullet.ySpeed < 0) {
            gameOver();
            bullet.alive = false
            
        }
        for (const enemy of enemies) { 
            if (isColliding(bullet, enemy) && bullet.ySpeed > 0) {               
                bullet.alive = false;
                enemy.alive = false;
                maxEnemySpeed += 0.01;

                //score?
                //health?
            }
        }
        for (const boss of bosses) { 
            if (isColliding(bullet, boss) && bullet.ySpeed > 0) {               
                bullet.alive = false;
                boss.HP -= 1;
            }
        }
    }
    bullets = bullets.filter(bullet => bullet.alive);   
    enemies = enemies.filter(enemy => enemy.alive);   
    bosses = bosses.filter(boss => boss.alive);   

    const playerXY = new Float32Array(makeEntityData(player.x, player.y, [0.2, 0.2, 1, 1]));
    const bulletXY = new Float32Array(bullets.flatMap((b) => makeEntityData(b.x, b.y, [1, 1, 0, 1])));
    const enemyXY = new Float32Array(enemies.flatMap(e => makeEntityData(e.x, e.y, [1, 0, 0, 1])));
    const bossXY = new Float32Array(bosses.flatMap(e => makeEntityData(e.x, e.y, [0.7, 0.1, 0.25, 1])));
    device.queue.writeBuffer(bulletXYBuffer, 0, bulletXY);
    device.queue.writeBuffer(playerXYBuffer, 0, playerXY);
    device.queue.writeBuffer(enemyXYBuffer, 0, enemyXY);
    device.queue.writeBuffer(bossXYBuffer, 0, bossXY);
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
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, bulletVertexBuffer);
        pass.setBindGroup(0, bulletBindGroup);
        pass.draw(6, bullets.length);
    }

    //boss
    if (bosses.length) {
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, bossVertexBuffer);
        pass.setBindGroup(0, bossBindGroup);
        pass.draw(9, bosses.length);
    }    

    // enemy
    if (enemies.length) {
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, enemyVertexBuffer);
        pass.setBindGroup(0, enemyBindGroup);
        pass.draw(9, enemies.length);
    }

    // player
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, playerVertexBuffer);
    pass.setBindGroup(0, playerBindGroup);
    pass.draw(playerVertices.byteLength / 8, 1);

    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}

let p;
function frame(ts) { 
    // const deltaTime = ts - p || 0; 
    const deltaTime = Math.max(ts - p || 0, 1 / 30); 
    p = ts;
    update(deltaTime / 1000);
    render();
    requestAnimationFrame(frame);
}

frame();