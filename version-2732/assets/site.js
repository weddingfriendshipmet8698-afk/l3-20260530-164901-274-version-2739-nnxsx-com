import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function initSearchFilters() {
  const scopes = document.querySelectorAll('[data-search-scope]');

  scopes.forEach((scope) => {
    const input = scope.querySelector('[data-search-input]') || document.querySelector('[data-search-input]');
    const result = scope.querySelector('[data-search-result]') || document.querySelector('[data-search-result]');
    const selects = scope.querySelectorAll('[data-filter-field]');
    const localContainer = scope.closest('.content-section') || scope.parentElement || document;
    let cards = Array.from(localContainer.querySelectorAll('[data-search-card]'));

    if (cards.length === 0) {
      cards = Array.from(document.querySelectorAll('[data-search-card]'));
    }

    if (!input || cards.length === 0) {
      return;
    }

    const apply = () => {
      const query = input.value.trim().toLowerCase();
      const filters = Array.from(selects).map((select) => ({
        field: select.dataset.filterField,
        value: select.value.trim(),
      }));
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
        ].join(' ').toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesFilters = filters.every(({ field, value }) => {
          if (!value || !field) {
            return true;
          }
          return (card.dataset[field] || '').includes(value);
        });

        const show = matchesQuery && matchesFilters;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    input.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  });
}

function initPlayers() {
  const videos = document.querySelectorAll('video[data-m3u8]');

  videos.forEach((video) => {
    const source = video.dataset.m3u8;
    const card = video.closest('.player-card');
    const startButton = card ? card.querySelector('[data-player-start]') : null;

    if (!source) {
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          console.warn('HLS fatal error:', data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    const play = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          video.controls = true;
        });
      }
    };

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    video.addEventListener('play', () => {
      if (card) {
        card.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', () => {
      if (card) {
        card.classList.remove('is-playing');
      }
    });
  });
}

ready(() => {
  initMobileMenu();
  initSearchFilters();
  initPlayers();
});
