function normalizeMovieText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function applyMovieFilter(input) {
  var root = input.closest("body");
  var query = normalizeMovieText(input.value);
  var cards = root.querySelectorAll("[data-movie-card]");
  var hiddenCount = 0;
  cards.forEach(function(card) {
    var text = normalizeMovieText([
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.textContent
    ].join(" "));
    var hit = !query || text.indexOf(query) !== -1;
    card.style.display = hit ? "" : "none";
    if (!hit) {
      hiddenCount += 1;
    }
  });
  var empty = root.querySelector("[data-empty-result]");
  if (empty) {
    empty.style.display = hiddenCount === cards.length && cards.length > 0 ? "block" : "none";
  }
}

function bootSite() {
  var menuBtn = document.querySelector("[data-mobile-menu-btn]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-global-search]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      window.location.href = target;
    });
  });

  var slides = document.querySelectorAll("[data-hero-slide]");
  var dots = document.querySelectorAll("[data-hero-dot]");
  var current = 0;
  function setSlide(index) {
    current = index;
    slides.forEach(function(slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }
  if (slides.length > 1) {
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        setSlide(i);
      });
    });
    setInterval(function() {
      setSlide((current + 1) % slides.length);
    }, 5000);
  }

  document.querySelectorAll("[data-filter-input]").forEach(function(input) {
    input.addEventListener("input", function() {
      applyMovieFilter(input);
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
      applyMovieFilter(input);
    }
  });
}

function initMoviePlayer(src) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("movie-play");
  var started = false;
  var hls = null;
  function start() {
    if (!video || started) {
      if (video) {
        video.play().catch(function() {});
      }
      return;
    }
    started = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
    video.play().catch(function() {});
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (video) {
    video.addEventListener("click", function() {
      if (!started) {
        start();
      }
    });
    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }
  window.addEventListener("beforeunload", function() {
    if (hls) {
      hls.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;
document.addEventListener("DOMContentLoaded", bootSite);
