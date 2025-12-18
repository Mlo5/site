/* chat/radio/radio.js — YouTube Sync via Firebase RTDB
   - Admin يتحكم
   - Users يتبعوا نفس الثانية باستخدام startedAtMs (server time)
*/

(function () {
  const radioBtn =
    document.getElementById("adminPanelRadio") ||
    document.getElementById("radioBtn");

  const radioMenu = document.getElementById("radioMenu");
  const playBtn = document.getElementById("radioPlayBtn");
  const stopBtn = document.getElementById("radioStopBtn");
  const setUrlBtn = document.getElementById("radioSetUrlBtn");

  // ✅ فيديو واحد (بدّل الـ ID يدوي)
  const DEFAULT_VIDEO_ID = "aM2kTHpZnsM"; // <-- غيّره لأي فيديو

  // RTDB path
  const RADIO_PATH = "roomState/radio";

  // Local volume (لكل جهاز)
  const VOL_KEY = "mlo5_radio_vol";
  const getVol = () => {
    const v = Number(localStorage.getItem(VOL_KEY));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1.0;
  };
  const setVol = (v) => localStorage.setItem(VOL_KEY, String(v));

  function showMenuAt(x, y) {
    if (!radioMenu) return;
    radioMenu.style.left = x + "px";
    radioMenu.style.top = y + "px";
    radioMenu.style.display = "block";
    radioMenu.setAttribute("aria-hidden", "false");
  }
  function hideMenu() {
    if (!radioMenu) return;
    radioMenu.style.display = "none";
    radioMenu.setAttribute("aria-hidden", "true");
  }

  // ---------- UI داخل المنيو ----------
  let stateEl = null;
  let volInput = null;
  let playerWrap = null;
  let ytPlayer = null;
  let lastAppliedState = null;
  let ytReady = false;

  function ensureUI() {
    if (!radioMenu) return;
    if (radioMenu.__radioUiReady) return;
    radioMenu.__radioUiReady = true;

    stateEl = document.createElement("div");
    stateEl.className = "radioState";
    stateEl.textContent = "الراديو: جاهز";
    radioMenu.appendChild(stateEl);

    playerWrap = document.createElement("div");
    playerWrap.className = "ytWrap";
    playerWrap.innerHTML = `<div id="ytRadioPlayer"></div>`;
    radioMenu.appendChild(playerWrap);

    const row = document.createElement("div");
    row.className = "radioUrlRow";
    row.innerHTML = `
      <input id="radioVolInput" type="number" min="0" max="100" step="1" style="width:110px" title="الصوت %" />
      <button id="radioUserUnmute" type="button" style="white-space:nowrap">🔊 تفعيل الصوت</button>
    `;
    radioMenu.appendChild(row);

    volInput = row.querySelector("#radioVolInput");
    const unmuteBtn = row.querySelector("#radioUserUnmute");

    if (volInput) volInput.value = String(Math.round(getVol() * 100));

    volInput?.addEventListener("change", () => {
      const v = Math.min(100, Math.max(0, Number(volInput.value || 100)));
      const vv = v / 100;
      setVol(vv);
      if (ytPlayer?.setVolume) ytPlayer.setVolume(Math.round(v));
      setState(`🔉 الصوت: ${v}%`);
    });

    // ✅ بسبب قيود المتصفح: المستخدم لازم “يتفاعل” مرة عشان الصوت يشتغل
    unmuteBtn?.addEventListener("click", async () => {
      try {
        if (ytPlayer?.unMute) ytPlayer.unMute();
        if (ytPlayer?.setVolume) ytPlayer.setVolume(Math.round(getVol() * 100));
        if (lastAppliedState?.playing) {
          ytPlayer.playVideo?.();
        }
        setState("✅ تم تفعيل الصوت على جهازك");
      } catch {}
    });
  }

  function setState(txt) {
    ensureUI();
    if (stateEl) stateEl.textContent = txt;
  }

  // ---------- YouTube API ----------
  function loadYouTubeApi() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve();
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        try { prev && prev(); } catch {}
        resolve();
      };
    });
  }

  async function ensurePlayer(videoId) {
    ensureUI();
    await loadYouTubeApi();

    if (ytPlayer) {
      // لو نفس الفيديو، خلّيه
      return ytPlayer;
    }

    return new Promise((resolve) => {
      ytPlayer = new window.YT.Player("ytRadioPlayer", {
        width: "100%",
        height: "100%",
        videoId: videoId || DEFAULT_VIDEO_ID,
        playerVars: {
          playsinline: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: () => {
            ytReady = true;
            try {
              ytPlayer.setVolume(Math.round(getVol() * 100));
              ytPlayer.mute(); // ✅ افتراضي: mute عشان autoplay ما يعلق
            } catch {}
            resolve(ytPlayer);
          }
        }
      });
    });
  }

  async function loadVideoIfNeeded(videoId) {
    await ensurePlayer(videoId || DEFAULT_VIDEO_ID);
    try {
      // لو الفيديو مختلف
      const currentId = ytPlayer.getVideoData?.().video_id;
      if (videoId && currentId && currentId !== videoId) {
        ytPlayer.loadVideoById(videoId);
      }
    } catch {}
  }

  // ---------- Firebase Sync ----------
  function fb() {
    return window.MLO5?.fb;
  }
  function rtdb() {
    return window.MLO5?.rtdb;
  }
  function nowMs() {
    return window.MLO5?.nowMs ? window.MLO5.nowMs() : Date.now();
  }
  function isAdmin() {
    return !!window.MLO5?.getIsAdmin?.();
  }

  async function adminSetVideoIdManual() {
    // انت قلت: بدك فيديو واحد وتغير ID يدوي
    const current = lastAppliedState?.videoId || DEFAULT_VIDEO_ID;
    const next = prompt("YouTube Video ID (مثال: dQw4w9WgXcQ):", current);
    if (!next) return;
    const clean = String(next).trim();

    await fb().update(fb().ref(rtdb(), RADIO_PATH), {
      videoId: clean,
      // إذا كان شغال، خليه يكمل من نفس اللحظة (ما بنغير startedAtMs)
      updatedAtMs: nowMs()
    });

    setState("✅ تم تغيير فيديو الراديو");
  }

  async function adminPlay() {
    const id = lastAppliedState?.videoId || DEFAULT_VIDEO_ID;

    // ✅ شغّل من “هسا” (الثانية 0 بالنسبة للبث)
    await fb().set(fb().ref(rtdb(), RADIO_PATH), {
      videoId: id,
      playing: true,
      startedAtMs: nowMs(),
      updatedAtMs: nowMs()
    });

    setState("▶️ تم تشغيل الراديو للجميع");
  }

  async function adminStop() {
    const id = lastAppliedState?.videoId || DEFAULT_VIDEO_ID;

    await fb().set(fb().ref(rtdb(), RADIO_PATH), {
      videoId: id,
      playing: false,
      startedAtMs: lastAppliedState?.startedAtMs || nowMs(),
      updatedAtMs: nowMs()
    });

    setState("⏹️ تم إيقاف الراديو للجميع");
  }

  async function applyState(st) {
    lastAppliedState = st || {};
    const vid = (st?.videoId || DEFAULT_VIDEO_ID).trim();
    const playing = st?.playing === true;
    const startedAt = Number(st?.startedAtMs || 0);

    await loadVideoIfNeeded(vid);

    // احسب الثانية الحالية بالنسبة لوقت البدء
    let posSec = 0;
    if (startedAt) posSec = Math.max(0, Math.floor((nowMs() - startedAt) / 1000));

    try {
      // seek ثم تشغيل/إيقاف
      if (ytPlayer?.seekTo) ytPlayer.seekTo(posSec, true);

      if (playing) {
        // autoplay غالباً رح يشتغل mute فقط — المستخدم يكبس "تفعيل الصوت" مرة
        ytPlayer.playVideo?.();
        setState(`📻 شغال الآن — عند الثانية ${posSec}s (على جهازك)`);
      } else {
        ytPlayer.pauseVideo?.();
        setState("⏸️ متوقف حالياً");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function startRadioListener() {
    if (!fb() || !rtdb()) {
      setState("❌ Firebase غير جاهز للراديو (تأكد window.MLO5 من room.js).");
      return;
    }

    fb().onValue(fb().ref(rtdb(), RADIO_PATH), (snap) => {
      const st = snap.val() || {};
      applyState(st).catch(() => {});
    });
  }

  // ---------- Events ----------
  radioBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    ensureUI();

    const r = radioBtn.getBoundingClientRect();
    const open = radioMenu?.style.display === "block";
    if (open) hideMenu();
    else showMenuAt(Math.round(r.left), Math.round(r.bottom + 8));
  });

  // ✅ الأدمن فقط
  playBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!isAdmin()) return setState("❌ هذا الخيار للأدمن فقط");
    await adminPlay();
  });

  stopBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!isAdmin()) return setState("❌ هذا الخيار للأدمن فقط");
    await adminStop();
  });

  setUrlBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!isAdmin()) return setState("❌ هذا الخيار للأدمن فقط");
    await adminSetVideoIdManual();
  });

  document.addEventListener("click", (e) => {
    if (!radioMenu || radioMenu.style.display !== "block") return;
    if (e.target?.closest?.("#radioMenu")) return;
    if (e.target?.closest?.("#radioBtn") || e.target?.closest?.("#adminPanelRadio")) return;
    hideMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideMenu();
  });

  // ✅ Start
  startRadioListener();
})();

