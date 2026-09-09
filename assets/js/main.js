/* ==========================================================================
   SALAMEH YASIN — PORTFOLIO
   Interaction + motion layer. No dependencies.
   Motion brief §09: restrained. Fade-and-rise 400ms / 12px, rails draw in,
   nothing bouncy. Everything below no-ops under prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- page ready */
  function ready() { document.body.classList.add("is-ready"); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  /* --------------------------------------------------- 1. scroll reveals */
  // A single observer drives every entrance animation on the page.
  var io = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          if (e.target.hasAttribute("data-count")) runCounters(e.target);
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 })
    : null;

  var REVEAL_SEL = ".rv, .rv-stagger, .reveal-lines, .lanes__inner, .steps, .cta, .map-wrap, [data-count]";

  function observeAll(root) {
    $$(REVEAL_SEL, root).forEach(function (el) {
      if (!io || REDUCED) {
        el.classList.add("is-in");
        if (el.hasAttribute("data-count")) runCounters(el);
        return;
      }
      io.observe(el);
    });
  }
  observeAll(document);

  /* --------------------------------------------------------- 2. counters */
  // Counts a numeral up to its target, preserving any prefix/suffix ("500+", "86%").
  function runCounters(scope) {
    $$("[data-to]", scope).forEach(function (el) {
      var to     = parseFloat(el.getAttribute("data-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (isNaN(to)) return;
      if (REDUCED) { el.textContent = to + suffix; return; }

      var dur = 1400, t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        // easeOutExpo — fast start, long settle
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(to * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      el.textContent = "0" + suffix;
      requestAnimationFrame(frame);
    });
  }

  /* ------------------------------------------------ 3. nav: stuck + progress */
  var nav      = $(".nav");
  var progress = $(".nav__progress");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 24);

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    updateSpine();
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------- 4. mobile drawer */
  var burger = $(".nav__burger");
  var drawer = $(".drawer");
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      drawer.classList.toggle("is-open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
    });
    $$("a", drawer).forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        drawer.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) burger.click();
    });
  }

  /* ------------------------------------------- 5. hero tile photography */
  // The tile columns are display:none below 1180px, but a plain src would
  // still be fetched there — ~400KB for something nobody sees. Attach the
  // src only when the columns are actually in play.
  var tileImgs = $$(".fl-tile img[data-src]");
  if (tileImgs.length) {
    var wide = window.matchMedia("(min-width: 1181px)");
    function loadTiles() {
      if (!wide.matches) return;
      tileImgs.forEach(function (img) {
        if (img.getAttribute("src")) return;
        img.src = img.getAttribute("data-src");
      });
    }
    loadTiles();
    if (wide.addEventListener) wide.addEventListener("change", loadTiles);
    else if (wide.addListener) wide.addListener(loadTiles);
  }

  /* ------------------------------------------------- 6. services tab group */
  $$("[data-tabs]").forEach(function (group) {
    var tabs   = $$(".tab", group);
    var ink    = $(".tabs__ink", group);
    var panels = $$(".tabpanel", group);

    // The indicator is a 1px bar, so scaleX maps 1:1 onto pixel width.
    function moveInk(tab) {
      if (!ink) return;
      ink.style.transform =
        "translateX(" + tab.offsetLeft + "px) scaleX(" + tab.offsetWidth + ")";
    }

    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p, n) { p.hidden = n !== i; });
      moveInk(tabs[i]);
      observeAll(panels[i]);
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select((i + d + tabs.length) % tabs.length, true);
      });
    });

    select(0);
    window.addEventListener("resize", function () {
      var active = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
      if (active) moveInk(active);
    });
    // Fonts land after first paint and shift tab widths — re-measure.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var active = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
        if (active) moveInk(active);
      });
    }
  });

  /* ------------------------------ 6b. services: numbered category rail */
  // Wireframe rail: the active row carries the fill and accent bar (both CSS),
  // so this only swaps selection and panel visibility.
  $$("[data-wtabs]").forEach(function (group) {
    var items  = $$(".wsvc__item", group);
    var panels = $$(".wsvc__panel", group);

    function select(i, focus) {
      items.forEach(function (b, n) {
        var on = n === i;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      panels.forEach(function (p, n) { p.hidden = n !== i; });
      observeAll(panels[i]);
    }

    items.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        select((i + d + items.length) % items.length, true);
      });
    });

    // The nav's Training link is index.html#training — open the matching
    // category and bring the block into view.
    function fromHash(scroll) {
      var slug = (location.hash || "").replace("#", "");
      if (!slug) return false;
      var i = -1;
      items.forEach(function (b, n) { if (b.getAttribute("data-slug") === slug) i = n; });
      if (i < 0) return false;
      select(i);
      if (scroll) group.scrollIntoView({ block: "start", behavior: REDUCED ? "auto" : "smooth" });
      return true;
    }

    if (!fromHash(true)) select(0);
    window.addEventListener("hashchange", function () { fromHash(true); });
  });

  /* ------------------------------------------ 7. two-lane timeline path prep */
  // Set each rail's dash length from its measured geometry so the draw-in
  // finishes cleanly regardless of viewport width.
  $$(".lane-path").forEach(function (p) {
    try {
      var len = Math.ceil(p.getTotalLength());
      p.style.setProperty("--len", len);
    } catch (err) { /* getTotalLength unsupported — CSS fallback length applies */ }
  });

  // Stagger node/label entrances along each rail.
  $$(".lanes__inner").forEach(function (inner) {
    $$(".lane-node, .lane-label, .lane-year", inner).forEach(function (el, i) {
      el.style.animationDelay = (420 + i * 55) + "ms";
    });
  });

  /* ------------------------------------------- 8. vertical timeline spine */
  var spine = $(".vtl__spine i");
  var vtl   = $(".vtl");
  function updateSpine() {
    if (!spine || !vtl) return;
    var r = vtl.getBoundingClientRect();
    var anchor = window.innerHeight * 0.62;
    var p = (anchor - r.top) / r.height;
    spine.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  updateSpine();

  /* --------------------------------------------------- 9. marquee doubling */
  // Duplicate the track contents so the -50% keyframe loops seamlessly.
  $$(".marquee__track").forEach(function (track) {
    if (track.dataset.doubled) return;
    track.dataset.doubled = "1";
    var clone = track.cloneNode(true);
    $$("*", clone).forEach(function (n) { n.setAttribute("aria-hidden", "true"); n.removeAttribute("id"); });
    while (clone.firstChild) track.appendChild(clone.firstChild);
  });

  /* -------------------------------------------- 10. experience-page filters */
  var filters = $$(".filter");
  if (filters.length) {
    var records = $$(".rec");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });

        records.forEach(function (rec) { rec.classList.add("is-filtering"); });
        window.setTimeout(function () {
          records.forEach(function (rec) {
            var tags = (rec.getAttribute("data-tags") || "").split(" ");
            rec.hidden = !(key === "all" || tags.indexOf(key) !== -1);
          });
          requestAnimationFrame(function () {
            records.forEach(function (rec) { rec.classList.remove("is-filtering"); });
          });
        }, REDUCED ? 0 : 200);
      });
    });
  }

  /* ------------------------------------------------- 11. calendar slot pick */
  var slotBtns = $$(".slotbtn");
  slotBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.disabled) return;
      slotBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      var f = $("#slot");
      if (f) f.value = b.getAttribute("data-slot") || b.textContent.trim();
    });
  });

  /* ------------------------------------------------------ 12. contact form */
  // No backend is wired up yet — compose a mailto so the form is never a dead
  // end, and say so plainly rather than faking a success state. Bound by class
  // so the page form and the dialog form share one handler.
  function bindEnquiry(form) {
    if (!form || form.dataset.bound) return;
    form.dataset.bound = "1";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var lines = [];
      d.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
      var status = form.querySelector(".form__note");
      if (status) {
        status.textContent = "Opening your email client with this enquiry ready to send…";
        status.style.color = "var(--action)";
      }
      window.location.href = "mailto:salameh.yasin@yahoo.com"
        + "?subject=" + encodeURIComponent("Enquiry via portfolio — " + (d.get("Organisation") || d.get("Name") || "New enquiry"))
        + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }
  $$("#enquiry, .enquiry-form").forEach(bindEnquiry);

  /* --------------------------------------------- 12b. contact as a dialog */
  // Every "Contact" / "Book a consultation" link still points at contact.html,
  // so it works with JS off and remains a real, linkable page. With JS on the
  // link is intercepted and the same form opens in a native <dialog>, which
  // brings its own focus trap, Esc handling and inertness for free.
  var dlg = null;

  function buildDialog() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "cdlg";
    dlg.innerHTML =
      '<form method="dialog" class="cdlg__x">' +
        '<button value="close" aria-label="Close">&times;</button>' +
      '</form>' +
      '<div class="cdlg__body">' +
        '<span class="eyebrow">Contact</span>' +
        '<h2 class="d3 cdlg__title">Tell me what you\'re building.</h2>' +
        '<p class="cdlg__lead">Academy design, digital transformation, Agile adoption, or a technical team that needs to start shipping.</p>' +
        '<form class="form enquiry-form">' +
          '<div class="field"><label for="m-name">Name</label><input id="m-name" name="Name" required autocomplete="name"></div>' +
          '<div class="field"><label for="m-email">Email</label><input id="m-email" name="Email" type="email" required autocomplete="email"></div>' +
          '<div class="field"><label for="m-org">Organisation <span class="field__opt">optional</span></label><input id="m-org" name="Organisation" autocomplete="organization"></div>' +
          '<div class="field"><label for="m-what">What are you building?</label><textarea id="m-what" name="What you are building" required></textarea></div>' +
          '<div class="field"><label for="m-need">What do you need?</label>' +
            '<select id="m-need" name="What you need" required>' +
              '<option value="">Choose a service</option>' +
              '<option>Development &amp; digital transformation</option>' +
              '<option>Training &amp; consultation</option>' +
              '<option>Project management</option>' +
              '<option>Something else</option>' +
            '</select></div>' +
          '<button class="btn btn--fill" type="submit">Send enquiry <span class="btn__arrow" aria-hidden="true">&rarr;</span></button>' +
          '<p class="form__note" role="status">This form opens your email client with the enquiry ready to send.</p>' +
        '</form>' +
        '<p class="cdlg__direct mono">Or go direct — ' +
          '<a href="mailto:salameh.yasin@yahoo.com">salameh.yasin@yahoo.com</a> · ' +
          '<a href="tel:+962776806986">+962 77 680 6986</a></p>' +
      '</div>';
    document.body.appendChild(dlg);
    bindEnquiry(dlg.querySelector(".enquiry-form"));

    // Click on the backdrop (outside the panel) closes it
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", function () { document.body.style.overflow = ""; });
    return dlg;
  }

  if (typeof HTMLDialogElement !== "undefined" && HTMLDialogElement.prototype.showModal) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="contact.html"]');
      if (!a) return;
      // Let modified clicks (new tab / new window) behave normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var d = buildDialog();
      document.body.style.overflow = "hidden";
      d.showModal();
      var first = d.querySelector("input, select, textarea");
      if (first) first.focus();
    });
  }

  /* ------------------------------------------------------------ 13. year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
