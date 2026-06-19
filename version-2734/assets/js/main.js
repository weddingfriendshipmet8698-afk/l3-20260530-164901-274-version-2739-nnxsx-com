(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  function setupImageFallbacks() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.poster, .hero-bg');

        if (holder) {
          holder.classList.add('is-missing');
        }

        image.remove();
      }, { once: true });
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var section = panel.parentElement;
      var cards = selectAll('[data-card]', section);
      var searchInput = panel.querySelector('[data-search-input]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var counter = panel.querySelector('[data-result-count]');

      function applyFilters() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var cardText = normalize(card.getAttribute('data-keywords'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;

          if (keyword && cardText.indexOf(keyword) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visibleCount);
        }
      }

      [searchInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('[data-video-player]');
    var playButton = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var sourceButtons = selectAll('[data-source-url]');
    var hlsInstance = null;
    var currentSource = video ? video.getAttribute('data-default-src') : '';

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function destroyHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function loadSource(sourceUrl, shouldPlay) {
      if (!video || !sourceUrl) {
        return;
      }

      currentSource = sourceUrl;
      destroyHls();
      setMessage('正在加载播放线路...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');

          if (shouldPlay) {
            video.play().catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('当前线路加载失败，请切换其他高清线路。');
          }
        });
      } else {
        video.src = sourceUrl;
        video.load();
        setMessage('当前浏览器不支持 HLS，可更换浏览器或使用 Safari 播放。');
      }

      if (shouldPlay && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.play().catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        loadSource(button.getAttribute('data-source-url'), true);

        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
    });

    if (playButton) {
      playButton.addEventListener('click', function () {
        playButton.classList.add('is-hidden');
        loadSource(currentSource, true);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
        setMessage('');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupImageFallbacks();
    setupFilters();
    setupPlayer();
  });
})();
