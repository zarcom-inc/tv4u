// swop.js
// This script works with your existing stbplayer and prov.js files.
// It replaces the original drm-play swop page functionality.

// When the user types into the code field, enable the "Check" button when the code length equals 6.
function doChangeCode(){
  var code = $('#inputCode').val().trim();
  $('#btnCheck').prop('disabled', code.length !== 6);
}

// When the user clicks "Check", verify the code.
function doCheck(){
  var code = $('#inputCode').val().trim();
  // Here, "123456" is used as the valid code.
  // Replace with your own code‐validation logic as needed.
  var validCode = "123456";
  
  if (code === validCode) {
    // If the code is correct, disable further editing and show the playlist (m3u) form.
    $('#inputCode').prop('disabled', true);
    $('#btnCheck').hide();
    $('#divSend-m3u').show();
    $('#inputName-m3u').focus();
  } else {
    alert("Incorrect Code!");
  }
}

// When the user submits the m3u playlist form.
function doSend_m3u(){
  var playlistName = $('#inputName-m3u').val().trim();
  var playlistURL  = $('#inputWww-m3u').val().trim();
  var mediaURL     = $('#inputMedUrl-m3u').val().trim();

  if (!playlistURL) {
    alert("Please enter a valid m3u URL.");
    return;
  }
  
  // Optionally, save the playlist info using your prov.js functions.
  // For example: provSetPlaylist(playlistName, playlistURL, mediaURL);
  
  // Now, integrate with your stbplayer.
  // For example, call stbPlay() with the m3u URL.
  stbPlay(playlistURL);
  
  // Inform the user that the playlist is loaded.
  alert("Playlist loaded into player!");
  
  // Optionally, redirect or reload your player view:
  // window.location.href = "player.html?m3u=" + encodeURIComponent(playlistURL);
}
