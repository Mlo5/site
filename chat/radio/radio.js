/* chat/radio/radio.js
   يعتمد على وجود عناصر بالـ HTML:
   - #radioBtn
   - #radioMenu
   - #radioPlayBtn #radioStopBtn #radioSetUrlBtn
*/

(function () {
  const radioBtn = document.getElementById("radioBtn");
  const radioMenu = document.getElementById("radioMenu");

  const playBtn = document.getElementById("radioPlayBtn");
  const stopBtn = document.getElementById("radioStopBtn");
  const setUrlBtn = document.getElementById("radioSetUrlBtn");

  // audio element (hidden)
  const audio = new Audio();
  audio.preload = "none";
  audio.crossOrigin = "anonymous";
  audio.volume = 1.0;

  // Local storage keys
  const URL_KEY = "mlo5_radio_url";
  const VOL_KEY = "mlo5_radio_vol";

  function getSavedUrl(){
    return localStorage.getItem(URL_KEY) || "";
  }
  function setSavedUrl(url){
    localStorage.setItem(URL_KEY, url);
  }
  function getSavedVol(){
    const v = Number(localStorage.getItem(VOL_KEY));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1.0;
  }
  function setSavedVol(v){
    localStorage.setItem(VOL_KEY, String(v));
  }

  function showMenuAt(x,y){
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

  // inject simple status UI inside menu once
  function ensureStatusUI(){
    if (!radioMenu) return;
    if (radioMenu.querySelector(".radioState")) return;

    const state = document.createElement("div");
    state.className = "radioState";
    state.textContent = "الراديو: جاهز";

    radioMenu.appendChild(state);

    // optional: volume slider
    const row = document.createElement("div");
    row.className = "radioUrlRow";
    row.innerHTML = `
      <input id="radioUrlInput" placeholder="ضع رابط بث الراديو هنا..." autocomplete="off" />
      <input id="radioVolInput" type="number" min="0" max="100" step="1" style="width:90px" title="الصوت %" />
    `;
    radioMenu.appendChild(row);

    const urlInput = radioMenu.querySelector("#radioUrlInput");
    const volInput = radioMenu.querySelector("#radioVolInput");

    if (urlInput) urlInput.value = getSavedUrl();
    if (volInput) volInput.value = String(Math.round(getSavedVol()*100));

    // live update volume
    volInput?.addEventListener("change", ()=>{
      const v = Math.min(100, Math.max(0, Number(volInput.value || 100)));
      const vv = v/100;
      audio.volume = vv;
      setSavedVol(vv);
      state.textContent = `الصوت: ${v}%`;
    });

    // expose helper to update state
    radioMenu.__setRadioState = (txt)=>{ state.textContent = txt; };
    radioMenu.__getUrlInput = ()=> urlInput;
  }

  function setState(txt){
    if (radioMenu?.__setRadioState) radioMenu.__setRadioState(txt);
  }

  async function play(){
    const url = getSavedUrl().trim();
    if (!url){
      setState("❌ لا يوجد رابط.\nاضغط (تعيين رابط) وضع رابط البث.");
      return;
    }
    try{
      audio.src = url;
      audio.volume = getSavedVol();
      await audio.play();
      setState("✅ يعمل الآن");
    }catch(e){
      setState("❌ فشل التشغيل.\nتأكد أن الرابط مباشر للبث (mp3/aac/stream) ومسموح من المتصفح.");
      console.error(e);
    }
  }

  function stop(){
    try{ audio.pause(); }catch{}
    try{ audio.currentTime = 0; }catch{}
    setState("⏹️ تم الإيقاف");
  }

  function promptSetUrl(){
    ensureStatusUI();
    const urlInput = radioMenu?.__getUrlInput?.();
    const current = (urlInput?.value || getSavedUrl() || "").trim();
    const next = prompt("ضع رابط بث الراديو (Stream URL):", current);
    if (!next) return;
    const clean = String(next).trim();
    setSavedUrl(clean);
    if (urlInput) urlInput.value = clean;
    setState("🔗 تم حفظ الرابط");
  }

  // Events
  radioBtn?.addEventListener("click", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    ensureStatusUI();
    const r = radioBtn.getBoundingClientRect();
    const open = radioMenu?.style.display === "block";
    if (open) hideMenu();
    else showMenuAt(Math.round(r.left), Math.round(r.bottom + 8));
  });

  playBtn?.addEventListener("click", (e)=>{ e.preventDefault(); play(); });
  stopBtn?.addEventListener("click", (e)=>{ e.preventDefault(); stop(); });
  setUrlBtn?.addEventListener("click", (e)=>{ e.preventDefault(); promptSetUrl(); });

  // close on outside
  document.addEventListener("click",(e)=>{
    if (!radioMenu || radioMenu.style.display !== "block") return;
    if (e.target?.closest?.("#radioMenu")) return;
    if (e.target?.closest?.("#radioBtn")) return;
    hideMenu();
  });

  // close on ESC
  document.addEventListener("keydown",(e)=>{
    if (e.key === "Escape") hideMenu();
  });

  // Default volume init
  audio.volume = getSavedVol();
})();
