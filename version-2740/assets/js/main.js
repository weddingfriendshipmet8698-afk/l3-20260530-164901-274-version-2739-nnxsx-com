(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var button = document.querySelector(".mobile-nav-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".movie-search");
      var region = scope.querySelector(".region-filter");
      var type = scope.querySelector(".type-filter");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      if (!cards.length) {
        return;
      }
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
          var okType = !typeValue || cardType.indexOf(typeValue) !== -1;
          card.hidden = !(okKeyword && okRegion && okType);
        });
      }
      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var hlsInstance = null;
  if (!video || !source) {
    return;
  }
  function attemptPlay() {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }
  function start() {
    if (started) {
      attemptPlay();
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", attemptPlay, { once: true });
      attemptPlay();
      return;
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        attemptPlay();
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          }
        }
      });
      return;
    }
    video.src = source;
    video.addEventListener("loadedmetadata", attemptPlay, { once: true });
    attemptPlay();
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });
}
