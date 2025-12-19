// chat/radio/radio.js
(() => {
  "use strict";

  const STORAGE_KEY = "mlo5_radio_url";
  const DEFAULT_URL = "https://mlo5.github.io/site/chat/media/radio/radio4.mp3"; // اتركه فاضي، أو حط رابط افتراضي لو بدك

  let audio = null;

  function $(sel) { return document.querySelector(sel); }

  function isVisible(el){
    if (!el) return false;
    const cs = window.getComputedStyle(el);
    if (!cs) return false;
    return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
  }

  // ✅ نحدد "هل هذا المستخدم أدمن؟" من واجهة الأدمن نفسها (بدون الاعتماد على room.js)
  function isAdminNow(){
  if (window.MLO5 && typeof window.MLO5.getIsAdmin === "function") {
    return window.MLO5.getIsAdmin() === true;
  }
  return window.__MLO5_IS_ADMIN__ === true;
}


  function getRadioButtons() {
    // ✅ يدعم الزر اللي فوق + الزر داخل قائمة الأدمن
    const a = document.getElementById("radioBtn");
    const b = document.getElementById("adminPanelRadio");
    return [a, b].filter(Boolean);
  }

  function getMenu() {
    return document.getElementById("radioMenu");
  }
  function setRadioOnUI(on){
  getRadioButtons().forEach(btn => {
    btn.classList.toggle("radio-on", !!on);
  });
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

    // ✅ قبل الإظهار: اخفي/اظهر خيار تعيين الرابط حسب الأدمن
    updateMenuPermissions();

    const r = anchorEl.getBoundingClientRect();
    menu.style.display = "block";
    menu.setAttribute("aria-hidden", "false");

    // تموضع ذكي
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

  function ensureAudio() {
  if (audio) return audio;

  audio = new Audio();

  // ✅ إذا توقف الصوت لأي سبب → رجّع الزر OFF
  audio.addEventListener("pause", () => setRadioOnUI(false));
  audio.addEventListener("ended", () => setRadioOnUI(false));
  audio.addEventListener("error", () => setRadioOnUI(false));

  audio.crossOrigin = "anonymous";
  audio.preload = "none";
  audio.volume = 1.0;

  return audio;
}


  async function playRadio() {
  const url = getSavedUrl();
  if (!url) {
    alert("الراديو غير مفعّل بعد. اطلب من الأدمن يحدد رابط الراديو.");
    return;
  }
  const a = ensureAudio();
  if (a.src !== url) a.src = url;

  try {
    await a.play();
    setRadioOnUI(true); // ✅ ON هنا
  } catch (e) {
    console.error(e);
    alert("تعذّر التشغيل. جرّب رابط مختلف أو تأكد أنه Stream مباشر (mp3/aac).");
  }
}

  function stopRadio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
      setRadioOnUI(false);
  }

  function setUrlFlow() {
    // ✅ حماية أكيدة: حتى لو الزر ظهر بالغلط
    if (!isAdminNow()){
      alert("هذا الخيار للأدمن فقط.");
      return;
    }

    const current = getSavedUrl() || "";
    const url = prompt("حط رابط الراديو (Stream URL):", current);
    if (!url) return;

    const cleaned = String(url).trim();
    saveUrl(cleaned);

    // لو شغال، بدّل الرابط فورًا
    if (audio && !audio.paused) {
      audio.pause();
      audio.src = cleaned;
      audio.play().catch(()=>{});
    }
  }

  function bindMenuActions() {
    const playBtn = document.getElementById("radioPlayBtn");
    const stopBtn = document.getElementById("radioStopBtn");
    const setUrlBtn = document.getElementById("radioSetUrlBtn");

    playBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      playRadio();
      hideMenu();
    });

    stopBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      stopRadio();
      hideMenu();
    });

    setUrlBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      setUrlFlow();
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

      // لو كبست على أي زر من أزرار الراديو لا تسكر فوراً
      const btns = getRadioButtons();
      if (btns.some(b => e.target === b || e.target?.closest?.("#" + b.id))) return;

      hideMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideMenu();
    });
  }

  // ✅ ابدأ بعد ما الصفحة تجهز
  window.addEventListener("DOMContentLoaded", () => {
    bindButtons();
    bindMenuActions();
    bindGlobalClose();

    // ✅ أول تحديث للصلاحيات (لو الأدمن كان مفعل من قبل)
    updateMenuPermissions();
  });
})();



