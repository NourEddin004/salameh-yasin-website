/* Accessible descriptions for the shared navigation links. */
(function () {
  "use strict";
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-nav-description]"));

  function isActive(item) {
    return item.matches(":hover") || item.contains(document.activeElement);
  }

  items.forEach(function (item) {
    function resetWhenInactive() {
      if (!isActive(item)) item.removeAttribute("data-description-dismissed");
    }
    item.addEventListener("pointerleave", resetWhenInactive);
    item.addEventListener("focusout", function (event) {
      // relatedTarget handles even a rapid keyboard return to the same link.
      if (!item.matches(":hover") && !item.contains(event.relatedTarget)) {
        item.removeAttribute("data-description-dismissed");
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    items.forEach(function (item) {
      if (isActive(item)) item.setAttribute("data-description-dismissed", "");
    });
  });
}());
