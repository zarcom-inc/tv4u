version += ' pc-0219';
// epgCash = 50000;
var stb = null;
var video = null, videopip = null;
var stbPlayers = ['html5', 'hls.js', 'shaka'];
var keys = {
  RIGHT: 0x27,    // 39
  LEFT: 0x25,     // 37
  DOWN: 0x28,     // 40
  UP: 0x26,       // 38
  RETURN: 0x2719,
  EXIT: 0x27c6,
  TOOLS: 0x2797,
  FF: 0x1a1,
  RW: 0x19c,
  NEXT: 0x27f9,
  PREV: 0x27f8,
  ENTER: 0x0d,    // hex for 13
  RED: 0x193,
  GREEN: 0x194,
  YELLOW: 0x195,
  BLUE: 0x196,
  CH_LIST: 0x2759,
  CH_UP: 0x1ab,
  CH_DOWN: 0x1ac,
  N0: 0x30,
  N1: 0x31,
  N2: 0x32,
  N3: 0x33,
  N4: 0x34,
  N5: 0x35,
  N6: 0x36,
  N7: 0x37,
  N8: 0x38,
  N9: 0x39,
  PRECH: 0x27ce,
  POWER: 0x0,
  PLAY: 0x19f,
  STOP: 0x19d,
  PAUSE: 0x13,
  SUBT: 0x27d8,
  INFO: 0x1c9,
  REC: 0x0,
  MUTE: 0x0,
  VOL_UP: 0x0,
  VOL_DOWN: 0x0,
  EPG: 0x1ca,
  ZOOM: 0x0,
  ASPECT: 0x279c,
  AUDIO: 0x27ed,
  SETUP: 0x0,
  PIP: 0x0
};

var strEXIT = 'Esc';
var strENTER = 'ENTER';
var strTools = '<span class="fontello">&#xe808;</span>';
var strInfo = '<span class="fontello">&#xe810;</span>';
var strEPG = '';
var strPip = 'W';
var strAspect = 'A';
var strZoom = 'E';
var strAudio = 'S';
var strPRECH = '?';
var strRETURN = '<span class="fontello">&#xe804;</span>';
var strSETUP = '§';
var strLANG = 'SHIFT';

function stbEventToKeyCode(event){
    // event.preventDefault();
    if(event.keyCode==76){
        if(isNormalScreen()) openFullscreen();
        else closeFullscreen();
    }
    return event.keyCode;
}

function isNormalScreen(){
    try{ return !document.fullscreen && !document.mozFullScreen && !document.webkitFullScreen && !document.msRequestFullscreen; }catch(e){ return true;}
}
/* View in fullscreen */
function openFullscreen() {
  var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}
function stbExit(){window.history.back(); }

//function stbExit(){window.close();}
function onEnded() {
   if (player){
   player.unload()
   .then(function () {
   video.pause();
   video.removeAttribute('src')});
   } else {video.pause();video.src="";}
}
function onError(e) {alert('Error code: ', e.code, ', Object: ', e);}
function onErrorEvent(event) {onError(event.detail);}

async function initPlayer(url) {
  // Create a Player instance.
  // const video = document.getElementById('video');
  const player = new shaka.Player(video);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  // player.addEventListener('error', onErrorEvent);
      // Load the source into the Player.
//      player.load(source);

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(url);

    video.play();
    // This runs if the asynchronous load is successful.
//    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}
function _initPlayer() {
  const player = new shaka.Player(video);
  window.player = player;
  player.addEventListener('error', onErrorEvent);
  video.addEventListener('ended', onEnded);
}
async function _startPlayer(url) {
  if(url.indexOf('strm.yandex.ru')>0||url.indexOf('.cdn.ngenix.net')>0){player.configure({drm:{clearKeys:key}});}
  try {await player.load(url);video.play();}catch(e){onError(e);}
}

var hls = null, player = null, url_c=null,dash=null,mpeg_ts=null,okko_id=1,drm_okko=0,okko_pl=0;
var url_r;var d_pause=0,ua;
function stbPlay(url, pos){ drm_okko=0;
    try{ua=chanels[curList[primaryIndex]].ua !="" ?chanels[curList[primaryIndex]].ua: 0;}catch (e){ua=0;}
    console.log ("ua: "+ua);

        if (url.indexOf('starnet-md.') >0){url=starnet(url);}
        else if (url.indexOf('//www.voka.tv/') >0){url=voka(url);}
        else if (url.indexOf('24htv.platform24.tv') >0||url.indexOf('api.24h.tv') >0) {url=tv24(url);}
        else if (url.indexOf('id=okko') >0) {drm_okko=1;url=okko(url);} 
        else if (url.indexOf('.drmplay.top') >0) {url=repurl(url);} 
    if(pos) url += '#t='+pos; url_c=url,url_r=url;if(playType == 0){d_pause=0;}else{d_pause=1;} //eRest=0;

    if(hls) {onEnded();hls.destroy(); hls = null;}
    if (mpeg_ts){onEnded();mpegts_destroy();mpeg_ts=null}
    if((sPlayers === 2) && shaka.Player.isBrowserSupported()) {
        if(!player||player==null) {_initPlayer();} else{player.unload();}
        _startPlayer(url);
    }else if ((url.indexOf('.m3u8')>=0&&Hls.isSupported())||sPlayers === 1){
        if(player) {onEnded();player=null;eRest=5;}
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function(){});
        video.play();
    }else if ((url.indexOf('.mpd') >0||url.indexOf('.isml/Manifes')>0)&& shaka.Player.isBrowserSupported()){
        if(!player||player==null) {_initPlayer();} else{player.unload();}
        _startPlayer(url);
        //initPlayer(url);
    }else if (playType<0&&mpegts.getFeatureList().mseLivePlayback) {
        if(player) {onEnded();player.destroy();player=null;eRest=5;}
        mpeg_ts = mpegts.createPlayer({
            type: 'mp4',  // could also be 'mse', 'mpegts', 'm2ts', 'flv' or 'mp4'
            isLive: true,
//            cors: false,
            hasAudio: true,
            hasVideo: true,
            url: url //'http://example.com/live/livestream.ts'
        });
        mpeg_ts.attachMediaElement(video);
        mpeg_ts.load();
        mpeg_ts.play();
    }else if (mpegts.getFeatureList().mseLivePlayback) {
      if(player) {onEnded();player.destroy();player=null;eRest=5;}
//    console.log('mpegts='+url);      
        mpeg_ts = mpegts.createPlayer({
            type: 'mse',  // could also be 'mse', 'mpegts', 'm2ts', 'flv' or 'mp4'
            isLive: true,
//            cors: false,
            hasAudio: true,
            hasVideo: true,
            url: url //'http://example.com/live/livestream.ts'
        });
        mpeg_ts.attachMediaElement(video);
        mpeg_ts.load();
        mpeg_ts.play();
    }else {
    if(player) {onEnded();player.destroy();player=null;eRest=5;}
    video.src = url;
    video.play();
    }
}
 
function mpegts_destroy() {
   mpeg_ts.pause();
   mpeg_ts.unload();
   mpeg_ts.detachMediaElement();
   mpeg_ts.destroy();
   mpeg_ts = null;
}

function stbStop(){
    video.pause();
    // video.currentTime = 0;
    video.removeAttribute('src');
    // video.src = '';
    if(hls) hls.destroy();
    if(mpeg_ts) {mpegts_destroy();}
}
function stbPause(){video.pause();d_pause=1;if(mpeg_ts) {mpeg_ts.pause();}}
function stbContinue(){video.paused ? video.play() : video.pause();}
function stbIsPlaying(){return !video.paused}
function stbToggleMute(){video.muted = !video.muted;}
function stbGetVolume(){ return video.volume*100; }
function stbSetVolume(value){ video.volume = value/100; }
function stbGetPosTime(){return video.currentTime;}
function stbSetPosTime(value){video.currentTime = value;if(playType<0) updateMediaInfo();}
function stbGetLen(){return video.duration;}
function stbToFullScreen(){
    _full=true;
    $('#video').css({left: 0, top: 0, width: '100%', height: '100%'});
    $('#vdiv').css({left: 0, top: 0, width: '100%', height: '100%'});
    _aspect();
}
function stbSetWindow(){
    _full=false;
    var lh = getHeightK(), lw = getWidthK();
    $('#vdiv').css({left: sListPos ? 758*lw : 10*lw, top: 50*lh, width: 512*lw, height: 288*lh});
    $('#video').css({left: 0, top: 0, width: '100%', height: '100%'});
}

function stbInfo(){
    $('#listAbout').append('<br/>userAgent: ' + navigator.userAgent+
        '<br/>MAC Address (gen): ' + stb.getMacAddress() +
        '<br/>appCodeName: ' + navigator.appCodeName+
        '<br/>appName: ' + navigator.appName+
        '<br/>appVersion: ' + navigator.appVersion+
        '<br/>platform: ' + navigator.platform
    );
    $.get('http://api.ipify.org', function(data){ $('#listAbout').append('<br/>Ip address: ' + data); });
}

// var sZoom = 0, arrayZoom = ['1', '1.1', '1.2', '1.3', '1.4', '1.5'];
// function _setZoom(val){ sZoom = val; $('#video').css('transform', 'scale('+arrayZoom[sZoom]+')'); }
// function stbToggleZoom(){
//     showSelectBox(sZoom, arrayZoom, function(val){ _setZoom(val); saveCHarr('aZooms', val); });
// }

var _full=true, aspect = 0;
// function _aspect(){
//     var lh = getHeightK(), lw = getWidthK();
//     if(_full) switch(aspect){
//         case 0: $('#video').css({left: 0, top: 0, width: 1280*lw, height: 720*lh}); break;
//         case 1: $('#video').css({left: 160*lw, top: 0, width: 960*lw, height: 720*lh}); break;
//         case 2: $('#video').css({left: 0, top: -120*lh, width: 1280*lw, height: 960*lh}); break;
//         case 3: $('#video').css({left: 0, top: 85*lh, width: 1280*lw, height: 550*lh}); break;
//         case 4: $('#video').css({left: -200*lw, top: 0, width: 1680*lw, height: 720*lh}); break;
//     }
// }
// function stbToggleAspectRatio(){
//     showSelectBox(aspect, ['16x9', '4x3', '4x3->16x9', '21x9', '21x9->16x9'], function(val){ _setAspect(val); saveCHarr('aAspects', val); });
// }
function _setAspect(val){ aspect = val; _aspect(); }
function _aspect(){
    var arrayRatio = ['contain', 'cover'];//['fill', 'contain', 'cover', 'none', 'scale-down'];
    $('#video').css('object-fit', arrayRatio[aspect]);
}
function stbToggleAspectRatio(){
    showSelectBox(aspect, ['contain', 'cover'], function(val){ _setAspect(val); saveCHarr('aAspects', val); });
}
// function stbToggleAspectRatio()
// {
    // var arrayRatio = ['fill', 'contain', 'cover', 'none', 'scale-down'];
    // aspect++;
    // if(aspect === arrayRatio.length) aspect = 0;
    // $('#video').css('object-fit', arrayRatio[aspect]);
//     showShift(arrayRatio[aspect]);
// }
function _setAudioTrack(ind){
    var at = (hls||video||mpeg_ts).audioTracks;
    for (var i = 0; i < at.length; i++){ at[i].enabled = i==ind; }
    // at[ind].enabled = true;
    if(hls) {hls.audioTrack = ind;} 
    else if(mpeg_ts) {mpeg_ts.audioTrack = ind;}
}
function stbToggleAudioTrack(){
    var z = 0, at = (hls||video||mpeg_ts).audioTracks, al=[];
    // console.log(at);
    for (var i = 0; i < at.length; i++){
        if(at[i].enabled) z = i;
        al.push((i+1) + '/' + at.length + ' (' + (at[i].label||at[i].name) + '/' + (at[i].language||at[i].lang) + ')');
    }
    showSelectBox(z, al, function(val){
        if(val==z) return;
        _setAudioTrack(val)
        saveCHarr('aAudios', val);
    }, -1);
}

function _setSubtitleTrack(ind){
    if(hls){ hls.subtitleTrack = ind-1; return; }
    var tt = video.textTracks;
    for (var i = 0; i < tt.length; i++){ tt[i].mode = (i==ind-1)?'showing':'disabled'; }
    // if(ind>0)tt[ind-1].mode = 'showing';
    if(hls) hls.subtitleTrack = ind-1;
}
function stbToggleSubtitle(){
    var z = 0, tt = video.textTracks, al = [tt.length?_('Off'):_('Not found')];
    if(hls){ tt = hls.subtitleTracks; z = hls.subtitleTrack+1; }
    console.log(tt, z);
    for (var i = 0; i < tt.length; i++){
        if(tt[i].mode == 'showing') z = i+1;
        al.push((i+1) + '/' + tt.length + ' (' + (tt[i].label||tt[i].name) + '/' + (tt[i].language||tt[i].lang) + ')');
    }
    showSelectBox(z, al, function(val){
        if(val==z) return;
        _setSubtitleTrack(val)
        saveCHarr('aSubs', val);
    }, -1);
}
function stbAudioTracksExists(){ return (hls||video||mpeg_ts).audioTracks.length>1; }
function stbSubtitleExists(){ if(hls) return hls.subtitleTracks.length; return video.textTracks.length; }

// var StandBy = false;
// function stbToggleStandby()
// {
//     if(StandBy){
//         StandBy = false;
//         parentAccess = false;
//         playChannel(catIndex, primaryIndex);
//         setSleepTimeout();
//         $('#video').show();
//         // stb.SetLedIndicatorMode(1);
//     } else {
//         clearTimeout(sleepTimeout);
//         $('#listEdit').hide();
//         $('#listAbout').hide();
//         closeList();
//         stbStop();
//         StandBy = true;
//         $('#video').hide();
//         // stb.SetLedIndicatorMode(2);
//     }
// }

function editKey2(code){
    switch(code){
                case keys.ENTER: editvar = $('#editvar').val(); setEdit();
        case keys.EXIT: $('#listEdit').hide(); restoreCPD();
    }
}
function showEditKey2(){
    saveCPD();
    listCaption.innerHTML = editCaption;
    $('#listEdit').show().html(editCaption + ':<br/><br/>'+
        '<br/><input type="text" id="editvar" value="'+editvar+'" style="background-color: black; color:'+curColor+'; font-size:150%; width: 95%;" autofocus><br/><br/>'+
        '<br/>'+btnDiv(keys.EXIT, strEXIT, '- return without save')+
        '<br/>'+btnDiv(keys.ENTER, strENTER, '- save')
    );
    document.getElementById("editvar").focus();
}
// function editKey2(code){}
// function showEditKey2(){
//     $('#dialogbox').show().html(
//         '<input type="text" id="editvar" value="'+editvar+'"  autofocus>'
//     );
//     $('#editvar').smartTvKeyboard({
//      title: editCaption,  // Window title
//      type: 'modal', // Modal 'inline',//
//      layouts: {en: smartTvKeyboardLayouts.en, ru: smartTvKeyboardLayouts.ru, en1: smartTvKeyboardLayouts.enBoxed}, // Put here all layouts you want to use
//      useNavKeys: true, // Enable custom nav keys
//      useDirectEdit: false, // Disable direct editing
//      navKeys: { // Nav keycodes
//              LEFT: 37,
//              UP: 38,
//              RIGHT: 39,
//              DOWN: 40,
//              ENTER: 13, // Enter
//              EXIT: 27 // ESC
//      },
//         onEnter: function(val){$('#dialogbox').hide(); editvar = val; setEdit();},
//         onCancel: function(val){$('#dialogbox').hide(); },
//     });
//     // $('.smart-tv-keyboard').css('transform', 'scale(2)');
// }

var hlsp = null;
function stbPlayPip(url){
    if((sPlayers === 1) && Hls.isSupported()){
        if(hlsp) hlsp.destroy();
        hlsp = new Hls();
        hlsp.loadSource(url);
        hlsp.attachMedia(videopip);
        hlsp.on(Hls.Events.MANIFEST_PARSED, function(){});
    } else {
        videopip.src = url;
    }
    videopip.play();
    $('#videopip').show();
}

function stbStopPip(){
    videopip.pause();
    videopip.src = '';
    if(hlsp) hlsp.destroy();
    $('#videopip').hide();
    $('#pip_buffering').hide();
}
function setPipPos(){
    function setPipWindowRect(x, y, width, height){
        $('#videopip').css({left: x, top: y, width: width, height: height});
    }
    var lw = getWidthK(), lh = getHeightK(), ll = Math.min(lw, lh), ls = Math.max(lw, lh);
    ps = [{x: 256, y: 144},{x: 384, y: 216},{x: 512, y: 288}];
    $('#videopip').css({width: ps[sPipSize].x*ll, height: ps[sPipSize].y*ll});
    switch (sPipPos) {
        case 0: $('#videopip').css({right: 20*ll, top: 20*ll}); return;
        case 1: $('#videopip').css({right: 20*ll, bottom: 20*ll}); return;
        case 2: $('#videopip').css({left: 20*ll, bottom: 20*ll}); return;
        case 3: $('#videopip').css({left: 20*ll, top: 20*ll}); return;
        // case 0: setPipWindowRect(1280*lw-ps[sPipSize].x-20*lw, 20*lh, ps[sPipSize].x, ps[sPipSize].y); return;
        // case 1: setPipWindowRect(1280*lw-ps[sPipSize].x-20*lw, 720*lh-ps[sPipSize].y-20*lh, ps[sPipSize].x, ps[sPipSize].y); return;
        // case 2: setPipWindowRect(20*lw, 720*lh-ps[sPipSize].y-20*lh, ps[sPipSize].x, ps[sPipSize].y); return;
        // case 3: setPipWindowRect(20*lw, 20*lh, ps[sPipSize].x, ps[sPipSize].y); return;
    }
}
var stbBufferSizes = ['0',1,2,3,4,5,6,7,8,9,10];
function stbSetBuffer(){
    // console.log(sBufSize);
}

function stbOptions(){
    function saveSettings(){
        i=-1;
        if(sEditor != listArray[++i].val) {sEditor = listArray[i].val; stbSetItem('sEditor', sEditor);}
        if(sPlayers != listArray[++i].val) {sPlayers = listArray[i].val; providerSetItem('sPlayers', sPlayers);}
        if(sAutorun != listArray[++i].val) {sAutorun = listArray[i].val; stbSetItem('sAutorun', sAutorun);}
        if(sBufSize != listArray[++i].val) {sBufSize = listArray[i].val; stbSetItem('sBufSize', sBufSize);}
        setEditor();
        // setPlayer();
        stbSetBuffer();
        showShift(_('Settings saved'));
        closeList();
        optionsList(stbOptions);
    }
    var noyes = [_('no'),_('yes')];
    var settingsArray = [
        {name: _('Editor'), val: sEditor, values: [_('built-in'), _('native')]},
        {name: _('Type of player for streaming'), val: sPlayers, values: stbPlayers},
        {name: _('Autostart of player'), val: sAutorun, values: noyes},
        {name: _('Buffer Size, s'), val: sBufSize, values: stbBufferSizes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: saveSettings, cur: ''}
    ];
    listArray = settingsArray;
    listCaption.innerHTML = _('Settings STB');
    _setSetup(saveSettings, function(){optionsList(stbOptions);});
}
function addAoptions(){
    optionsArr.splice(optIndexOf(parentControlSetup), 0, {action:stbOptions, name: 'Settings STB'});
    optionsArr.splice(optIndexOf(selectLang)+1, 0,
        {},
        {name:'Save settings to storage'},
        {name:'Load settings from storage'}
    );
}

function unload(){
    stbStop();
}
// function getWidthK(){ return wi / 1280; }
// function getHeightK(){ return hi / 720; }
// function getWidthK(){ return Math.min(window.innerWidth/1280,window.innerHeight/720); }
// function getHeightK(){ return Math.min(window.innerWidth/1280,window.innerHeight/720); }
stb = {};
stb.getMacAddress = function (){
    var m = stbGetItem('mac') || '';
    if(!m){ // '44:5c:e9:XX:XX:XX' - tizen
        m = 'aa:ab:XX:XX:XX:XX'.replace(/X/g, function(){ return "0123456789abcdef".charAt(Math.floor(Math.random() * 16)) });
        stbSetItem('mac', m);
    }
    return m;
};


//stb = {};
//stb.getMacAddress = function (){
//if (navigator.userAgent.indexOf('android')>0){return return AndroidInterface.getMac();}
//else {  
//  return 'aa:aa:aa:aa:aa:ab'//'00:1A:79:aa:aa:ab'
//     }
//};
// var wi = 1280, hi = 720;
// var wi = 1920, hi = 1080;
function videoEvent(event) {
    // console.log('video > '+event.type);
}
// var backFunction = function(){
//     history.pushState('', '', '');
//     keyHandler({ keyCode: keys.RETURN, preventDefault: function(){}, stopPropagation: function(){} });
// }
// window.addEventListener("popstate", backFunction);

function setTransform(){
    // if(!isNormalScreen()){
    //     if(window.innerWidth/wi>window.innerHeight/hi)
    //         var sc = window.innerHeight/hi, tx = (window.innerWidth/sc-wi)/2, ty = 0;
    //     else
    //         var sc = window.innerWidth/wi, tx = 0, ty = (window.innerHeight/sc-hi)/2;
    //     $('body').css('transform', 'scale('+sc+') translate('+tx+'px,'+ty+'px)');
    // } else
        $('body').css('transform', 'scale('+Math.min(window.innerWidth/wi, window.innerHeight/hi)+')');
    // $('body').css('transform', 'scale('+(window.innerWidth/wi)+','+(window.innerHeight/hi)+')');
    // $('#vdiv').css({left: 100, top: 0, right: 100, bottom: 0});
}
document.body.style.cursor = "pointer"; // iOS bug!!!
function _showStreamData(){
    if(playType<0)updateMediaInfo();
    if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
//    if(!stbIsPlaying()&&d_pause==0&&eRest>3){stbStop();stbPlay(url_r);aRest+=1;alert ('reStart:'+aRest);}eRest+=1; console.log('eRest:'+eRest);
//    if(!stbIsPlaying()&&d_pause==0&&eRest>3){stbPlay(url_r);}
        if(video.webkitVideoDecodedByteCount != undefined)
                if(video.videoWidth && (video.webkitVideoDecodedByteCount-_Dec)>0)
                    $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight+ '<br/>' + Math.round((video.webkitVideoDecodedByteCount-_Dec)*8/1024/1024 * 100) / 100+ ' Mbps');
                _Dec = video.webkitVideoDecodedByteCount;
}
var _Dec = 0,ct_1=0,ct_2=0;
function _showStreamData(){
    if(playType<0) {updateMediaInfo();}
    if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
    ct_1=video.currentTime;
    if(ct_1<ct_2&&d_pause==0&&eRest>4){
         if (aRest>19){stbStop();infoBox(_('The connection with the channel\'s broadcast server is unstable <br> After ')+aRest+_(' unsuccessful attempts to establish a connection<br>PLAYER OPERATION STOPPED'));return;}
         aRest+=1;alert ('rStart:'+aRest);stbStop();stbPlay(url_r);}
    eRest=eRest+1;if (ct_1!=0){ct_2=ct_1+1;}
    if(video.webkitVideoDecodedByteCount != undefined)
                if(video.videoWidth && (video.webkitVideoDecodedByteCount-_Dec)>0)
                    $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight+ '<br/>' + Math.round((video.webkitVideoDecodedByteCount-_Dec)*8/1024/1024 * 100) / 100+ ' Mbps');
                _Dec = video.webkitVideoDecodedByteCount;
}
var _tim = null;

var timerID = null, isStalling = false;
function reportStalling() {
  if ((!video.paused && !video.ended) || isStalling) {stbStop();stbPlay(url_r);aRest+=1;alert ('reStart:'+aRest);}
}

function stbInit(){
    $('body').css( {'background-color': '#111'} );
    // var s = Math.min(window.innerWidth/16,window.innerHeight/9);
    // $('body').css( {'background-color': '#111', position: 'absolute', width: 16*s, height: 9*s, left:(window.innerWidth-16*s)/2, top:(window.innerHeight-9*s)/2} );
    window.addEventListener('resize', function(){
        // var s = Math.min(window.innerWidth/1920,window.innerHeight/1080);
        // $('body').css( {position: 'absolute', width: 1920*s, height: 1080*s, left:(window.innerWidth-1920*s)/2, top:(window.innerHeight-1080*s)/2} );
        setFontSize();
        setListPos();
        setColor();
        // closeList();
        if(list.style.display != 'none'){ closeList(); showPage(); }
    });

    try
    {
        $('#launch').append(_('<br/>Loading STB...'));

        // $(document.head).append('<link rel="stylesheet" type="text/css" href="'+host+'/js/dist/css/smart-tv-keyboard-dark.css"/>');
        // $.getScript(host+"/js/dist/layouts/en.js");
        // $.getScript(host+"/js/dist/layouts/ru.js");
        // $.getScript(host+"/js/dist/layouts/en-boxed.js");
        // $.getScript(host+"/js/dist/layouts/num.js");
        // $.getScript(host+"/js/dist/smartTvKeyboard.min.js");
//        var key;$.getScript(host+'/pc/stb.php');
        var key;$.getScript('https://ott.drm-play.com/pc/stb.php');
        $.getScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
        $.getScript('https://github.com/videojs/mux.js/releases/download/v6.2.0/mux.js');
//        $.getScript('//github.com/videojs/mux.js/releases/latest/download/mux.js');
//        $.getScript('https://ajax.googleapis.com/ajax/libs/shaka-player/3.3.2/shaka-player.compiled.js', function(){
        $.getScript('https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.2/shaka-player.compiled.js', function(){
            // Install built-in polyfills to patch browser incompatibilities.
            shaka.polyfill.installAll();
        });


        document.addEventListener('visibilitychange', function(){
            console.log('pc');
            if(document.hidden){
                // setCurrent(catIndex, primaryIndex); playType = 0;
                closeList();
                stbStopPip();
                stbStop();
            } else playChannel(catIndex, primaryIndex);
        });
        $('body').prepend('<div id="vdiv" style="position: absolute; overflow: hidden; background-color: black;"><video id="video" style="position: absolute; object-position: center center;"></video><video id="videopip" muted style="position: absolute; display: none; background-color: black; object-position: center center;"></video>');
        // $('body').prepend('<div id="vdiv" style="position: absolute; left:0; top:0; bottom:0; right: 0; overflow:hidden; background-color: black;"><video id="video" style="position: absolute;"></video><video id="videopip" muted style="position: absolute; display: none; background-color: black;"></video>');
        // $('body').prepend('<div id="vdiv" style="position: absolute; left:0; top:0; bottom:0; right: 0; overflow:hidden;"><div id="video" style="position: absolute;"></div></div><video id="videopip" muted style="position: absolute; display: none; background-color: black;"></video>');
        video = document.getElementById('video');
        video.addEventListener("waiting", function(){
            $('#buffering').show();
            $('#video_res').html('<br/>connect...');
        });
        video.addEventListener("loadstart", function(){
            $('#buffering').show();
            $('#video_res').html('<br/>buffering...');
        });
        video.addEventListener("loadeddata", function(){
            // $('#video_res').html('<br/>loaded');
            // $('#buffering').hide();
            // if(playType<0) updateMediaInfo();
        });
        video.addEventListener("loadedmetadata", function(){
            // $('#video_res').html('<br/>loadedMeta');
            // $('#video_res').text('');
        });
        video.addEventListener("durationchange", function(){
            if(playType<0) updateMediaInfo();
        });
        video.addEventListener('canplay', function(){
            $('#buffering').hide();
            $('#video_res').text('');
            if(playType<0) updateMediaInfo();
            if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
              clearInterval(_tim);
             _tim = setInterval(_showStreamData, 5000);
            execCHarr('aAspects', _setAspect);
            // execCHarr('aZooms', _setZoom);
            execCHarr('aSubs', _setSubtitleTrack);
            execCHarr('aAudios', _setAudioTrack);
        });
        video.addEventListener("playing", function(){
            $('#buffering').hide();
            // $('#video_res').text('');
            // if(playType<0) updateMediaInfo();
            // if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
        });
        video.addEventListener("play", function(){
        });
        video.addEventListener("timeupdate", function() {
//            clearTimeout(timerID);
            isStalling = false;
//            console.log('timeupdate:'+isStalling);
            // remove stalling indicator if any ...
//            timerID = setTimeout(reportStalling, 4000);  // 4 sec timeout
        });
        video.addEventListener("stalled", function() {isStalling = true;console.log('stalled:'+isStalling);})
        video.addEventListener("error", function(){
            var me = ['', 'ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'];
            console.log('video > error: '+video.error.code+'-'+me[video.error.code]||video.error.code+(video.error.message?' ('+video.error.message+')':''));
            $('#buffering').hide();
            $('#video_res').html('<br/>error '+video.error.code);
            showShift('Error: '+me[video.error.code]||video.error.code+(video.error.message?' ('+video.error.message+')':''));
          /*  if (video.error.code==4&&url_c.indexOf('.m3u8') !== -1&&Hls.isSupported()){ //
                if(hls) { hls.destroy(); hls = null;}
                hls = new Hls();
                hls.loadSource(url_c);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function(){});
                video.play();
           } */

            // video.load();
            // video.play();
            // setTimeout(function(){
                // stbPlay(video.loadSource, video.currentTime);
            // }, 1000);
            // stbContinue();
            // playChannel(catIndex, primaryIndex);
        });
        video.addEventListener("resize", function(){
            if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
        });
        ['waiting', 'loadstart', 'loadeddata', 'loadedmetadata', 'durationchange', 'canplay', 'canplaythrough', 'playing', 'error', 'progress',
        'ratechange', 'ended', 'suspend', 'emptied', 'stalled', 'abort', 'play', 'pause', 'resize']
        .forEach(function(element) { video.addEventListener(element, videoEvent); });
        if(video.webkitVideoDecodedByteCount != undefined)
            setInterval(function(){
                if(video.videoWidth && (video.webkitVideoDecodedByteCount-_Dec)>0)
                    $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight+ '<br/>' + Math.round((video.webkitVideoDecodedByteCount-_Dec)*8/1024/1024 * 100) / 100+ ' Mbps');
                // console.log('webkitVideoDecodedByteCount '+(video.webkitVideoDecodedByteCount-_Dec)*8/1024/1024);
                _Dec = video.webkitVideoDecodedByteCount;
            }, 1000);

        videopip = document.getElementById('videopip');
        videopip.addEventListener("loadstart", function(){ if(videopip.style.display != 'none') $('#pip_buffering').show(); });
        videopip.addEventListener("playing", function(){ $('#pip_buffering').hide(); });
        // $('body').prepend('<div id="back" style="position: absolute; left:0; top:0; bottom:0; right: 0; background-color:black"></div>');

    }
    catch (e)
    {
        // window.location.href = "error.html";
    }
    $('#launch').append(_('<br/>Setup STB...'));
    // localStorage.clear();
    if(isNaN(parseInt(stbGetItem('sEditor')))) stbSetItem('sEditor', 1);
    // addAoptions();
    stbToFullScreen();
    // stbCSS = function(){ console.log('hkhkjhkjhjkh'); }

    window.onkeydown = keyHandler;
    // $('#info').toggle();
    // window.onkeyup = keyHandler;
    // infoBox('???????/!!!<br/><br/>');
}
function read_json(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
//read_json("http://ott.drm-play.com/m3u/g_full.json", function(text){epg_list = JSON.parse(text); epg_loc=1;});

//$.ajax({ url: host+'/m3u/g_full.json', dataType: 'json',async: true,cache:true,type:"GET",timeout: 10000, success: [function(data){epg_list = data;},function(){epg_loc=1;}],}); 
////$.ajax({ url: host+'/m3u/g_full.json', dataType: 'json',async: true,cache:true,type:"GET",timeout: 5000, success:function(data){epg_list = data;},complete: function() {if (epg_list.length >0){epg_loc=1;}},}); 
