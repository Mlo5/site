(() => {
  // Elements
  const radioMenu = document.getElementById("radioMenu");
  const radioBtn  = document.getElementById("adminPanelRadio") || document.getElementById("radioBtn");
  const playBtn   = document.getElementById("radioPlayBtn");
  const stopBtn   = document.getElementById("radioStopBtn");
  const setUrlBtn = document.getElementById("radioSetUrlBtn");

  // Audio
  const audio = new Audio();
  audio.preload = "none";
  audio.crossOrigin = "anonymous"; // يساعد ببعض الروابط

  // Storage keys
  const KEY_URL = "mlo5_radio_url";
  const KEY_VOL = "mlo5_radio_vol";

  function getSavedUrl(){
    try { return localStorage.getItem(KEY_URL) || ""; } catch { return ""; }
  }
  function setSavedUrl(url){
    try { localStorage.setItem(KEY_URL, url); } catch {}
  }
  function getSavedVol(){
    try {
      const v = Number(localStorage.getItem(KEY_VOL));
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
    } catch { return 1; }
  }

  function showMenuAt(x, y){
    if (!radioMenu) return;
    radioMenu.style.left = x + "px";
    radioMenu.style.top  = y + "px";
    radioMenu.style.display = "block";
    radioMenu.setAttribute("aria-hidden","false");
  }
  function hideMenu(){
    if (!radioMenu) return;
    radioMenu.style.display = "none";
    radioMenu.setAttribute("aria-hidden","true");
  }

  function ensureUrl(){
    const url = getSavedUrl();
    if (!url){
      alert("حط رابط راديو (MP3/ICECAST) أولاً من زر: تعيين رابط");
      return "";
    }
    return url;
  }

  async function play(){
    const url = ensureUrl();
    if (!url) return;
    try{
      audio.src = url;
      audio.volume = getSavedVol();
      await audio.play();
    }catch(err){
      console.error("Radio play error:", err);
      alert("تعذر تشغيل الرابط. جرّب رابط ثاني (يفضل mp3/icecast مباشر).");
    }
  }

  function stop(){
    try{
      audio.pause();
      audio.currentTime = 0;
    }catch{}
  }

  function promptSetUrl(){
    const current = getSavedUrl();
    const next = prompt("ضع رابط الراديو المباشر (mp3/icecast):", current || "https://icecast.omroep.nl/radio1-bb-mp3");
    if (!next) return;
    const url = String(next).trim();
    setSavedUrl(url);
    alert("✅ تم حفظ رابط الراديو.");
  }

  // Bind events
  if (radioBtn){
    radioBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      e.stopPropagation();
      const r = radioBtn.getBoundingClientRect();
      const open = radioMenu?.style.display === "block";
      if (open) hideMenu();
      else showMenuAt(Math.round(r.left), Math.round(r.bottom + 8));
    });
  }

  playBtn?.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); play(); });
  stopBtn?.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); stop(); });
  setUrlBtn?.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); promptSetUrl(); });

  // Close on outside click
  document.addEventListener("click",(e)=>{
    if (!radioMenu || radioMenu.style.display !== "block") return;
    if (e.target?.closest?.("#radioMenu")) return;
    if (e.target?.closest?.("#radioBtn")) return;
    if (e.target?.closest?.("#adminPanelRadio")) return;
    hideMenu();
  });

  // Close on ESC
  document.addEventListener("keydown",(e)=>{
    if (e.key === "Escape") hideMenu();
  });

  // Init
  audio.volume = getSavedVol();
})();
