"use strict";

function roundedRectPath(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawDaisy(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=.8;for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.fillStyle="#f6fff1";ctx.beginPath();ctx.ellipse(0,-8,3.2,7,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#f4c94d";ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawBackdrop(){const g=ctx.createLinearGradient(0,0,0,CONFIG.worldHeight);g.addColorStop(0,"#24765f");g.addColorStop(1,"#15503f");ctx.fillStyle=g;ctx.fillRect(-120,-120,CONFIG.worldWidth+240,CONFIG.worldHeight+240);ctx.save();ctx.globalAlpha=.1;ctx.strokeStyle="#d9ffd4";ctx.lineWidth=18;for(let y=-80;y<CONFIG.worldHeight+100;y+=64){ctx.beginPath();ctx.moveTo(-100,y);ctx.lineTo(CONFIG.worldWidth+100,y+180);ctx.stroke()}ctx.restore();for(const [x,y] of[[42,230],[565,245],[37,705],[575,780],[50,1060],[570,1020]])drawDaisy(x,y,.72)}
function drawSlopeZones(){for(const zone of slopeZones){ctx.save();ctx.fillStyle=zone.tint;ctx.strokeStyle="rgba(226,255,198,.2)";ctx.lineWidth=2;if(zone.type==="radial"){ctx.beginPath();ctx.ellipse(zone.body.position.x,zone.body.position.y,zone.radius,zone.radius*.68,-.16,0,Math.PI*2);ctx.fill();for(let i=1;i<=3;i++){ctx.beginPath();ctx.ellipse(zone.body.position.x,zone.body.position.y,zone.radius*i/4,zone.radius*.68*i/4,-.16,0,Math.PI*2);ctx.stroke()}}else{const v=zone.body.vertices;ctx.beginPath();ctx.moveTo(v[0].x,v[0].y);for(let i=1;i<v.length;i++)ctx.lineTo(v[i].x,v[i].y);ctx.closePath();ctx.fill();ctx.globalAlpha=.62;for(let inset=18;inset<=48;inset+=15){const c=zone.body.position;ctx.beginPath();ctx.moveTo(v[0].x+(c.x-v[0].x)*inset/100,v[0].y+(c.y-v[0].y)*inset/100);for(let i=1;i<v.length;i++)ctx.lineTo(v[i].x+(c.x-v[i].x)*inset/100,v[i].y+(c.y-v[i].y)*inset/100);ctx.closePath();ctx.stroke()}}ctx.restore()}}
function drawCourse(){ctx.save();ctx.shadowColor="rgba(0,0,0,.26)";ctx.shadowBlur=24;ctx.shadowOffsetY=13;ctx.fillStyle="#0e392e";ctx.fill(coursePath);ctx.restore();ctx.save();ctx.clip(coursePath);const g=ctx.createLinearGradient(0,70,CONFIG.worldWidth,CONFIG.worldHeight);g.addColorStop(0,"#55a844");g.addColorStop(.52,"#46973d");g.addColorStop(1,"#3f8a39");ctx.fillStyle=g;ctx.fillRect(0,0,CONFIG.worldWidth,CONFIG.worldHeight);ctx.globalAlpha=.08;ctx.fillStyle="#eaffce";for(let x=-CONFIG.worldHeight;x<CONFIG.worldWidth+CONFIG.worldHeight;x+=72){ctx.save();ctx.translate(x,0);ctx.rotate(-.18);ctx.fillRect(0,-200,28,CONFIG.worldHeight+500);ctx.restore()}ctx.globalAlpha=1;const tee=ctx.createRadialGradient(TEE.x,TEE.y-8,8,TEE.x,TEE.y,112);tee.addColorStop(0,"rgba(122,194,82,.64)");tee.addColorStop(1,"rgba(46,122,48,.12)");ctx.fillStyle=tee;ctx.beginPath();ctx.ellipse(TEE.x,TEE.y,112,72,0,0,Math.PI*2);ctx.fill();drawSlopeZones();ctx.restore();ctx.save();ctx.strokeStyle="#2d722f";ctx.lineWidth=10;ctx.lineJoin="round";ctx.stroke(coursePath);ctx.strokeStyle="rgba(232,255,213,.28)";ctx.lineWidth=2.2;ctx.stroke(coursePath);ctx.restore()}

function drawSandPatch(item){
  const points=item.points;
  if(!points||points.length<3)return;
  ctx.save();
  ctx.shadowColor="rgba(0,0,0,.18)";
  ctx.shadowBlur=7;
  ctx.shadowOffsetY=4;
  const gradient=ctx.createLinearGradient(item.x-28,item.y-22,item.x+30,item.y+24);
  gradient.addColorStop(0,"#f4d78d");
  gradient.addColorStop(.52,"#d9b66b");
  gradient.addColorStop(1,"#b98f4e");
  ctx.fillStyle=gradient;
  ctx.beginPath();
  ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor="transparent";
  ctx.strokeStyle="rgba(112,78,37,.48)";
  ctx.lineWidth=3;
  ctx.lineJoin="round";
  ctx.stroke();

  ctx.globalAlpha=.45;
  ctx.fillStyle="#fff0bd";
  for(const [dx,dy,r] of[[-16,-5,2],[3,-11,1.7],[17,-1,2.2],[-7,10,1.5],[11,12,1.4],[-21,7,1.2]]){
    ctx.beginPath();
    ctx.arc(item.x+dx,item.y+dy,r,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBumpers(){
  for(const item of decorativeBumpers){
    if(item.kind==="sand"){
      drawSandPatch(item);
      continue;
    }
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.24)";
    ctx.shadowBlur=9;
    ctx.shadowOffsetY=6;
    const g=ctx.createRadialGradient(item.x-8,item.y-10,4,item.x,item.y,item.r+4);
    g.addColorStop(0,"#6f9851");
    g.addColorStop(1,"#315f33");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(item.x,item.y,item.r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
    if(item.kind==="flowers"){
      drawDaisy(item.x-8,item.y-4,.55);
      drawDaisy(item.x+8,item.y+1,.48);
      drawDaisy(item.x+1,item.y-11,.42);
    }
  }
}

function drawHoleAndFlag(now){ctx.save();const g=ctx.createRadialGradient(HOLE.x-4,HOLE.y-4,2,HOLE.x,HOLE.y,23);g.addColorStop(0,"#061410");g.addColorStop(.65,"#10251d");g.addColorStop(1,"rgba(15,43,32,.3)");ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(HOLE.x,HOLE.y,23,15,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(233,255,221,.42)";ctx.lineWidth=2;ctx.stroke();const top=HOLE.y-104;ctx.strokeStyle="#f6f1df";ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(HOLE.x,HOLE.y+1);ctx.lineTo(HOLE.x,top);ctx.stroke();const wave=Math.sin(now*.004)*4;ctx.fillStyle="#ef4b4b";ctx.beginPath();ctx.moveTo(HOLE.x+1,top+1);ctx.quadraticCurveTo(HOLE.x+35,top+8+wave,HOLE.x+69,top+20);ctx.lineTo(HOLE.x+1,top+39);ctx.closePath();ctx.fill();ctx.restore()}
function drawTrail(){if(state.trail.length<2)return;ctx.save();ctx.lineCap="round";for(let i=1;i<state.trail.length;i++){ctx.strokeStyle=`rgba(255,255,255,${i/state.trail.length*.18})`;ctx.lineWidth=2+i/state.trail.length*4;ctx.beginPath();ctx.moveTo(state.trail[i-1].x,state.trail[i-1].y);ctx.lineTo(state.trail[i].x,state.trail[i].y);ctx.stroke()}ctx.restore()}
function drawBall(now){if(state.sinkScale<=.03)return;if(canAim()&&!state.aiming){const pulse=(Math.sin(now*.0045)+1)/2;ctx.save();ctx.strokeStyle=`rgba(255,235,126,${.2+pulse*.24})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(ball.position.x,ball.position.y,22+pulse*5,0,Math.PI*2);ctx.stroke();ctx.restore()}ctx.save();ctx.translate(ball.position.x,ball.position.y);ctx.scale(state.sinkScale,state.sinkScale);ctx.rotate(ball.angle);ctx.shadowColor="rgba(0,0,0,.3)";ctx.shadowBlur=9;ctx.shadowOffsetY=6;const g=ctx.createRadialGradient(-5,-7,2,0,0,CONFIG.ballRadius+2);g.addColorStop(0,"#fff");g.addColorStop(.65,"#f1f4ee");g.addColorStop(1,"#bec8bd");ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,CONFIG.ballRadius,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawAimGuide(){if(!state.aiming)return;const raw=Vector.sub(ball.position,state.dragPoint),distance=Math.min(Vector.magnitude(raw),CONFIG.maxDrag);if(distance<1)return;const direction=Vector.normalise(raw),pullPoint=Vector.sub(ball.position,Vector.mult(direction,distance)),power=distance/CONFIG.maxDrag,arrowEnd=Vector.add(ball.position,Vector.mult(direction,58+power*110));ctx.save();ctx.lineCap="round";ctx.setLineDash([8,9]);ctx.strokeStyle="rgba(255,255,255,.66)";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ball.position.x,ball.position.y);ctx.lineTo(pullPoint.x,pullPoint.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=power>.68?"#ff8b4f":"#ffe25d";ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(ball.position.x+direction.x*20,ball.position.y+direction.y*20);ctx.lineTo(arrowEnd.x,arrowEnd.y);ctx.stroke();const side={x:-direction.y,y:direction.x},base=Vector.sub(arrowEnd,Vector.mult(direction,18));ctx.beginPath();ctx.moveTo(arrowEnd.x,arrowEnd.y);ctx.lineTo(base.x+side.x*11,base.y+side.y*11);ctx.lineTo(base.x-side.x*11,base.y-side.y*11);ctx.closePath();ctx.fill();const labelY=pullPoint.y+18;roundedRectPath(ctx,pullPoint.x-27,labelY,54,28,14);ctx.fillStyle="rgba(9,36,30,.88)";ctx.fill();ctx.fillStyle="#fff";ctx.font="900 14px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(`${Math.round(power*100)}%`,pullPoint.x,labelY+14);ctx.restore()}
function render(now){const v=state.viewport;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#123f35";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(v.dpr*v.scale,0,0,v.dpr*v.scale,v.dpr*v.offsetX,v.dpr*v.offsetY);drawBackdrop();drawCourse();drawBumpers();drawHoleAndFlag(now);drawTrail();drawBall(now);drawAimGuide()}