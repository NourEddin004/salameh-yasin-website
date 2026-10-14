/* Accessible service-category selector with a restrained card-dealing transition. */
(function () {
  "use strict";

  var decks = document.querySelectorAll("[data-service-deck]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  decks.forEach(function (deck) {
    var tabs = Array.prototype.slice.call(deck.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(deck.querySelectorAll('[role="tabpanel"]'));
    var activeIndex = Math.max(0, tabs.findIndex(function (tab) {
      return tab.getAttribute("aria-selected") === "true";
    }));

    function replay(panel) {
      panel.classList.remove("is-dealing");
      if (reduceMotion.matches) return;
      void panel.offsetWidth;
      panel.classList.add("is-dealing");
    }

    function select(index, focusTab) {
      if (index < 0) index = tabs.length - 1;
      if (index >= tabs.length) index = 0;
      activeIndex = index;

      tabs.forEach(function (tab, tabIndex) {
        var selected = tabIndex === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach(function (panel, panelIndex) {
        var selected = panelIndex === index;
        panel.hidden = !selected;
        if (!selected) panel.classList.remove("is-dealing");
      });

      replay(panels[index]);
      if (focusTab) {
        tabs[index].focus();
        tabs[index].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        select(index, false);
      });

      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index + 1;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index - 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });

    var hash = window.location.hash.replace("#service-", "");
    var hashIndex = tabs.findIndex(function (tab) {
      return tab.dataset.serviceSlug === hash;
    });
    if (hashIndex >= 0) select(hashIndex, false);

    if ("IntersectionObserver" in window) {
      var hasEntered = false;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          deck.classList.toggle("is-motion-visible", entry.isIntersecting);
          if (entry.isIntersecting && !hasEntered) {
            hasEntered = true;
            replay(panels[activeIndex]);
          }
        });
      }, { threshold: 0.08 });
      observer.observe(deck);
    } else {
      deck.classList.add("is-motion-visible");
    }
  });
}());
