(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var source = player.getAttribute("data-video");
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      bindSource();

      if (button) {
        button.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(setupPlayer);
})();
