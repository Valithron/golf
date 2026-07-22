"use strict";

// -------------------------------------------------------------------------
// INPUT
// -------------------------------------------------------------------------
function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left - state.viewport.offsetX) / state.viewport.scale;
  const y = (clientY - rect.top - state.viewport.offsetY) / state.viewport.scale;
  return { x, y };
}

function canAim() {
  return !state.sinking && !state.runComplete && ball.speed < 0.28;
}

function beginAim(event) {
  event.preventDefault();
  ensureAudio();
  if (!canAim()) return;
  const point = screenToWorld(event.clientX, event.clientY);
  const aimRadius = event.pointerType === "touch" ? CONFIG.touchAimRadius : CONFIG.mouseAimRadius;
  if (Vector.magnitude(Vector.sub(point, ball.position)) > aimRadius) return;
  state.aiming = true;
  state.activePointerId = event.pointerId;
  state.dragPoint = point;
  canvas.setPointerCapture?.(event.pointerId);
  playTone(420, 0.035, "sine", 0.035);
}

function updateAim(event) {
  if (!state.aiming || event.pointerId !== state.activePointerId) return;
  event.preventDefault();
  state.dragPoint = screenToWorld(event.clientX, event.clientY);
}

function endAim(event) {
  if (!state.aiming || event.pointerId !== state.activePointerId) return;
  event.preventDefault();
  const raw = Vector.sub(ball.position, state.dragPoint);
  const distance = Math.min(Vector.magnitude(raw), CONFIG.maxDrag);
  const direction = distance > 0 ? Vector.normalise(raw) : { x: 0, y: 0 };
  state.aiming = false;
  state.activePointerId = null;
  canvas.releasePointerCapture?.(event.pointerId);
  if (distance < 9) return;
  state.lastShotPosition = { x: ball.position.x, y: ball.position.y };
  state.trail.length = 0;
  const launchSpeed = Math.min(distance * CONFIG.powerMultiplier, CONFIG.maxBallSpeed);
  Body.setVelocity(ball, Vector.mult(direction, launchSpeed));
  Body.setAngularVelocity(ball, launchSpeed * 0.025);
  Sleeping.set(ball, false);
  state.shots += 1;
  state.totalShots += 1;
  state.firstShotTaken = true;
  updateHud();
  instructions.classList.add("hidden");
  playWhoosh(launchSpeed / CONFIG.maxBallSpeed);
  vibrate(12);
}

function cancelAim(event) {
  if (event.pointerId !== state.activePointerId) return;
  state.aiming = false;
  state.activePointerId = null;
}

function recoverBall() {
  if (state.sinking || state.runComplete) return;
  state.aiming = false;
  state.activePointerId = null;
  const target = state.shots > 0 ? state.lastShotPosition : TEE;
  const alreadyReady = Vector.magnitude(Vector.sub(ball.position, target)) < 2 && ball.speed < 0.2;
  if (alreadyReady) {
    showToast("Ball is ready");
    return;
  }
  state.shots += CONFIG.recoveryPenalty;
  state.totalShots += CONFIG.recoveryPenalty;
  setBallAt(target, true);
  updateHud();
  showToast(`+${CONFIG.recoveryPenalty} penalty`);
  playTone(220, 0.08, "triangle", 0.03);
  vibrate([18, 30, 18]);
}

canvas.addEventListener("pointerdown", beginAim, { passive: false });
canvas.addEventListener("pointermove", updateAim, { passive: false });
canvas.addEventListener("pointerup", endAim, { passive: false });
canvas.addEventListener("pointercancel", cancelAim, { passive: false });
canvas.addEventListener("contextmenu", event => event.preventDefault());

// -------------------------------------------------------------------------
// GAMEPLAY PHYSICS
// -------------------------------------------------------------------------
function isInsideSlope(zone, position) {
  if (zone.type === "radial") {
    return Vector.magnitudeSquared(Vector.sub(position, zone.body.position)) <= zone.radius * zone.radius;
  }
  return Vertices.contains(zone.body.vertices, position);
}

function applySlopeForces() {
  if (state.sinking) return;
  let onSlope = false;
  for (const zone of slopeZones) {
    if (!isInsideSlope(zone, ball.position)) continue;
    onSlope = true;
    Sleeping.set(ball, false);
    if (zone.type === "vector") {
      Body.applyForce(ball, ball.position, {
        x: zone.force.x * CONFIG.slopeForce,
        y: zone.force.y * CONFIG.slopeForce
      });
    } else {
      const fromCenter = Vector.sub(ball.position, zone.body.position);
      const distance = Math.max(8, Vector.magnitude(fromCenter));
      const falloff = 1 - Math.min(distance / zone.radius, 1);
      const direction = Vector.mult(Vector.normalise(fromCenter), zone.direction);
      Body.applyForce(ball, ball.position, Vector.mult(direction, zone.strength * (0.30 + falloff * 0.70)));
    }
  }
  if (!onSlope && ball.speed > 0 && ball.speed < CONFIG.lowSpeedCutoff) {
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
    Sleeping.set(ball, true);
  }
  if (ball.speed > CONFIG.maxBallSpeed) {
    Body.setVelocity(ball, Vector.mult(Vector.normalise(ball.velocity), CONFIG.maxBallSpeed));
  }
}

function applyCupPhysics(now) {
  if (state.sinking) {
    const elapsed = now - state.sinkStartedAt;
    const t = Math.min(elapsed / 620, 1);
    state.sinkScale = 1 - (1 - Math.pow(1 - t, 3)) * 0.96;
    return;
  }
  const toCup = Vector.sub({ x: HOLE.x, y: HOLE.y }, ball.position);
  const distance = Vector.magnitude(toCup);
  if (distance < CONFIG.holeCaptureRadius + 18 && ball.speed < CONFIG.holeCaptureSpeed + 0.8) {
    const pull = Math.max(0, 1 - distance / (CONFIG.holeCaptureRadius + 18));
    Body.applyForce(ball, ball.position, Vector.mult(Vector.normalise(toCup), 0.00006 * pull));
    Body.setVelocity(ball, Vector.mult(ball.velocity, 0.988));
  }
  if (distance < CONFIG.holeCaptureRadius && ball.speed < CONFIG.holeCaptureSpeed) startSink();
}

function startSink() {
  if (state.sinking) return;
  state.sinking = true;
  state.aiming = false;
  state.sinkStartedAt = performance.now();
  state.sinkScale = 1;
  state.trail.length = 0;
  Body.setPosition(ball, { x: HOLE.x, y: HOLE.y });
  Body.setVelocity(ball, { x: 0, y: 0 });
  Body.setAngularVelocity(ball, 0);
  Body.setStatic(ball, true);
  playHoleSound();
  vibrate([24, 40, 35]);
  schedule(completeHole, 650);
}

function completeHole() {
  state.holes += 1;
  updateHud();
  showToast(state.shots === 1 ? "Hole in one!" : state.shots <= 3 ? "Nice!" : "In the cup!");
  celebrate(false);
  if (state.holes >= CONFIG.completionsToWin) {
    state.runComplete = true;
    schedule(showFinish, 800);
  } else {
    schedule(resetBallForNextHole, 1350);
  }
}

function resetBallForNextHole() {
  setBallAt(TEE, true);
  state.lastShotPosition = { x: TEE.x, y: TEE.y };
  state.shots = 0;
  state.sinking = false;
  state.sinkScale = 1;
  updateHud();
}

function restartCourse() {
  clearScheduledActions();
  finishModal.classList.remove("show");
  state.holes = 0;
  state.shots = 0;
  state.totalShots = 0;
  state.firstShotTaken = false;
  state.runComplete = false;
  state.sinking = false;
  state.sinkScale = 1;
  state.aiming = false;
  state.lastShotPosition = { x: TEE.x, y: TEE.y };
  setBallAt(TEE, true);
  updateHud();
  instructions.classList.remove("hidden");
  playTone(520, 0.06, "triangle", 0.035);
}
