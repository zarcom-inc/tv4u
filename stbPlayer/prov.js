version += ' m3u-0218';
var m3uArr, _number = 0;
p_pref = 'm3u';
parental = /XXX|Взрослые|Для взрослых|Взрослое|Эротика|18+|Adults/;

function keyNames4(keyName){
    if(pdsa.indexOf(keyName) != -1) {keyName += m3uArr.active || '';}
    return keyName;
}
if(typeof(stbGetItem)==='function'){
    providerGetItem = function (keyName){ return stbGetItem(p_pref + keyNames4(keyName)); }
    providerSetItem = function (keyName, keyValue){ stbSetItem(p_pref + keyNames4(keyName), keyValue); }
} else {
    providerGetItem = function (keyName){ return localStorage.getItem(p_pref + keyNames4(keyName)); }
    providerSetItem = function (keyName, keyValue){ localStorage.setItem(p_pref + keyNames4(keyName), keyValue); }
}
function loadM3Uparams(){
    m3uArr = providerGetItem("m3uArr");
//    useragent = navigator.userAgent;
    drm_list=parseInt(providerGetItem('drm_list')) || 0;
    if(!m3uArr) {
        m3uArr = {active:0, M3Us: []};
       /* m3uArr = {active:0, M3Us: []};if(drm_list==0){if(abcv==1){drm_list=7;}else{drm_list=1;}} 
        if (useragent.indexOf('Maple')>0||useragent.indexOf('Web0S')>0||useragent.indexOf('LG SimpleSmart')>0||useragent.indexOf('LG NetCast.TV')>0 ||useragent.indexOf('Tizen')>0 )
           { if(drm_list==0){drm_list=5;}
           }
           else { if(drm_list==0){drm_list=5;}
                } */     
    }
    else {try{ m3uArr = JSON.parse(m3uArr); 
    }catch(e){ m3uArr = {active:0, M3Us: []}; }}
    for(var i = m3uArr.M3Us.length; i < 25; i++)
        m3uArr.M3Us[i] = {www:'', rechours:0};
    if (drm_list > 0) {m3uArr.M3Us[25] = {"www":_drm_list+drmlist_url[drm_list],"rechours":0,"name":"Встроенный плейлист","medUrl":scheme+"drm-play.com/media.php"};}
    try {if (m3uArr.M3Us[2]["www"].indexOf('data/data/com.drm_play.')>0||m3uArr.M3Us[0]["name"].indexOf('MediacenterIPTV')>0){stbExit();return;}} catch (e) {}
    if(browserName() == 'dune') try{
        var params = window.location.href.split('?')[1].split('&');
        params.forEach(function(item){
            var p = item.split('=');
            if(p[0]=='n'){ _number = parseInt(p[1]); throw {}; }
        });
    }catch(e){}
    if(_number>0 && _number<25) {m3uArr.active = _number-1;}
    if (drm_list > 0){m3uArr.active =25;sFavorites=1;}
}


function getProviderParams(){
    loadM3Uparams();
    for(var i = 0; i < 10; i++){
        $("#www"+i).val(m3uArr.M3Us[i].www);
        $("#rechours"+i).val(m3uArr.M3Us[i].rechours);
    }
    $('input:radio[name=odin]').filter('[value='+m3uArr.active+']').attr('checked', true);
    return m3uArr.M3Us[m3uArr.active].www;
}
function setProviderParams(){
    for(var i = 0; i < 10; i++){
        m3uArr.M3Us[i].www = decodeURIComponent($("#www"+i).val().trim());
        m3uArr.M3Us[i].rechours = $("#rechours"+i).val().trim();
    }
    m3uArr.active = $("input[name=odin]:checked").val();
    var changed = JSON.stringify(m3uArr) != providerGetItem("m3uArr");
    providerSetItem("m3uArr", JSON.stringify(m3uArr));
    loadM3Uparams();

    if(m3uArr.M3Us[m3uArr.active].www.length < 8) alert('Для доступа необходимо ввести адрес плейлиста!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getChannelDRM(ch_id){ return chanels[ch_id].drm; }
function getArchiveUrl(ch_id, time, time_to){
    function insPar(u){
        var time_t = new Date(Math.floor(time)*1000);
        time_t=time_t.toLocaleString('en-GB').replace(/, /g, 'T'); console.log ("time_t: "+time_t);
//        var time_t=time_t.toLocaleString('en-GB').replace(/, /g, '').replace(/\//g, '').replace(/:/g, ''); console.log ("time_t: "+time_t);
        var time_to_t= new Date(Math.floor(time_to)*1000);
        time_to_t=time_to_t.toLocaleString('en-GB').replace(/, /g, 'T'); console.log ("time_to_t: "+time_to_t);
//        var time_to_t=time_to_t.toLocaleString('en-GB').replace(/, /g, '').replace(/\//g, '').replace(/:/g, ''); console.log ("time_to_t: "+time_to_t);
        return u.replace(/\$\{start\}/g, Math.floor(time))
            .replace(/\$\{end\}/g, Math.floor(time_to))
            .replace(/\$\{start_t\}/g, time_t)
            .replace(/\$\{end_t\}/g, time_to_t)
            .replace(/\$\{timestamp\}/g, Math.floor(Date.now()/1000))
            .replace(/\$\{offset\}/g, Math.floor(Date.now()/1000)-Math.floor(time))
            .replace(/\$\{offset_v\}/g, (Math.floor(Date.now()/1000)-Math.floor(time))+10800)
            .replace(/\$\{duration\}/g, Math.floor(time_to-time))
            .replace(/\$\{url_arh\}/g, url_arh)
            .replace(/\$\{token_t\}/g, 'drmreq='+t_token)
            .replace(/\$\{token_p\}/g, 'token='+p_token+'&offset=10');

    }
    if(time_to < time) {time_to = Date.now()/1000;}
    if(browserName() == 'dune') {time_to += 7200;}
    if(chanels[ch_id].ca.indexOf('flussonic')!=-1||chanels[ch_id].ca.indexOf('fs')!=-1){
        var spl = '', ts_hls = 0, url = chanels[ch_id].url;
        if(url.indexOf('mpegts')!=-1){ spl = 'mpegts'; ts_hls = 0; }
        else if(url.indexOf('video.m3u8')!=-1){ spl = 'video.m3u8'; ts_hls = 1; }
        else if(url.indexOf('index.m3u8')!=-1){ spl = 'index.m3u8'; ts_hls = 2; }
        else if(url.indexOf('index.mpd')!=-1){ spl = 'index.mpd'; ts_hls = 3; }
        if(spl){
            var u = url.split(spl);
            if(!ts_hls||(time > Date.now()/1000-600)) // мпег или последние 10 минут
                return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
            else
                return u[0] + ['', 'video-', 'index-', 'archive-'][ts_hls] + Math.floor(time) + '-' + Math.floor(time_to-time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
        }
    }
    if(chanels[ch_id].caso)
        switch (chanels[ch_id].ca){
            case 'append': return insPar(chanels[ch_id].url+chanels[ch_id].caso);
            default:
                return insPar(chanels[ch_id].caso);
        }
    var c = (chanels[ch_id].url.indexOf('?') == -1) ? '?' : '&';
    return chanels[ch_id].url + c + 'utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
}
if(typeof catsArray == 'undefined') var catsArray = [];
function addChan2cat(cat, ci){
    if(!cat || !ci) return;
    if(!cats[cat]){
        catsArray.push(cat);
        cats[cat] = [];
    }
    cats[cat].push(ci);
}
function getChanelsArray(callback){
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */

function murmurhash3_32_gc(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
                k1 =
                  ((key.charCodeAt(i) & 0xff)) |
                  ((key.charCodeAt(++i) & 0xff) << 8) |
                  ((key.charCodeAt(++i) & 0xff) << 16) |
                  ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;

                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

                h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
}

function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

function getAint(text, attribute){ return parseInt(getAttribute(text, attribute)) || 0; }
var notvgname=0;
function loadPlaylist(url, success, callback){
    if(typeof(launch_id)=='undefined') launch_id = '#launch';  
    if(!url){callback();return;}
    if(abcv==1){var data={svc:btoa(Math.round(Date.now()/1000)),a:a,b:b,c:c,v:v};}
    else{var data={svc:btoa(Math.round(Date.now()/1000)),a:box_mac_};}                  
    notvgname = (url.indexOf('tvteam.') >0||url.indexOf('tv.team') >0||url.indexOf('maximum-tv.top') >0) ? 1 : 0;
    var cpurl = url;
    if (url.indexOf('drm-play.com/iptv.php') >0){sFavorites=1;
     $.ajax({url:url,timeout: 10000,dataType:'text',type:'post',data:data,success:success,
        error: function(){$(launch_id).append('Загрузка через cors-proxy плеера...');
            $.ajax({url: host+'/m3u/cp.php', data: {url:'@'+cpurl,svc:btoa(Math.round(Date.now()/1000)),a:box_mac_}, type: 'post', dataType: 'text',timeout: 10000, success: success,
                error: function(jqXHR, textStatus, errorThrown){alert( _('Failed to load channel list!') );callback();},
            });
        },
     });
    }else{
    if(typeof(stbInterceptRequest) === 'function'){
        stbInterceptRequest(url);
        url += (url.indexOf('?')==-1 ? '?' : '&') + 'url=' + encodeURIComponent(url);
    }
     $.ajax({                        
        url:url,dataType:'text',timeout:10000, 
        success:success,
        error: function(){
            $(launch_id).append('Загрузка через cors-proxy плеера...');
            $.ajax({                                               
                url: 'http://cors.drm-play.com/m3u/cp.php', data:{url:'@'+cpurl,svc:btoa(Math.round(Date.now()/1000)),a:box_mac_},type:'post',dataType:'text',timeout: 10000, success: success,
                error: function(jqXHR, textStatus, errorThrown){
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!') );
                    callback();
                },
            });
        },
     });
   };
}
function getEpgList(cepg, callback){
    if(!cList.length){ callback(); return; }
    $(launch_id).append(_('epgs...'));
    //var head={'X-Svc':btoa(Math.round(Date.now()/1000))};
    $.ajax({
        url: scheme+'epg.drm-play.com/m3u/gelist.php', data: {list: JSON.stringify(cepg),a:box_mac_},type:'post',timeout: 120000,
        success: function(data){
            if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
            cList.forEach(function(val){
                if(data[val]) chanels[val].epg_url = data[val];
            });
        },
        complete: function(){ callback(); },
    });
}
function locEpgList(cepg,callback){
    if(!cList.length){ callback(); return; }
    $(launch_id).append(_('epgs...'));
  var g_time=Date.now(); g_time=g_time/1000;
  for (var key in cepg) {
        var subObj = cepg[key];
        var l_epg=0,l_logo=1,g_utvg;if (subObj.l) l_logo=0;
        if (subObj.u) {g_utvg=subObj.u.split(';');}
        var g_name=subObj.n;
        g_name=g_name.replace(/ ace/gi, '')
        .replace(/ \(тест\)/gi, '')
        .replace(/ \(vpn EU\)/gi, '')
        .replace(/ \(vpn RU\)/gi, '')
        .replace(/ \(ext\)/gi, '')
        .replace(/ \( original \)/gi, '')
        .replace(/ FHD/gi, ' HD')
        .replace(/\•/gi, '.');g_name=g_name.toUpperCase();
        if (subObj.e&&subObj.u&&(l_epg!=1||l_logo!=1)){ 
                var e_utvg=g_utvg[0];
                var eObj=epg_list[e_utvg];
                for (var e_key in eObj){
                        if (epg_list[e_utvg]===undefined) break;
                        var e2Obj=eObj[e_key];
                        if (l_epg!=1&&e2Obj['tvg-id']==subObj.e&&e2Obj.time_to>g_time&&e2Obj.epg!=""){
                                chanels[key].epg_url = e2Obj.epg; l_epg=1;
                        }
                        if (l_logo!=1&&e2Obj['tvg-id']==subObj.e&&e2Obj.logo!=""){
                                chanels[key].logo = e2Obj.logo;l_logo=1;
                        }
                        if (l_epg==1&&l_logo==1) break;
                }
        }
        if(subObj.u&&(l_epg!=1||l_logo!=1)) {var i;
                for (i=0; i < g_utvg.length; ++i) {
                        if (epg_list[g_utvg[i]]===undefined) break;
                        var uObj=epg_list[g_utvg[i]];  
                                if (l_epg!=1&&uObj[g_name]&&uObj[g_name].epg!=""&&uObj[g_name].time_to>g_time){
                                l_epg=1;chanels[key].epg_url = uObj[g_name].epg;
                                }
                                if (l_logo!=1&&uObj[g_name]&&uObj[g_name].logo!=""){
                                l_logo=1;chanels[key].logo = uObj[g_name].logo;
                                }
                                if (l_epg==1&&l_logo==1) break;
                }
        } 
        if(l_epg!=1||l_logo!=1) { 
                for (var n_key in epg_list){
                        var nObj = epg_list[n_key];
                        if (l_epg!=1&&nObj[g_name]&&nObj[g_name].epg!=""&&nObj[g_name].time_to>g_time){
//                        if (l_epg!=1&&nObj[g_name]&&nObj[g_name].epg&&nObj[g_name].epg!=""&&nObj[g_name].time_to>g_time){
                        l_epg=1;chanels[key].epg_url = nObj[g_name].epg;
                        }
                        if (l_logo!=1&&nObj[g_name]&&nObj[g_name].logo!=""){
                        l_logo=1;chanels[key].logo = nObj[g_name].logo;
                        }
                        if (l_epg==1&&l_logo==1) break;                 
                }
        }

  }
  callback();
}


function getLogoList(cepg, callback){
    if(!cList.length){ callback(); return; }
    $(launch_id).append(_('logos...'));
    //var head={'X-Svc':btoa(Math.round(Date.now()/1000))};
    $.ajax({
        url: scheme+'epg1.drm-play.com/m3u/geicons.php',data:{list: JSON.stringify(cepg),a:box_mac_},type:'post',timeout: 120000,
        success: function(data){
            if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
            cList.forEach(function(val){
                if(data[val]) chanels[val].logo = data[val];
            });
        },
        complete: function(){ callback(); },
    });
}

    function aSuccess(data){
        try{
            // console.log(data);
            var ccat = '', cepg = {}, clogo = false,cua='';
            var arrEXTINF = data.split('#EXTINF:'), l1 = arrEXTINF[0],
//                g_utvg = getAttribute(l1, 'url-tvg') || getAttribute(l1, 'x-tvg-url'),
              g_utvg = m3uArr.M3Us[m3uArr.active].epg&&m3uArr.M3Us[m3uArr.active].epg !=''? m3uArr.M3Us[m3uArr.active].epg : getAttribute(l1, 'url-tvg') || getAttribute(l1, 'x-tvg-url'),
              g_ua = getAttribute(l1, 'user-agent'),
                gRec = l1.indexOf('catchup-minutes')>-1 ? getAint(l1, 'catchup-minutes')/60 : l1.indexOf('catchup-days')>-1 ? getAint(l1, 'catchup-days')*24 : l1.indexOf('timeshift')>-1 ? getAint(l1, 'timeshift')*24 : l1.indexOf('tvg-rec')>-1 ? getAint(l1, 'tvg-rec')*24 : parseInt(m3uArr.M3Us[m3uArr.active].rechours),
                gC = getAttribute(l1, 'catchup') || getAttribute(l1, 'catchup-type'), gCS = getAttribute(l1, 'catchup-source');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){                    
                var e = val.split('\n'),
                    drm = getAttribute(e[0], 'drm'),
                    drm_key = getAttribute(e[0], 'drm_key'),
                    nohls = getAttribute(e[0], 'nohls'),
                    ua = getAttribute(e[0], 'user-agent')|| g_ua,
                    ref = getAttribute(e[0], 'ref'),
                    orig = getAttribute(e[0], 'orig'),
                    xfor = getAttribute(e[0], 'xfor'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    tn = notvgname==1 ? '' :getAttribute(e[0], 'tvg-name'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    logo = logo.indexOf('//') === 0 || logo.toLowerCase().indexOf('http') === 0 ? logo : '',
//                    rec = e[0].indexOf('tvg-rec')>-1 ? getAint(e[0], 'tvg-rec')*24 : e[0].indexOf('catchup-days')>-1 ? getAint(e[0], 'catchup-days')*24 : e[0].indexOf('timeshift')>-1 ? getAint(e[0], 'timeshift')*24 :  gRec,
                    rec = e[0].indexOf('catchup-minutes')>-1 ? getAint(e[0], 'catchup-minutes')/60 : e[0].indexOf('catchup-enable')>-1 ? getAint(e[0], 'catchup-enable')*24: e[0].indexOf('catchup-days')>-1 ? getAint(e[0], 'catchup-days')*24 : e[0].indexOf('timeshift')>-1 ? getAint(e[0], 'timeshift')*24 : e[0].indexOf('tvg-rec')>-1 ? getAint(e[0], 'tvg-rec')*24 : gRec,
                    ca = getAttribute(e[0], 'catchup') || getAttribute(e[0], 'catchup-type') || gC,
                    caso = getAttribute(e[0], 'catchup-source') || gCS,
                    utvg = getAttribute(e[0], 'url-tvg') || g_utvg,
                    cn = _('??? No channel name'),
                    url = '',
                    n = 1;if (utvg.indexOf('ttps://')!=-1||utvg.indexOf('ttp://')!=-1){utvg='';}

                try {
                    var i = e[0].indexOf(',');
                    cn = i>0?e[0].substr(i+1).trim():cn;
                } catch(e) {}                                     
                try { url = e[1].trim(); } catch(e) {}
                while (url.indexOf('#') === 0) {
                    if(url.indexOf('#EXTGRP:') != -1) {if(!cat) cat = url.split('#EXTGRP:')[1].trim();}
                    if(url.indexOf('#EXTVLCOPT:http-user-agent=') != -1) {if(!ua) ua = url.split('#EXTVLCOPT:http-user-agent=')[1].trim();}
                    if(url.indexOf('#KODIPROP:inputstream.adaptive.license_key=') != -1) {if(!drm_key) drm_key = url.split('#KODIPROP:inputstream.adaptive.license_key=')[1].trim();}
                    if(url.indexOf('#EXTVLCOPT:http-referer=') != -1) {if(!ref) ref = url.split('#EXTVLCOPT:http-referer=')[1].trim();}
                    else if(url.indexOf('#EXTVLCOPT:http-referrer=') != -1) {if(!ref) ref = url.split('#EXTVLCOPT:http-referrer=')[1].trim();}
                    if(url.indexOf('#EXTVLCOPT:http-origin=') != -1) {if(!orig) orig = url.split('#EXTVLCOPT:http-origin=')[1].trim();}
                    try { url = e[++n].trim(); } catch(e) { url = ''; }
                }
                if(cat == '') {cat = ccat;}else {ccat = cat;} //if(ua == '') {ua = cua;}else {cua = ua;}
                var ci = murmurhash3_32_gc(url, 10);
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, nohls:nohls, drm: drm, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, tn: tn, ca: ca, caso: caso, utvg: utvg,drm_key:drm_key, ua: ua,ref:ref,orig:orig,xfor:xfor};
//                    cepg[ci] = (epg && utvg) ? {n: tn || cn, e: epg, u: utvg} : (utvg) ? {n: cn, u: utvg || cn, u: utvg}:{n: tn || cn};
                    cepg[ci] = (!logo&&epg&&utvg)? {n: tn || cn, e: epg, u: utvg,l:1}:(!logo&&utvg)?{n:cn, u:utvg||cn, u:utvg, l:1} :(!logo) ? {n: tn || cn, l:1} : (epg && utvg) ? {n: tn || cn, e: epg, u: utvg} : (utvg) ? {n: cn, u: utvg || cn, u: utvg}:{n: tn || cn};
                    if(!logo){
                        if(!clogo) clogo = {}; var tn_l=tn+"|"+utvg,cn_l=cn+"|"+utvg
                        clogo[ci] = (utvg) ? cn_l||tn_l : tn || cn ;
                    }
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
       if (epg_loc>0) {locEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });}
       else{
        getEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });
        if(clogo) getLogoList(clogo, function(){ updateChanelInfo(curList[primaryIndex]); });
       }
//        getEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });
//        if(clogo) getLogoList(clogo, function(){ updateChanelInfo(curList[primaryIndex]); });
    }
    if(typeof(readFile)==='function' && m3uArr.M3Us[m3uArr.active].www && m3uArr.M3Us[m3uArr.active].www[0]=='/')
        aSuccess(readFile(m3uArr.M3Us[m3uArr.active].www));
    else
        loadPlaylist(m3uArr.M3Us[m3uArr.active].www, aSuccess, callback);
}
function getEPGurl(ch_id){ return chanels[ch_id].epg_url }
_epgDomen = scheme+'epg.drm-play.com/';
function getEPGchanel(ch_id, callback){
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    $.ajax({ url: _epgDomen+encodeURIComponent(epg_url)+'.json', dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        complete: function(){ callback(ch_id, d); },
    });
}
var dind;
var _drm_list=scheme+''
var drm_list=parseInt(providerGetItem('drm_list')) || 0;
var useragent = navigator.userAgent;
var drmlist_url =[''],
        edTlist = ['Нет'],
        vdList =[
        'Встроенный плейлист не выбран'];
//drmlist_url.splice(8, 1);edTlist.splice(8, 1);vdList.splice(8, 1);
if(listdrm <1){
        drmlist_url.splice(7, 1);drmlist_url.splice(5, 1);
        edTlist.splice(7, 1);edTlist.splice(5, 1);
        vdList.splice(7, 1);vdList.splice(5, 1);   
        if (drm_list==5||drm_list>6) {drm_list=1;}
//}else if (useragent.indexOf('Android')<=0&&listdrm<2){
}else if (listdrm<2){
         drmlist_url.splice(7, 1);
         edTlist.splice(7, 1);
         vdList.splice(7, 1);   
         if (drm_list==6||drm_list>7){drm_list=1;}
}else if (drm_list>8){drm_list=1;}
function _m3u2popup(){
    var i = parseInt(m3uArr.active),b,c,a = m3uArr.M3Us[i];
    if (drm_list > 0) {b='Загрузить: '+ edTlist[drm_list];c='Загрузить встроенный плейлист: '+ edTlist[drm_list];}else {b='';c='';}
    popupArray[popupActions.indexOf(doEditM3Ua)] = _('Select playlist')+': '+((i+1)+' - '+(a.name || a.www || '')); // .replace('https://', '').replace('http://', '')
    popupArray[popupActions.indexOf(doEditList)] = 'Выбор встроенного плейлиста: '+ edTlist[drm_list];
    popupArray[popupActions.indexOf(loadDrmList)] = b;
    popupDetail.splice(dind, 3, vdList[drm_list],c,_('Select playlist'));
}

function duneAddSettings(ind){
    loadM3Uparams(); dind=ind;
    if(_number>0 && _number<25){ doEditM3Ua = doEditListData }
    popupArray.splice(ind, 1,  '','','');
    popupDetail.splice(ind, 1, 'Встроенные плейлисты','Загрузить встроенный плейлист',_('Select playlist'));
    popupActions.splice(ind, 1, doEditList,loadDrmList, doEditM3Ua);
    _m3u2popup();
    getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
}
function doEditList(){
    if(++drm_list==edTlist.length) drm_list = 0;
    providerSetItem("drm_list", drm_list);
    _m3u2popup();
    popupList(doEditList);
}
function loadDrmList(){
    loadM3Uparams();
    _m3u2popup();
    getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
    loadChannels();
}


function selectAndRestart(ind){
    var i = m3uArr.active;
    m3uArr.active = ind;
    providerSetItem("m3uArr", JSON.stringify(m3uArr));
    m3uArr.active = i;
    loadPlaylist();
}
function loadPlaylist(){
    drm_list=0;
    providerSetItem("drm_list", drm_list);
    loadM3Uparams(); 
    _m3u2popup();
    getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
    loadChannels();
}
function bluepoint (ur) {
url_r="";
cid=ur.replace(/http\:\/\/bluepoint\//g,"");
svc=btoa(Math.round(Date.now()/1000));
$.ajax({
   url: host+'/m3u/cors-4.php?id='+cid, dataType: 'json', type: "GET",timeout: 10000, async:false, 
   success: function(data){ if(data !== null) d = data; url_r=d.url;
   },
});
return url_r; 
} 
function voka (ur) {
url_v="";
svc=btoa(Math.round(Date.now()/1000));
var channel_ = ur.match('voka.tv/(.*)$');
var channel=channel_[0];channel=channel.replace(/voka.tv\//g,"");
channel=channel.replace(/\&stream_start_offset=(.*)$/g,"");
channel=channel.replace(/\?stream_start_offset=(.*)$/g,"");
$.ajax({
   url: host+'/m3u/cors.php?id='+channel, dataType: 'json', type: "GET", timeout: 10000, async:false, 
   success: function(data){ if(data !== null) d = data; url_v=d.url;
   if (ur.indexOf('stream_start_offset=')>0) { ar=ur.match('stream_start_offset=(.*)$');url_v=url_v+'&'+ar[0];}
   },
});
return url_v; 
} 
var tv24dev=providerGetItem("tv24dev") || "noDev";
function tv24t(){
	if (tv24dev!="noDev"){ 
            $.ajax({url:ur,dataType:'json',data:tv24dev,type:"POST",timeout:5000,async:true,
                success: function(data){if(data !== null) d=data; id=d.id;
                        $.ajax({url:'https://api.24h.tv/v2/auth/device',dataType:'json',data:{device_id:id},type:"POST",timeout:5000,
						success:function(data){if(data !== null) tv24token=data.access_token; providerSetItem("tv24token", tv24token);}, 
						});},
				error: function(){
						ur="http://api.24h.tv/v2/users/self/devices?access_token="+tv24tm;
						m='0be155fc-f0fc-4XX9-873b-XXXXXXXXXXXX'.replace(/X/g, function(){return "0123456789abcdef".charAt(Math.floor(Math.random()*16))});
						dat={device_type:"pc",vendor:"PC",model:"Edge 129",version:"163",os_name:"Windows",os_version:"10",application_type:"web",serial:m};
			            $.ajax({url:ur,dataType:'json',data:dat,type:"POST",timeout:5000,async:true,
            		    	success: function(data){if(data !== null) {id=data.id,providerSetItem("tv24dev", id),
                    	    $.ajax({url:'https://api.24h.tv/v2/auth/device',dataType:'json',data:{device_id:id},type:"POST",timeout:5000,
								success:function(data){if(data !== null) tv24token=data.access_token; providerSetItem("tv24token", tv24token);}, 
								});}},
							});
					    },		
			}); return tv24token;
	}
	ur="http://api.24h.tv/v2/users/self/devices?access_token="+tv24tm;
	m='0be155fc-f0fc-4XX9-873b-XXXXXXXXXXXX'.replace(/X/g, function(){return "0123456789abcdef".charAt(Math.floor(Math.random()*16))});
	dat={device_type:"pc",vendor:"PC",model:"Edge 129",version:"163",os_name:"Windows",os_version:"10",application_type:"web",serial:m};
            $.ajax({url:ur,dataType:'json',data:dat,type:"POST",timeout:5000,async:true,
                success: function(data){if(data !== null)id=data.id,providerSetItem("tv24dev", id),
                        $.ajax({url:'https://api.24h.tv/v2/auth/device',dataType:'json',data:{device_id:id},type:"POST",timeout:5000,async:true,
						success:function(data){if(data !== null) tv24token=data.access_token; providerSetItem("tv24token", tv24token);}, 
						});},});
	return tv24token; 
}
function tv24(ur){
ur=ur+"&format=json";
        rep_token="access_token="+tv24token;
		ur=ur.replace(/access_token/g,rep_token);
            $.ajax({ url: ur, dataType: 'json', type: "GET", timeout: 10000, async:false,
                success: function(data){ if(data !== null) d = data; url_tv=d.http||d.hls_mbr||d.hls;url_tv=url_tv.replace(/https:/g,"http:");},
                error: function(){
                        $.ajax({ url: host+'/m3u/corsp.php', dataType: 'json', type: "POST", data: {stk:2,lst:drm_list,id:ur,svc:btoa(Math.round(Date.now()/1000)),a:box_mac_}, timeout: 10000, async:false,
                        success: function(data){if(data !== null) d = data; url_tv=d.http||d.hls_mbr||d.hls;url_tv=url_tv.replace(/https:/g,"http:");},
                        error: function(){providerSetItem("tv24token",""),tv24token=tv24t(),url_tv="http://tv.drm-play.com/2/mono.m3u8",alert ('В Вашем регионе доступ к каналу ограничен');},           
                        });},}); 
return url_tv;
}$.ajax({method:'get',url:host+'/m3u/0/',dataType:"script",async:false});
function starnet (ur) { 
url=ur.replace(/\?timeshift_rel-(.*)$/g,"");
    $.ajax({ url: url.replace(/http:\/\/starnet-md./g,atob('aHR0cHM6Ly90b2tlbi5zdGIubWQvYXBpL0ZsdXNzb25pYy9zdHJlYW0v'))+'/metadata.json', dataType: 'json', timeout: 10000, async:false,
        success: function(data){ if(data !== null) d = data; url_r=d.variants[0].url;if (ur.indexOf('timeshift_rel-')>0) { 
                 ar=ur.match('timeshift_rel-(.*)$');url_r=url_r.replace(/\/index/g,'/'+ar[0])+'.m3u8';} },
    });
return url_r; 
}
//providerSetItem("m_exp", 1);
//providerSetItem("m_token", ""); //1553422 5023104 7671289 5319346
//var n_token = 'XXXXXXXXXX'.replace(/X/g, function(){ return "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789".charAt(Math.floor(Math.random() * 62)) });
var n_token = btoa('XXXXXXX'.replace(/X/g, function(){ return "0123456789".charAt(Math.floor(Math.random() * 10)) }));n_token=n_token.replace(/=/g,"");
var neva_ext,neva_int,vng_ext,url_arh;
var tv24token=providerGetItem("tv24token") || "";
var tv24token_a=providerGetItem("tv24token_a") || "";
var tv_exp=providerGetItem("tv_exp") || 1; 
var p_token=providerGetItem("p_token") || "";
var p_exp=providerGetItem("p_exp") || 1; 
var m_token=providerGetItem("m_token") ||"";
var m_exp=providerGetItem("m_exp") || 1; 
//var t_token=providerGetItem("t_token") ||"";
//var t_token="";
//var t_exp=providerGetItem("t_exp") || 1; 
var t_exp=1; 
var box_mac_ = stb.getMacAddress();
function pr(x){
   if (x==1){
   return $.ajax({url:host+"/m3u/pr.php?id=1",type: "POST",dataType:'json',data:{svc:btoa(Math.round(Date.now()/1000)),a:box_mac_,l:window.location.href},timeout: 5000,
   success:function(data){if(data !== null){d=data;p_token=d.access_token;p_exp=Math.round(Date.now()/1000)+43200;
   providerSetItem("p_exp", p_exp);providerSetItem("p_token", p_token);}}});
   }else if (x==2){
   return $.ajax({url:host+"/m3u/pr.php?id=2",type: "POST",dataType:'json',data:{svc:btoa(Math.round(Date.now()/1000)),a:box_mac_,l:window.location.href},timeout: 5000,
   success:function(data){if(data !== null){d=data;tv24token=d.access_token;providerSetItem("tv24token", tv24token);}}});
   }else if (x==3){
   return $.ajax({ url: host+'/m3u/pr.php?id=3', dataType: 'json', type: "POST",data:{svc:btoa(Math.round(Date.now()/1000)),a:box_mac_,l:window.location.href},timeout: 5000, 
   success: function(data){if(data !== null) d=data;m_token=d['result']['token'];m_exp=Math.round(Date.now()/1000)+43200;
   providerSetItem("m_exp", m_exp);providerSetItem("m_token", m_token);},}); 
   }else if (x==4){
   return $.ajax({ url: 'https://media.mediavitrina.ru/get_token', dataType: 'json', type: "GET",timeout: 5000, 
   success: function(data){if(data !== null) d=data;m_token=d['result']['token'];m_exp=Math.round(Date.now()/1000)+43200;
   providerSetItem("m_exp", m_exp);providerSetItem("m_token", m_token);},
   error: function(){$.ajax({ url: host+'/m3u/pr.php?id=3', dataType: 'json', type: "POST",data:{svc:btoa(Math.round(Date.now()/1000)),a:box_mac_,l:window.location.href},timeout: 5000, 
   success: function(data){if(data !== null) d=data;m_token=d['result']['token'];m_exp=Math.round(Date.now()/1000)+43200;
   providerSetItem("m_exp", m_exp);providerSetItem("m_token", m_token);},})},
   }); 
   }else if (x==5){
   return $.ajax({ url: host+'/m3u/pr.php?id=5', dataType: 'json', type: "POST",data:{svc:btoa(Math.round(Date.now()/1000)),a:box_mac_,l:window.location.href},timeout: 5000, 
   success: function(data){if(data !== null) d=data;t_token=d.t_token;tv24token_a=d.access_token_a;tv_exp=d.tv_exp;t_exp=d.t_exp;
   providerSetItem("t_token", t_token);providerSetItem("t_exp", t_exp);providerSetItem("tv_exp", tv_exp);providerSetItem("tv24token_a", tv24token_a); },}); 
   }
} t_exp=1;
if (serD==0){
if (Math.round(Date.now()/1000) >p_exp||p_token=="") {try {pr(1);}catch (e){};}
//if (Math.round(Date.now()/1000) >t_exp||t_token==""||Math.round(Date.now()/1000) >tv_exp||tv24token_a=="") {try {pr(5);}catch (e){};};
if (Math.round(Date.now()/1000) >t_exp||t_token=="") {try {pr(5);}catch (e){};}
//if (Math.round(Date.now()/1000) >m_exp||m_token=="") {pr(4);if(m_token==""){pr(3);}}
if (Math.round(Date.now()/1000) >m_exp||m_token=="") {try {pr(4);}catch (e){};}
//if (tv24token==""){try {tv24t();}catch (e){};}
if (tv24dev=="noDev"){try {tv24t();}catch (e){};}

}

$.ajax({ url: host+'/m3u/neva_ext.json?3', dataType: 'json', type: "GET",timeout: 5000, success: function(data){if(data !== null) neva_ext=data;},}); 
$.ajax({ url: host+'/m3u/neva_int.json?3', dataType: 'json', type: "GET",timeout: 5000, success: function(data){if(data !== null) neva_int=data;},}); 
//$.ajax({ url: host+'/m3u/vng_ext.json', dataType: 'json', type: "GET",timeout: 5000, success: function(data){if(data !== null) vng_ext=data;},});
//if (dn==2||dn==4||dn==6) {providerSetItem("lm_arr","");}
var lm_arr={},tv24_arr={};providerSetItem("lm_arr","");
//console.log ('lm_arr1:',lm_arr);
try {lm_arr=JSON.parse(providerGetItem("lm_arr"));} catch (e){};
try {tv24_arr=JSON.parse(providerGetItem("tv24_arr"));} catch (e){};
if (typeof lm_arr == 'undefined'||lm_arr == null)lm_arr={};
if (typeof tv24_arr == 'undefined'||tv24_arr == null)tv24_arr={};
//console.log ('lm_arr2:',lm_arr);
 
function repurl(ur){
  svc=btoa(Math.round(Date.now()/1000));
  if(ur.indexOf('in.drmplay.top')>0){
      var id_in=parseInt(ur.replace(/https\:\/\/in\.drmplay\.top\//g,""));
        $.ajax({ url:scheme+'api4.inetcom.tv/channel/all', dataType: 'json', type: "GET",headers:{"X-Client-Info":"AndroidPhone 50327582","X-Client-Model":"OnePlus A5010","X-Device":"4","X-Requested-With":"tv.inetcom.phone2","User-Agent":eUserAgent[3]}, timeout: 10000, async:false,
               success: function(data){if(data !== null){d=data;for (var i = 0; i <d.length; i ++) {if (d[i].id==id_in){url=d[i].streams.hls;break;}};}},});return url;
    }else if(ur.indexOf('media.drmplay.top')>0){
    id_nv=ur.replace(/http:\/\/media.drmplay.top\//g,''); 
    arr_id=neva_int[id_nv].split('?id=');
    neva=atob(arr_id[1]).split(',');
    url=arr_id[0].replace(/31\.134\.132\.249/g,neva[Math.floor(Math.random() * neva.length)]);
    }else if(ur.indexOf('vng.drmplay.top')>0){
    id_arh_nv=ur.replace(/http:\/\/vng.drmplay.top\//g,'').split('&'); 
    id_nv=id_arh_nv[0];arh_nv=id_arh_nv[1]||0;
    console.log("id_nv:"+id_nv+" arh_nv"+arh_nv);
    arr_id=vng_ext[id_nv].split('?id=');
    vng=atob(arr_id[1]).split(',');
    url=arr_id[0].replace(/185\.23\.80\.25/g,vng[Math.floor(Math.random() * vng.length)]);
    if (arh_nv!==0){url=url.replace(/index.m3u8/g,'tracks-v1a1/'+arh_nv);}else{url=url.replace(/index.m3u8/g,'tracks-v1a1/mono.m3u8');}
    console.log("url_vng:"+url);
    return url;
    }else if (ur.indexOf('neva.drmplay.top')>0){
    id_arh_nv=ur.replace(/http:\/\/neva.drmplay.top\//g,'').split('&'); 
    id_nv=id_arh_nv[0];arh_nv=id_arh_nv[1]||0;
    arr_id=neva_ext[id_nv].split('?id=');neva=atob(arr_id[1]).split(',');
    if (neva_int[id_nv]){arh_id=neva_int[id_nv].split('?id=');neva_arh=atob(arh_id[1]).split(',');}else{arh_id="";}    
    if (arh_nv!==0&&arh_nv!=""&&arh_id!=""){url=arh_id[0].replace(/31\.134\.132\.249/g,neva_arh[Math.floor(Math.random() * neva_arh.length)]).replace(/index.m3u8/g,arh_nv+'?token='+n_token);
    }else{url=arr_id[0].replace(/31\.134\.132\.249/g,neva[Math.floor(Math.random() * neva.length)]).replace(/index.m3u8/g,'mono.m3u8?token='+n_token);}
   }else if(ur.indexOf('stk.drmplay.top')>0){
        id_stk=ur.replace(/http\:\/\/stk\.drmplay\.top\//g,"");
        $.ajax({
           url: 'http://cors.drm-play.com/m3u/cors-stk.php'+id_stk, dataType: 'json', type: "GET", timeout: 5000, async:false, 
           success: function(data){ if(data !== null) d = data; url=d.url;
           },
        });
   }else if(ur.indexOf('prs.drmplay.top')>0){
        if (Math.round(Date.now()/1000) >p_exp) {pr(1);}
        url=ur.replace(/prs\.drmplay\.top\//g,"api.peers.tv/timeshift/");
        url=url+'='+p_token+'&offset=10';
  }else if(ur.indexOf('smk.drmplay.top')>0){
        id_stk=ur.replace(/http\:\/\/smk\.drmplay\.top\//g,"");
        $.ajax({
           url: 'http://cors.drm-play.com/m3u/cors-stk.php'+id_stk, dataType: 'json', type: "GET", timeout: 5000, async:false, 
           success: function(data){ if(data !== null) d = data; url=d.url;
           },
        });return url;
  }else if(ur.indexOf('obt.drmplay.top')>0){
        orbt=sobt.split(',');
        obt=orbt[Math.floor(Math.random() * orbt.length)]+'/btv/SWM';
        url=ur.replace(/obt\.drmplay\.top/g, obt);
  }else if(ur.indexOf('atv.drmplay.top')>0){
        atvt=satv.split(',');url=ur.replace(/atv\.drmplay\.top/g, atvt[Math.floor(Math.random() * atvt.length)]);
  }else if(ur.indexOf('lmh.drmplay.top')>0){
        id_lm=ur.replace(/https\:\/\/lmh\.drmplay\.top\//g,"");
        id_lm=id_lm.replace(/\/index-\d+-\d+.m3u8/g,"");
        data_lm= typeof(lm_arr[id_lm]) !== "undefined" && lm_arr[id_lm] !== null ? lm_arr[id_lm]['data'] : 0;
        if (data_lm > Math.floor(Date.now()/1000))
        {url_arh=lm_arr[id_lm]['arh'];url=lm_arr[id_lm]['url'];return url;}
                $.ajax({ url: 'http://ott.drm-play.com/m3u/corsp.php', dataType: 'json', type: "POST", data: {stk:1,lst:drm_list,id:id_lm,svc:btoa(Math.round(Date.now()/1000)),a:box_mac_}, timeout: 10000, async:false,
                        success: function(data){if(data !== null) d=data;url=d.url;url_arh=d.url_arh;
                        if (ur.indexOf('index-')>0) { ar=ur.match('index-(.*)$');url=url_arh+'/index-'+ar[0];}
                        },
                        error: function(){url=scheme+"tv.drm-play.com/2/mono.m3u8";},           
                }); 
                data_url=url.split(',');data_url=data_url[1].split('/');data_url=data_url[0];
                lm_arr[id_lm]={data:data_url,url:url,arh:url_arh};console.log ('lm_arr:',lm_arr);
                providerSetItem("lm_arr",JSON.stringify(lm_arr));
  }else if(ur.indexOf('lm.drmplay.top')){
        id_lm=ur.replace(/https\:\/\/lm\.drmplay\.top\//g,"");
        id_lm=id_lm.replace(/\/index-\d+-\d+.m3u8/g,"");
        data_lm= typeof(lm_arr[id_lm]) !== "undefined" && lm_arr[id_lm] !== null ? lm_arr[id_lm]['data'] : 0;
        if (data_lm > Math.floor(Date.now()/1000))
        {url_arh=lm_arr[id_lm]['arh'];url=lm_arr[id_lm]['url'];return url;}
        lm_url='https://api.iptv2021.com/v1/streams/'+id_lm;
                $.ajax({ url: lm_url, dataType: 'json', type: "GET",headers:{"X-Access-Key":slame}, timeout: 10000, async:false,
                        success: function(data){if(data !== null) {d=data;console.log ('data_lm:',d);
                        url= typeof(d['data'][0]['attributes']['playlist_url']) != "undefined" && d['data'][0]['attributes']['playlist_url'] !== null ? d['data'][0]['attributes']['playlist_url'] : scheme+"tv.drm-play.com/2/mono.m3u8"; 
                        url_arh= typeof(d['data'][0]['attributes']['archive_url']) != "undefined" && d['data'][0]['attributes']['archive_url'] !== null ? d['data'][0]['attributes']['archive_url'] : ""; 
                        console.log ('url:'+url);console.log ('url_arh:'+url_arh);
                        }},
                        error: function(){url=scheme+"tv.drm-play.com/2/mono.m3u8";},});           
                        data_url=url.split(',');data_url=data_url[1].split('/');data_url=data_url[0];
                if (url.indexOf('drm-play.com')===-1){
                var xhr;var _orgAjax = jQuery.ajaxSettings.xhr;
                jQuery.ajaxSettings.xhr = function () {xhr = _orgAjax();return xhr;};
                $.ajax({ url: url, type: "GET", timeout: 10000, async:false,                     
                        success: function(data){          
                                url=xhr.responseURL;                              
                                if(data.indexOf('tracks-v6a1')>0){
                                  url=url.replace(/index.m3u8/g,'tracks-v6a1/mono.m3u8');
                                } else if (data.indexOf('tracks-v5a1')>0) {
                                  url=url.replace(/index.m3u8/g,'tracks-v5a1/mono.m3u8');
                                } else if (data.indexOf('tracks-v4a1')>0) {
                                  url=url.replace(/index.m3u8/g,'tracks-v4a1/mono.m3u8');
                                } else if (data.indexOf('tracks-v3a1')>0) {
                                  url=url.replace(/index.m3u8/g,'tracks-v3a1/mono.m3u8');
                                }},
                        error: function(){url=url.replace(/mhd\./g,'mhd219.');},});  
                if(scheme=='http://'){url=url.replace(/https:/g,'http:');url_arh=url_arh.replace(/https:/g,'http:');}
                lm_arr[id_lm]={data:data_url,url:url,arh:url_arh};console.log ('lm_arr:',lm_arr);
                providerSetItem("lm_arr",JSON.stringify(lm_arr));
               }
  } 
return url;  
} 
function okko(ur){
    $.ajax({ url: ur, dataType: 'json', type: "GET", timeout: 10000, async:false,
        success: function(data){ if(data !== null) d = data; url_ok=d.url;okko_id=d.id;},
        error: function(){alert ("Error okko");},
    });
return url_ok;
}
var doEditM3Ua = function(ind){
    if(typeof ind === 'undefined') ind = m3uArr.active;
    selIndex = ind;
    listArray = m3uArr.M3Us;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(sNoNumbersKeys?(i+1)+' - ':'<div class="btn">'+(i+1)+'</div>&nbsp;')+(item.name || item.www || ''); };
    detailListAction = function(){
        var a = m3uArr.M3Us[selIndex];
        listDetail.innerHTML = _('Playlist Name')+': <span " style="color:'+curColor+';">'+(a.name || '')+'</span><br/>'+
            _('Playlist URL')+':<br/><span " style="color:'+curColor+';">'+(a.www || '')+'</span><br/>'+
            _('Archive hours')+': <span " style="color:'+curColor+';">'+(a.rechours || 0)+'</span><br/>'+
            _('EPG source selection')+': <span " style="color:'+curColor+';">'+(a.epg || '')+'</span><br/>'+
            _('Media Library URL')+':<br/><span " style="color:'+curColor+';">'+(a.medUrl || '')+'</span>';
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')+btnDiv(keys.ENTER, strENTER, ((m3uArr.active == selIndex) || !m3uArr.M3Us[selIndex].www)?'Edit':'Load');

    };
    listKeyHandler = function(code){
        switch (code) {
            case keys.RETURN: _m3u2popup(); popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N1:
            case keys.N2:
            case keys.N3:
            case keys.N4:
            case keys.N5:
            case keys.N6:
            case keys.N7:
            case keys.N8:
            case keys.N9:
            case keys.N10:
        if (code - 49 > listArray.length - 1) return false;
        selIndex = code - 49; 

            case keys.ENTER:
                if((m3uArr.active == selIndex) || !m3uArr.M3Us[selIndex].www) doEditListData(selIndex);
                else selectAndRestart(selIndex)
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Select playlist');
    listPodval.innerHTML = '';
    $('#listPopUp').hide();

    showPage();
}
function doEditListData(ind){
    function __m3u2list(){
        var i=0;
        listArray[i++] = _('Playlist Name')+': '+(a.name || '');
        listArray[i++] = _('Playlist URL')+': '+(a.www || '');
        if(typeof(readFile)==='function'){
            var f = '';
            if(a.www && a.www[0]=='/'){
                var af = a.www.split('/');
                f = af[af.length-1];
            }
            listArray[i++] = _('Playlist file')+': '+f+strNew;
        }
        listArray[i++] = _('Archive hours')+': '+(a.rechours || 0);
        listArray[i++] = _('EPG source selection')+': '+(a.epg || '');
        listArray[i] = _('Media Library URL')+': '+(a.medUrl || '');
    }
    function _edit(caption, vname, types, intg, clpdsa){
        editCaption = _(caption);
        editvar = (a[vname] || '').toString();
        setEdit = function(){
            if(a[vname] == editvar.trim()) return;
            if(clpdsa) pdsa.forEach(function(val){ providerSetItem(val, ''); });
            a[vname] = intg? parseInt(editvar) || 0 : editvar;
            providerSetItem("m3uArr", JSON.stringify(m3uArr));
            __m3u2list();
            getMediaArray = m3uArr.M3Us[m3uArr.active].medUrl?_getMediaArray:null;
            showPage();
        };
        showEditKey(types);
    }

        function editListPC(){
            var _break = false, _code;
            function _close(){ clearTimeout(_timeout); _break = true;editKey = editKey1;$('#listEdit').hide()}
            var _timeout = setTimeout( _close, 600000);
            function get_settings(){
                if(_break) return;
                $.ajax({
                    url: host+'/swop/a.php',
                    data: {c:'get_m3u', d: _code}, type: 'POST', timeout: 10000, cache: false,
                    success: function(json){
                        if(_break) return;
                        if(json.status === 'forbidden') setTimeout(get_settings, 5000)
                        else if (json.status === 'success') {
                            a.name = json.name;
                            a.www = json.www;
                            a.medUrl = json.medUrl;
                            editKey = editKey1; 
                            _close(); providerSetItem("m3uArr", JSON.stringify(m3uArr));
                            __m3u2list();
                            showPage();
							loadPlaylist();
                        }
                    },
                    error: function(jqXHR){
                        $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
                    },
                })
            }
            listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
            $('#listEdit').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send request')+'...</div>').show();
            editKey = function(code){ if(code==keys.RETURN||code==keys.EXIT){ _close(); } return true; }
            $.ajax({
                url: host+'/swop/a.php', data: {c:'get_cod_m3u'}, type: 'POST', timeout: 10000, cache: false,
                success: function(json){
                    _code = json.code;
                    $('#listEdit').html(
                        '<div style="text-align:center;font-size:larger;"><br/>'+_('Request sended!')+'<br/><br/>'+
                        _('To enter playlist value open')+'<br/><span style="font-size:larger;color:'+curColor+'">'+__test+host+'</span> t.me/tv4u_bot '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+_code+'</span><br/><br/>'+
                        _('or scan')+':<br/><br/>'+
                        '<div><img src="./stbPlayer/bot.png" style="max-width: 30%; height: auto; display: block; margin: auto;" alt="bot"></div>'+
                        '</div>'
                    );
                    //setTimeout(get_settings, 10000);
                },
                error: function(jqXHR){
                    $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
                },
            });
        }



    if(typeof ind === 'undefined') ind = m3uArr.active;
    var a = m3uArr.M3Us[ind];
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),
        aDetail = [_('Enter playlist Name'),_('Enter playlist URL')+r, _('Enter playlist archive hours')+r,_('List of epg sources: http://epg.drm-play.com column "provider". For example: edem <br> Entering multiple sources using ";" For example: iptvx.one;edem;tvteam'),_('Enter Media Library URL'), '', _('Enter URL playlis & media on PC or Phone'),'',_('Load playlist'),_('Delete value playlist')]
        a2=2,a3=3,a4=4,a5=8,aR=1000;a6=6;a7=9;
        listArray = ['', '', '', '','', '', _('Enter URL on PC or Phone'),'', _('Load playlist'),_('Delete')];

    if(typeof(readFile)=='function'){
        listArray.splice(2,0,'');
        aDetail.splice(2,0,_('Select playlist file')+r);
        a2=3,a3=4,a4=5,a5=9,aR=2;a6=7;a7=10;
    }

    __m3u2list();
	editListPC();
	
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){ listDetail.innerHTML = aDetail[selIndex]; };
    listKeyHandler = function(code){
        switch (code) {
            case keys.ENTER:
                switch (selIndex) {
                    case 0: _edit('Enter playlist Name', 'name'); return true;
                    case 1: _edit('Enter playlist URL', 'www', null, false, m3uArr.active==ind); return true;
                    case aR:
                        editvar = (a['www'] || '').toString();
                        setEdit = function(){
                            a.www = editvar;
                            providerSetItem("m3uArr", JSON.stringify(m3uArr));
                            __m3u2list();
                            showPage();
                        }
                        showFileDialog(editvar, 'm3u,m3u8');
                        return true;
                    case a2: _edit('Enter playlist archive hours', 'rechours', [0], true); return true;
                    case a3: _edit('Enter EPG source', 'epg'); return true;
                    case a4: _edit('Enter Media Library URL', 'medUrl'); return true;
                    case a5:
                        if(_number>0 && _number<25) loadPlaylist();//restart();
                        else selectAndRestart(ind);
                        return true;
                    case a6:
                        editListPC();//__m3u2list();showPage();
                        return true;    
                    case a7:
                        a.name='';
                        a.www='';a.epg='';
                        a.medUrl=''; providerSetItem("m3uArr", JSON.stringify(m3uArr));
                        __m3u2list();showPage();
                        return true;

                }
                return true;
			
            case keys.RETURN:
                if(_number>0 && _number<25){ _m3u2popup(); popupList(popupActions.indexOf(noProvParam)+1); }
                else doEditM3Ua(ind);
                return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Edit playlist data');
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();

    showPage();
}
function xml2json1(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        // o["#cdata"] = X.escape(n.nodeValue);
                        o = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}
function getMediaArrayXML(murl, callback){ //true
    mediaUrls[mediaUrls.length-1]=murl;
    if(murl === '') { callback(); return; }
    var head={'X-Svc':btoa(Math.round(Date.now()/1000))};var method='get';var data='';
    if (murl.indexOf('drm-play') >0&&murl.indexOf('media.php') >0) {method='post';data=head;}
    if((typeof box_mac !== 'undefined') && box_mac) {murl += ((murl.indexOf('?') == -1) ? '?' : '&')+'box_client=ott-play&box_mac='+box_mac;}
    $.ajax({url: murl, dataType: 'text',timeout: 60000,method:method, data:data,
        success: function(data, textStatus, jqXHR){
            try {
                var i=data.indexOf('<?xml');
                if(i!==-1){ // XML        |\&|ium","\u0026"
                    data=data.replace(/\&\#\d+;/g,"" );
                    data=data.replace(/\&nbsp;/g," " );
                    data=data.replace(/(\<title\>.+?)\&(.+?\<\/title\>)/g,"$1 | $2" );
                    if (murl.indexOf("filmix.red")){
                    data=data.replace(/channels\>/g,"items>" );
                    data=data.replace(/\<stream_url\>https\:\/\//g,"<stream_url>http://" );
                    }

                    if(i>0) data = data.substr(i);
                    var jj;
                    try { data = xml2json1(jQuery.parseXML(data), ' '); }
                    catch (e) { alert("Error XML !!!"); return; }
                } else {
                    i=data.indexOf('#EXTM3U');
                    if(i!==-1){ // m3u
                        getMediaArrayEXTM3U(data);
                        return;
                    }
                }
                try { jj = JSON.parse(data); }
                catch (e) { alert("Error JSON !!!"); return; }
                if(jj.items) jj = jj.items;
                mediaName = jj.playlist_name || jj.title || mediaName || '?';
                var cc = jj.channel ||jj.channels;
                mediaRecords = !cc ? [] : Array.isArray(cc) ? cc : [cc];
                if(jj.next_page_url) mediaRecords.push( {title: '...', logo_30x30: '', description: '...', playlist_url: jj.next_page_url} );
            } catch (e) {
                console.log(e);
            }
        },
        complete: function(){ $('#dialogbox').hide(); callback(); },
    });
}

function getMediaArrayEXTM3U(data){
    function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

    function item2descr(n, i){
        return '<table>'
            + '<h2><center>'+n+'</center></h2>'
            + (i?'<img id="detal" height="285" src="'+i+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">':'')
            + '</table>';
    }
    try{
        mediaName = mediaName || '?';
        mediaRecords = [];
        var arrEXTINF = data.split('#EXTINF:');
        arrEXTINF.shift();
        arrEXTINF.forEach(function(val, i, arr){
            var e = val.split('\n');
            var logo = getAttribute(e[0], 'tvg-logo');
            var cn = '??? Нет названия';
            try { cn = e[0].split(',')[1].trim(); } catch(e) {}
            var url = '', n = 1;
            try { url = e[1].trim(); } catch(e) {}
            while (url.indexOf('#') === 0) {
                try { url = e[++n].trim(); } catch(e) { url = ''; }
            }
            if(url)
                mediaRecords.push({title: cn, logo_30x30: logo, description: item2descr(cn, logo), stream_url: url});
        });
    } catch(e) {
        alert("Error M3U !!!");
    }
}
if(browserName() == 'dune'){
var _getMediaArray = function(murl, callback){
    if(murl === '') murl = m3uArr.M3Us[m3uArr.active].medUrl || '';
    getMediaArrayXML(murl, callback); 
}
box_mac = stb.getMacAddress().replace(/:/g, '');
}
try{
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}
}catch(e){}