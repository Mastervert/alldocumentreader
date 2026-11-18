var $=function(i){return document.getElementById(i);};
var phone=$('phone'),topEl=$('top'),bodyEl=$('body'),navEl=$('nav'),fabEl=$('fab'),sheetEl=$('sheet'),drawerEl=$('drawer'),ovlEl=$('ovl'),toastEl=$('toast');
var subFrom=null,scr='launcher',docId=null,mode='system',gridOn=false,tsize=15,tt,helpOpen=-1,timer,rtimer,ringEl=null,sx=0,sy=0,hold=null,long=false;
function isDark(){var cs=getComputedStyle(phone).getPropertyValue('--text-primary');if(!cs||!cs.trim())return !!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);var t=document.createElement('span');t.style.color='var(--text-primary)';phone.appendChild(t);var c=getComputedStyle(t).color;phone.removeChild(t);var m=c.match(/[\d.]+/g);return (0.299*m[0]+0.587*m[1]+0.114*m[2])>140;}
function applyTheme(){phone.classList.remove('f-dark','f-light');var dk=mode==='dark'||(mode==='system'&&isDark());if(mode==='dark')phone.classList.add('f-dark');if(mode==='light')phone.classList.add('f-light');phone.classList.toggle('dark',dk);phone.classList.toggle('nogrid',!gridOn);}
function hydrateIcons(root){var els=root.querySelectorAll('i.ti:not([data-h])');for(var i=0;i<els.length;i++){var el=els[i],n=null;for(var j=0;j<el.classList.length;j++){var c=el.classList[j];if(c.indexOf('ti-')===0)n=c.slice(3);}el.setAttribute('data-h','1');var p=n&&ICON_PATHS[n];if(p){var f=p.charAt(0)==='F';el.innerHTML='<svg viewBox="0 0 24 24" width="1em" height="1em" '+(f?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')+' style="display:block;pointer-events:none">'+p.slice(1)+'</svg>';}}}
new MutationObserver(function(){hydrateIcons(phone);}).observe(phone,{childList:true,subtree:true});
function setMode(m){mode=m;applyTheme();render(true);}
function setTsize(n){tsize=Math.max(12,Math.min(22,n));V.doc.size=tsize;V.txt.size=Math.max(10,tsize-3);render(true);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function av(s){return '<div style="width:'+s+'px;height:'+s+'px;border-radius:50%;background:var(--dan));display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ti ti-sparkles" style="font-size:'+Math.round(s*0.55)+'px;color:#fff;"></i></div>';}
function ic(n,a,x){return '<i class="ti ti-'+n+'" data-act="'+a+'" role="button" style="font-size:22px;padding:8px;margin:-8px;cursor:pointer;color:var(--text-primary);'+(x||'')+'"></i>';}
function tile(k,s){var t=TY[k]||TY.txt;return '<div class="ibox" style="width:'+s+'px;height:'+s+'px;border-radius:12px;background:'+t[2]+'38;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="ti ti-'+t[1]+'" style="font-size:'+Math.round(s*0.55)+'px;color:'+t[2]+';"></i></div>';}
function sw(a,on){return '<div data-act="'+a+'" role="switch" aria-checked="'+on+'" style="width:44px;height:26px;border-radius:16px;background:'+(on?'var(--text-accent)':'var(--border-strong)')+';position:relative;cursor:pointer;flex-shrink:0;"><div style="position:absolute;top:3px;left:'+(on?21:3)+'px;width:20px;height:20px;border-radius:50%;background:#fff;"></div></div>';}
function toast(m,undo){clearTimeout(tt);toastEl.innerHTML='<div style="position:absolute;left:12px;right:12px;bottom:'+(scr==='home'&&path.length&&!selecting()?136:80)+'px;background:var(--text-primary);color:var(--surface-2);border-radius:12px;padding:10px 14px;font-size:13px;display:flex;gap:12px;align-items:center;z-index:30;"><span style="flex:1;">'+esc(m)+'</span>'+(undo?'<span data-act="undo" style="font-weight:500;text-decoration:underline;cursor:pointer;padding:6px;">Undo</span>':'')+'</div>';tt=setTimeout(function(){toastEl.innerHTML='';},3000);}
function flash(sid){var el=$(sid);if(!el)return;el.style.background=phone.classList.contains('dark')?'#6B5A12':'#FFE98A';el.style.borderRadius='3px';var y=el.getBoundingClientRect().top-bodyEl.getBoundingClientRect().top+bodyEl.scrollTop-90;bodyEl.scrollTo({top:Math.max(0,y),behavior:'smooth'});setTimeout(function(){el.style.background='';},4500);}
function setRow(i,t,s,a,r){return '<div data-act="'+a+'" role="button" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:0.5px solid var(--border-strong);margin-bottom:8px;cursor:pointer;"><i class="ti ti-'+i+'" style="font-size:22px;color:var(--text-secondary);"></i><div style="flex:1;"><div style="font-size:14px;">'+t+'</div><div style="font-size:12px;color:var(--text-secondary);">'+s+'</div></div>'+(r||'')+'</div>';}
function tgRow(i,t,s,a,on){return '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:0.5px solid var(--border-strong);margin-bottom:8px;"><i class="ti ti-'+i+'" style="font-size:22px;color:var(--text-secondary);"></i><div style="flex:1;"><div style="font-size:14px;">'+t+'</div><div style="font-size:12px;color:var(--text-secondary);">'+s+'</div></div>'+sw(a,on)+'</div>';}
function srow(i,t,s,scr){return '<div data-act="sgo" data-s="'+scr+'" role="button" style="display:flex;align-items:center;gap:12px;padding:14px 16px;min-height:56px;border-bottom:1px solid var(--border);cursor:pointer;"><i class="ti ti-'+i+'" style="font-size:22px;color:var(--text-secondary);"></i><div style="flex:1;min-width:0;"><div style="font-size:15px;">'+t+'</div><div style="font-size:12px;color:var(--text-secondary);">'+s+'</div></div><i class="ti ti-chevron-right" style="font-size:18px;color:var(--text-muted);"></i></div>';}
function settingsHtml(){var tn={system:'System default',light:'Light',dark:'Dark'}[mode],fn=FONTS.filter(function(o){return o[0]===fontSet;})[0][1];return '<div class="grp" style="margin:12px 16px 24px;background:var(--surface-2);border:1px solid var(--border);border-radius:24px;overflow:hidden;">'+srow('palette','Theme',tn,'stheme')+srow('h2','Font style',fn,'sfont')+srow('letter-case','Text size',tsize+' px','stext')+'</div>';}
function themeHtml(){return '<div style="padding:8px 14px 24px;">'+[['system','device-mobile','System default'],['light','sun','Light'],['dark','moon','Dark']].map(function(o){var on=mode===o[0];return '<div data-act="setmode" data-m="'+o[0]+'" role="button" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:'+(on?'1px solid var(--text-accent)':'0.5px solid var(--border-strong)')+';margin-bottom:8px;cursor:pointer;"><i class="ti ti-'+o[1]+'" style="font-size:22px;color:'+(on?'var(--text-accent)':'var(--text-secondary)')+';"></i><span style="flex:1;font-size:14px;">'+o[2]+'</span>'+(on?'<i class="ti ti-circle-check" style="font-size:22px;color:var(--text-accent);"></i>':'')+'</div>';}).join('')+'</div>';}
function fontHtml(){return '<div style="padding:8px 14px 24px;">'+FONTS.map(function(o){var on=fontSet===o[0];return '<div data-act="setfont" data-f="'+o[0]+'" role="button" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:'+(on?'1px solid var(--text-accent)':'0.5px solid var(--border-strong)')+';margin-bottom:8px;cursor:pointer;"><div style="flex:1;"><div style="font-family:'+o[2]+';font-size:17px;">'+o[1]+'</div><div style="font-family:'+o[3]+';font-size:12px;color:var(--text-secondary);margin-top:2px;">'+o[4]+'</div></div>'+(on?'<i class="ti ti-circle-check" style="font-size:22px;color:var(--text-accent);"></i>':'')+'</div>';}).join('')+'</div>';}
function textHtml(){var stp=function(a,n){return '<div data-act="'+a+'" role="button" style="width:40px;height:40px;border-radius:12px;border:0.5px solid var(--border-strong);display:flex;align-items:center;justify-content:center;cursor:pointer;"><i class="ti ti-'+n+'"></i></div>';};return '<div style="padding:8px 14px 24px;"><div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:0.5px solid var(--border-strong);margin-bottom:12px;"><span style="flex:1;font-size:14px;">Reading text size</span>'+stp('tsm','minus')+'<span style="min-width:48px;text-align:center;font-size:13px;">'+tsize+' px</span>'+stp('tsp','plus')+'</div><div style="padding:14px;border-radius:12px;border:0.5px solid var(--border-strong);font-size:'+tsize+'px;line-height:1.6;">This is how your documents will look when you read them.</div></div>';}
function helpHtml(){return '<div style="padding:0 14px 24px;"><p style="font-size:13px;color:var(--text-secondary);margin:4px 8px 12px;line-height:1.5;">Tap a problem to see how to fix it. You can also ask Dan.</p>'+HELP.map(function(h,i){var on=helpOpen===i;return '<div data-act="helpq" data-i="'+i+'" role="button" style="padding:12px;border-radius:12px;border:'+(on?'1px solid var(--text-accent)':'0.5px solid var(--border-strong)')+';margin-bottom:8px;cursor:pointer;"><div style="display:flex;align-items:center;gap:8px;"><span style="flex:1;font-size:14px;font-weight:500;">'+esc(h[0])+'</span><i class="ti ti-chevron-'+(on?'up':'down')+'" style="font-size:18px;color:var(--text-muted);"></i></div>'+(on?'<p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:var(--text-secondary);">'+esc(h[1])+'</p>':'')+'</div>';}).join('')+'</div>';}
function topHtml(){if(scr==='launcher'||scr==='splash')return '';var b='display:flex;align-items:center;gap:14px;padding:18px 16px 10px;';
if(scr==='home')return orgTop();
if(scr==='viewer')return viewerTop();
if(scr==='quiz')return '<div style="'+b+'">'+ic('arrow-left','qexit')+'<span style="flex:1;font-size:18px;font-weight:500;margin-left:4px;">Quiz</span></div>';
return '<div style="'+b+'">'+ic('arrow-left','back')+'<span style="flex:1;font-size:18px;font-weight:500;margin-left:4px;">'+({sprivacy:'Privacy Policy',slang:'Language',sfeedback:'Feedback & Suggestions',stheme:'Theme',sfont:'Font style',stext:'Text size',lab:'Understanding Dan',help:'Help'}[scr]||'Settings')+'</span>'+ic('sparkles','dan','color:var(--dan);')+'</div>';}
function bodyHtml(){if(scr==='launcher')return launcherHtml();if(scr==='splash')return '';if(scr==='home')return homeHtml();if(scr==='viewer')return viewerBody();if(scr==='quiz')return quizBody();if(scr==='sprivacy')return privacyHtml();if(scr==='slang')return langHtml();if(scr==='sfeedback')return feedbackHtml();if(scr==='stheme')return themeHtml();if(scr==='sfont')return fontHtml();if(scr==='stext')return textHtml();if(scr==='lab')return labHtml();if(scr==='help')return helpHtml();return settingsHtml();}
function navHtml(){if(scr==='home')return orgNav();if(scr==='viewer')return viewerTools();return '';}
function renderSheet(){if(!sheet){sheetEl.innerHTML='';return;}var inner=orgSheet();if(inner===null)inner=viewerSheet();if(inner===null){sheetEl.innerHTML='';return;}sheetEl.innerHTML='<div id="backdrop" style="position:absolute;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.4);display:flex;align-items:flex-end;z-index:7;"><div class="sheetpanel" style="width:100%;max-height:calc(100% - 40px);overflow-y:auto;background:var(--surface-2);border-radius:24px 20px 0 0;padding:16px 16px 0;border-top:0.5px solid var(--border);">'+inner+'<div style="height:16px;"></div></div></div>';}
function render(keep){var st=bodyEl.scrollTop;topEl.innerHTML=topHtml();bodyEl.innerHTML=bodyHtml();bodyEl.scrollTop=keep?st:0;navEl.innerHTML=navHtml();fabEl.innerHTML=orgFab();renderSheet();drawerEl.innerHTML=scr==='home'?drawerHtml():'';ovlEl.innerHTML=viewerOvl();var sp=$('splash');if(scr==='splash'){if(!sp.firstChild)sp.innerHTML=splashHtml();}else sp.innerHTML='';}
function go(s){scr=s;sheet=null;render(false);}
function endHold(){clearTimeout(timer);clearTimeout(rtimer);if(ringEl){ringEl.remove();ringEl=null;}hold=null;}
function fireItem(id){endHold();long=true;if(sel[id])delete sel[id];else sel[id]=true;render(true);}
function fireEmpty(){endHold();long=true;if(path.length===1){openSheetFx('newfolder');return;}sheet=path.length?'ctx':'ctxroot';render(true);}
function startRing(x,y){var rc=phone.getBoundingClientRect();ringEl=document.createElement('div');ringEl.className='hw';ringEl.style.left=(x-rc.left)+'px';ringEl.style.top=(y-rc.top)+'px';ringEl.innerHTML='<i></i><i></i><i></i><b style="animation-duration:'+(HOLD-RING_DELAY)+'ms"></b>';phone.appendChild(ringEl);}
function beginHold(h,x,y,fn){hold=h;timer=setTimeout(fn,HOLD);rtimer=setTimeout(function(){if(hold===h)startRing(x,y);},RING_DELAY);}
function moved(x,y){return Math.abs(x-sx)>10||Math.abs(y-sy)>10;}
function act(n,el){var d=el.dataset;
if(orgAct(n,d)||vAct(n,d)||danAct(n,el))return;
if(n==='launch')startSplash();
else if(n==='skip')finishSplash();
else if(n==='gear'){drawer=false;sheet=null;go('settings');}
else if(n==='back')go((scr==='stheme'||scr==='sfont'||scr==='stext'||scr==='slang')?'settings':'home');
else if(n==='sgo'){subFrom='settings';helpOpen=-1;go(d.s);}
else if(n==='tryDan'){openDan();setTimeout(function(){send(d.t);},250);}
else if(n==='gohelp'){drawer=false;subFrom=null;helpOpen=-1;go('help');}
else if(n==='golab'){drawer=false;go('lab');}

else if(n==='closeapp'){drawer=false;exitSel();scr='launcher';render(false);}
else if(n==='soon'){drawer=false;render(true);toast(d.n+' is designed next');}
else if(n==='setfont'){setFont(d.f);render(true);}
else if(n==='setmode')setMode(d.m);
else if(n==='tsm'||n==='tsp')setTsize(tsize+(n==='tsp'?1:-1));
else if(n==='togstrict'){strict=!strict;render(true);}
else if(n==='togwhy'){showWhy=!showWhy;render(true);}
else if(n==='clearall'){chats={};toast('Dan chats cleared');}

else if(n==='helpq'){helpOpen=helpOpen===+d.i?-1:+d.i;render(true);}}
phone.addEventListener('pointerdown',function(e){long=false;endHold();sx=e.clientX;sy=e.clientY;
if(scr!=='home'||selecting()||sheet||drawer||danOpen)return;
var r=e.target.closest('[data-file],[data-folder]');
if(r){var id=r.dataset.file||r.dataset.folder;beginHold({kind:'item'},e.clientX,e.clientY,function(){fireItem(id);});return;}
if(tab!=='home')return;
if(!e.target.closest('#body')||e.target.closest('[data-act],button,input'))return;
beginHold({kind:'empty'},e.clientX,e.clientY,fireEmpty);});
['pointerup','pointercancel','pointerleave','touchend','touchcancel'].forEach(function(n){phone.addEventListener(n,endHold);});
phone.addEventListener('pointermove',function(e){if(hold&&moved(e.clientX,e.clientY))endHold();});
phone.addEventListener('touchmove',function(e){var t=e.touches&&e.touches[0];if(hold&&t&&moved(t.clientX,t.clientY))endHold();},{passive:true});
window.addEventListener('scroll',endHold,true);
phone.addEventListener('contextmenu',function(e){e.preventDefault();});
phone.addEventListener('click',function(e){
if(long){long=false;return;}
if(e.target.id==='backdrop'){sheet=null;render(true);return;}
if(e.target.id==='dbackdrop'){drawer=false;render(true);return;}
if(e.target.id==='dbd'){closeDan();return;}
var a=e.target.closest('[data-act]');if(a){act(a.dataset.act,a);return;}
var hb=e.target.closest('[data-hl]');if(hb&&scr==='viewer'&&vk()==='pdf'&&V.pdf.hlMode){var hid=hb.dataset.hl;V.pdf.hl[hid]=!V.pdf.hl[hid];render(true);return;}
if(scr!=='home')return;
var fr=e.target.closest('[data-file]');if(fr){if(selecting()){var id=fr.dataset.file;if(sel[id])delete sel[id];else sel[id]=true;render(true);}else openFile(fr.dataset.file);return;}
var fo=e.target.closest('[data-folder]');if(fo){var fid=fo.dataset.folder;if(selecting()){if(sel[fid])delete sel[fid];else sel[fid]=true;render(true);return;}var nd=cur().children.filter(function(c){return c.id===fid;})[0];path.push(nd);render(false);return;}
if(selecting()&&e.target.closest('#body')){exitSel();render(true);}});
phone.addEventListener('input',function(e){var t=e.target.id;
if(t==='impq'){iq=e.target.value;var il=$('implist');if(il)il.innerHTML=impListHtml();}
else if(t==='allq'){aq=e.target.value;$('allres').innerHTML=allResHtml();}
else if(t==='nameInput'){newName=e.target.value;$('err').textContent='';var pv=$('pvName');if(pv)pv.textContent=newName||'Category name';}
else if(t==='vsq'){V[vk()].search=e.target.value;var st=bodyEl.scrollTop;bodyEl.innerHTML=bodyHtml();bodyEl.scrollTop=st;var c=$('vscount');if(c)c.textContent=searchCount()+' found';}});
phone.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var t=e.target.id;if(t==='dq'){if(e.key==='Enter')send(e.target.value);return;}if(t==='labq'){if(e.key==='Enter')danAct('labgo',e.target);return;}if(t==='nameInput'){if(e.key==='Enter')orgAct('create',{});return;}/* Activate a focused [data-act] element so role=button works for keyboard and screen-reader users. */var actEl=e.target.closest&&e.target.closest('[data-act]');if(actEl){if(e.key===' ')e.preventDefault();if(e.key==='Enter')act(actEl.dataset.act,actEl);}});
applyTheme();setInterval(applyTheme,1000);render(false);hydrateIcons(phone);

var FONTS=[['editorial','Editorial','"Playfair Display"','"DM Sans"','Playfair Display headings, DM Sans text'],['elegant','Elegant','"Cormorant Garamond"','"DM Sans"','Cormorant Garamond headings, DM Sans text'],['soft','Soft','Raleway','Raleway','Raleway everywhere']],fontSet='editorial';
var FONTCSS={editorial:['"Playfair Display"','"DM Sans"'],elegant:['"Cormorant Garamond"','"DM Sans"'],soft:['Raleway','Raleway']};
function setFont(k){if(!FONTCSS[k])return;fontSet=k;document.body.style.setProperty('--font-display',FONTCSS[k][0]+',Roboto,sans-serif');document.body.style.setProperty('--font-body',FONTCSS[k][1]+',-apple-system,"Segoe UI",Helvetica,Arial,sans-serif');}
setFont('editorial');
startSplash();
