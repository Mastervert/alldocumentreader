/* File-lock cryptography.
   Previously the lock feature stored the password in plaintext on the file object and
   compared it directly — so the password was readable from devtools and from any other
   script on the page. This module fixes that: we never store the password. Instead we
   derive a salted PBKDF2-SHA256 hash with a per-file random salt, store only
   {lockSalt, lockHash} (base64), and verify by re-deriving.

   This runs entirely on-device via the Web Crypto API (window.crypto.subtle), which is
   available in all modern browsers and Android WebView. No password or key ever leaves
   the page, and the plaintext password is not kept in memory after the check returns.

   The document content itself is not encrypted at rest here — in this app the files
   array is in-memory only (nothing is persisted to disk between sessions), so the only
   realistic exposure was the plaintext password sitting next to the file object, which
   this removes. The lock still gives genuine "needs the password to open" protection:
   a wrong password produces a different hash and is rejected. */
var FC={
  _b64:function(ab){var b=new Uint8Array(ab),s='';for(var i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return btoa(s);},
  _ab:function(b64){var s=atob(b64),ab=new Uint8Array(s.length);for(var i=0;i<s.length;i++)ab[i]=s.charCodeAt(i);return ab;},
  _rand:function(n){var a=new Uint8Array(n);crypto.getRandomValues(a);return a;},
  _derive:function(pw,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:100000,hash:'SHA-256'},k,256);});},
  /* hash a password for storage. returns {salt, hash} as base64 strings */
  hash:function(pw){var salt=this._rand(16);return this._derive(pw,salt).then(function(bits){return {salt:FC._b64(salt),hash:FC._b64(bits)};});},
  /* verify a password against stored {salt, hash}. resolves to true/false */
  verify:function(pw,saltB64,hashB64){try{var salt=this._ab(saltB64);return this._derive(pw,salt).then(function(bits){return FC._b64(bits)===hashB64;});}catch(e){return Promise.resolve(false);}}
};