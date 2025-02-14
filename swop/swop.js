// Set the backend URL (make sure it starts with a slash so it’s relative to your site’s root)
var backendUrl = '/a.php';

// Global message strings
var sErrorCode = 'Incorrect Code!',
    sErrorFileSize = 'File size limited!!!',
    sFileUploaded = 'File uploaded!',
    sValueSended = 'Value sended!';

// When the user types a code, enable the Check button only when there are 4 characters.
function dochangecode() {
  $('#btnCheck').prop('disabled', $('#inputCode').val().length !== 4);
}

function doCheck() {
  var enteredCode = $('#inputCode').val().trim();
  $.ajax({
    url: backendUrl,
    type: 'post',
    data: { c: 'check', d: enteredCode },
    // Ensure cookies are sent (if testing cross‑domain)
    xhrFields: { withCredentials: true },
    success: function (response) {
      if (response.status === 'success' && response.data === 'playlist') {
        // The entered code is correct—load the playlist into the STB player.
        var playlistUrl = response.playlist;
        // Call your STB player function (for example, stbPlay) to load the playlist.
        stbPlay(playlistUrl);
      } else {
        alert(response.message || sErrorCode);
      }
    },
    error: function () {
      alert('Error checking the code');
    }
  });
}

function doDownload() {
  window.open(backendUrl + '?c=download&d=' + $('#inputCode').val(), '_blank');
  location.reload();
}

function doFindFile() {
  $('#my_hidden_file').val('');
  $('#my_hidden_file').click();
}

function doUpload() {
  if ($('#my_hidden_file').prop('files')[0].size > 300000) {
    alert(sErrorFileSize);
    return;
  }
  var form_data = new FormData();
  form_data.append('c', 'upload');
  form_data.append('d', $('#inputCode').val());
  form_data.append('file', $('#my_hidden_file').prop('files')[0]);
  $.ajax({
    url: backendUrl,
    dataType: 'text',
    cache: false,
    contentType: false,
    processData: false,
    data: form_data,
    type: 'post',
    success: function (php_script_response) {
      alert(sFileUploaded);
      location.reload();
    },
    error: function (jqXHR) {
      alert(jqXHR.responseText);
      console.log('error:' + JSON.stringify(jqXHR));
    }
  });
}

function doSend() {
  $.ajax({
    url: backendUrl,
    data: { c: 'send_val', d: $('#inputCode').val(), v: $('#inputVar').val() },
    type: 'post',
    success: function (json) {
      alert(sValueSended);
      window.location.href = window.location.href.split('?')[0];
    },
    error: function (jqXHR) {
      alert(jqXHR.responseText);
      console.log('error:' + JSON.stringify(jqXHR));
    }
  });
}

function doSend_m3u() {
  $.ajax({
    url: backendUrl,
    data: {
      c: 'send_m3u',
      d: $('#inputCode').val(),
      name: $('#inputName-m3u').val(),
      www: $('#inputWww-m3u').val(),
      medUrl: $('#inputMedUrl-m3u').val()
    },
    type: 'post',
    success: function (json) {
      alert(sValueSended);
      window.location.href = window.location.href.split('?')[0];
    },
    error: function (jqXHR) {
      alert(jqXHR.responseText);
      console.log('error:' + JSON.stringify(jqXHR));
    }
  });
}

function doSend_ed() {
  $.ajax({
    url: backendUrl,
    data: {
      c: 'send_ed',
      d: $('#inputCode').val(),
      edkey: $('#input-edkey').val(),
      vpurl: $('#input-vpurl').val(),
      edurl: $('#input-edurl').val()
    },
    type: 'post',
    success: function (json) {
      alert(sValueSended);
      window.location.href = window.location.href.split('?')[0];
    },
    error: function (jqXHR) {
      alert(jqXHR.responseText);
      console.log('error:' + JSON.stringify(jqXHR));
    }
  });
}

$(document).ready(function () {
  var l = (navigator.language || '').substr(0, 2);
  if (l === 'ru') {
    $('#inputCode').attr('placeholder', 'Код');
    $('#btnCheck').text('Проверить');
    $('#btnDownload').text('Скачать');
    $('#btnUpload').text('Отправить');
    $('#btnSend').text('Отправить');
    sErrorCode = 'Неверный код!';
    sErrorFileSize = 'Размер файла ограничен!!!';
    sFileUploaded = 'Файл отправлен!';
    sValueSended = 'Значение отправлено!';
  } else if (l === 'uk') {
    $('#inputCode').attr('placeholder', 'Код');
    $('#btnCheck').text('Перевірити');
    $('#btnDownload').text('Завантажити');
    $('#btnUpload').text('Надіслати');
    $('#btnSend').text('Надіслати');
    sErrorCode = 'Невірний код!';
    sErrorFileSize = 'Розмір файлу обмежений!!!';
    sFileUploaded = 'Файл відправлений!';
    sValueSended = 'Значення відправлено!';
  }
  // If a code is provided via the URL query string, prefill it.
  $('#inputCode').val((window.location.href.split('?')[1] || '').split('&')[0]);
  dochangecode();
  if ($('#inputCode').val().length === 4) {
    doCheck();
  }
});
