(function () {
    var mobileButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
    var heroIndex = 0;
    var heroTimer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === heroIndex);
        });
        dots.forEach(function (dot) {
            dot.classList.toggle('active', Number(dot.getAttribute('data-hero-target')) === heroIndex);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-target')));
                if (heroTimer) {
                    clearInterval(heroTimer);
                }
                heroTimer = setInterval(function () {
                    setHero(heroIndex + 1);
                }, 5000);
            });
        });
        heroTimer = setInterval(function () {
            setHero(heroIndex + 1);
        }, 5000);
    }

    document.querySelectorAll('.library-panel').forEach(function (panel) {
        var input = panel.querySelector('.search-field');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('.filter-button'));
        var cards = Array.prototype.slice.call(panel.querySelectorAll('.movie-card'));
        var count = panel.querySelector('.result-count');
        var activeFilter = '全部';

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var passSearch = !q || haystack.indexOf(q) !== -1;
                var passFilter = activeFilter === '全部' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                var visible = passSearch && passFilter;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + shown + ' / ' + cards.length;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || '全部';
                buttons.forEach(function (btn) {
                    btn.classList.toggle('active', btn === button);
                });
                applyFilter();
            });
        });

        applyFilter();
    });

    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('.hls-player');
        var button = box.querySelector('.play-overlay');
        var hlsInstance = null;

        function start() {
            if (!video) {
                return;
            }
            var src = video.getAttribute('data-src');
            if (!src) {
                return;
            }
            box.classList.add('playing');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', src);
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
                return;
            }

            if (!video.getAttribute('src')) {
                video.setAttribute('src', src);
            }
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', start);
        }
    });
})();
