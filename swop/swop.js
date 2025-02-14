// Define the backend URL
var backendUrl = 'swop/a.php';

// Global variables for messages
var sErrorCode = 'Incorrect Сode!',
    sErrorFileSize = 'File size limited!!!',
    sFileUploaded = 'File uploaded!',
    sValueSended = 'Value sended!';

function dochangecode() {
  $('#btnCheck').prop('disabled', $('#inputCode').val().length != 6);
}

function doCheck() {
  var enteredCode = $('#inputCode').val();
  $.ajax({
    url: backendUrl,
    type: 'post',
    data: { c: 'check', d: enteredCode },
    success: function (response) {
      if (response.data === 'playlist') {
        // The entered code is correct—load the playlist into the STB player.
        var playlistUrl = response.playlist;
        // Call your stbplayer's function to load the playlist URL
        stbPlay(playlistUrl);
      } else {
        alert(response.message);
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
  switch (l) {
    case 'ru':
      $('#inputCode').attr('placeholder', 'Код');
      $('#btnCheck').text('Проверить');
      $('#btnDownload').text('Скачать');
      $('#btnUpload').text('Отправить');
      $('#btnSend').text('Отправить');
      sErrorCode = 'Неверный код!';
      sErrorFileSize = 'Размер файла ограничен!!!';
      sFileUploaded = 'Файл отправлен!';
      sValueSended = 'Значение отправлено!';
      break;
    case 'uk':
      $('#inputCode').attr('placeholder', 'Код');
      $('#btnCheck').text('Перевірити');
      $('#btnDownload').text('Завантажити');
      $('#btnUpload').text('Надіслати');
      $('#btnSend').text('Надіслати');
      sErrorCode = 'Невірний код!';
      sErrorFileSize = 'Розмір файлу обмежений!!!';
      sFileUploaded = 'Файл відправлений!';
      sValueSended = 'Значення відправлено!';
      break;
  }
  $('#inputCode').val((window.location.href.split('?')[1] || '').split('&')[0]);
  dochangecode();
  if ($('#inputCode').val().length === 6) doCheck();
});
