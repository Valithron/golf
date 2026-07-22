"use strict";
function ensureAudio(){if(!state.audioEnabled)return null;if(!audioContext){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return null;audioContext=new AudioCtx}if(audioContext.state==="suspended")audioContext.resume();return audioContext}
function playTone(frequency,duration,type="sine",volume=.04,delay=0){const audio=ensureAudio();if(!audio)return;const oscillator=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+delay;oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(volume,.0002),start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start(start);oscillator.stop(start+duration+.02)}
function playWhoosh(power){const audio=ensureAudio();if(!audio)return;const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;oscillator.type="sine";oscillator.frequency.setValueAtTime(460+power*260,now);oscillator.frequency.exponentialRampToValueAtTime(120,now+.16);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.035+power*.025,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.18);oscillator.connect(gain).connect(audio.destination);oscillator.start(now);oscillator.stop(now+.2)}
function playHoleSound(){playTone(523.25,.16,"triangle",.05);playTone(659.25,.18,"triangle",.045,.1);playTone(783.99,.26,"sine",.04,.2)}
function updateHud(){holesValue.textContent=state.holes;shotsValue.textContent=state.shots;totalValue.textContent=state.totalShots}
function showToast(message){toast.textContent=message;toast.classList.remove("show");void toast.offsetWidth;toast.classList.add("show")}
function celebrate(finale){if(typeof window.confetti!=="function")return;const count=finale?CONFIG.confettiAmount*2.4:CONFIG.confettiAmount,defaults={spread:finale?95:72,startVelocity:finale?47:38,gravity:.9,ticks:170,scalar:.9,zIndex:30,disableForReducedMotion:true},colors=["#ffdf5d","#f15454","#ffffff","#79d269","#66a9ff"];window.confetti({...defaults,particleCount:Math.round(count*.55),origin:{x:.3,y:.35},angle:62,colors});window.confetti({...defaults,particleCount:Math.round(count*.45),origin:{x:.7,y:.35},angle:118,colors})}
function showFinish(){const par=CONFIG.parPerHole*CONFIG.completionsToWin,difference=state.totalShots-par,relation=difference===0?"even par":difference<0?`${Math.abs(difference)} under par`:`${difference} over par`,rating=difference<=-3?"Masterful.":difference<=0?"Excellent round.":difference<=5?"Solid putting.":"Course conquered.";finalScore.textContent=state.totalShots;resultSummary.innerHTML=`${rating} You finished ${CONFIG.completionsToWin} holes in <strong>${state.totalShots}</strong> shots, ${relation}.`;finishModal.classList.add("show");celebrate(true);playTone(523.25,.22,"triangle",.05);playTone(659.25,.24,"triangle",.05,.12);playTone(783.99,.32,"triangle",.05,.24);playTone(1046.5,.42,"sine",.045,.38)}
restartButton.addEventListener("click",restartCourse);recoverButton.addEventListener("click",recoverBall);playAgainButton.addEventListener("click",restartCourse);helpButton.addEventListener("click",()=>{instructions.classList.toggle("hidden");playTone(380,.045,"sine",.028)});soundButton.addEventListener("click",()=>{state.audioEnabled=!state.audioEnabled;soundButton.textContent=state.audioEnabled?"♪":"×";soundButton.setAttribute("aria-label",state.audioEnabled?"Mute sound":"Enable sound");if(state.audioEnabled)playTone(620,.06,"triangle",.04)});
window.addEventListener("keydown",event=>{if(event.repeat)return;const key=event.key.toLowerCase();if(key==="r")restartCourse();if(key==="h"||key==="?")helpButton.click();if(key==="m")soundButton.click();if(key==="escape")instructions.classList.add("hidden")});
Events.on(engine,"collisionStart",event=>{if(!state.audioEnabled||state.sinking)return;const now=performance.now();if(now-state.collisionSoundAt<90)return;for(const pair of event.pairs){const labels=[pair.bodyA.label,pair.bodyB.label];if(labels.includes("golf-ball")&&(labels.includes("course-wall")||labels.includes("bumper"))){if(ball.speed>1.4){state.collisionSoundAt=now;playTone(170+Math.min(ball.speed,10)*14,.035,"triangle",.018)}break}}});
function updateTrail(){if(state.sinking||ball.speed<.45){if(state.trail.length>0)state.trail.shift();return}const previous=state.trail.at(-1);if(!previous||Vector.magnitudeSquared(Vector.sub(ball.position,previous))>20){state.trail.push({x:ball.position.x,y:ball.position.y});if(state.trail.length>16)state.trail.shift()}}
function resizeCanvas(){
  const cssWidth=innerWidth;
  const cssHeight=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  const isNarrow=cssWidth<=700;
  const hud=document.querySelector(".hud");
  const measuredHudBottom=hud?hud.getBoundingClientRect().bottom:0;
  const topReserve=isNarrow?Math.min(cssHeight*.32,Math.max(0,measuredHudBottom+12)):0;
  const usableHeight=Math.max(280,cssHeight-topReserve);
  const scale=Math.min(cssWidth/CONFIG.worldWidth,usableHeight/CONFIG.worldHeight);
  const offsetX=(cssWidth-CONFIG.worldWidth*scale)/2;
  const offsetY=topReserve+(usableHeight-CONFIG.worldHeight*scale)/2;
  state.viewport={cssWidth,cssHeight,dpr,scale,offsetX,offsetY};
  canvas.width=Math.max(1,Math.round(cssWidth*dpr));
  canvas.height=Math.max(1,Math.round(cssHeight*dpr));
  canvas.style.width=`${cssWidth}px`;
  canvas.style.height=`${cssHeight}px`;
}
addEventListener("resize",resizeCanvas,{passive:true});addEventListener("orientationchange",resizeCanvas,{passive:true});