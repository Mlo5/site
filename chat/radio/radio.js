// chat/radio/radio.js
(() => {
  "use strict";

  const STORAGE_KEY = "mlo5_radio_url";           // fallback/local
  const DEFAULT_URL = "";
  const ENABLE_KEY  = "mlo5_radio_enabled";       // 1 = user يسمح بالتشغيل التلقائي
  const RADIO_PATH  = "radioState";               // RTDB path

  let audio = null;
  let lastState = null;
  let pendingSeekSec = null;
  let applyingState = false;

  function $(sel) { return document.querySelector(sel); }

  function isVisible(el){
    if (!el) return false;
    const cs = window.getComputedStyle(el);
    if (!cs) return false;
    return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
  }

  // ✅ Admin = مصدر واحد للحقيقة (room.js يوفّرها)
  function isAdminNow(){
    if (window.MLO5 && typeof window.MLO5.getIsAdmin === "function") {
      return window.MLO5.getIsAdmin() === true;
    }
    return window.__MLO5_IS_ADMIN__ === true;
  }

  function nowMs(){
    try{
      if (window.MLO5 && typeof window.MLO5.nowMs === "function") return window.MLO5.nowMs();
    }catch{}
    return Date.now();
  }

  function getFB(){
    const fb = window.MLO5?.fb;
    const rtdb = window.MLO5?.rtdb;
    if (!fb || !rtdb) return null;
    return { fb, rtdb };
  }

  function getRadioButtons() {
    const a = document.getElementById("radioBtn");
    const b = document.getElementById("adminPanelRadio");
    return [a, b].filter(Boolean);
  }

  function getMenu() {
    return document.getElementById("radioMenu");
  }

  function setRadioOnUI(on){
    getRadioButtons().forEach(btn => btn.classList.toggle("radio-on", !!on));
  }

  function updateMenuPermissions(){
    const setUrlBtn = document.getElementById("radioSetUrlBtn");
    if (setUrlBtn){
      setUrlBtn.style.display = isAdminNow() ? "block" : "none";
    }
  }

  function showMenu(anchorEl) {
    const menu = getMenu();
    if (!menu || !anchorEl) return;

    updateMenuPermissions();

    const r = anchorEl.getBoundingClientRect();
    menu.style.display = "block";
    menu.setAttribute("aria-hidden", "false");

    const w = menu.offsetWidth || 220;
    const left = Math.max(12, Math.min(window.innerWidth - w - 12, Math.round(r.left)));
    const top = Math.round(r.bottom + 10);

    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function hideMenu() {
    const menu = getMenu();
    if (!menu) return;
    menu.style.display = "none";
    menu.setAttribute("aria-hidden", "true");
  }

  function toggleMenu(anchorEl) {
    const menu = getMenu();
    if (!menu) return;
    const open = menu.style.display === "block";
    if (open) hideMenu();
    else showMenu(anchorEl);
  }

  function getSavedUrl() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
    } catch {
      return DEFAULT_URL;
    }
  }

  function saveUrl(url) {
    try { localStorage.setItem(STORAGE_KEY, url); } catch {}
  }

  function getEnabled(){
    try{ return localStorage.getItem(ENABLE_KEY) === "1"; }catch{ return false; }
  }

  function setEnabled(on){
    try{ localStorage.setItem(ENABLE_KEY, on ? "1" : "0"); }catch{}
  }

  function ensureAudio() {
    if (audio) return audio;

    audio = new Audio();

    audio.addEventListener("pause", () => setRadioOnUI(false));
    audio.addEventListener("ended", () => setRadioOnUI(false));
    audio.addEventListener("error", () => setRadioOnUI(false));

    // لما يجهز الميتاداتا نطبق seek مؤجل (عشان mp3)
    audio.addEventListener("loadedmetadata", () => {
      if (pendingSeekSec != null && Number.isFinite(pendingSeekSec)) {
        try {
          const dur = Number(audio.duration || 0);
          let s = Math.max(0, pendingSeekSec);
          if (dur && dur > 1) s = Math.min(s, Math.max(0, dur - 0.25));
          audio.currentTime = s;
        } catch {}
        pendingSeekSec = null;
      }
    });

    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.volume = 1.0;

    return audio;
  }

  async function playLocal(url, seekSec){
    const a = ensureAudio();

    if (a.src !== url) {
      a.src = url;
      // لو بدنا seek، نخليه pending عشان يتطبق بعد metadata
      if (Number.isFinite(seekSec)) pendingSeekSec = seekSec;
    } else {
      // نفس الرابط: نقدر نحاول نعمل seek مباشرة
      if (Number.isFinite(seekSec)) {
        try{
          const dur = Number(a.duration || 0);
          let s = Math.max(0, seekSec);
          if (dur && dur > 1) s = Math.min(s, Math.max(0, dur - 0.25));
          a.currentTime = s;
        } catch {
          pendingSeekSec = seekSec;
        }
      }
    }

    try {
      await a.play();
      setRadioOnUI(true);
      return true;
    } catch (e) {
      console.error(e);
      // autoplay blocked أو مشكلة تشغيل
      setRadioOnUI(false);
      return false;
    }
  }

  function stopRadioLocal() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
    setRadioOnUI(false);
  }

  // ========= RTDB Sync =========
  async function writeRadioState(patch){
    const fbPack = getFB();
    if (!fbPack) return;
    const { fb, rtdb } = fbPack;
    try{
      await fb.update(fb.ref(rtdb, RADIO_PATH), patch);
    }catch(e){
      console.error("radioState write failed", e);
    }
  }

  function computeSeekFromState(st){
    const start = Number(st?.startedAtMs || 0);
    if (!start) return 0;
    const elapsed = (nowMs() - start) / 1000;
    return Math.max(0, elapsed);
  }

  async function applyState(st, reason){
    if (!st || applyingState) return;
    applyingState = true;

    try{
      lastState = st;

      const url = String(st.url || "").trim();
      const playing = st.isPlaying === true;

      // خزّن الرابط محليًا كـ fallback
      if (url) saveUrl(url);

      // إذا المستخدم غير مفعل الراديو بعد: لا نشغل تلقائيًا
      if (!getEnabled()) {
        // لكن لو هو أدمن وشغال، نقدر نحدّث UI بشكل عام إذا بدك. خلّيها OFF للمستخدم حتى يفعّل.
        if (!playing) setRadioOnUI(false);
        return;
      }

      if (!url) {
        stopRadioLocal();
        return;
      }

      if (!playing) {
        stopRadioLocal();
        return;
      }

      // playing=true + enabled=true → شغل و إلحق نفس الدقيقة
      const seekSec = computeSeekFromState(st);
      const ok = await playLocal(url, seekSec);

      // لو autoplay انمنع رغم إنه enabled (بعض المتصفحات عنيدة)
      if (!ok) {
        // نخليه enabled لكن المستخدم يحتاج يضغط تشغيل مرة (رح ينجح بعدها)
      }
    } finally {
      applyingState = false;
    }
  }

  function startRadioStateListener(){
    const fbPack = getFB();
    if (!fbPack) return;
    const { fb, rtdb } = fbPack;

    fb.onValue(fb.ref(rtdb, RADIO_PATH), (snap) => {
      const st = snap.val() || null;
      if (!st) return;
      applyState(st, "remote");
    });
  }

  // ========= UI Actions =========

  async function playFlow(){
    // ✅ نفس زر التشغيل هو "التفعيل"
    setEnabled(true);

    // إذا عندنا state عالمي، إلحقه
    if (lastState) {
      await applyState(lastState, "playFlow_lastState");
      return;
    }

    // إذا ما وصل state لسه: fallback تشغيل محلي (لحد ما يجي state)
    const url = getSavedUrl();
    if (!url) {
      alert("الراديو غير مفعّل بعد. اطلب من الأدمن يحدد رابط الراديو.");
      return;
    }
    await playLocal(url, 0);
  }

  async function stopFlow(){
    // للمستخدم: وقف عنده فقط + عطّل auto
    setEnabled(false);
    stopRadioLocal();

    // للأدمن: يوقف على الكل
    if (isAdminNow()) {
      await writeRadioState({ isPlaying:false, updatedAtMs: nowMs() });
    }
  }

  async function setUrlFlow() {
    if (!isAdminNow()){
      alert("هذا الخيار للأدمن فقط.");
      return;
    }

    const current = (lastState?.url || getSavedUrl() || "");
    const url = prompt("حط رابط MP3:", current);
    if (!url) return;

    const cleaned = String(url).trim();
    saveUrl(cleaned);

    // اكتب الرابط عالميًا (بدون تشغيل تلقائي إلا إذا انت شغّال)
    await writeRadioState({
      url: cleaned,
      updatedAtMs: nowMs()
    });

    // لو انت مشغّل حالياً: بدّل فورًا على الكل مع reset للوقت
    if (lastState?.isPlaying === true) {
      await writeRadioState({
        isPlaying: true,
        startedAtMs: nowMs(),
        updatedAtMs: nowMs()
      });
    }
  }

  function bindMenuActions() {
    const playBtn = document.getElementById("radioPlayBtn");
    const stopBtn = document.getElementById("radioStopBtn");
    const setUrlBtn = document.getElementById("radioSetUrlBtn");

    playBtn?.addEventListener("click", async (e) => {
      e.preventDefault();

      // إذا أدمن: تشغيل عالمي + حفظ وقت البداية
      if (isAdminNow()) {
        const url = String(lastState?.url || getSavedUrl() || "").trim();
        if (!url) { alert("حدد رابط MP3 أولاً."); return; }

        // فعّل لنفسك كمان
        setEnabled(true);

        await writeRadioState({
          url,
          isPlaying: true,
          startedAtMs: nowMs(),
          updatedAtMs: nowMs()
        });

        // لتقليل تأخيرك انت: شغل محلي فورًا
        await playLocal(url, 0);
      } else {
        await playFlow();
      }

      hideMenu();
    });

    stopBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await stopFlow();
      hideMenu();
    });

    setUrlBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await setUrlFlow();
      hideMenu();
    });
  }

  function bindButtons() {
    const btns = getRadioButtons();
    btns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu(btn);
      });
    });
  }

  function bindGlobalClose() {
    document.addEventListener("click", (e) => {
      const menu = getMenu();
      if (!menu || menu.style.display !== "block") return;

      if (e.target?.closest?.("#radioMenu")) return;

      const btns = getRadioButtons();
      if (btns.some(b => e.target === b || e.target?.closest?.("#" + b.id))) return;

      hideMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideMenu();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    bindButtons();
    bindMenuActions();
    bindGlobalClose();

    updateMenuPermissions();
    startRadioStateListener();
  });
})();
