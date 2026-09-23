/* Apply the saved palette before the stylesheet paints. Dark is the default. */
(function () {
  "use strict";
  var key = "salameh-theme";
  var root = document.documentElement;
  function savedTheme() {
    try { return localStorage.getItem(key) === "light" ? "light" : "dark"; }
    catch (_) { return "dark"; }
  }
  function apply(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      var label = "Switch to " + (theme === "dark" ? "light" : "dark") + " mode";
      button.setAttribute("aria-label", label);
      button.title = label;
    });
  }
  apply(savedTheme());
  document.addEventListener("DOMContentLoaded", function () {
    apply(root.dataset.theme);
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        var theme = root.dataset.theme === "dark" ? "light" : "dark";
        apply(theme);
        try { localStorage.setItem(key, theme); } catch (_) {}
      });
    });
  });
  window.addEventListener("storage", function (event) {
    if (event.key === key || event.key === null) apply(savedTheme());
  });
}());
