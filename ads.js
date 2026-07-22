/* ═══════════════════════════════════════════════════
   Fantasy Calendar Builder — ads.js
   Central ad configuration. Edit this file to swap
   between AdSense, custom HTML, or disable ads.

   HOW TO USE:
   - Set AD_MODE to 'adsense', 'custom', or 'off'
   - For 'adsense': paste your AdSense publisher ID
   - For 'custom': edit the HTML strings in CUSTOM_ADS
   ═══════════════════════════════════════════════════ */

var AD_MODE = 'off'; /* 'adsense' | 'custom' | 'off' */

var ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; /* replace with your AdSense publisher ID */

/* Custom HTML ads — edit freely */
var CUSTOM_ADS = {
  'ad-top':    '<a href="#" target="_blank"><img src="" alt="Advertisement" style="max-width:100%;height:auto;display:block;margin:0 auto"/></a>',
  'ad-mid':    '<a href="#" target="_blank"><img src="" alt="Advertisement" style="max-width:100%;height:auto;display:block;margin:0 auto"/></a>',
  'ad-sidebar':'<a href="#" target="_blank"><img src="" alt="Advertisement" style="max-width:100%;height:auto;display:block;margin:0 auto"/></a>'
};

/* ── Slot definitions ── */
var AD_SLOTS = {
  'ad-top':     { adsense: 'XXXXXXXXXX', width: '728px', mobileWidth: '320px', height: '90px',  mobileHeight: '50px'  },
  'ad-mid':     { adsense: 'XXXXXXXXXX', width: '300px', mobileWidth: '300px', height: '250px', mobileHeight: '250px' },
  'ad-sidebar': { adsense: 'XXXXXXXXXX', width: '160px', mobileWidth: '0px',   height: '600px', mobileHeight: '0px'   }
};

/* ── Inject ads into all slots found on page ── */
(function(){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectAds);
  } else {
    injectAds();
  }

  function injectAds(){
    if(AD_MODE==='off') return;

    /* Load AdSense script once if needed */
    if(AD_MODE==='adsense'){
      var s=document.createElement('script');
      s.async=true;
      s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADSENSE_CLIENT;
      s.crossOrigin='anonymous';
      document.head.appendChild(s);
    }

    Object.keys(AD_SLOTS).forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      var slot=AD_SLOTS[id];
      var isMobile=window.innerWidth<600;
      var w=isMobile?slot.mobileWidth:slot.width;
      var h=isMobile?slot.mobileHeight:slot.height;

      /* Hide sidebar on mobile */
      if(id==='ad-sidebar'&&isMobile){ el.style.display='none'; return; }

      el.style.display='flex';
      el.style.justifyContent='center';
      el.style.alignItems='center';
      el.style.width='100%';
      el.style.minHeight=h;
      el.style.overflow='hidden';

      if(AD_MODE==='custom'){
        el.innerHTML=CUSTOM_ADS[id]||'';
      } else if(AD_MODE==='adsense'){
        el.innerHTML=
          '<ins class="adsbygoogle"'+
          ' style="display:block;width:'+w+';height:'+h+'"'+
          ' data-ad-client="'+ADSENSE_CLIENT+'"'+
          ' data-ad-slot="'+slot.adsense+'"></ins>';
        try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
      }
    });
  }
})();
