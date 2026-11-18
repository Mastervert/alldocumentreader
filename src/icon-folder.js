/* Icon Folder, framework-free. A folder with icons fanned out of it.
   IconFolder.html({title, meta, icons:[{html,label}], theme, attrs, badge, style, toggle}) -> HTML string
   IconFolder.observe(rootEl)  -> lays out every .ifold now and whenever the DOM under rootEl changes
   Behaviour: pops in when visible; mouse hover or touch-press spreads the icons; hovering an icon lifts it and shows its label;
   data-toggle="1" makes click/Enter toggle the spread (standalone use). Respects prefers-reduced-motion. */
(function(w){
var EASE='cubic-bezier(.2,.8,.2,1)',uid=0,RM=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
/* outlines: front pocket has its tab on the left, back plate has it on the right */
function pL(w,h,r,d,tw,s){return 'M0 '+r+'A'+r+' '+r+' 0 0 1 '+r+' 0L'+tw+' 0C'+(tw+s*.55)+' 0 '+(tw+s*.45)+' '+d+' '+(tw+s)+' '+d+'L'+(w-r)+' '+d+'A'+r+' '+r+' 0 0 1 '+w+' '+(d+r)+'L'+w+' '+(h-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+'L'+r+' '+h+'A'+r+' '+r+' 0 0 1 0 '+(h-r)+'Z';}
function pR(w,h,r,d,tw,s){var x=w-tw;return 'M0 '+(d+r)+'A'+r+' '+r+' 0 0 1 '+r+' '+d+'L'+(x-s)+' '+d+'C'+(x-s*.45)+' '+d+' '+(x-s*.55)+' 0 '+x+' 0L'+(w-r)+' 0A'+r+' '+r+' 0 0 1 '+w+' '+r+'L'+w+' '+(h-r)+'A'+r+' '+r+' 0 0 1 '+(w-r)+' '+h+'L'+r+' '+h+'A'+r+' '+r+' 0 0 1 0 '+(h-r)+'Z';}
function html(o){var n=o.icons.length,id='ifg'+(++uid),th=o.theme||'paper';
 var tiles=o.icons.map(function(ic,i){return '<div class="ifold-tile" data-i="'+i+'"><div class="ifold-tilein">'+ic.html+'</div>'+(ic.label?'<span class="ifold-lab">'+esc(ic.label)+'</span>':'')+'</div>';}).join('');
 return '<div class="ifold" data-theme="'+th+'" data-n="'+n+'" role="button" tabindex="0" aria-label="'+esc(o.title)+'"'+(o.toggle?' data-toggle="1"':'')+' '+(o.attrs||'')+' style="'+(o.style||'')+'">'
 +'<div class="ifold-glow"></div><div class="ifold-back"><svg class="ifold-edge" aria-hidden="true"><path/></svg></div><div class="ifold-fan" aria-hidden="true">'+tiles+'</div>'
 +'<div class="ifold-front">'+(o.blurImg?'<div class="ifold-blur" style="background-image:url('+o.blurImg+')"></div><div class="ifold-tint"></div>':'')+'<svg class="ifold-edge" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--if-edge-0)"/><stop offset=".35" style="stop-color:var(--if-edge-1)"/><stop offset="1" style="stop-color:var(--if-edge-2)"/></linearGradient></defs><path stroke="url(#'+id+')"/></svg>'
 +'<h3 class="ifold-title">'+esc(o.title)+'</h3>'+(o.meta?'<p class="ifold-meta">'+esc(o.meta).replace(/\n/g,'<br>')+'</p>':'')+(o.badge||'')+'</div></div>';}
function fan(el,wide,hi){var g=el._g;if(!g)return;var tiles=el.querySelectorAll('.ifold-tile'),n=tiles.length,rs=n>1?25/(n-1):0;
 [].forEach.call(tiles,function(t,i){var k=i-(n-1)/2,gap=g.spread*(wide?1.15:1),y=k*k*g.H*.035-(wide?4:0),rot=k*rs*(wide?1.2:1),inn=t.firstChild;
  t.style.opacity=el.hasAttribute('data-shown')||RM?1:0;
  t.style.transform=el.hasAttribute('data-shown')||RM?'translate3d('+(k*gap)+'px,'+y+'px,0) rotate('+rot+'deg)':'translate3d('+(k*g.spread*.6)+'px,'+(g.H*.3)+'px,0)';
  t.style.transitionDelay=RM?'0s':(wide?(i*.04)+'s':(el._first?(.3+i*.08)+'s':'0s'));
  t.style.zIndex=hi===i?5:'';
  inn.style.transform=hi===i?'translateY('+(-g.T*.26)+'px) rotate('+(-rot)+'deg) scale(1.1)':(hi!=null&&hi>=0?'scale(.96)':'none');
  inn.style.filter=hi!=null&&hi>=0&&hi!==i?'saturate(.75) brightness(.9)':'none';
  if(hi===i)t.setAttribute('data-hi','1');else t.removeAttribute('data-hi');});}
function layout(el){var W=el.offsetWidth,H=el.offsetHeight;if(!W||!H)return;
 var dr=+el.getAttribute('data-r')||0,r=dr||Math.max(10,Math.round(W*.06)),d=dr?Math.min(r,14):r,s=Math.round(W*.11),T=Math.round(W*.3),front=el.querySelector('.ifold-front'),back=el.querySelector('.ifold-back'),fh=front.offsetHeight,bh=back.offsetHeight,
 fd=pL(W,fh,r,d,Math.round(W*.42),s),bd=pR(W,bh,r,d,Math.round(W*.4),s);
 front.style.clipPath="path('"+fd+"')";back.style.clipPath="path('"+bd+"')";front.querySelector('path').setAttribute('d',fd);back.querySelector('path').setAttribute('d',bd);
 el.style.setProperty('--if-tile',T+'px');el._g={W:W,H:H,T:T,spread:W*.2};fan(el,el._wide,el._hi);}
function init(el){if(el.hasAttribute('data-ready'))return;el.setAttribute('data-ready','1');el._first=true;if(RM)el.classList.add('ifold-rm');
 function set(wide){el._wide=wide;if(wide)el.setAttribute('data-lift','1');else el.removeAttribute('data-lift');fan(el,wide,el._hi);}
 el.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')set(true);});
 el.addEventListener('pointerleave',function(e){el._hi=null;set(!!el._open);});
 el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')set(true);});
 el.addEventListener('pointerup',function(e){if(e.pointerType!=='mouse')setTimeout(function(){set(!!el._open);},380);});
 el.addEventListener('pointercancel',function(){set(!!el._open);});
 [].forEach.call(el.querySelectorAll('.ifold-tile'),function(t,i){t.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){el._hi=i;fan(el,el._wide,i);}});t.addEventListener('pointerleave',function(){if(el._hi===i){el._hi=null;fan(el,el._wide,null);}});});
 if(el.hasAttribute('data-toggle')){var tg=function(){el._open=!el._open;set(el._open);};el.addEventListener('click',tg);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg();}});}
 if(w.ResizeObserver)new ResizeObserver(function(){layout(el);}).observe(el);
 layout(el);
 var show=function(){var idx=[].indexOf.call(el.parentNode?el.parentNode.children:[],el);el.style.transitionDelay=RM?'0s':Math.min(idx,8)*60+'ms';el.setAttribute('data-shown','1');fan(el,el._wide,el._hi);setTimeout(function(){el.style.transitionDelay='';el._first=false;},1400);};
 if(RM||!w.IntersectionObserver)show();else{var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();show();}},{threshold:.2});io.observe(el);}}
function mount(scope){[].forEach.call((scope||document).querySelectorAll('.ifold:not([data-ready])'),init);}
function observe(root){mount(root);var q=0;new MutationObserver(function(){if(q)return;q=requestAnimationFrame(function(){q=0;mount(root);});}).observe(root,{childList:true,subtree:true});}
w.IconFolder={html:html,mount:mount,observe:observe,layout:layout,paths:{front:pL,back:pR}};
})(window);
