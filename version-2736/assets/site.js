document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var show = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    }

    var localInput = document.querySelector('[data-local-filter]');
    var localType = document.querySelector('[data-local-type]');
    var localList = document.querySelector('[data-filter-list]');
    if (localInput && localList) {
        var localCards = Array.prototype.slice.call(localList.querySelectorAll('.movie-card'));
        var localFilter = function () {
            var q = localInput.value.trim().toLowerCase();
            var type = localType ? localType.value : '';
            localCards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.type, card.dataset.region, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
                var typeText = (card.dataset.type || '') + ' ' + (card.dataset.tags || '');
                var ok = (!q || hay.indexOf(q) !== -1) && (!type || typeText.indexOf(type) !== -1);
                card.style.display = ok ? '' : 'none';
            });
        };
        localInput.addEventListener('input', localFilter);
        if (localType) {
            localType.addEventListener('change', localFilter);
        }
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var searchInput = searchPage.querySelector('[data-search-input]');
        var searchType = searchPage.querySelector('[data-search-type]');
        var searchRegion = searchPage.querySelector('[data-search-region]');
        var searchYear = searchPage.querySelector('[data-search-year]');
        var searchCards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (searchInput && initial) {
            searchInput.value = initial;
        }
        var runSearch = function () {
            var q = searchInput.value.trim().toLowerCase();
            var type = searchType.value;
            var region = searchRegion.value;
            var year = searchYear.value;
            searchCards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.type, card.dataset.region, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
                var ok = true;
                if (q && hay.indexOf(q) === -1) {
                    ok = false;
                }
                if (type && card.dataset.type !== type) {
                    ok = false;
                }
                if (region && card.dataset.region !== region) {
                    ok = false;
                }
                if (year && card.dataset.year !== year) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
            });
        };
        [searchInput, searchType, searchRegion, searchYear].forEach(function (el) {
            el.addEventListener('input', runSearch);
            el.addEventListener('change', runSearch);
        });
        runSearch();
    }
});
