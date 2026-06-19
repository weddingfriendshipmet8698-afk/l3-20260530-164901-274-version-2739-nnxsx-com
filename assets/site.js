(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('is-active', i === current);
    });
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var index = parseInt(thumb.getAttribute('data-hero-thumb'), 10);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var count = document.querySelector('[data-search-count]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var year = normalize(yearFilter && yearFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));

      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.textContent);
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var matchType = !type || cardType.indexOf(type) !== -1;
      var show = matchKeyword && matchYear && matchType;

      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = '当前显示 ' + visible + ' 条内容';
    }
  }

  [searchInput, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
