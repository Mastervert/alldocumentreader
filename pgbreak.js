/* Reading modes. Every page keeps A4 proportions; the layout follows how the phone is held unless the user picks otherwise.
   v = Vertical: tall pages, scroll top to bottom.
   h = Horizontal: wide landscape pages, scroll top to bottom (turned sideways when the phone is upright).
   b = Book: one page at a time, flip left to right with a page-turn animation. Page shape follows the phone (Auto) or the user's choice. */
(function(){
var busy=false,bp=0,drag=null;
function K(){try{if(scr==='viewer'&&typeof vk==='function')return vk();}catch(e){}return null;}
function S(){var k=K();return k&&V[k]?V[k]:null;}
function dirOf(){var s=S();return (s&&s.dir)||'v';}
function isRot(){var f=bodyEl.querySelector('[data-flow]');return !!(f&&f.getAttribute('data-rot')==='1');}
function resetBody(){bodyEl.style.overflowX='auto';bodyEl.style.overflowY='auto';bodyEl.style.touchAction='';}
function pagesEl(){return [].slice.call(bodyEl.querySelectorAll('[data-unit]')).sort(function(a,b){return a.getAttribute('data-unit')-b.getAttribute('data-unit');});}
function curIdx(){var u=pagesEl();if(!u.length)return 0;if(dirOf()==='b')return Math.min(bp,u.length-1);var br=bodyEl.getBoundingClientRect(),py=br.top+bodyEl.clientHeight*0.3,c=0,bd=1e9,i,r;
 for(i=0;i<u.length;i++){r=u[i].getBoundingClientRect();if(r.top<=py&&r.bottom>py)return i;var dc=Math.abs((r.top+r.bottom)/2-py);if(dc<bd){bd=dc;c=i;}}return c;}
function save(){var s=S(),u=pagesEl();if(!s||!u.length||busy)return;var p=u[curIdx()],b=p&&p.querySelector('[data-blk]');if(b)s.anchor={ui:b.getAttribute('data-ui'),bi:b.getAttribute('data-bi')};}
function showBook(i,anim){var u=pagesEl(),s=S(),rtl=s&&s.rdir==='rtl';bp=i;
 u.forEach(function(w,j){var turned=j<i;w.style.transition=anim?'transform .65s cubic-bezier(.45,.05,.25,1),box-shadow .65s':'none';w.style.zIndex=turned?1000+j:u.length-j;w.style.transform=turned?'rotateY('+(rtl?180:-180)+'deg)':'none';w.style.pointerEvents=turned?'none':'auto';w.style.boxShadow=(anim&&(j===i-1||j===i))?'0 6px 24px rgba(0,0,0,0.22)':'none';});
 if(anim)setTimeout(function(){u.forEach(function(w){w.style.boxShadow='none';});},700);}
function goTo(i){var u=pagesEl();if(!u.length)return;i=Math.max(0,Math.min(u.length-1,i));if(dirOf()==='b'){showBook(i,false);return;}var br=bodyEl.getBoundingClientRect(),r=u[i].getBoundingClientRect();bodyEl.scrollTop+=r.top-br.top-12;}
function turn(n){var u=pagesEl(),t=Math.max(0,Math.min(u.length-1,bp+n));if(t!==bp){showBook(t,true);save();}}
function build(force){
 var fl=bodyEl.querySelector('[data-flow]');if(!fl||busy)return;
 var wr=fl.parentElement,cs=getComputedStyle(wr),W=Math.floor(wr.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight));if(W<50)return;
 var s=S(),dir=dirOf(),rtl=!!(s&&s.rdir==='rtl'&&dir==='b'),bh=bodyEl.clientHeight,portraitPhone=bodyEl.clientWidth<=bh,orient=(s&&s.orient)||'auto',
 land=dir==='h'||(dir==='b'&&(orient==='landscape'||(orient==='auto'&&!portraitPhone))),rot=land&&portraitPhone,
 key=[dir,rtl,orient,W,bh,portraitPhone].join('|');
 if(fl.getAttribute('data-done')===key&&!force)return;
 busy=true;
 var avail=Math.max(240,bh-24),keep=s&&s.anchor,st=bodyEl.scrollTop,blks=[].slice.call(fl.querySelectorAll('[data-blk]')),ps=decodeURIComponent(fl.getAttribute('data-pstyle')||''),Wr,H0,f=1,pages=[],inner=null,page=null,firstBuild=!fl.getAttribute('data-done');
 if(dir==='v'){Wr=W;H0=Math.round(W*1.414);}
 else if(land&&rot){Wr=Math.round(W*1.414);H0=W;if(dir==='b')f=Math.max(0.7,Math.min(1,avail/Wr));}
 else if(land){Wr=dir==='h'?Math.min(W,760):Math.min(W,Math.floor(avail*1.414));H0=Math.round(Wr/1.414);}
 else{Wr=Math.min(W,560);H0=Math.round(Wr*1.414);f=Math.max(0.7,Math.min(1,avail/H0));}
 fl.innerHTML='';fl.removeAttribute('data-rot');fl.style.cssText='width:'+Wr+'px;';wr.style.display='';wr.style.alignItems='';wr.style.justifyContent='';resetBody();
 function np(){page=document.createElement('div');page.style.cssText=ps+';height:'+H0+'px;box-sizing:border-box;position:relative;display:flex;flex-direction:column;overflow:hidden;margin:0;';inner=document.createElement('div');inner.style.cssText='flex:1 1 auto;min-height:0;overflow:hidden;';var lab=document.createElement('div');lab.className='pglab';lab.style.cssText='flex:none;text-align:center;font-family:Roboto,sans-serif;font-size:11px;opacity:.5;padding:8px 0 10px;';page.appendChild(inner);page.appendChild(lab);fl.appendChild(page);pages.push(page);}
 np();
 blks.forEach(function(b){inner.appendChild(b);if(inner.scrollHeight>inner.clientHeight+1&&inner.children.length>1){inner.removeChild(b);np();inner.appendChild(b);}});
 pages.forEach(function(p,i){p.querySelector('.pglab').textContent='Page '+(i+1)+' of '+pages.length;});
 pages.forEach(function(p){var ib=p.querySelector('[data-imgbox]');if(ib)ib.style.height=Math.max(60,p.firstChild.clientHeight-4)+'px';});
 if(dir==='v'){fl.style.width='';pages.forEach(function(p,i){p.setAttribute('data-unit',i);p.style.marginBottom='12px';});}
 else{
  var lw=Math.round(Wr*f),lh=Math.round(H0*f),sw=rot?lh:lw,sh=rot?lw:lh,
  wraps=pages.map(function(p,i){var w=document.createElement('div');w.setAttribute('data-unit',i);
   if(dir==='h'&&rot){w.style.cssText='position:relative;flex:none;width:'+H0+'px;height:'+Wr+'px;';p.style.cssText+=';position:absolute;left:'+H0+'px;top:0;width:'+Wr+'px;height:'+H0+'px;transform-origin:0 0;transform:rotate(90deg);';}
   else if(dir==='h'){w.style.cssText='position:relative;flex:none;width:'+Wr+'px;height:'+H0+'px;';p.style.cssText+=';position:absolute;left:0;top:0;width:'+Wr+'px;height:'+H0+'px;';}
   else{w.style.cssText='position:absolute;left:0;top:0;width:'+lw+'px;height:'+lh+'px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-origin:'+(rtl?'right center':'left center')+';';p.style.cssText+=';position:absolute;left:0;top:0;width:'+Wr+'px;height:'+H0+'px;transform-origin:0 0;transform:scale('+f+');';}
   w.appendChild(p);return w;});
  fl.innerHTML='';
  if(dir==='h'){fl.style.cssText='width:'+(rot?H0:Wr)+'px;margin:0 auto;display:flex;flex-direction:column;gap:12px;';if(rot)fl.setAttribute('data-rot','1');wraps.forEach(function(w){fl.appendChild(w);});}
  else{var stage=document.createElement('div');fl.style.cssText='position:relative;width:'+sw+'px;height:'+sh+'px;margin:0 auto;';stage.style.cssText=rot?'position:absolute;left:'+sw+'px;top:0;width:'+lw+'px;height:'+lh+'px;transform-origin:0 0;transform:rotate(90deg);perspective:1800px;':'position:absolute;left:0;top:0;width:'+lw+'px;height:'+lh+'px;perspective:1800px;';wraps.forEach(function(w){stage.appendChild(w);});fl.appendChild(stage);if(rot)fl.setAttribute('data-rot','1');
   wr.style.display='flex';wr.style.alignItems='center';wr.style.justifyContent='center';var fits=sh<=avail;bodyEl.style.overflowX='hidden';bodyEl.style.overflowY=fits?'hidden':'auto';bodyEl.style.touchAction=fits?'none':'pan-y';}
 }
 fl.setAttribute('data-done',key);
 if(!firstBuild)fl.style.animation='fwdfade .35s ease';
 var idx=-1;if(keep){var b=fl.querySelector('[data-blk][data-ui="'+keep.ui+'"][data-bi="'+keep.bi+'"]'),w=b&&b.closest('[data-unit]');if(w)idx=+w.getAttribute('data-unit');}
 if(dir==='b')showBook(Math.max(0,idx),false);
 else if(idx>=0)goTo(idx);
 else bodyEl.scrollTop=dir==='h'?0:st;
 busy=false;
}
/* swipe left to right to turn pages in Book mode (along the page's own left-right axis) */
bodyEl.addEventListener('pointerdown',function(e){if(dirOf()!=='b'||(e.target.closest&&e.target.closest('input,textarea,button')))return;drag={x:e.clientX,y:e.clientY};});
bodyEl.addEventListener('pointerup',function(e){if(!drag||dirOf()!=='b'){drag=null;return;}var dx=e.clientX-drag.x,dy=e.clientY-drag.y,s=S(),rtl=s&&s.rdir==='rtl',r=isRot(),a=r?dy:dx,o=r?dx:dy;drag=null;if(Math.abs(a)>45&&Math.abs(a)>Math.abs(o)){var next=a<0;if(rtl)next=!next;turn(next?1:-1);}});
bodyEl.addEventListener('pointercancel',function(){drag=null;});
document.addEventListener('keydown',function(e){if(dirOf()!=='b'||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;var s=S(),rtl=!!(s&&s.rdir==='rtl'),k=e.key;if(isRot()){if(k==='ArrowDown'||k==='ArrowUp')turn(k==='ArrowDown'?1:-1);}else if(k==='ArrowRight'||k==='ArrowLeft'){turn((k==='ArrowRight')!==rtl?1:-1);}});
/* previous / next buttons for Book mode */
var AR={l:'<polyline points="14,6 8,12 14,18"/>',r:'<polyline points="10,6 16,12 10,18"/>',u:'<polyline points="6,14 12,8 18,14"/>',d:'<polyline points="6,10 12,16 18,10"/>'};
function btn(dir){var b=document.createElement('div');b.setAttribute('role','button');b.style.cssText='position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(32,34,48,.6);color:#fff;display:none;align-items:center;justify-content:center;z-index:5;cursor:pointer;';b.addEventListener('click',function(e){e.stopPropagation();turn(dir);});phone.appendChild(b);return b;}
var bPrev=btn(-1),bNext=btn(1);
function placeBtns(){var on=scr==='viewer'&&!sheet&&dirOf()==='b'&&pagesEl().length>0;if(!on){bPrev.style.display=bNext.style.display='none';return;}var s=S(),rtl=s&&s.rdir==='rtl',r=isRot(),br=bodyEl.getBoundingClientRect(),pr=phone.getBoundingClientRect(),n=pagesEl().length,t=function(sh){return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+AR[sh]+'</svg>';};
 bPrev.style.display=bNext.style.display='flex';bPrev.style.opacity=bp<=0?.3:1;bNext.style.opacity=bp>=n-1?.3:1;
 if(!r){var my=br.top-pr.top+bodyEl.clientHeight/2-20;bPrev.style.top=bNext.style.top=my+'px';bPrev.style.bottom=bNext.style.bottom='auto';var L=br.left-pr.left+6,R=pr.right-br.right+6;
  bPrev.style.left=(rtl?'auto':L+'px');bPrev.style.right=(rtl?R+'px':'auto');bNext.style.left=(rtl?L+'px':'auto');bNext.style.right=(rtl?'auto':R+'px');
  bPrev.innerHTML=t(rtl?'r':'l');bNext.innerHTML=t(rtl?'l':'r');}
 else{var cx=br.left-pr.left+bodyEl.clientWidth/2-20;bPrev.style.left=bNext.style.left=cx+'px';bPrev.style.right=bNext.style.right='auto';bPrev.style.top=(br.top-pr.top+6)+'px';bPrev.style.bottom='auto';bNext.style.top='auto';bNext.style.bottom=(pr.bottom-br.bottom+6)+'px';bPrev.innerHTML=t(rtl?'d':'u');bNext.innerHTML=t(rtl?'u':'d');}}
new MutationObserver(function(){if(!bodyEl.querySelector('[data-flow]'))resetBody();build(false);}).observe(bodyEl,{childList:true});
window.addEventListener('resize',function(){build(true);});
if(document.fonts){document.fonts.ready.then(function(){build(true);});document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',function(){build(true);});}
setInterval(function(){build(false);placeBtns();},400);
window.__pgCur=curIdx;window.__pgSave=save;window.__pgGo=goTo;window.__pgTurn=turn;
})();
