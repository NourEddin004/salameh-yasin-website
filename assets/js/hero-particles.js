/* Decorative hero constellation. Pointer input never captures clicks or scrolling. */
(function () {
  "use strict";

  var hero = document.querySelector(".fl-hero");
  var canvas = hero && hero.querySelector(".hero-particles");
  if (!canvas || canvas.dataset.particlesReady === "true") return;

  var context = canvas.getContext("2d");
  if (!context) return;
  canvas.dataset.particlesReady = "true";

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducedMotion = motionQuery.matches;
  var particles = [];
  var width = 0;
  var height = 0;
  var pixelRatio = 0;
  var frame = 0;
  var previousTime = 0;
  var visible = true;
  var pageActive = true;
  var destroyed = false;
  var pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, motion: 0, active: false };
  var color = "#78ADFF";
  var lightTheme = false;

  function makeParticle() {
    var angle = Math.random() * Math.PI * 2;
    var speed = 4 + Math.random() * 6;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      driftX: Math.cos(angle) * speed,
      driftY: Math.sin(angle) * speed,
      pushX: 0,
      pushY: 0,
      radius: 1 + Math.random() * 1.2,
      opacity: 0.3 + Math.random() * 0.25
    };
  }

  function readPalette() {
    var style = getComputedStyle(hero);
    color = style.getPropertyValue("--hero-particle-color").trim() ||
      style.getPropertyValue("--action").trim() || "#78ADFF";
    lightTheme = document.documentElement.dataset.theme === "light";
    draw();
  }

  function resize() {
    var nextWidth = hero.clientWidth;
    var nextHeight = hero.clientHeight;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (nextWidth === width && nextHeight === height && ratio === pixelRatio) {
      updatePlayback();
      return;
    }
    var oldWidth = width;
    var oldHeight = height;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = ratio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Retain each particle's relative position instead of reshuffling on resize.
    if (oldWidth && oldHeight) {
      particles.forEach(function (particle) {
        particle.x *= width / oldWidth;
        particle.y *= height / oldHeight;
      });
    }
    var count = Math.max(24, Math.min(85, Math.round(width * height / 14000)));
    particles.length = Math.min(particles.length, count);
    while (particles.length < count) particles.push(makeParticle());
    pointer.active = false;
    pointer.strength = 0;
    pointer.motion = 0;
    draw();
    updatePlayback();
  }

  function line(x1, y1, x2, y2, opacity) {
    context.globalAlpha = opacity;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  function draw() {
    if (!width || !height || destroyed) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 0.7;
    var linkDistance = width < 700 ? 95 : 125;
    var cursorDistance = width < 700 ? 170 : 220;

    particles.forEach(function (particle, index) {
      // Quiet connections between nearby points keep the background uncluttered.
      for (var next = index + 1; next < particles.length; next++) {
        var neighbour = particles[next];
        var dx = neighbour.x - particle.x;
        var dy = neighbour.y - particle.y;
        var distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < linkDistance * linkDistance) {
          var distance = Math.sqrt(distanceSquared);
          line(particle.x, particle.y, neighbour.x, neighbour.y,
            (1 - distance / linkDistance) * (lightTheme ? 0.14 : 0.19));
        }
      }

      if (pointer.strength > 0.005 && !reducedMotion) {
        var pointerDx = pointer.x - particle.x;
        var pointerDy = pointer.y - particle.y;
        var pointerDistance = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
        if (pointerDistance < cursorDistance) {
          line(pointer.x, pointer.y, particle.x, particle.y,
            (1 - pointerDistance / cursorDistance) * pointer.strength * (lightTheme ? 0.35 : 0.45));
        }
      }

      context.globalAlpha = particle.opacity * (lightTheme ? 0.9 : 1);
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
  }

  function animate(time) {
    frame = 0;
    if (!hero.isConnected) {
      destroy();
      return;
    }
    if (!canAnimate()) return;
    var elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0;
    previousTime = time;
    var damping = Math.exp(-3 * elapsed);
    // Time-based easing stays consistent across pointer speeds and refresh rates.
    var follow = 1 - Math.exp(-12 * elapsed);
    var moveX = (pointer.targetX - pointer.x) * follow;
    var moveY = (pointer.targetY - pointer.y) * follow;
    pointer.x += moveX;
    pointer.y += moveY;
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-7 * elapsed));

    // Measure travel per second in the animation loop, so high-frequency input
    // does not add extra force. Acceleration eases in, then coasts back to idle.
    var pointerSpeed = elapsed && pointer.active ? Math.sqrt(moveX * moveX + moveY * moveY) / elapsed : 0;
    var targetMotion = Math.min(pointerSpeed / 700, 1);
    var motionResponse = targetMotion > pointer.motion ? 8 : 2.4;
    pointer.motion += (targetMotion - pointer.motion) * (1 - Math.exp(-motionResponse * elapsed));
    var energy = pointer.motion * pointer.strength;
    var driftMultiplier = 1 + energy * 1.6;
    var repelDistance = (width < 700 ? 115 : 155) + energy * 35;
    var repelForce = 340 + energy * 600;

    particles.forEach(function (particle) {
      if (pointer.strength > 0.005) {
        var dx = particle.x - pointer.x;
        var dy = particle.y - pointer.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < repelDistance) {
          // A soft force gives the dots momentum rather than snapping them away.
          if (distance < 0.1) { dx = 1; dy = 0; distance = 1; }
          var strength = Math.pow(1 - distance / repelDistance, 2) * repelForce * pointer.strength * elapsed;
          particle.pushX += dx / distance * strength;
          particle.pushY += dy / distance * strength;
        }
      }
      particle.pushX *= damping;
      particle.pushY *= damping;
      var pushSpeedSquared = particle.pushX * particle.pushX + particle.pushY * particle.pushY;
      if (pushSpeedSquared > 180 * 180) {
        var limit = 180 / Math.sqrt(pushSpeedSquared);
        particle.pushX *= limit;
        particle.pushY *= limit;
      }
      particle.x += (particle.driftX * driftMultiplier + particle.pushX) * elapsed;
      particle.y += (particle.driftY * driftMultiplier + particle.pushY) * elapsed;

      // Wrap beyond the edge, where the hero's clipping hides the transition.
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;
    });

    draw();
    frame = requestAnimationFrame(animate);
  }

  function canAnimate() {
    return !destroyed && pageActive && visible && !document.hidden &&
      !reducedMotion && width > 0 && height > 0;
  }

  function updatePlayback() {
    if (canAnimate()) {
      if (!frame) {
        previousTime = 0;
        frame = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      pointer.active = false;
      pointer.strength = 0;
      pointer.motion = 0;
    }
  }

  function onPointerMove(event) {
    if (event.pointerType === "touch" || reducedMotion) return;
    var bounds = hero.getBoundingClientRect();
    pointer.targetX = event.clientX - bounds.left;
    pointer.targetY = event.clientY - bounds.top;
    if (!pointer.active && pointer.strength < 0.005) {
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
    }
    pointer.active = true;
  }

  function clearPointer() { pointer.active = false; }

  function onMotionChange(event) {
    reducedMotion = event.matches;
    clearPointer();
    updatePlayback();
    draw();
  }

  function onPageHide() {
    pageActive = false;
    clearPointer();
    updatePlayback();
  }

  function onPageShow() {
    pageActive = true;
    resize();
  }

  function destroy() {
    destroyed = true;
    updatePlayback();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    themeObserver.disconnect();
    hero.removeEventListener("pointermove", onPointerMove);
    hero.removeEventListener("pointerleave", clearPointer);
    hero.removeEventListener("pointercancel", clearPointer);
    document.removeEventListener("visibilitychange", updatePlayback);
    window.removeEventListener("scroll", clearPointer);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
    motionQuery.removeEventListener("change", onMotionChange);
    delete canvas.dataset.particlesReady;
  }

  var resizeObserver = new ResizeObserver(resize);
  var visibilityObserver = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (!visible) clearPointer();
    updatePlayback();
  });
  var themeObserver = new MutationObserver(readPalette);

  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", clearPointer, { passive: true });
  hero.addEventListener("pointercancel", clearPointer, { passive: true });
  document.addEventListener("visibilitychange", updatePlayback);
  window.addEventListener("scroll", clearPointer, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  motionQuery.addEventListener("change", onMotionChange);
  resizeObserver.observe(hero);
  visibilityObserver.observe(hero);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class", "style"]
  });

  readPalette();
  resize();
}());
