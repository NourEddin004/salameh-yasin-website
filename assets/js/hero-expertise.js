/* Upright service cards travel around one wheel; native links remain intact. */
(function () {
  "use strict";
  var hero = document.querySelector(".fl-hero--interactive");
  var expertise = document.querySelector(".hero-expertise");
  var map = expertise && expertise.querySelector(".expertise-map");
  var cards = expertise && Array.prototype.slice.call(expertise.querySelectorAll("[data-service]"));
  if (!hero || !map || !cards.length || map.dataset.wheelReady === "true") return;
  map.dataset.wheelReady = "true";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var staticLayout = window.matchMedia("(max-width: 560px), (hover: none) and (pointer: coarse)");
  var fullTurn = Math.PI * 2;
  var phase = -Math.PI * 0.75;
  var width = 0;
  var height = 0;
  var geometry = null;
  var poses = [];
  var transition = null;
  var frame = 0;
  var previousTime = 0;
  var visible = true;
  var pageActive = true;
  var destroyed = false;
  var hovered = null;
  var focused = null;
  var expanded = null;
  var dismissed = false;
  var pointer = { x: null, y: null, travel: 0, lockedUntil: 0 };
  var pointerTimer = 0;
  var pointerQueued = false;
  var rendered = cards.map(function () { return {}; });
  var wheelProperties = ["--wheel-x", "--wheel-y", "--wheel-width", "--wheel-height"];

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function clockwise(angle) { return ((angle % fullTurn) + fullTurn) % fullTurn; }

  function nearestAngle(angle, reference) {
    return reference + Math.atan2(Math.sin(angle - reference), Math.cos(angle - reference));
  }

  function copyPose(pose) {
    return { angle: pose.angle, radius: pose.radius, width: pose.width, height: pose.height,
      offsetX: pose.offsetX, offsetY: pose.offsetY };
  }

  function idlePose(index) {
    return { angle: phase + index * fullTurn / cards.length, radius: geometry.radius,
      width: geometry.idleWidth, height: 112, offsetX: 0, offsetY: 0 };
  }

  function targets() {
    var next = cards.map(function (_, index) { return idlePose(index); });
    var starts = poses.map(function (pose) { return pose.angle; });
    if (!expanded) {
      next.forEach(function (pose, index) {
        pose.angle = nearestAngle(pose.angle, poses[index].angle);
      });
      return { poses: next, starts: starts };
    }

    var selectedIndex = cards.indexOf(expanded);
    // A compact card expands exactly where it is now, not at its old idle angle.
    var anchor = poses[selectedIndex].angle;
    var selected = next[selectedIndex];
    selected.angle = anchor;
    selected.width = geometry.expandedWidth;
    selected.height = geometry.expandedHeight;
    var orbitX = width / 2 + Math.cos(anchor) * geometry.radius;
    var orbitY = height / 2 + Math.sin(anchor) * geometry.radius;
    selected.offsetX = clamp(orbitX, selected.width / 2 + 10, width - selected.width / 2 - 10) - orbitX;
    selected.offsetY = clamp(orbitY, selected.height / 2 + 10, height - selected.height / 2 - 10) - orbitY;

    var others = cards.map(function (_, index) {
      return { index: index, offset: clockwise(poses[index].angle - anchor) };
    }).filter(function (entry) { return entry.index !== selectedIndex; });
    others.sort(function (a, b) { return a.offset - b.offset; });

    // Nudge the opposite arc if an upright compact card would touch the selection.
    // This small search runs only when choosing targets, never in the frame loop.
    var selectedX = orbitX + selected.offsetX;
    var selectedY = orbitY + selected.offsetY;
    function clusterFits(centre) {
      return others.every(function (_, slot) {
        var angle = centre + (slot - (others.length - 1) / 2) * geometry.compactStep;
        var x = width / 2 + Math.cos(angle) * geometry.radius;
        var y = height / 2 + Math.sin(angle) * geometry.radius;
        return Math.abs(x - selectedX) >= (geometry.compactWidth + selected.width) / 2 + 4 ||
          Math.abs(y - selectedY) >= (72 + selected.height) / 2 + 4;
      });
    }
    var clusterCentre = anchor + Math.PI;
    if (!clusterFits(clusterCentre)) {
      for (var degree = 1; degree <= 30; degree++) {
        var offset = degree * Math.PI / 180;
        if (clusterFits(anchor + Math.PI + offset)) {
          clusterCentre = anchor + Math.PI + offset;
          break;
        }
        if (clusterFits(anchor + Math.PI - offset)) {
          clusterCentre = anchor + Math.PI - offset;
          break;
        }
      }
    }
    others.forEach(function (entry, slot) {
      var pose = next[entry.index];
      pose.angle = clusterCentre + (slot - (others.length - 1) / 2) * geometry.compactStep;
      pose.width = geometry.compactWidth;
      pose.height = 72;
      // Unwrap in clockwise order so cards follow arcs without passing the selection.
      starts[entry.index] = anchor + entry.offset;
    });
    return { poses: next, starts: starts };
  }

  function writeCard(index, property, value) {
    if (rendered[index][property] === value) return;
    rendered[index][property] = value;
    cards[index].style.setProperty(property, value);
  }

  function render() {
    if (!geometry || staticLayout.matches || destroyed) return;
    poses.forEach(function (pose, index) {
      var x = width / 2 + Math.cos(pose.angle) * pose.radius + pose.offsetX;
      var y = height / 2 + Math.sin(pose.angle) * pose.radius + pose.offsetY;
      // Keep a shrinking former selection in bounds while it rejoins the arc.
      x = clamp(x, pose.width / 2 + 10, width - pose.width / 2 - 10);
      y = clamp(y, pose.height / 2 + 10, height - pose.height / 2 - 10);
      var left = x - pose.width / 2;
      var top = y - pose.height / 2;
      if (expanded && !transition) {
        var ratio = window.devicePixelRatio || 1;
        left = Math.round(left * ratio) / ratio;
        top = Math.round(top * ratio) / ratio;
      }
      writeCard(index, "--wheel-x", left.toFixed(3) + "px");
      writeCard(index, "--wheel-y", top.toFixed(3) + "px");
      writeCard(index, "--wheel-width", pose.width.toFixed(3) + "px");
      writeCard(index, "--wheel-height", pose.height.toFixed(3) + "px");
    });
    map.style.setProperty("--wheel-phase", (phase * 180 / Math.PI).toFixed(3) + "deg");
  }

  function retarget(immediate) {
    if (!geometry || !poses.length) return;
    var destination = targets();
    if (immediate || reduced.matches) {
      poses = destination.poses;
      transition = null;
      render();
    } else {
      transition = {
        elapsed: 0,
        from: poses.map(function (pose, index) {
          var start = copyPose(pose);
          start.angle = destination.starts[index];
          return start;
        }),
        to: destination.poses
      };
    }
    sync();
  }

  function resize() {
    if (destroyed) return;
    map.classList.toggle("is-wheel", !staticLayout.matches);
    if (staticLayout.matches) {
      geometry = null;
      poses = [];
      transition = null;
      width = height = 0;
      cards.forEach(function (card, index) {
        wheelProperties.forEach(function (property) { card.style.removeProperty(property); });
        rendered[index] = {};
      });
      map.style.removeProperty("--wheel-radius");
      map.style.removeProperty("--wheel-phase");
      sync();
      return;
    }
    var nextWidth = map.clientWidth;
    var nextHeight = map.clientHeight;
    if (nextWidth === width && nextHeight === height && geometry) {
      sync();
      return;
    }
    width = nextWidth;
    height = nextHeight;
    if (!width || !height) {
      geometry = null;
      sync();
      return;
    }
    var idleWidth = clamp(width * 0.32, 144, 188);
    var radius = Math.max(1, Math.min(width / 2 - idleWidth / 2 - 12, height / 2 - 56 - 12));
    var compactWidth = Math.min(112, width * 0.2);
    geometry = {
      idleWidth: idleWidth,
      radius: radius,
      expandedWidth: Math.min(340, width * 0.57),
      expandedHeight: Math.min(280, height - 20),
      compactWidth: compactWidth,
      compactStep: 2 * Math.asin(Math.min(1, (Math.hypot(compactWidth, 72) + 6) / (2 * radius)))
    };
    map.style.setProperty("--wheel-radius", radius.toFixed(3) + "px");
    if (!poses.length) poses = cards.map(function (_, index) { return idlePose(index); });
    retarget(true);
  }

  function canAnimate() {
    return !destroyed && pageActive && visible && !document.hidden &&
      !reduced.matches && !staticLayout.matches && Boolean(geometry);
  }

  function shouldRun() {
    return canAnimate() && (transition || (!hovered && !focused && !expanded));
  }

  function sync() {
    hero.classList.toggle("is-motion-paused", !pageActive || !visible || document.hidden || staticLayout.matches);
    if (shouldRun()) {
      if (!frame) {
        previousTime = 0;
        frame = requestAnimationFrame(animate);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }
  }

  function animate(time) {
    frame = 0;
    if (!map.isConnected) {
      destroy();
      return;
    }
    if (!canAnimate()) return;
    var elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.04) : 0;
    previousTime = time;
    if (transition) {
      transition.elapsed += elapsed;
      var progress = Math.min(1, transition.elapsed / 0.6);
      var ease = progress * progress * (3 - 2 * progress);
      poses = transition.from.map(function (start, index) {
        var end = transition.to[index];
        var pose = {};
        Object.keys(start).forEach(function (key) { pose[key] = start[key] + (end[key] - start[key]) * ease; });
        return pose;
      });
      if (progress === 1) transition = null;
    } else if (!hovered && !focused && !expanded) {
      phase += elapsed * fullTurn / 40;
      poses = cards.map(function (_, index) { return idlePose(index); });
    }
    render();
    if (!transition && pointerQueued && !pointerTimer) queuePointerCheck();
    if (shouldRun()) frame = requestAnimationFrame(animate);
    else previousTime = 0;
  }

  function expand() {
    var keyboardFocused = focused && focused.matches(":focus-visible");
    var selected = dismissed || staticLayout.matches ? null : (keyboardFocused ? focused : (hovered || focused));
    if (selected !== expanded) {
      cancelPointerCheck();
      pointer.lockedUntil = performance.now() + (reduced.matches ? 0 : 640);
      pointer.travel = 0;
      if (selected && poses.length) {
        var index = cards.indexOf(selected);
        phase = poses[index].angle - index * fullTurn / cards.length;
      }
      expanded = selected;
      expertise.classList.toggle("has-expanded", Boolean(selected));
      cards.forEach(function (card) {
        card.classList.toggle("is-expanded", card === selected);
        card.classList.toggle("is-dimmed", Boolean(selected && card !== selected));
      });
      if (selected) expertise.dataset.active = selected.dataset.service;
      retarget(false);
    }
    sync();
  }

  function resetPointer() {
    pointer.x = null;
    pointer.y = null;
    pointer.travel = 0;
  }

  function cancelPointerCheck() {
    window.clearTimeout(pointerTimer);
    pointerTimer = 0;
    pointerQueued = false;
  }

  function selectPointerCard() {
    var target = document.elementFromPoint(pointer.x, pointer.y);
    if (!target || !map.contains(target)) return;
    var card = target.closest("[data-service]");
    if (!card || cards.indexOf(card) === -1 || card === hovered) return;
    hovered = card;
    dismissed = false;
    expand();
  }

  function queuePointerCheck() {
    if (pointerTimer) return;
    pointerTimer = window.setTimeout(function () {
      pointerTimer = 0;
      if (!pointerQueued) return;
      // A slow frame rate may extend the tween; its completion will resolve this.
      if (transition) return;
      pointerQueued = false;
      if (destroyed || !pageActive || !visible || document.hidden || staticLayout.matches) return;
      selectPointerCard();
    }, Math.max(0, pointer.lockedUntil - performance.now()) + 20);
  }

  function onPointerMove(event) {
    if (event.pointerType === "touch" || staticLayout.matches) return;
    var firstMovement = pointer.x === null;
    if (!firstMovement) {
      var dx = event.clientX - pointer.x;
      var dy = event.clientY - pointer.y;
      pointer.travel += Math.sqrt(dx * dx + dy * dy);
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    var intentional = firstMovement || pointer.travel >= 4;
    if (performance.now() < pointer.lockedUntil || transition) {
      if (intentional) {
        pointerQueued = true;
        queuePointerCheck();
        pointer.travel = 0;
      }
      return;
    }
    if (!intentional) return;
    pointer.travel = 0;
    cancelPointerCheck();
    selectPointerCard();
  }

  function onPointerLeave() {
    cancelPointerCheck();
    hovered = null;
    resetPointer();
    expand();
  }

  function onFocus(event) {
    focused = event.currentTarget;
    dismissed = false;
    expand();
  }

  function onBlur(event) {
    if (focused === event.currentTarget) focused = null;
    if (!map.contains(event.relatedTarget)) {
      cancelPointerCheck();
      hovered = null;
      pointer.travel = 0;
    }
    expand();
  }

  function onKeyDown(event) {
    if (event.key !== "Escape") return;
    cancelPointerCheck();
    if (!hovered && !focused) return;
    dismissed = true;
    expand();
  }

  function onMotionChange() {
    if (reduced.matches) retarget(true);
    sync();
  }

  function onLayoutChange() {
    cancelPointerCheck();
    hovered = null;
    dismissed = false;
    resetPointer();
    resize();
    expand();
  }

  function onVisibilityChange() {
    if (document.hidden) cancelPointerCheck();
    sync();
  }

  function onPageHide() { cancelPointerCheck(); pageActive = false; sync(); }
  function onPageShow() { pageActive = true; resize(); sync(); }

  function mediaListener(query, method, handler) {
    if (query[method + "EventListener"]) query[method + "EventListener"]("change", handler);
    else query[method + "Listener"](handler);
  }

  function destroy() {
    destroyed = true;
    cancelPointerCheck();
    sync();
    if (resizeObserver) resizeObserver.disconnect();
    if (visibilityObserver) visibilityObserver.disconnect();
    map.removeEventListener("pointermove", onPointerMove);
    map.removeEventListener("pointerleave", onPointerLeave);
    cards.forEach(function (card) {
      card.removeEventListener("focus", onFocus);
      card.removeEventListener("blur", onBlur);
    });
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("pageshow", onPageShow);
    mediaListener(reduced, "remove", onMotionChange);
    mediaListener(staticLayout, "remove", onLayoutChange);
    delete map.dataset.wheelReady;
  }

  map.addEventListener("pointermove", onPointerMove, { passive: true });
  map.addEventListener("pointerleave", onPointerLeave, { passive: true });
  cards.forEach(function (card) {
    card.style.removeProperty("--compact-slot");
    card.addEventListener("focus", onFocus);
    card.addEventListener("blur", onBlur);
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  mediaListener(reduced, "add", onMotionChange);
  mediaListener(staticLayout, "add", onLayoutChange);
  var resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  var visibilityObserver = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (!visible) {
      cancelPointerCheck();
      hovered = null;
      resetPointer();
    }
    expand();
  }) : null;
  if (resizeObserver) resizeObserver.observe(map);
  if (visibilityObserver) visibilityObserver.observe(expertise);
  resize();
}());
