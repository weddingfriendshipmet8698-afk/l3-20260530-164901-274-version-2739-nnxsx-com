(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      startHero();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartHero();
      });
    });

    showSlide(0);
    startHero();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(scope) {
    var queryInput = scope.querySelector('.movie-search');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('.movie-select'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    if (!cards.length) {
      cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    }

    var empty = scope.querySelector('[data-empty-state]');
    var query = normalize(queryInput ? queryInput.value : '');
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var matched = !query || text.indexOf(query) !== -1;

      selects.forEach(function (select) {
        var value = normalize(select.value);
        var field = select.getAttribute('data-filter-field');
        var target = normalize(card.getAttribute('data-' + field));

        if (value && target.indexOf(value) === -1) {
          matched = false;
        }
      });

      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.filter-scope')).forEach(function (scope) {
    var controls = Array.prototype.slice.call(scope.querySelectorAll('.movie-search, .movie-select'));

    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilter(scope);
      });
      control.addEventListener('change', function () {
        applyFilter(scope);
      });
    });
  });

  function startVideo(player) {
    var video = player.querySelector('video');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (!player.hlsReady) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        player.hlsInstance = hls;
      } else {
        video.src = stream;
      }

      player.hlsReady = true;
    }

    player.classList.add('playing');
    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');

    if (playButton) {
      playButton.addEventListener('click', function () {
        startVideo(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startVideo(player);
      });
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
    }
  });
})();
