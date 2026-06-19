function initMoviePlayer(source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var message = document.getElementById('playerMessage');
    var hlsInstance = null;

    var showMessage = function (text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add('show');
    };

    var attachSource = function () {
        if (!video || !source) {
            showMessage('视频暂时无法播放');
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage('视频加载失败，请稍后重试');
                }
            });
            return;
        }
        video.src = source;
    };

    var start = function () {
        if (!video) {
            return;
        }
        if (!video.src && !hlsInstance) {
            attachSource();
        }
        if (overlay) {
            overlay.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                showMessage('点击视频区域即可继续播放');
            });
        }
    };

    attachSource();
    if (overlay) {
        overlay.addEventListener('click', start);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
    }
}
