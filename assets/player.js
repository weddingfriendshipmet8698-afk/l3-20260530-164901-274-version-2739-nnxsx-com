(function () {
  function setStatus(message) {
    var status = document.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function startPlayer() {
    var video = document.getElementById('movie-player');
    var startButton = document.querySelector('[data-player-start]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    if (!source) {
      setStatus('当前页面未检测到播放源。');
      return;
    }

    if (startButton) {
      startButton.classList.add('is-hidden');
    }

    setStatus('正在加载播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().then(function () {
        setStatus('正在播放。');
      }).catch(function () {
        setStatus('浏览器已加载播放源，请再次点击视频播放。');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().then(function () {
          setStatus('正在播放。');
        }).catch(function () {
          setStatus('播放源已加载，请再次点击视频播放。');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放初始化失败，请刷新页面或更换浏览器。');
          hls.destroy();
        }
      });
      return;
    }

    video.src = source;
    setStatus('浏览器不支持 HLS 初始化，已尝试使用原生播放。');
  }

  var button = document.querySelector('[data-player-start]');
  if (button) {
    button.addEventListener('click', startPlayer);
  }
})();
