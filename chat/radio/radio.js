// chat/radio/radio.js
(() => {
  "use strict";

  const STORAGE_KEY = "mlo5_radio_url";
  const DEFAULT_URL = ""; // اختياري

  let audio = null;

  function getIsAdmin() {
    return document.body?.dataset?.isAdmin === "1";
  }

  function getRadioButtons() {
    const a = document.getElementById("radioBtn");
    const b = document.getElementById("adminPanelRadio");
    return [a, b].filter(Boolean);
  }

  function getMenu() {
    return document.getElementById("radioMenu");
  }

  function showMenu(anchorEl) {
    const menu = getMenu();
    if (!menu || !anchorEl) return;

    // ✅ إخفاء زر تعيين الرابط لغير الأدمن
    const setUrlBtn = document.getElementById("radioSetUrlBtn");
    if (setUrlBtn) setUrlBtn.style.display = getIsAdmin() ? "block" : "none";

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

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audio.volume = 1.0;
    return audio;
  }

  async function playRadio() {
    const url = getSavedUrl();
    if (!url) {
      alert("الراديو مش محدد. خلي الأدمن يحدد الرابط أولاً.");
      return;
    }
    const a = ensureAudio();
    if (a.src !== url) a.src = url;

    try {
      await a.play();
    } catch (e) {
      console.error(e);
      alert("تعذّر التشغيل. لازم يكون رابط Stream مباشر (mp3/aac).");
    }
  }

  function stopRadio() {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }

  function setUrlFlow() {
    if (!getIsAdmin()) return;

    const current = getSavedUrl() || "";
    const url = prompt("حط رابط الراديو (Stream URL):", current);
    if (!url) return;

    const cleaned = String(url).trim();
    saveUrl(cleaned);

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
  });
})();
