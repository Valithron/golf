"use strict";

function gameLoop(now){
  const frameTime=Math.min(now-lastFrame,CONFIG.maxFrameMs);
  lastFrame=now;
  accumulator+=frameTime;

  while(accumulator>=CONFIG.fixedStepMs){
    applySlopeForces();
    applyCupPhysics(now);
    Engine.update(engine,CONFIG.fixedStepMs);
    updateTrail();
    accumulator-=CONFIG.fixedStepMs;
  }

  render(now);
  requestAnimationFrame(gameLoop);
}

buildCourse();

const sandPatch=decorativeBumpers.find(item=>item.kind==="stone");
if(sandPatch){
  sandPatch.kind="sand";
  sandPatch.points=[
    {x:sandPatch.x-31,y:sandPatch.y-7},
    {x:sandPatch.x-22,y:sandPatch.y-24},
    {x:sandPatch.x-2,y:sandPatch.y-29},
    {x:sandPatch.x+24,y:sandPatch.y-20},
    {x:sandPatch.x+33,y:sandPatch.y-3},
    {x:sandPatch.x+21,y:sandPatch.y+20},
    {x:sandPatch.x-5,y:sandPatch.y+27},
    {x:sandPatch.x-28,y:sandPatch.y+15}
  ];
  sandPatch.body.isSensor=true;
  sandPatch.body.label="sand";
  sandPatch.body.restitution=0;
  Body.scale(sandPatch.body,1.25,.9);

  Events.on(engine,"beforeUpdate",()=>{
    if(state.sinking||!Vertices.contains(sandPatch.body.vertices,ball.position))return;
    Sleeping.set(ball,false);
    Body.setVelocity(ball,Vector.mult(ball.velocity,.978));
    Body.setAngularVelocity(ball,ball.angularVelocity*.88);
  });
}

resizeCanvas();
updateHud();
Sleeping.set(ball,true);
requestAnimationFrame(gameLoop);