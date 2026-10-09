export const GRAVITY = 1800;
export const JUMP = 770;
export const STEP = 1 / 120;
export const TYPES = [
  {kind:'cone',w:40,h:58,cell:0}, {kind:'barrier',w:74,h:48,cell:1},
  {kind:'tire',w:55,h:36,cell:2}, {kind:'crate',w:52,h:46,cell:3},
  {kind:'rocks',w:66,h:30,cell:4}, {kind:'can',w:42,h:54,cell:5}
];
export function speedForScore(score) { return Math.min(560,245+score*9); }
export function gapForScore(score,random=Math.random()) {return Math.max(1.18,1.85-score*.025)+random*.45;}
export function advancePlayer(p,ground,dt) {
  p.vy+=GRAVITY*dt;p.y+=p.vy*dt;
  if(p.y+p.h>=ground){p.y=ground-p.h;p.vy=0;p.onGround=true;p.jumpsUsed=0;}
}
export function collision(p,o,ground) {
  // The motorcycle wheels and rider are inside the visible alpha silhouette, not PNG margins.
  const left=p.x+31,right=p.x+p.w-29,top=p.y+16,bottom=p.y+p.h-3;
  const ox=o.x+o.w*.13,ow=o.w*.74,oy=ground-o.h*.88;
  return left<ox+ow&&right>ox&&top<ground-2&&bottom>oy;
}
export function jumpPlayer(p) {
  if(!p.onGround&&p.jumpsUsed>=2)return false;
  p.vy=-JUMP*(p.onGround?1:.9);p.onGround=false;p.jumpsUsed++;return true;
}
