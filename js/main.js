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
resizeCanvas();
updateHud();
Body.setSleeping(ball,true);
requestAnimationFrame(gameLoop);
