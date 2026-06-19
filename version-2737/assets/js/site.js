(function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";

      if (!value) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var scope = panel.closest("section") || document;
    var input = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var emptyState = scope.querySelector("[data-empty-state]");
    var query = new URLSearchParams(window.location.search).get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function matchSelect(card, select, attr) {
      if (!select || !select.value) {
        return true;
      }

      return normalize(card.getAttribute(attr)) === normalize(select.value);
    }

    function apply() {
      var keyword = input ? normalize(input.value) : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (!matchSelect(card, year, "data-year")) {
          ok = false;
        }

        if (!matchSelect(card, region, "data-region")) {
          ok = false;
        }

        if (!matchSelect(card, type, "data-type")) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
