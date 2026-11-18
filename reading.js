/* Reading preferences: remembered per document (and as the default for new ones) */
var PK=['dir','rdir','orient','eye'];
function rdKey(id){return 'fwd.read.'+id;}
function rdLoad(k){try{var t=window.localStorage&&localStorage.getItem(k);return t?JSON.parse(t):null;}catch(e){return null;}}
function rdSave(id){var f=fileById(id),s=f&&V[f.t];if(!s||!('dir' in s))return;var o={};PK.forEach(function(k){o[k]=s[k];});try{if(window.localStorage){localStorage.setItem(rdKey(id),JSON.stringify(o));localStorage.setItem('fwd.read.last',JSON.stringify(o));}}catch(e){}}
var _openFile=openFile;
openFile=function(id){var f=fileById(id),s=f&&V[f.t];if(s&&('dir' in s)){var p=rdLoad(rdKey(id))||rdLoad('fwd.read.last')||{};s.dir=p.dir||'v';s.rdir=p.rdir||'ltr';s.orient=p.orient||'auto';s.eye=!!p.eye;s.anchor=null;}return _openFile(id);};
var _vAct=vAct;
vAct=function(n,d){if(n==='vsetv'&&d&&d.key==='dir'&&window.__pgSave)window.__pgSave();
 var r=_vAct(n,d);
 if(n==='vsetv'||n==='vtogv'){var k=scr==='viewer'?vk():null,s=k?V[k]:null;if(s&&('dir' in s)){
  if(n==='vtogv'&&d.key==='eye'&&s.eye&&s.night){s.night=false;render(true);}
  if(n==='vtogv'&&d.key==='night'&&s.night&&s.eye){s.eye=false;render(true);}
  if(PK.indexOf(d.key)>-1)rdSave(docId);}}
 return r;};
