(function () {
    function closestScope(element) {
        return element.closest(".search-scope") || document;
    }

    function cardText(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
        ].join(" ").toLowerCase();
    }

    function applySearch(scope) {
        var input = scope.querySelector(".search-input");
        var active = scope.querySelector(".filter-chip.active");
        var query = input ? input.value.trim().toLowerCase() : "";
        var filter = active ? active.dataset.filter.toLowerCase() : "";
        var cards = scope.querySelectorAll(".movie-card");
        var shown = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var okQuery = !query || text.indexOf(query) !== -1;
            var okFilter = !filter || text.indexOf(filter) !== -1;
            var show = okQuery && okFilter;
            card.hidden = !show;
            if (show) {
                shown += 1;
            }
        });

        var empty = scope.querySelector(".empty-state");
        if (empty) {
            empty.hidden = shown !== 0;
        }
    }

    function setupSearch() {
        document.querySelectorAll(".search-input").forEach(function (input) {
            input.addEventListener("input", function () {
                applySearch(closestScope(input));
            });
        });

        document.querySelectorAll(".filter-chip").forEach(function (button) {
            button.addEventListener("click", function () {
                var scope = closestScope(button);
                scope.querySelectorAll(".filter-chip").forEach(function (chip) {
                    chip.classList.remove("active");
                });
                button.classList.add("active");
                applySearch(scope);
            });
        });
    }

    function setupNav() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".nav-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.slide || 0));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var frame = video ? video.closest(".video-frame") : null;
        var overlay = document.getElementById("playerOverlay");
        var playButton = document.getElementById("playButton");
        var muteButton = document.getElementById("muteButton");
        var fullButton = document.getElementById("fullButton");
        var attached = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function syncState() {
            if (frame) {
                frame.classList.toggle("is-playing", !video.paused);
            }
            if (playButton) {
                playButton.textContent = video.paused ? "▶" : "Ⅱ";
            }
            if (overlay) {
                overlay.hidden = !video.paused;
            }
        }

        function playVideo() {
            attachStream();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        function togglePlay() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }
        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }
        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "静" : "音";
            });
        }
        if (fullButton) {
            fullButton.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (frame && frame.requestFullscreen) {
                    frame.requestFullscreen();
                }
            });
        }
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", syncState);
        video.addEventListener("pause", syncState);
        video.addEventListener("ended", syncState);
        video.addEventListener("error", function () {
            if (overlay) {
                overlay.hidden = false;
                overlay.innerHTML = '<span class="big-play">▶</span>';
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
        syncState();
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupNav();
        setupSearch();
        setupHero();
    });
})();
