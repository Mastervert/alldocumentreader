/* PDF page scroller: draggable handle showing the current page */
(function(){
var h=document.createElement('div');h.id='pgs';
h.style.cssText='position:absolute;right:3px;width:52px;height:44px;display:none;align-items:center;justify-content:flex-end;touch-action:none;z-index:6;cursor:grab;opacity:.6;transition:opacity .2s;';
h.innerHTML='<div id="pgsp" style="padding:0 8px;height:26px;border-radius:16px;background:rgba(32,34,48,.88);color:#fff;font-size:11px;font-weight:500;display:flex;align-items:center;"><span id="pgst">1 / 1</span></div>';
phone.appendChild(h);
var drag=false,idle=null;
function dirH(){return typeof scr!=='undefined'&&scr==='viewer'&&typeof vk==='function'&&V[vk()]&&V[vk()].dir==='b'&&pages().length>0;}
function pages(){return bodyEl.querySelectorAll('[data-unit]');}
function kind(){if(typeof scr==='undefined'||scr!=='viewer'||typeof vk!=='function')return null;var k=vk(),hp=pages().length>0;if(hp&&(k==='pdf'||k==='doc'||k==='txt'))return 'pdf';if(k==='doc'||k==='txt'||k==='xls')return 'virt';if(k==='pdf'&&V.pdf.reading)return 'virt';return null;}
function total(){return kind()==='pdf'?pages().length:Math.max(1,Math.ceil(bodyEl.scrollHeight/Math.max(1,bodyEl.clientHeight)));}
function virtCur(){var max=bodyEl.scrollHeight-bodyEl.clientHeight;return max>0?Math.min(total()-1,Math.floor(bodyEl.scrollTop/max*total())):0;}
function curPage(){if(window.__pgCur&&kind()==='pdf')return window.__pgCur();if(kind()==='virt')return virtCur();var u=pages(),bt=bodyEl.getBoundingClientRect().top,probe=bt+bodyEl.clientHeight*0.3,c=0;for(var i=0;i<u.length;i++){if(u[i].getBoundingClientRect().top<=probe)c=i;else break;}return c;}
function geo(){var r=bodyEl.getBoundingClientRect(),p=phone.getBoundingClientRect();return {top:r.top-p.top+6,h:r.height-12-44-52};}
function active(){return !!kind()&&!sheet&&(kind()==='virt'||pages().length>0)&&(dirH()?true:bodyEl.scrollHeight>bodyEl.clientHeight+4);}
function upd(){if(!active()){h.style.display='none';return;}h.style.display='flex';if(dirH()){var u=pages();h.style.pointerEvents='none';h.style.top=(geo().top)+'px';document.getElementById('pgst').textContent=(window.__pgCur()+1)+'/'+u.length;window.__pgSave&&window.__pgSave();return;}h.style.pointerEvents='';window.__pgSave&&window.__pgSave();var g=geo(),max=bodyEl.scrollHeight-bodyEl.clientHeight,r=max>0?bodyEl.scrollTop/max:0,n=total();h.style.top=(g.top+r*g.h)+'px';document.getElementById('pgst').textContent=(curPage()+1)+'/'+n;}
function wake(){h.style.opacity='1';clearTimeout(idle);idle=setTimeout(function(){if(!drag)h.style.opacity='.6';},1400);}
bodyEl.addEventListener('scroll',function(){upd();wake();},{passive:true});
function moveTo(y){var g=geo(),p=phone.getBoundingClientRect(),r=(y-p.top-g.top-22)/g.h;r=Math.max(0,Math.min(1,r));bodyEl.scrollTop=r*(bodyEl.scrollHeight-bodyEl.clientHeight);upd();}
h.addEventListener('pointerdown',function(e){drag=true;h.setPointerCapture(e.pointerId);h.style.cursor='grabbing';h.style.opacity='1';e.preventDefault();e.stopPropagation();});
h.addEventListener('pointermove',function(e){if(drag)moveTo(e.clientY);});
function end(e){if(!drag)return;drag=false;h.style.cursor='grab';wake();}
h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
h.addEventListener('click',function(e){e.stopPropagation();});
setInterval(function(){if(!drag)upd();},300);
})();
