export const WIDTH=320,HEIGHT=440,LEFT=10,RIGHT=310,PADDLE_Y=410;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const POWER={E:{name:'EXPAND',color:'#7da8ff'},C:{name:'CATCH',color:'#8ee0bd'},S:{name:'SLOW',color:'#e5a4dd'},L:{name:'LASER',color:'#f393a3'},D:{name:'MULTIBALL',color:'#90e8fa'},P:{name:'EXTRA LIFE',color:'#e6d681'},B:{name:'EXIT OPEN',color:'#c5a2ff'}};
const layouts=[
 ['1111111111','2222222222','3333333333','4444444444','5555555555','6666666666'],
 ['1........1','22......22','333....333','4444..4444','5555555555','SSSSSSSSSS'],
 ['...1111...','..222222..','.33333333.','4444444444','.55555555.','..SSSSSS..','...6666...'],
 ['111.GG.111','22..GG..22','333.GG.333','44......44','SSS.GG.SSS','66..GG..66','111.GG.111'],
 ['S1S1S1S1S1','2S2S2S2S2S','S3S3S3S3S3','4S4S4S4S4S','S5S5S5S5S5','6666666666'],
 ['G11111111G','G2..22..2G','G3..33..3G','G44444444G','G5..55..5G','GSSSSSSSSG','..666666..'],
 ['1.2.3.4.5.','.S.S.S.S.S','2.3.4.5.6.','.S.S.S.S.S','3.4.5.6.1.','.S.S.S.S.S','4444444444'],
 ['SSSSSSSSSS','1G22GG33G4','1G22GG33G4','1111111111','G5G5GG5G5G','6666666666','SSSSSSSSSS']
];
export function createBricks(round){return (layouts[round-1]||[]).flatMap((line,row)=>[...line].flatMap((c,col)=>c==='.'?[]:[{x:11+col*30,y:50+row*14,w:28,h:11,type:c,hp:c==='G'?Infinity:c==='S'?2:1,alive:true,row,col}]));}
export function circleRect(ball,rect){const x=clamp(ball.x,rect.x,rect.x+rect.w),y=clamp(ball.y,rect.y,rect.y+rect.h);return (ball.x-x)**2+(ball.y-y)**2<ball.r**2;}
export class Arkanoid {
 constructor({random=Math.random,event=()=>{}}={}){this.random=random;this.event=event;this.mode='ready';this.round=1;this.score=0;this.lives=3;this.time=0;this.paddle={x:160,w:50};this.balls=[];this.bricks=createBricks(1);this.capsules=[];this.shots=[];this.enemies=[];this.effect=null;this.effectTime=0;this.exit=false;this.boss=null;this.transition=0;this.cooldown=0;this.enemyTimer=12;this.extraAt=20000;}
 start(){this.score=0;this.round=1;this.lives=3;this.extraAt=20000;this.time=0;this.mode='playing';this.setupRound();this.event('start');}
 setupRound(){this.bricks=createBricks(this.round);this.paddle={x:160,w:50};this.capsules=[];this.shots=[];this.enemies=[];this.effect=null;this.effectTime=0;this.exit=false;this.transition=0;this.cooldown=0;this.enemyTimer=12;this.boss=this.round===9?{x:128,y:53,w:64,h:60,hp:32,maxHp:32,flash:0}:null;this.serve();this.event('round',this.round);}
 serve(){this.balls=[{x:this.paddle.x,y:PADDLE_Y-6,vx:0,vy:0,r:3,attached:true}];}
 get speed(){return Math.min(310,165+(this.round-1)*13);}
 addScore(points){this.score+=points;while(this.score>=this.extraAt){this.extraAt+=20000;this.lives=Math.min(9,this.lives+1);this.event('life');}}
 action(){if(this.mode!=='playing'||this.transition)return;for(const b of this.balls)if(b.attached){b.attached=false;b.vx=55;b.vy=-Math.sqrt(this.speed**2-55**2);this.event('launch');}if(this.effect==='L'&&this.cooldown<=0){this.cooldown=.22;this.shots.push({x:this.paddle.x-this.paddle.w/2+3,y:PADDLE_Y-7},{x:this.paddle.x+this.paddle.w/2-3,y:PADDLE_Y-7});this.event('laser');}}
 pause(){if(this.mode==='playing'){this.mode='paused';return true;}return false;}
 resume(){if(this.mode==='paused')this.mode='playing';}
 loseLife(){this.lives--;this.event('lost');this.effect=null;this.effectTime=0;this.paddle.w=50;this.exit=false;this.capsules=[];this.shots=[];this.enemies=[];if(this.lives<=0){this.mode='over';this.balls=[];this.event('over');}else this.serve();}
 collect(type){this.addScore(100);this.event('power',type);if(type==='P'){this.lives=Math.min(9,this.lives+1);return;}if(type==='B'){this.exit=true;return;}if(type==='D'){const sources=this.balls.filter(b=>!b.attached);if(!sources.length)this.action();const b=sources[0]||this.balls[0];if(b){const speed=Math.hypot(b.vx,b.vy)||this.speed;const angle=Math.atan2(b.vy,b.vx);for(const delta of [-.4,.4])if(this.balls.length<7)this.balls.push({...b,attached:false,vx:Math.cos(angle+delta)*speed,vy:Math.sin(angle+delta)*speed});}return;}
 if(type==='S'){for(const b of this.balls)if(!b.attached){const speed=Math.hypot(b.vx,b.vy),scale=Math.max(115,speed*.75)/speed;b.vx*=scale;b.vy*=scale;}return;}
 this.paddle.w=type==='E'?76:50;this.paddle.x=clamp(this.paddle.x,LEFT+this.paddle.w/2,RIGHT-this.paddle.w/2);this.effect=type;this.effectTime=22;
 }
 clearRound(){if(this.transition||this.mode!=='playing')return;this.transition=1.7;this.balls=[];this.capsules=[];this.shots=[];this.enemies=[];this.addScore(500+this.round*100);this.event('clear');}
 damageBrick(brick){if(brick.type==='G'){this.event('metal',{x:brick.x+14,y:brick.y+5});return;}brick.hp--;if(brick.hp<=0){brick.alive=false;this.addScore(brick.type==='S'?100:50+Number(brick.type)*10);this.event('brick',{x:brick.x+14,y:brick.y+5,type:brick.type});if(this.capsules.length<4&&this.random()<.19){const types=Object.keys(POWER);this.capsules.push({x:brick.x+14,y:brick.y+5,type:types[Math.floor(this.random()*types.length)]});}}else this.event('metal',{x:brick.x+14,y:brick.y+5});}
 bounceRect(b,rect,oldX,oldY){let nx=0,ny=0;if(oldY+b.r<=rect.y){b.y=rect.y-b.r;ny=-1;}else if(oldY-b.r>=rect.y+rect.h){b.y=rect.y+rect.h+b.r;ny=1;}else if(oldX+b.r<=rect.x){b.x=rect.x-b.r;nx=-1;}else if(oldX-b.r>=rect.x+rect.w){b.x=rect.x+rect.w+b.r;nx=1;}else{const distances=[Math.abs(b.x-rect.x),Math.abs(b.x-rect.x-rect.w),Math.abs(b.y-rect.y),Math.abs(b.y-rect.y-rect.h)];const n=distances.indexOf(Math.min(...distances));if(n===0){nx=-1;b.x=rect.x-b.r;}if(n===1){nx=1;b.x=rect.x+rect.w+b.r;}if(n===2){ny=-1;b.y=rect.y-b.r;}if(n===3){ny=1;b.y=rect.y+rect.h+b.r;}}
 const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=2*dot*nx;b.vy-=2*dot*ny;}}
 step(dt,input={}){if(this.mode!=='playing')return;dt=clamp(dt,0,.04);this.time+=dt;this.cooldown-=dt;if(this.transition){this.transition-=dt;if(this.transition<=0){if(this.round===9){this.mode='won';this.event('won');}else{this.round++;this.setupRound();}}return;}
 if(input.target!==undefined)this.paddle.x=input.target;else this.paddle.x+=(input.move||0)*300*dt;this.paddle.x=clamp(this.paddle.x,LEFT+this.paddle.w/2,RIGHT-this.paddle.w/2);
 if(this.exit&&this.paddle.x+this.paddle.w/2>RIGHT-3){this.clearRound();return;}
 if(this.effectTime>0){this.effectTime-=dt;if(this.effectTime<=0){this.effect=null;this.paddle.w=50;}}
 if(input.action)this.action();if(this.boss){this.boss.x=128+Math.sin(this.time*.65)*65;this.boss.flash=Math.max(0,this.boss.flash-dt);}
 for(const c of this.capsules){c.y+=47*dt;if(c.y+5>=PADDLE_Y&&c.y-5<=PADDLE_Y+8&&Math.abs(c.x-this.paddle.x)<this.paddle.w/2+8){c.dead=true;this.collect(c.type);}}this.capsules=this.capsules.filter(c=>!c.dead&&c.y<HEIGHT+10);
 for(const shot of this.shots){const oldY=shot.y;shot.y-=340*dt;const brick=this.bricks.filter(b=>b.alive&&shot.x>=b.x&&shot.x<=b.x+b.w&&shot.y<=b.y+b.h&&oldY>=b.y).sort((a,b)=>b.y-a.y)[0];if(brick){shot.dead=true;this.damageBrick(brick);}else if(this.boss&&shot.x>=this.boss.x&&shot.x<=this.boss.x+this.boss.w&&shot.y<=this.boss.y+this.boss.h&&oldY>=this.boss.y){shot.dead=true;this.hitBoss();}}
 this.shots=this.shots.filter(s=>!s.dead&&s.y>8);
 const substeps=Math.max(1,Math.ceil(dt*240)),subdt=dt/substeps;
 for(let i=0;i<substeps;i++){for(const b of this.balls){if(b.attached){b.x=this.paddle.x;b.y=PADDLE_Y-6;continue;}const oldX=b.x,oldY=b.y;b.x+=b.vx*subdt;b.y+=b.vy*subdt;
 if(b.x-b.r<LEFT){b.x=LEFT+b.r;b.vx=Math.abs(b.vx);this.event('wall');}if(b.x+b.r>RIGHT){b.x=RIGHT-b.r;b.vx=-Math.abs(b.vx);this.event('wall');}if(b.y-b.r<10){b.y=10+b.r;b.vy=Math.abs(b.vy);this.event('wall');}
 if(b.vy>0&&oldY+b.r<=PADDLE_Y+2&&b.y+b.r>=PADDLE_Y&&b.x+b.r>=this.paddle.x-this.paddle.w/2&&b.x-b.r<=this.paddle.x+this.paddle.w/2){b.y=PADDLE_Y-b.r;const offset=clamp((b.x-this.paddle.x)/(this.paddle.w/2),-1,1),speed=Math.min(340,Math.hypot(b.vx,b.vy)+1.8),angle=offset*1.08;b.vx=Math.sin(angle)*speed;if(Math.abs(b.vx)<18)b.vx=offset<0?-18:18;b.vy=-Math.sqrt(speed**2-b.vx**2);if(this.effect==='C')b.attached=true;this.event('paddle',{x:b.x,y:PADDLE_Y});}
 for(const brick of this.bricks){if(!brick.alive||!circleRect(b,brick))continue;this.bounceRect(b,brick,oldX,oldY);this.damageBrick(brick);break;}
 if(this.boss&&circleRect(b,this.boss)){this.bounceRect(b,this.boss,oldX,oldY);this.hitBoss();}
 for(const e of this.enemies)if(!e.dead&&(b.x-e.x)**2+(b.y-e.y)**2<81){e.dead=true;b.vy*=-1;this.addScore(100);this.event('enemy',{x:e.x,y:e.y});}
 }this.balls=this.balls.filter(b=>b.y<HEIGHT+8);}
 this.enemyTimer-=dt;if(this.enemyTimer<=0&&this.round<9&&this.enemies.length<3&&this.balls.some(b=>!b.attached)){this.enemies.push({x:this.random()<.5?35:285,y:25,phase:this.random()*6});this.enemyTimer=9+this.random()*6;}for(const e of this.enemies){e.y+=22*dt;e.x=clamp(e.x+Math.sin(this.time*2+e.phase)*18*dt,20,300);if(e.y>=PADDLE_Y-5&&Math.abs(e.x-this.paddle.x)<this.paddle.w/2)e.dead=true;}this.enemies=this.enemies.filter(e=>!e.dead&&e.y<HEIGHT);
 if(this.mode!=='playing'||this.transition)return;
 if((this.round<9&&!this.bricks.some(b=>b.alive&&b.type!=='G'))||(this.round===9&&this.boss?.hp<=0)){this.clearRound();return;}
 if(!this.balls.length)this.loseLife();
 }
 hitBoss(){if(!this.boss||this.boss.hp<=0)return;this.boss.hp--;this.boss.flash=.1;this.addScore(100);this.event('boss',{x:this.boss.x+32,y:this.boss.y+30});}
}
