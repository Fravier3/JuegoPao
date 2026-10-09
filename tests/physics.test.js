import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advancePlayer,jumpPlayer,collision,speedForScore,gapForScore,STEP,TYPES} from '../physics.js';
const player=()=>({x:44,y:472,w:166,h:128,vy:0,onGround:true,jumpsUsed:0});
test('every road hazard collides with the board at ground level',()=>{for(const t of TYPES)assert.ok(collision(player(),{...t,x:100},600));});
test('all hazards can be cleared at the starting and maximum speeds',()=>{
 for(const t of TYPES)for(const speed of [245,560]){
  let found=false;
  for(let lead=-.15;lead<.85;lead+=.01){const p=player(),o={...t,x:p.x+p.w+speed*lead};jumpPlayer(p);let hit=false;
   for(let time=0;time<1.8;time+=STEP){advancePlayer(p,600,STEP);o.x-=speed*STEP;if(collision(p,o,600)){hit=true;break;}if(o.x+o.w<p.x){found=true;break;}}
   if(found&&!hit)break;found=false;
  }assert.ok(found,`${t.kind} at ${speed}`);
 }
});
test('double jump limited to two and reset by landing',()=>{const p=player();assert.ok(jumpPlayer(p));assert.ok(jumpPlayer(p));assert.equal(jumpPlayer(p),false);for(let i=0;i<240;i++)advancePlayer(p,600,STEP);assert.ok(p.onGround);assert.ok(jumpPlayer(p));});
test('speed increases only with success and is capped; gap exceeds single jump duration',()=>{assert.equal(speedForScore(0),245);assert.ok(speedForScore(5)>speedForScore(4));assert.equal(speedForScore(1000),560);assert.ok(gapForScore(1000,0)>2*770/1800+.3);});
