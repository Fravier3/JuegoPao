import {STEP,TYPES,speedForScore,gapForScore,advancePlayer,jumpPlayer,collision} from './physics.js?v=moto-wheels-1';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),phone=$('phone');
const images={},bounds={"ride": [173, 21, 1268, 978], "jump": [190, 25, 1286, 987], "crash": [17, 228, 1507, 636]};
const cells=[[111,105,309,370],[550,137,443,338],[1080,249,397,226],[58,664,437,247],[556,674,480,244],[1150,565,289,356]];
let W=420,H=760,groundY=590,state='loading',score=0,best=0,oldBest=0,speed=245,distance=0,frame=0,nextSpawn=1.8,obstacles=[],clouds=[],stars=[],particles=[],toastTime=0,hitTime=0,lastTime=0,accumulator=0,buffer=0,wheelAngle=0,sound=false,audio;
try{best=Math.max(0,Number(localStorage.getItem('paolasMotoPreviewBest'))||0);}catch{}
const player={x:44,y:0,w:166,h:128,vy:0,onGround:true,jumpsUsed:0,hit:false};
function resize(){const r=phone.getBoundingClientRect(),old=groundY;W=r.width>r.height?Math.min(740,Math.max(420,360*r.width/r.height)):420;H=W*r.height/r.width;groundY=H*.78;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);player.y=state==='playing'||state==='paused'?player.y+groundY-old:groundY-player.h;clouds=Array.from({length:5},()=>({x:Math.random()*W,y:60+Math.random()*H*.24,s:28+Math.random()*34,v:.18+Math.random()*.3}));}
function show(id,visible){$(id).hidden=!visible;$(id).classList.toggle('hidden',!visible);}
function tone(freq,duration=.09){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.7,audio.currentTime+duration);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
function burst(x,y,color,n=7){for(let i=0;i<n;i++)particles.push({x,y,vx:-40-Math.random()*100,vy:-30-Math.random()*85,life:.45,max:.45,color});}
function reset(){oldBest=best;score=0;speed=245;distance=0;wheelAngle=0;frame=0;nextSpawn=1.8;obstacles=[];particles=[];buffer=0;hitTime=0;player.y=groundY-player.h;player.vy=0;player.onGround=true;player.jumpsUsed=0;player.hit=false;state='playing';canvas.focus();$('score').textContent='0';$('best').textContent=best;$('level').textContent='Ritmo tranquilo';$('speed').textContent='1.0×';$('tapHint').textContent='Toca para saltar · otro toque en el aire';$('toast').textContent='';toastTime=0;for(const id of ['startScreen','gameOverScreen','pauseScreen','artScreen'])show(id,false);$('pauseBtn').hidden=false;lastTime=0;accumulator=0;tone(400);}
function jump(){if(state!=='playing')return;if(jumpPlayer(player)){buffer=0;burst(player.x+40,groundY,'#fff3bd');tone(player.jumpsUsed===2?620:480);}else buffer=.1;}
function pause(){if(state==='playing'){state='paused';show('pauseScreen',true);$('pauseBtn').hidden=true;tone(260);}}
function resume(){if(state!=='paused')return;state='playing';show('pauseScreen',false);$('pauseBtn').hidden=false;lastTime=0;accumulator=0;buffer=0;}
function crash(){state='hit';player.hit=true;hitTime=1.6;$('pauseBtn').hidden=true;burst(player.x+60,groundY,'#ffd19c',14);tone(130,.25);$('tapHint').textContent='¡Un obstáculo en el camino!';}
function finish(){state='gameover';$('finalScore').textContent=score;$('finalBest').textContent=best;$('resultLabel').textContent=score>oldBest?'¡NUEVO RÉCORD!':'¡VAMOS OTRA VEZ!';$('resultMessage').textContent=score>oldBest?'Paola acaba de superar su mejor marca.':score>0?'Superaste '+score+' obstáculos. El próximo paseo puede ser aún mejor.':'Espera a que se acerque el obstáculo y toca para saltar.';show('gameOverScreen',true);$('tapHint').textContent='';}
function spawn(){const available=score<3?TYPES.filter(t=>t.kind!=='barrier'):TYPES;const t=available[Math.floor(Math.random()*available.length)];obstacles.push({...t,x:W+20,passed:false});nextSpawn=gapForScore(score);}
function update(dt){if(state==='playing'){
 frame+=dt*60;speed+=(speedForScore(score)-speed)*Math.min(1,dt*3);distance+=speed*dt;wheelAngle=(wheelAngle+speed/(178*player.w/bounds.ride[2])*dt)%(Math.PI*2);const wasGround=player.onGround;advancePlayer(player,groundY,dt);if(!wasGround&&player.onGround){burst(player.x+35,groundY,'#fce6b8',5);if(buffer>0)jump();}buffer=Math.max(0,buffer-dt);
 nextSpawn-=dt;if(nextSpawn<=0)spawn();for(const o of obstacles)o.x-=speed*dt;
 // Check a collision before crediting any successful clearance in this step.
 if(obstacles.some(o=>collision(player,o,groundY))){crash();}else for(const o of obstacles){if(!o.passed&&o.x+o.w<player.x+18){o.passed=true;score++;$('score').textContent=score;if(score>best){best=score;$('best').textContent=best;try{localStorage.setItem('paolasMotoPreviewBest',String(best));}catch{}}tone(800,.065);$('speed').textContent=(speedForScore(score)/245).toFixed(1)+'×';$('level').textContent=score<5?'Ritmo tranquilo':score<15?'Tomando velocidad':score<30?'A toda rueda':'¡Imparable!';if(score%5===0){$('toast').textContent='¡'+score+' obstáculos! Sigue así';toastTime=1.8;}}}
 obstacles=obstacles.filter(o=>o.x+o.w>-40);clouds.forEach(c=>{c.x-=c.v*dt*60;if(c.x<-c.s*3)c.x=W+c.s;});if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').textContent='';}
 }else if(state==='hit'){hitTime-=dt;if(hitTime<=0)finish();}
 if(state==='playing'||state==='hit'){particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=250*dt;});particles=particles.filter(p=>p.life>0);}
}
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#3b82f6');
    sky.addColorStop(0.28, '#7dd3fc');
    sky.addColorStop(0.58, '#f9a8d4');
    sky.addColorStop(0.82, '#fed7aa');
    sky.addColorStop(1, '#ffe8c9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Sun + glow
    const sunX = W * 0.8;
    const sunY = H * 0.17;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, Math.max(90, W * 0.22));
    sunGlow.addColorStop(0, 'rgba(255,245,180,.98)');
    sunGlow.addColorStop(.45, 'rgba(255,178,102,.35)');
    sunGlow.addColorStop(1, 'rgba(255,178,102,0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff1a8';
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.max(28, W * 0.06), 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    clouds.forEach(c => {
      ctx.fillStyle = 'rgba(255,255,255,.72)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.s * .55, 0, Math.PI * 2);
      ctx.arc(c.x + c.s * .48, c.y - c.s * .12, c.s * .42, 0, Math.PI * 2);
      ctx.arc(c.x + c.s * .92, c.y, c.s * .50, 0, Math.PI * 2);
      ctx.arc(c.x + c.s * .42, c.y + c.s * .12, c.s * .46, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant mountains
    ctx.fillStyle = 'rgba(124, 58, 237, .20)';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 160);
    for (let x = 0; x <= W + 120; x += 120) {
      ctx.lineTo(x, groundY - 140 - Math.sin((x + distance * .035) / 80) * 26);
    }
    ctx.lineTo(W, groundY + 10);
    ctx.lineTo(0, groundY + 10);
    ctx.closePath();
    ctx.fill();

    // City skyline silhouette
    ctx.fillStyle = 'rgba(31, 41, 55, .18)';
    let bx = -20;
    while (bx < W + 60) {
      const bw = 26 + ((bx * 7) % 34 + 34) % 34;
      const bh = 35 + ((bx * 13) % 90 + 90) % 90;
      ctx.fillRect(bx, groundY - bh - 18, bw, bh);
      ctx.fillStyle = 'rgba(255, 240, 180, .25)';
      for (let wy = groundY - bh - 10; wy < groundY - 24; wy += 12) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
          ctx.fillRect(wx, wy, 4, 5);
        }
      }
      ctx.fillStyle = 'rgba(31, 41, 55, .18)';
      bx += bw + 10;
    }

    // Mid hills
    ctx.fillStyle = 'rgba(16, 185, 129, .22)';
    ctx.beginPath();
    ctx.moveTo(0, groundY - 92);
    for (let x = 0; x <= W + 90; x += 90) {
      ctx.lineTo(x, groundY - 92 - Math.cos((x + distance * .062) / 75) * 20);
    }
    ctx.lineTo(W, groundY + 20);
    ctx.lineTo(0, groundY + 20);
    ctx.closePath();
    ctx.fill();

    // Green countryside / field band
    const fieldGrad = ctx.createLinearGradient(0, groundY - 34, 0, groundY + 24);
    fieldGrad.addColorStop(0, '#86efac');
    fieldGrad.addColorStop(.55, '#4ade80');
    fieldGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = fieldGrad;
    ctx.beginPath();
    ctx.moveTo(0, groundY - 30);
    for (let x = 0; x <= W + 70; x += 70) {
      ctx.lineTo(x, groundY - 30 - Math.sin((x + distance * .043) / 65) * 10);
    }
    ctx.lineTo(W, groundY + 22);
    ctx.lineTo(0, groundY + 22);
    ctx.closePath();
    ctx.fill();

    // Small grass highlights
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    for (let x = -((distance * .35) % 28); x < W + 28; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 1);
      ctx.lineTo(x + 6, groundY - 10);
      ctx.lineTo(x + 11, groundY - 2);
      ctx.stroke();
    }

    // Light streaks / speed feel
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const y = H * .18 + i * 22;
      const x = (distance * (1.6 + i * .2)) % (W + 140);
      ctx.beginPath();
      ctx.moveTo(W - x, y);
      ctx.lineTo(W - x + 120, y);
      ctx.stroke();
    }

    // Road / skate lane
    const roadTop = groundY - 4;
    const roadGrad = ctx.createLinearGradient(0, roadTop, 0, H);
    roadGrad.addColorStop(0, '#475569');
    roadGrad.addColorStop(.55, '#334155');
    roadGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadTop, W, H - roadTop);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, roadTop, W, 5);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(0, roadTop + 18, W, 2);

    // Center lane motion stripes
    const stripeY = roadTop + 36;
    for (let x = -((distance * 1.2) % 90); x < W + 90; x += 90) {
      ctx.fillStyle = 'rgba(255,248,180,.95)';
      roundRect(x, stripeY, 46, 8, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      roundRect(x + 6, stripeY + 18, 34, 5, 4);
      ctx.fill();
    }

    // Side dots / sparkly reflections
    for (let x = -((distance * .85) % 44); x < W + 44; x += 44) {
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      ctx.beginPath();
      ctx.arc(x, roadTop + 68, 2.6, 0, Math.PI * 2);
      ctx.arc(x + 20, roadTop + 90, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function drawObstacle(o){const b=cells[o.cell];ctx.save();ctx.fillStyle='#15213840';ctx.beginPath();ctx.ellipse(o.x+o.w*.5,groundY+3,o.w*.45,4,0,0,Math.PI*2);ctx.fill();if(images.hazards)ctx.drawImage(images.hazards,...b,o.x,groundY-o.h,o.w,o.h);ctx.restore();}
// Source-space hubs and masks keep the fork, brakes, exhaust and swingarm still.
// Only the actual rim/spoke annuli rotate, clockwise for travel toward the right.
const wheelParts={
 ride:[{x:371,y:802,r:139,hub:42,masks:[[[344,773],[570,773],[581,820],[342,833]],[[355,654],[432,682],[630,804],[623,844],[443,797],[350,744]]]},
       {x:1254,y:808,r:139,hub:46,masks:[[[1129,587],[1178,580],[1273,807],[1247,843],[1217,823]],[[1142,731],[1191,729],[1206,804],[1164,816]]]}],
 jump:[{x:414,y:826,r:147,hub:42,masks:[[[379,800],[623,766],[639,801],[406,854],[379,850]],[[382,686],[451,696],[654,784],[644,833],[452,780],[371,744]]]},
       {x:1296,y:647,r:136,hub:46,masks:[[[1129,453],[1175,437],[1332,629],[1317,680],[1271,670]],[[1180,604],[1220,574],[1275,626],[1250,658]]]}]
};
function animateWheels(img,key,b,dx,dy,w){
 const parts=wheelParts[key];if(!parts)return;const scale=w/b[2];
 for(const wheel of parts){const cx=dx+(wheel.x-b[0])*scale,cy=dy+(wheel.y-b[1])*scale,r=wheel.r*scale;
  ctx.save();ctx.translate(cx,cy);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.arc(0,0,wheel.hub*scale,0,Math.PI*2,true);ctx.clip('evenodd');ctx.rotate(wheelAngle);
  ctx.drawImage(img,wheel.x-wheel.r,wheel.y-wheel.r,wheel.r*2,wheel.r*2,-r,-r,r*2,r*2);ctx.restore();
  // Restore the original stationary components over the spinning wheel.
  ctx.save();ctx.beginPath();for(const polygon of wheel.masks){polygon.forEach((v,i)=>{const x=dx+(v[0]-b[0])*scale,y=dy+(v[1]-b[1])*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.clip();
  ctx.drawImage(img,...b,dx,dy,w,w*b[3]/b[2]);ctx.restore();
 }
}
function drawPlayer(){const key=player.hit?'crash':!player.onGround?'jump':'ride';const img=images[key];if(!img)return;const b=bounds[key];const height=Math.max(0,groundY-player.y-player.h);ctx.save();ctx.fillStyle='#14213d35';ctx.beginPath();ctx.ellipse(player.x+player.w*.5,groundY+3,Math.max(20,70-height*.12),6,0,0,Math.PI*2);ctx.fill();let w=player.hit?218:player.w,h=w*b[3]/b[2];const shift=player.hit?Math.min(26,(1.6-hitTime)*22):0;const bounce=player.onGround&&state==='playing'?Math.sin(distance*.10)*.8:0;const y=player.hit?groundY-h:player.y+player.h-h+bounce;const dx=player.x-(w-player.w)/2+shift;ctx.drawImage(img,...b,dx,y,w,h);animateWheels(img,key,b,dx,y,w);ctx.restore();}
function draw(){drawBackground();obstacles.forEach(drawObstacle);drawPlayer();for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
function loop(now){if(!lastTime)lastTime=now;const elapsed=Math.min((now-lastTime)/1000,.08);lastTime=now;if(state!=='paused'&&state!=='loading'){accumulator+=elapsed;while(accumulator>=STEP){update(STEP);accumulator-=STEP;}}draw();requestAnimationFrame(loop);}
phone.addEventListener('pointerdown',e=>{if(e.target.closest('button,.overlay'))return;if(state==='playing'){e.preventDefault();jump();}},{passive:false});
$('startBtn').addEventListener('click',reset);$('restartBtn').addEventListener('click',reset);$('pauseBtn').addEventListener('click',pause);$('resumeBtn').addEventListener('click',resume);$('soundBtn').addEventListener('click',()=>{sound=!sound;$('soundBtn').textContent='Sonido: '+(sound?'sí':'no');$('soundBtn').setAttribute('aria-pressed',String(sound));$('soundBtn').setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');tone(600);});
window.addEventListener('keydown',e=>{if(e.repeat)return;if(!$('artScreen').hidden){if(e.code==='Escape'){show('artScreen',false);show('startScreen',true);}return;}if(e.code==='Space'||e.code==='ArrowUp'){if(e.target.closest('button'))return;e.preventDefault();if(state==='start'||state==='gameover')reset();else jump();}if(e.code==='KeyP'||e.code==='Escape'){state==='paused'?resume():pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',pause);window.addEventListener('resize',resize);
$('best').textContent=best;resize();requestAnimationFrame(loop);
const urls={ride:'assets/ride.webp',jump:'assets/jump.webp',crash:'assets/crash.webp',hazards:'assets/road-hazards.webp'};
// All character states were made with built-in ImageGen, preserving the original woman and outfit.
Promise.all(Object.entries(urls).map(([key,url])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[key]=img;resolve();};img.onerror=()=>reject(new Error(url));img.src=url;}))).then(()=>{state='start';$('heroRide').src=urls.ride;$('poseImage').src=urls.ride;$('startBtn').disabled=false;$('startBtn').textContent='Arrancar la moto';}).catch(()=>{$('startBtn').textContent='Recarga para cargar las imágenes';$('tapHint').textContent='No se pudieron cargar todos los recursos.';});
$('artBtn').addEventListener('click',()=>{show('startScreen',false);show('artScreen',true);});$('closeArt').addEventListener('click',()=>{show('artScreen',false);show('startScreen',true);});
const poseData={ride:['Paola conduciendo su moto','Chaqueta y pantalón de mahón, blusa amarilla y tenis verdes. Más detalle, misma apariencia.'],jump:['Paola saltando con la moto','Una pose distinta en el aire: Paola sigue montada y la moto levanta la rueda delantera.'],crash:['Paola cayéndose de la moto','Al chocar, la moto se cae y Paola sale de su asiento. La caída aparece antes de reiniciar.']};
for(const key of ['ride','jump','crash'])$('pose'+(key==='ride'?'Ride':key==='jump'?'Jump':'Crash')).addEventListener('click',()=>{$('poseImage').src=urls[key];$('poseImage').alt=poseData[key][0];$('poseCaption').textContent=poseData[key][1];for(const k of ['ride','jump','crash'])$('pose'+(k==='ride'?'Ride':k==='jump'?'Jump':'Crash')).setAttribute('aria-pressed',String(k===key));});
