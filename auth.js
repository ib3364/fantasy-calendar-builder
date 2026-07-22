/* Fantasy Calendar Builder — auth.js (username-only, no email/OAuth) */
(function(){
'use strict';

window.FCB_AUTH={
  profile:null,
  isSignedIn:function(){ return !!localStorage.getItem('fcb-username'); },
  openModal:function(){ fcbShowModal(); },
  getUid:function(){
    /* UID is always derived from username — same username = same UID = same calendars */
    var username=localStorage.getItem('fcb-username');
    if(!username) return null;
    return fcbUsernameToUid(username);
  }
};

/* Deterministic UUID from username — same input always gives same UUID */
function fcbUsernameToUid(str){
  str='fcb:'+str.toLowerCase(); /* namespace prefix */
  var h1=0xdeadbeef^str.length, h2=0x41c6ce57^str.length;
  for(var i=0;i<str.length;i++){
    var ch=str.charCodeAt(i);
    h1=Math.imul(h1^ch,2654435761);
    h2=Math.imul(h2^ch,1597334677);
  }
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  var a=(h1>>>0).toString(16).padStart(8,'0');
  var b=(h2>>>0).toString(16).padStart(8,'0');
  var c=Math.imul(h1,h2)>>>0;
  var d=(c^0xdeadbeef).toString(16).padStart(8,'0');
  var e=((h1+h2)>>>0).toString(16).padStart(8,'0');
  /* Format as valid UUID v4-like */
  return a+'-'+b.slice(0,4)+'-4'+b.slice(5,8)+'-a'+d.slice(1,4)+'-'+d.slice(4)+e.slice(0,8);
}

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
        <div style="background:rgba(200,160,74,.08);border:1px solid rgba(200,160,74,.3);border-radius:6px;padding:.7rem .9rem;margin-bottom:.9rem;font-size:.76rem;color:#c8a04a;line-height:1.6">
          ⚠️ <strong>Important:</strong> Your username IS your key — the same username always gives access to the same calendars on any device or browser. Keep it unique and memorable. If someone else uses the same username, they can see your calendars!
        </div>
        <div id="fcb-setup-msg" class="fcb-msg"></div>
        <input class="fcb-input" id="fcb-uname-input" type="text" placeholder="your_username" maxlength="20" autocomplete="off" spellcheck="false"/>
        <button class="fcb-btn" onclick="fcbSaveUsername()">I understand — Continue →</button>
      </div>
      <div id="fcb-view-in" style="display:none">
        <div class="fcb-logo">🌙 Fantasy Calendar Builder</div>
        <div class="fcb-sub" id="fcb-in-lbl">Signed in</div>
        <div style="background:rgba(200,160,74,.08);border:1px solid rgba(200,160,74,.2);border-radius:6px;padding:.6rem .8rem;margin-bottom:.9rem;font-size:.73rem;color:#8a7040;line-height:1.5">
          📌 Your username is your key to your calendars — use the same username on any device to access them. Keep it unique and don't share it.
        </div>
        <div style="display:flex;gap:.6rem;margin-bottom:.6rem">
          <button class="fcb-btn" onclick="fcbExportData()" style="flex:1;font-size:.82rem;padding:.5rem">📦 Export my data</button>
          <button class="fcb-btn" onclick="document.getElementById('fcb-import-input').click()" style="flex:1;font-size:.82rem;padding:.5rem;background:transparent;border:1px solid #c8a04a;color:#c8a04a">📂 Import data</button>
          <input type="file" id="fcb-import-input" accept=".json" style="display:none" onchange="fcbImportData(this)"/>
        </div>
        <div id="fcb-import-msg" style="font-size:.75rem;margin-bottom:.6rem;display:none;padding:.4rem .6rem;border-radius:4px"></div>
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

window.fcbSaveUsername=async function(){
  var raw=(document.getElementById('fcb-uname-input').value||'').trim();
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(raw)){
    var m=document.getElementById('fcb-setup-msg');
    if(m){ m.textContent='3–20 characters, letters/numbers/underscores only.'; m.className='fcb-msg show error'; }
    return;
  }
  localStorage.setItem('fcb-username',raw);
  window.FCB_AUTH.profile={username:raw};
  /* Migrate any calendars saved under old random fcb-uid to new username-derived UID */
  var oldUid=localStorage.getItem('fcb-uid');
  var newUid=fcbUsernameToUid(raw);
  if(oldUid&&oldUid!==newUid){
    try{
      var SB_URL='https://rqrqxrngqtaywmhkdoal.supabase.co';
      var SB_KEY='sb_publishable_Hvg22Fb6JhnA81umnhoSYw_uIitY5E7';
      await fetch(SB_URL+'/rest/v1/calendars?owner_id=eq.'+encodeURIComponent(oldUid),{
        method:'PATCH',
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return-minimal'},
        body:JSON.stringify({owner_id:newUid})
      });
    }catch(e){ console.warn('FCB: migration failed',e); }
    localStorage.removeItem('fcb-uid');
  }
  updateNav();
  fcbCloseModal();
  if(window.updateSaveUI) updateSaveUI();
  if(window.loadMyCreations) loadMyCreations();
};

/* ── Export all calendar data as JSON file ── */
window.fcbExportData=async function(){
  var uid=localStorage.getItem('fcb-uid');
  var username=localStorage.getItem('fcb-username');
  if(!uid||!username){ alert('No data to export.'); return; }
  try{
    var SB_URL='https://rqrqxrngqtaywmhkdoal.supabase.co';
    var SB_KEY='sb_publishable_Hvg22Fb6JhnA81umnhoSYw_uIitY5E7';
    var res=await fetch(SB_URL+'/rest/v1/calendars?owner_id=eq.'+encodeURIComponent(uid)+'&select=*',{
      headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}
    });
    if(!res.ok) throw new Error('fetch failed');
    var calendars=await res.json();
    var bundle={
      version:1,
      username:username,
      uid:uid,
      exported_at:new Date().toISOString(),
      calendars:calendars
    };
    var blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download='fcb-backup-'+username+'-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    URL.revokeObjectURL(url);
  }catch(e){
    alert('Export failed — make sure you are connected to the internet.');
  }
};

/* ── Import calendar data from JSON file ── */
window.fcbImportData=async function(input){
  var file=input.files[0];
  if(!file) return;
  var msg=document.getElementById('fcb-import-msg');
  function showMsg(txt,color){ if(msg){msg.textContent=txt;msg.style.display='block';msg.style.background=color==='ok'?'rgba(0,80,0,.4)':'rgba(80,0,0,.4)';msg.style.color=color==='ok'?'#90cc90':'#ff9090';} }
  try{
    var text=await file.text();
    var bundle=JSON.parse(text);
    if(!bundle.version||!bundle.calendars){ showMsg('Invalid backup file.','err'); return; }
    var uid=localStorage.getItem('fcb-uid')||window.FCB_AUTH.getUid();
    var SB_URL='https://rqrqxrngqtaywmhkdoal.supabase.co';
    var SB_KEY='sb_publishable_Hvg22Fb6JhnA81umnhoSYw_uIitY5E7';
    var count=0;
    for(var i=0;i<bundle.calendars.length;i++){
      var cal=bundle.calendars[i];
      /* Give it a new ID to avoid conflicts, assign to current user */
      var newId='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
        var r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);
      });
      var payload={id:newId,data:cal.data,owner_id:uid,is_public:cal.is_public||false,title:cal.title||'Imported Calendar',created_at:cal.created_at};
      var res=await fetch(SB_URL+'/rest/v1/calendars',{
        method:'POST',
        headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return-minimal'},
        body:JSON.stringify(payload)
      });
      if(res.ok) count++;
    }
    showMsg('✓ Imported '+count+' calendar'+(count!==1?'s':'')+' successfully!','ok');
    if(window.loadMyCreations) loadMyCreations();
  }catch(e){
    showMsg('Import failed — check the file and try again.','err');
  }
  input.value='';
};

window.fcbSignOut=function(){
  var confirmed=confirm('Sign out?\n\nYou can always sign back in with the same username to access your calendars on any device.\n\nMake sure you remember your username!');
  if(!confirmed) return;
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
