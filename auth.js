/* ═══════════════════════════════════════════════════════
   Fantasy Calendar Builder — auth.js
   Self-contained auth module: modal + Supabase Auth
   Supports: Email, Google, Facebook, X (Twitter), Reddit
   ═══════════════════════════════════════════════════════ */
(function(){
'use strict';

const SUPA_URL='https://rqrqxrngqtaywmhkdoal.supabase.co';
const SUPA_KEY='sb_publishable_Hvg22Fb6JhnA81umnhoSYw_uIitY5E7';
const SITE_URL='https://fantasy-calendar-builder.vercel.app';
const SDK_URL='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

/* ── Public API ── */
window.FCB_AUTH={
  user:null, profile:null, db:null,
  openModal:function(){ authShowModal(); },
  isSignedIn:function(){ return !!window.FCB_AUTH.user; }
};

/* ─────────────────────────────────────────
   1. INJECT CSS
───────────────────────────────────────── */
function injectCSS(){
  const s=document.createElement('style');
  s.textContent=`
  /* ── Auth modal overlay ── */
  #fcb-auth-overlay{
    display:none;position:fixed;inset:0;z-index:99999;
    background:rgba(0,0,0,0.78);backdrop-filter:blur(4px);
    align-items:center;justify-content:center;padding:1rem;
  }
  #fcb-auth-overlay.open{display:flex}

  /* ── Modal box ── */
  #fcb-auth-box{
    background:#1a1205;border:1px solid #c8a04a;border-radius:12px;
    padding:2.2rem 2.2rem 1.8rem;width:100%;max-width:400px;
    position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.8);
    color:#e8d8a8;font-family:Georgia,'Times New Roman',serif;
    animation:fcbModalIn .2s ease-out;
  }
  @keyframes fcbModalIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}

  #fcb-auth-close{
    position:absolute;top:.9rem;right:1rem;background:transparent;
    border:none;color:#c8a04a;font-size:1.3rem;cursor:pointer;
    line-height:1;padding:.25rem .4rem;border-radius:4px;
  }
  #fcb-auth-close:hover{background:rgba(200,160,74,.15)}

  .fcb-auth-logo{
    font-family:'Cinzel',Georgia,serif;font-size:1.15rem;
    color:#c8a04a;margin-bottom:.25rem;letter-spacing:.03em;
  }
  .fcb-auth-sub{
    font-size:.78rem;color:#8a7040;margin-bottom:1.5rem;line-height:1.5;
  }

  /* OAuth buttons */
  .fcb-oauth-btn{
    display:flex;align-items:center;gap:.9rem;width:100%;
    background:#241808;border:1px solid #4a3418;color:#e8d8a8;
    padding:.62rem 1rem;margin-bottom:.55rem;border-radius:6px;
    font-size:.84rem;cursor:pointer;font-family:Georgia,serif;
    transition:border-color .15s,background .15s;text-align:left;
  }
  .fcb-oauth-btn:hover{border-color:#c8a04a;background:#2e1e08}
  .fcb-oauth-icon{font-size:1.05rem;width:22px;text-align:center;flex-shrink:0}

  /* Divider */
  .fcb-divider{
    display:flex;align-items:center;gap:.8rem;
    margin:.9rem 0;color:#6a5030;font-size:.73rem;
  }
  .fcb-divider::before,.fcb-divider::after{
    content:'';flex:1;height:1px;background:#3a2c10;
  }

  /* Inputs */
  .fcb-input{
    width:100%;background:#0e0b04;border:1px solid #4a3818;
    color:#e8d8a8;padding:.6rem .85rem;border-radius:5px;
    font-size:.87rem;font-family:Georgia,serif;outline:none;
    box-sizing:border-box;margin-bottom:.65rem;
  }
  .fcb-input:focus{border-color:#c8a04a}
  .fcb-input::placeholder{color:#5a4828}

  /* Buttons */
  .fcb-btn-primary{
    width:100%;background:#c8a04a;color:#1a1005;border:none;
    padding:.65rem;border-radius:5px;font-size:.9rem;font-weight:700;
    font-family:'Cinzel',Georgia,serif;cursor:pointer;
    letter-spacing:.04em;transition:background .15s;
  }
  .fcb-btn-primary:hover{background:#e0b860}
  .fcb-btn-secondary{
    width:100%;background:transparent;border:1px solid #c8a04a;
    color:#c8a04a;padding:.58rem;border-radius:5px;font-size:.85rem;
    font-family:Georgia,serif;cursor:pointer;margin-top:.5rem;
    transition:background .15s;
  }
  .fcb-btn-secondary:hover{background:rgba(200,160,74,.1)}

  /* Messages */
  .fcb-msg{
    font-size:.77rem;padding:.5rem .7rem;border-radius:4px;
    margin-bottom:.6rem;display:none;line-height:1.4;
  }
  .fcb-msg.show{display:block}
  .fcb-msg.error{background:#2a0808;color:#ff9090;border:1px solid #6a1818}
  .fcb-msg.info{background:#08101a;color:#90bbdd;border:1px solid #1a3a5a}
  .fcb-msg.success{background:#081808;color:#90cc90;border:1px solid #1a4a1a}

  /* Switch link */
  .fcb-switch{
    text-align:center;margin-top:1rem;font-size:.77rem;color:#8a7040;
  }
  .fcb-switch a{color:#c8a04a;cursor:pointer;text-decoration:underline}

  /* Nav sign-in link styling */
  #fcb-nav-auth{
    color:var(--text-muted,#9a8068);text-decoration:none;
    font-size:.9rem;cursor:pointer;font-family:var(--font-body,Georgia,serif);
    transition:color .15s;
  }
  #fcb-nav-auth:hover{color:var(--accent,#c8a04a)}
  #fcb-nav-auth.signed-in{color:var(--accent,#c8a04a);font-weight:600}

  /* Username hint */
  .fcb-uname-rules{
    font-size:.72rem;color:#6a5028;margin-bottom:1rem;line-height:1.5;
  }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────
   2. INJECT MODAL HTML
───────────────────────────────────────── */
function injectHTML(){
  const wrap=document.createElement('div');
  wrap.innerHTML=`
  <div id="fcb-auth-overlay">
    <div id="fcb-auth-box">
      <button id="fcb-auth-close" onclick="authCloseModal()" aria-label="Close">✕</button>

      <!-- ── View: sign in / sign up ── -->
      <div id="fcb-view-main">
        <div class="fcb-auth-logo" id="fcb-main-title">🌙 Sign In</div>
        <div class="fcb-auth-sub" id="fcb-main-sub">Sign in to save calendars, download images and unlock all themes.</div>

        <button class="fcb-oauth-btn" onclick="authOAuth('google')">
          <span class="fcb-oauth-icon">🔵</span>Continue with Google
        </button>

        <div class="fcb-divider">or continue with email</div>

        <div id="fcb-main-msg" class="fcb-msg"></div>
        <input class="fcb-input" id="fcb-email" type="email" placeholder="Email address" autocomplete="email"/>
        <input class="fcb-input" id="fcb-password" type="password" placeholder="Password (min 6 chars)" autocomplete="current-password"/>
        <button class="fcb-btn-primary" id="fcb-main-action-btn" onclick="authEmailAction()">Sign In</button>
        <div class="fcb-switch" id="fcb-switch-row">
          New here? <a onclick="authToggleMode()">Create an account</a>
        </div>
      </div>

      <!-- ── View: username setup (new users) ── -->
      <div id="fcb-view-username" style="display:none">
        <div class="fcb-auth-logo">🌙 One last step!</div>
        <div class="fcb-auth-sub">Choose a username for your account.</div>
        <div class="fcb-uname-rules">Letters, numbers and underscores only · 3–20 characters</div>
        <div id="fcb-uname-msg" class="fcb-msg"></div>
        <input class="fcb-input" id="fcb-username" type="text" placeholder="your_username" maxlength="20" autocomplete="off" autocorrect="off" spellcheck="false"/>
        <button class="fcb-btn-primary" onclick="authSaveUsername()">Continue →</button>
      </div>

      <!-- ── View: signed in ── -->
      <div id="fcb-view-signedin" style="display:none">
        <div class="fcb-auth-logo">🌙 Fantasy Calendar Builder</div>
        <div class="fcb-auth-sub" id="fcb-signedin-label">Signed in</div>
        <button class="fcb-btn-secondary" style="margin-top:1.2rem" onclick="authSignOut()">Sign Out</button>
      </div>
    </div>
  </div>
  `;
  document.body.appendChild(wrap);

  /* close on backdrop click */
  document.getElementById('fcb-auth-overlay').addEventListener('click',function(e){
    if(e.target.id==='fcb-auth-overlay') authCloseModal();
  });
  /* Enter key on password */
  document.getElementById('fcb-password').addEventListener('keydown',function(e){
    if(e.key==='Enter') authEmailAction();
  });
  /* Enter key on username */
  document.getElementById('fcb-username').addEventListener('keydown',function(e){
    if(e.key==='Enter') authSaveUsername();
  });
}

/* ─────────────────────────────────────────
   3. MODAL CONTROLS
───────────────────────────────────────── */
function openOverlay(){
  var overlay=document.getElementById('fcb-auth-overlay');
  if(overlay) overlay.classList.add('open');
}
function authShowModal(){
  if(window.FCB_AUTH.profile) showView('signedin');
  else showView('main');
  openOverlay();
}
window.authCloseModal=function(){
  var overlay=document.getElementById('fcb-auth-overlay');
  if(overlay) overlay.classList.remove('open');
};
function showView(v){
  ['main','username','signedin'].forEach(function(n){
    var el=document.getElementById('fcb-view-'+n);
    if(el) el.style.display=(n===v)?'':'none';
  });
}
function setMsg(elId, txt, type){
  var el=document.getElementById(elId);
  if(!el) return;
  el.textContent=txt;
  el.className='fcb-msg'+(txt?' show':'')+' '+(type||'');
}

/* ─────────────────────────────────────────
   4. NAV BUTTON UPDATE
───────────────────────────────────────── */
function updateNav(){
  var btn=document.getElementById('fcb-nav-auth');
  if(!btn) return;
  var p=window.FCB_AUTH.profile;
  if(p){
    localStorage.setItem('fcb-username',p.username);
    btn.textContent='👤 '+p.username;
    btn.classList.add('signed-in');
    btn.onclick=function(e){ e.preventDefault(); authShowModal(); };
    var lbl=document.getElementById('fcb-signedin-label');
    if(lbl) lbl.textContent='Signed in as '+p.username;
  } else {
    localStorage.removeItem('fcb-username');
    btn.textContent='Sign In';
    btn.classList.remove('signed-in');
    btn.onclick=function(e){ e.preventDefault(); authShowModal(); };
  }
}

/* ─────────────────────────────────────────
   5. OAUTH
───────────────────────────────────────── */
window.authOAuth=async function(provider){
  setMsg('fcb-main-msg','Redirecting to '+provider+'…','info');
  var result=await window.FCB_AUTH.db.auth.signInWithOAuth({
    provider:provider,
    options:{ redirectTo: SITE_URL }
  });
  if(result.error) setMsg('fcb-main-msg',result.error.message,'error');
};

/* ─────────────────────────────────────────
   6. EMAIL AUTH
───────────────────────────────────────── */
var _authMode='signin';
window.authToggleMode=function(){
  _authMode=(_authMode==='signin')?'signup':'signin';
  var btn=document.getElementById('fcb-main-action-btn');
  var row=document.getElementById('fcb-switch-row');
  var title=document.getElementById('fcb-main-title');
  var sub=document.getElementById('fcb-main-sub');
  if(_authMode==='signup'){
    if(btn) btn.textContent='Create Account';
    if(row) row.innerHTML='Already have an account? <a onclick="authToggleMode()">Sign in</a>';
    if(title) title.textContent='🌙 Create Account';
    if(sub) sub.textContent='Join free to save calendars, download images and unlock all themes.';
  } else {
    if(btn) btn.textContent='Sign In';
    if(row) row.innerHTML='New here? <a onclick="authToggleMode()">Create an account</a>';
    if(title) title.textContent='🌙 Sign In';
    if(sub) sub.textContent='Sign in to save calendars, download images and unlock all themes.';
  }
  setMsg('fcb-main-msg','','');
};

window.authEmailAction=async function(){
  var email=document.getElementById('fcb-email').value.trim();
  var pass=document.getElementById('fcb-password').value;
  if(!email||!pass){ setMsg('fcb-main-msg','Please enter your email and password.','error'); return; }
  try{
    if(_authMode==='signup'){
      if(pass.length<6){ setMsg('fcb-main-msg','Password must be at least 6 characters.','error'); return; }
      setMsg('fcb-main-msg','Creating account…','info');
      var sr=await window.FCB_AUTH.db.auth.signUp({email:email,password:pass});
      if(sr.error){ setMsg('fcb-main-msg',sr.error.message,'error'); return; }
      setMsg('fcb-main-msg','✓ Account created! You can now sign in.','success');
    } else {
      setMsg('fcb-main-msg','Signing in…','info');
      var sr=await window.FCB_AUTH.db.auth.signInWithPassword({email:email,password:pass});
      if(sr.error){
        var msg=sr.error.message;
        if(msg.indexOf('Invalid')>-1) msg='Wrong email or password — please try again.';
        if(msg.indexOf('confirmed')>-1) msg='Please confirm your email first, or contact support.';
        setMsg('fcb-main-msg',msg,'error');
        return;
      }
    }
  } catch(e){
    setMsg('fcb-main-msg','Something went wrong — please try again.','error');
  }
};

/* ─────────────────────────────────────────
   7. USERNAME SETUP
───────────────────────────────────────── */
window.authSaveUsername=async function(){
  var raw=document.getElementById('fcb-username').value.trim();
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(raw)){
    setMsg('fcb-uname-msg','3–20 characters, letters/numbers/underscores only.','error');
    return;
  }
  setMsg('fcb-uname-msg','Saving…','info');
  var id=window.FCB_AUTH.user.id;
  var ins=await window.FCB_AUTH.db.from('profiles').insert({id:id,username:raw});
  if(ins.error){
    var msg=ins.error.code==='23505'?'That username is taken — try another.':ins.error.message;
    setMsg('fcb-uname-msg',msg,'error');
    return;
  }
  window.FCB_AUTH.profile={id:id,username:raw};
  updateNav();
  authCloseModal();
};

/* ─────────────────────────────────────────
   8. SIGN OUT
───────────────────────────────────────── */
window.authSignOut=async function(){
  await window.FCB_AUTH.db.auth.signOut();
  window.FCB_AUTH.user=null;
  window.FCB_AUTH.profile=null;
  localStorage.removeItem('fcb-username');
  updateNav();
  authCloseModal();
};

/* ─────────────────────────────────────────
   9. SESSION HANDLER
───────────────────────────────────────── */
async function handleSession(session){
  window.FCB_AUTH.user=session.user;
  var result=await window.FCB_AUTH.db
    .from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  if(!result.data){
    showView('username');
    openOverlay();
  } else {
    window.FCB_AUTH.profile=result.data;
    updateNav();
    var overlay=document.getElementById('fcb-auth-overlay');
    if(overlay&&overlay.classList.contains('open')) authCloseModal();
  }
}

/* ─────────────────────────────────────────
   10. LOAD SUPABASE SDK + INIT
───────────────────────────────────────── */
function loadSDK(){
  return new Promise(function(res,rej){
    if(window.supabase){res();return;}
    var s=document.createElement('script');
    s.src=SDK_URL; s.onload=res; s.onerror=rej;
    document.head.appendChild(s);
  });
}

async function authInit(){
  injectCSS();
  injectHTML();
  try{
    await loadSDK();
  } catch(e){
    console.warn('FCB Auth: could not load Supabase SDK',e);
    return;
  }
  window.FCB_AUTH.db=window.supabase.createClient(SUPA_URL,SUPA_KEY);

  /* onAuthStateChange with INITIAL_SESSION handles everything on load */
  window.FCB_AUTH.db.auth.onAuthStateChange(async function(event,session){
    if(event==='INITIAL_SESSION'){
      /* Page load with existing session — restore quietly, no popup */
      if(session){
        window.FCB_AUTH.user=session.user;
        var r1=await window.FCB_AUTH.db
          .from('profiles').select('*').eq('id',session.user.id).maybeSingle();
        if(r1.data){
          window.FCB_AUTH.profile=r1.data;
          updateNav();
        } else {
          updateNav();
          showView('username');
          openOverlay();
        }
      } else {
        /* Signed out — clear any stale cached username */
        localStorage.removeItem('fcb-username');
        updateNav();
      }
    }
    if(event==='SIGNED_IN'){
      if(session) await handleSession(session);
    }
    if(event==='SIGNED_OUT'){
      window.FCB_AUTH.user=null;
      window.FCB_AUTH.profile=null;
      updateNav();
    }
  });

  /* Nav will be updated by INITIAL_SESSION event above */
}

/* Wait for DOM ready */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',authInit);
} else {
  authInit();
}

})();
