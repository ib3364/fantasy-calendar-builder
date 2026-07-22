/* Fantasy Calendar Builder — auth.js (username-only, no email/OAuth) */
(function(){
'use strict';

window.FCB_AUTH={
  profile:null,
  isSignedIn:function(){ return !!localStorage.getItem('fcb-username'); },
  openModal:function(){ fcbShowModal(); },
  getUid:function(){
    var uid=localStorage.getItem('fcb-uid');
    if(!uid){ uid='u'+Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem('fcb-uid',uid); }
    return uid;
  }
};

var _name=localStorage.getItem('fcb-username');
if(_name) window.FCB_AUTH.profile={username:_name};

function injectCSS(){
  var s=document.createElement('style');
  s.textContent=`
  #fcb-auth-overlay{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:1rem}
  #fcb-auth-overlay.open{display:flex}
  #fcb-auth-box{background:#1a1205;border:1px solid #c8a04a;border-radius:12px;padding:2.2rem;width:100%;max-width:380px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.8);color:#e8d8a8;font-family:Georgia,serif;animation:fcbIn .2s ease-out}
  @keyframes fcbIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
  #fcb-auth-close{position:absolute;top:.9rem;right:1rem;background:transparent;border:none;color:#c8a04a;font-size:1.3rem;cursor:pointer;padding:.25rem .4rem;border-radius:4px}
  #fcb-auth-close:hover{background:rgba(200,160,74,.15)}
  .fcb-logo{font-family:'Cinzel',Georgia,serif;font-size:1.15rem;color:#c8a04a;margin-bottom:.3rem}
  .fcb-sub{font-size:.8rem;color:#8a7040;margin-bottom:1.2rem;line-height:1.5}
  .fcb-rules{font-size:.72rem;color:#6a5028;margin-bottom:.8rem;line-height:1.5}
  .fcb-input{width:100%;background:#0e0b04;border:1px solid #4a3818;color:#e8d8a8;padding:.6rem .85rem;border-radius:5px;font-size:.9rem;font-family:Georgia,serif;outline:none;box-sizing:border-box;margin-bottom:.65rem}
  .fcb-input:focus{border-color:#c8a04a}
  .fcb-input::placeholder{color:#5a4828}
  .fcb-msg{font-size:.77rem;padding:.5rem .7rem;border-radius:4px;margin-bottom:.6rem;display:none;line-height:1.4}
  .fcb-msg.show{display:block}
  .fcb-msg.error{background:#2a0808;color:#ff9090;border:1px solid #6a1818}
  .fcb-btn{width:100%;background:#c8a04a;color:#1a1005;border:none;padding:.65rem;border-radius:5px;font-size:.9rem;font-weight:700;font-family:'Cinzel',Georgia,serif;cursor:pointer;letter-spacing:.04em}
  .fcb-btn:hover{background:#e0b860}
  .fcb-btn-out{width:100%;background:transparent;border:1px solid #c8a04a;color:#c8a04a;padding:.58rem;border-radius:5px;font-size:.85rem;font-family:Georgia,serif;cursor:pointer;margin-top:.5rem}
  .fcb-btn-out:hover{background:rgba(200,160,74,.1)}
  #fcb-nav-auth{color:var(--text-muted,#9a8068);text-decoration:none;font-size:.9rem;cursor:pointer;font-family:var(--font-body,Georgia,serif)}
  #fcb-nav-auth:hover{color:var(--accent,#c8a04a)}
  #fcb-nav-auth.has-name{color:var(--accent,#c8a04a);font-weight:600}
  `;
  document.head.appendChild(s);
}

function injectHTML(){
  var d=document.createElement('div');
  d.innerHTML=`<div id="fcb-auth-overlay">
    <div id="fcb-auth-box">
      <button id="fcb-auth-close" onclick="fcbCloseModal()">✕</button>
      <div id="fcb-view-setup">
        <div class="fcb-logo">🌙 Choose a username</div>
        <div class="fcb-sub">Pick a name to save your calendars to My Creations. No email or password needed.</div>
        <div class="fcb-rules">3–20 characters · letters, numbers, underscores only</div>
        <div id="fcb-setup-msg" class="fcb-msg"></div>
        <input class="fcb-input" id="fcb-uname-input" type="text" placeholder="your_username" maxlength="20" autocomplete="off" spellcheck="false"/>
        <button class="fcb-btn" onclick="fcbSaveUsername()">Continue →</button>
      </div>
      <div id="fcb-view-in" style="display:none">
        <div class="fcb-logo">🌙 Fantasy Calendar Builder</div>
        <div class="fcb-sub" id="fcb-in-lbl">Signed in</div>
        <button class="fcb-btn-out" onclick="fcbSignOut()">Sign out / Change username</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(d);
  document.getElementById('fcb-auth-overlay').addEventListener('click',function(e){ if(e.target.id==='fcb-auth-overlay') fcbCloseModal(); });
  document.getElementById('fcb-uname-input').addEventListener('keydown',function(e){ if(e.key==='Enter') fcbSaveUsername(); });
}

function fcbShowModal(){
  var name=localStorage.getItem('fcb-username');
  document.getElementById('fcb-view-setup').style.display=name?'none':'';
  document.getElementById('fcb-view-in').style.display=name?'':'none';
  if(name){ var l=document.getElementById('fcb-in-lbl'); if(l) l.textContent='Signed in as '+name; }
  document.getElementById('fcb-auth-overlay').classList.add('open');
}
window.fcbCloseModal=function(){ document.getElementById('fcb-auth-overlay').classList.remove('open'); };

window.fcbSaveUsername=function(){
  var raw=(document.getElementById('fcb-uname-input').value||'').trim();
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(raw)){
    var m=document.getElementById('fcb-setup-msg');
    if(m){ m.textContent='3–20 characters, letters/numbers/underscores only.'; m.className='fcb-msg show error'; }
    return;
  }
  localStorage.setItem('fcb-username',raw);
  window.FCB_AUTH.getUid();
  window.FCB_AUTH.profile={username:raw};
  updateNav();
  fcbCloseModal();
  if(window.updateSaveUI) updateSaveUI();
  if(window.loadMyCreations) loadMyCreations();
};

window.fcbSignOut=function(){
  localStorage.removeItem('fcb-username');
  window.FCB_AUTH.profile=null;
  updateNav();
  fcbCloseModal();
  if(window.updateSaveUI) updateSaveUI();
  if(window.loadMyCreations) loadMyCreations();
};

function updateNav(){
  var btn=document.getElementById('fcb-nav-auth');
  var name=localStorage.getItem('fcb-username');
  var myTab=document.getElementById('tab-my');
  if(myTab) myTab.style.display=name?'':'none';
  if(!btn) return;
  if(name){ btn.textContent='👤 '+name; btn.classList.add('has-name'); }
  else { btn.textContent='Set username'; btn.classList.remove('has-name'); }
  btn.onclick=function(e){ e.preventDefault(); fcbShowModal(); };
}

function init(){
  injectCSS();
  injectHTML();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',updateNav);
  else updateNav();
}
init();
})();
