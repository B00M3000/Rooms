function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

// This is a protocol-relative URL as described here:
//     http://paulirish.com/2010/the-protocol-relative-url/
// If you're testing a local page accessed via a file:/// URL, please set tag.src to
//     "https://www.youtube.com/iframe_api" instead.
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '500',
    videoId: "dQw4w9WgXcQ",
    width: '750',
    playerVars: {
      'modestbranding': 1,
      'showinfo': 0,
      'mute': 1,
      'autoplay': 1
    },
    events: {
      'onReady': function() {
        player.unMute()
        player.playVideo()
      }
    }
  });
}