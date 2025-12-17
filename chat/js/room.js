import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, where, orderBy, onSnapshot, doc, setDoc,
  getDocs, limit, limitToLast, writeBatch
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getDatabase, ref, set, onDisconnect, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnxruqFdBHEHTSVXl-QK848lsGvwBBH9U",
  authDomain: "mlo5-users.firebaseapp.com",
  databaseURL: "https://mlo5-users-default-rtdb.firebaseio.com",
  projectId: "mlo5-users",
  appId: "1:142086858806:web:64c50f3a8d6250a2049097"
};

const ADMIN_UIDS = ["VFjSs6kH2jcFJnddE7SXIpipzDi2"];
const ADMIN_USERNAME = "MLO5";
const ADMIN_PASSWORD = "APRIL3049";

/* ✅✅✅ ADMIN DISPLAY (NEW) */
const ADMIN_DISPLAY_NAME = "𝕄𝕃𝕆𝟝 ヅ";
const ADMIN_ICONS_HTML = `
  <span class="adminIcons" aria-hidden="true">
    <span class="adminIcon blink" title="تاج">👑</span>
    <span class="adminIcon blink" title="جمجمة">💀</span>
  </span>
`;
/* ✅✅✅ END */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

/* ✅✅✅ FIX: Server Time Offset for ALL devices (prevents messages reappearing after clear) */
let serverOffsetMs = 0;
onValue(ref(rtdb, ".info/serverTimeOffset"), (snap)=>{
  serverOffsetMs = Number(snap.val() || 0);
});
function nowMs(){
  return Date.now() + serverOffsetMs;
}
/* ✅✅✅ END FIX */

const __MOBILE_DEVICE = window.matchMedia("(pointer: coarse)").matches;

const connDot = document.getElementById("connDot");
const connText = document.getElementById("connText");
const exitBtn = document.getElementById("exitBtn");
const logBtn = document.getElementById("logBtn");
const bgBtn  = document.getElementById("bgBtn");
const adminMenuBtn = document.getElementById("adminMenuBtn");
const colorBtn = document.getElementById("colorBtn");
const downloadBtn = document.getElementById("downloadBtn");

/* ✅ THEMES UI */
const themeBtn  = document.getElementById("themeBtn");
const themeMenu = document.getElementById("themeMenu");
/* ✅ END */

const onlineList = document.getElementById("onlineList");
const onlineCount = document.getElementById("onlineCount");
const meBadge = document.getElementById("meBadge");
const statusSelect = document.getElementById("statusSelect");
const ignoreCount = document.getElementById("ignoreCount");

const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const adminClearBtn = document.getElementById("adminClearBtn");
const emojiBtn = document.getElementById("emojiBtn");
const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");

const replyPreview = document.getElementById("replyPreview");
const replyPreviewName = document.getElementById("replyPreviewName");
const replyPreviewText = document.getElementById("replyPreviewText");
const replyCancelBtn = document.getElementById("replyCancelBtn");

const emojiPicker = document.getElementById("emojiPicker");
const emojiGrid = document.getElementById("emojiGrid");

const modal = document.getElementById("modal");
const modalErr = document.getElementById("modalErr");
const formBox = document.getElementById("formBox");
const chooseLogin = document.getElementById("chooseLogin");
const chooseGuest = document.getElementById("chooseGuest");

const homeBtn = document.getElementById("homeBtn");
const backListBtn = document.getElementById("backListBtn");

const nameInput = document.getElementById("nameInput");
const genderInput = document.getElementById("genderInput");
const ageInput = document.getElementById("ageInput");
const countryInput = document.getElementById("countryInput");
const nameColorInput = document.getElementById("nameColor");
const textColorInput = document.getElementById("textColor");
const enterBtn = document.getElementById("enterBtn");

const adminUser = document.getElementById("adminUser");
const adminPass = document.getElementById("adminPass");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminErr = document.getElementById("adminErr");

const ctxMenu = document.getElementById("ctxMenu");
const modActions = document.getElementById("modActions");
const rankActions = document.getElementById("rankActions");

const ctxKickBtn = document.getElementById("ctxKickBtn");
const ctxMuteBtn = document.getElementById("ctxMuteBtn");
const ctxUnmuteBtn = document.getElementById("ctxUnmuteBtn");
const ctxBanBtn = document.getElementById("ctxBanBtn");
const ctxUnbanBtn = document.getElementById("ctxUnbanBtn");

const ctxRankLegend = document.getElementById("ctxRankLegend");
const ctxRankVip    = document.getElementById("ctxRankVip");
const ctxRankRoot   = document.getElementById("ctxRankRoot");
const ctxRankGirl   = document.getElementById("ctxRankGirl");
const ctxRankMaster = document.getElementById("ctxRankMaster");
const ctxRankNone   = document.getElementById("ctxRankNone");

const roomMenu = document.getElementById("roomMenu");
const roomLockBtn = document.getElementById("roomLockBtn");
const roomUnlockBtn = document.getElementById("roomUnlockBtn");

const roomLogBtn = document.getElementById("roomLogBtn");
const radioBtn = document.getElementById("radioBtn");
const capsuleBtn = document.getElementById("capsuleBtn");

const bg1Btn = document.getElementById("bg1Btn");
const bg2Btn = document.getElementById("bg2Btn");
const bg3Btn = document.getElementById("bg3Btn");
const bg4Btn = document.getElementById("bg4Btn");
const bg5Btn = document.getElementById("bg5Btn");
const bg0Btn = document.getElementById("bg0Btn");

const siteBgLayer = document.getElementById("siteBgLayer");
const chatHint = document.getElementById("chatHint");

const appModal = document.getElementById("appModal");
const appModalTitle = document.getElementById("appModalTitle");
const appModalText = document.getElementById("appModalText");
const appModalActions = document.getElementById("appModalActions");

const toastSound = new Audio("./chat/media/sounds/toast.mp3");
toastSound.preload = "auto";
toastSound.volume = 1.0;

let user = null;
let profile = null;
let joinAtMs = null;
let initialLoaded = false;
let lastSoundAt = 0;
let __lastMessagesSnap = null;

const adminSessionKey = (uid) => `adminSession_${uid}`;
let isAdmin = false;
let isGuest = false;

const ignoreKey = (uid) => `chatIgnoreWindows_${uid}`;
const profKey   = (uid) => `chatProfile_${uid}`;
const statusKey = (uid) => `chatStatus_${uid}`;

let ignoreWindows = {};
let replyTarget = null;
let roomLocked = false;

const BAD_WORDS = ["fuck","shit","bitch","asshole","كس","زب","شرموط","قحبه","منيك","خول","طيز"];
const EMOJIS = "😀😅😂🤣😊😍😘😎🤩🥳😡😭😱👍👎💓🙏🔥💛⭐💛🎮💀".split("");

/* ✅ RANKS */
const RANKS = {
  none:  { label:"بدون",     emoji:"",   rowClass:"" },
  legend:{ label:"Legendary",emoji:"⚡",  rowClass:"rank-legend" },
  vip:   { label:"VIP",      emoji:"💎",  rowClass:"rank-vip" },
  root:  { label:"ROOT",     emoji:"🛡️",  rowClass:"rank-root" },
  girl:  { label:"GIRL",     emoji:"🎀",  rowClass:"rank-girl" },
  master:{ label:"MASTER",  emoji:"🟩",  rowClass:"rank-master" }
};
let ranksMap = {}; // uid -> rank
let capsulesMap = {}; // uid -> {choice}

function capsuleChoiceOf(uid){
  const v = capsulesMap?.[uid];
  const n = (typeof v === "number") ? v : Number(v?.choice || 0);
  return Number.isFinite(n) ? n : 0;
}

function rankOf(uid){ return ranksMap?.[uid] || "none"; }
function rankEmoji(r){ return (RANKS[r] || RANKS.none).emoji || ""; }
function rankNameColor(r){
  if (r === "legend") return "#f97316"; // orange
  if (r === "girl") return "#ec4899";   // pink
  if (r === "root") return "#ef4444";   // red
  if (r === "vip") return "#2563eb";    // blue
  if (r === "master") return "#39ff14"; // phosphoric
  return "#ffffff";
}
function displayNameColorFor(uid, isRowAdmin=false, fallback="#ffffff"){
  if (isRowAdmin) return "#ffffff";
  const r = rankOf(uid);
  const c = rankNameColor(r);
  return c || fallback;
}


// ✅ صلاحيات الرتب (تم تعديل المسح: للأدمن فقط)
function myRank(){ return rankOf(user?.uid); }
function hasAnyRank(uid){ return rankOf(uid) && rankOf(uid) !== "none"; }
function canWriteWhenLocked(){ return isAdmin || hasAnyRank(user?.uid); }
function canClear(){ return isAdmin; } // ✅ مسح الشات للأدمن فقط
function canKick(){
  const r = myRank();
  return isAdmin || r === "root" || r === "vip" || r === "girl";
}
function canMute(){
  const r = myRank();
  return isAdmin || r === "root" || r === "vip" || r === "legend" || r === "girl";
}
function canBan(){
  const r = myRank();
  return isAdmin || r === "root";
}

function rankIconHtml(r){
  if (!r || r === "none") return "";
  return `<span class="rankIcon" title="${escapeHtml(RANKS[r]?.label||"")}">${escapeHtml(rankEmoji(r))}</span>`;
}

/* =========================
   ✅ THEMES (Local per user + gated)
   - All themes visible to everyone
   - If user clicks locked theme => redirect to color.html
   - Saved in localStorage per uid
   - Gradient generates random mix each time chosen
   ========================= */

const THEME_KEY = (uid)=> `chatTheme_${uid || "anon"}`;
const THEME_GRAD_KEY = (uid)=> `chatThemeGradient_${uid || "anon"}`;
let __themeInitBound = false;

function getUserTier(){
  if (isAdmin) return "admin";
  if (hasAnyRank(user?.uid)) return "rank";
  return "user";
}

function isThemeAllowedForTier(theme, tier){
  // supported: dark, white, blue, gradient, pink, anime, rank, adminGlobal
  if (tier === "admin") return true;

  const userAllowed = ["dark","white","blue","gradient"];
  const rankAllowed = ["dark","white","blue","gradient","pink","anime","rank","adminGlobal"];

  if (tier === "rank") return rankAllowed.includes(theme);
  return userAllowed.includes(theme);
}

function pickRandomGradient(){
  const stops = [
    ["#0ea5e9","#22c55e"], ["#f97316","#facc15"], ["#a78bfa","#22d3ee"],
    ["#f43f5e","#60a5fa"], ["#10b981","#facc15"], ["#fb7185","#a78bfa"],
    ["#38bdf8","#f472b6"], ["#84cc16","#06b6d4"]
  ];
  const pair = stops[Math.floor(Math.random()*stops.length)];
  const angle = Math.floor(Math.random()*360);
  return { a: pair[0], b: pair[1], angle };
}

function applyTheme(theme, opts={}){
  const rootEl = document.documentElement;
  document.body?.setAttribute("data-theme", theme);
  rootEl.setAttribute("data-theme", theme);

  rootEl.style.removeProperty("--mlo5-gradient");
  rootEl.style.removeProperty("--mlo5-bg");
  rootEl.style.removeProperty("--mlo5-card");
  rootEl.style.removeProperty("--mlo5-text");
  rootEl.style.removeProperty("--mlo5-accent");

  if (theme === "dark"){
    return;
  }

  if (theme === "white"){
    rootEl.style.setProperty("--mlo5-bg", "#f7f7f8");
    rootEl.style.setProperty("--mlo5-card", "#ffffff");
    rootEl.style.setProperty("--mlo5-text", "#111827");
    rootEl.style.setProperty("--mlo5-accent", "#111827");
    return;
  }

  if (theme === "blue"){
    rootEl.style.setProperty("--mlo5-bg", "#06111f");
    rootEl.style.setProperty("--mlo5-card", "rgba(9, 30, 66, .55)");
    rootEl.style.setProperty("--mlo5-text", "#e5e7eb");
    rootEl.style.setProperty("--mlo5-accent", "#60a5fa");
    return;
  }

  if (theme === "pink"){
    rootEl.style.setProperty("--mlo5-bg", "#1a0510");
    rootEl.style.setProperty("--mlo5-card", "rgba(255, 105, 180, .10)");
    rootEl.style.setProperty("--mlo5-text", "#ffe4f1");
    rootEl.style.setProperty("--mlo5-accent", "#fb7185");
    return;
  }

  if (theme === "anime"){
    rootEl.style.setProperty("--mlo5-bg", "#090a16");
    rootEl.style.setProperty("--mlo5-card", "rgba(124, 58, 237, .14)");
    rootEl.style.setProperty("--mlo5-text", "#ede9fe");
    rootEl.style.setProperty("--mlo5-accent", "#a78bfa");
    return;
  }

  if (theme === "rank"){
    rootEl.style.setProperty("--mlo5-bg", "#0b0b0b");
    rootEl.style.setProperty("--mlo5-card", "rgba(250, 204, 21, .08)");
    rootEl.style.setProperty("--mlo5-text", "#fff7d6");
    rootEl.style.setProperty("--mlo5-accent", "#facc15");
    return;
  }

  if (theme === "adminGlobal"){
    rootEl.style.setProperty("--mlo5-bg", "#071a10");
    rootEl.style.setProperty("--mlo5-card", "rgba(34, 197, 94, .12)");
    rootEl.style.setProperty("--mlo5-text", "#dcfce7");
    rootEl.style.setProperty("--mlo5-accent", "#22c55e");
    return;
  }

  if (theme === "gradient"){
    const g = opts.gradient || pickRandomGradient();
    rootEl.style.setProperty("--mlo5-gradient", `linear-gradient(${g.angle}deg, ${g.a}, ${g.b})`);
    rootEl.style.setProperty("--mlo5-card", "rgba(0,0,0,.55)");
    rootEl.style.setProperty("--mlo5-text", "#f9fafb");
    rootEl.style.setProperty("--mlo5-accent", "#facc15");
    return;
  }
}

function saveThemeForUser(theme, extra=null){
  if (!user) return;
  try{
    localStorage.setItem(THEME_KEY(user.uid), theme);
    if (theme === "gradient" && extra?.gradient){
      localStorage.setItem(THEME_GRAD_KEY(user.uid), JSON.stringify(extra.gradient));
    }
  }catch{}
}

function loadSavedTheme(){
  if (!user) return { theme:"dark", gradient:null };
  let theme = "dark";
  let gradient = null;

  try{
    const t = localStorage.getItem(THEME_KEY(user.uid));
    if (t) theme = t;
  }catch{}

  try{
    const g = localStorage.getItem(THEME_GRAD_KEY(user.uid));
    if (g) gradient = JSON.parse(g);
  }catch{}

  return { theme, gradient };
}

function redirectToBuy(){
  location.href = "color.html";
}

function ensureThemeStillAllowed(){
  if (!user) return;
  const tier = getUserTier();
  const saved = loadSavedTheme();

  if (!isThemeAllowedForTier(saved.theme, tier)){
    applyTheme("dark");
    saveThemeForUser("dark");
    return;
  }

  if (saved.theme === "gradient"){
    applyTheme("gradient", { gradient: saved.gradient || pickRandomGradient() });
  } else {
    applyTheme(saved.theme);
  }
}

/* ✅ Theme menu open/close */
function showThemeMenu(x,y){
  if (!themeMenu) return;
  themeMenu.style.left = x + "px";
  themeMenu.style.top  = y + "px";
  themeMenu.style.display = "block";
  themeMenu.setAttribute("aria-hidden","false");
}
function hideThemeMenu(){
  if (!themeMenu) return;
  themeMenu.style.display = "none";
  themeMenu.setAttribute("aria-hidden","true");
}

function initThemeSystem(){
  if (!user) return;

  ensureThemeStillAllowed();

  if (__themeInitBound) return;
  __themeInitBound = true;

  // click on theme button
  if (themeBtn){
    themeBtn.addEventListener("click",(e)=>{
      e.preventDefault();
      e.stopPropagation();
      if (!themeMenu) return;
      const r = themeBtn.getBoundingClientRect();
      const open = themeMenu.style.display === "block";
      if (open) hideThemeMenu();
      else showThemeMenu(Math.round(r.left), Math.round(r.bottom + 8));
    });
  }

  // click on any [data-theme] inside themeMenu
  document.addEventListener("click", (e)=>{
    const btn = e.target?.closest?.("#themeMenu [data-theme]");
    if (!btn) return;

    const theme = String(btn.getAttribute("data-theme") || "").trim();
    if (!theme) return;

    const tierNow = getUserTier();

    if (!isThemeAllowedForTier(theme, tierNow)){
      e.preventDefault();
      hideThemeMenu();
      redirectToBuy();
      return;
    }

    e.preventDefault();
    hideThemeMenu();

    if (theme === "gradient"){
      const g = pickRandomGradient();
      applyTheme("gradient", { gradient: g });
      saveThemeForUser("gradient", { gradient: g });
    } else {
      applyTheme(theme);
      saveThemeForUser(theme);
    }
  }, { passive:false });

  // close menu on outside click
  document.addEventListener("click",(e)=>{
    if (!themeMenu || themeMenu.style.display !== "block") return;
    if (e.target === themeBtn || e.target?.closest?.("#themeBtn")) return;
    if (e.target?.closest?.("#themeMenu")) return;
    hideThemeMenu();
  });
}

/* ✅ Country code -> flag emoji */
function countryCodeToFlagEmoji(cc){
  const c = String(cc||"").toUpperCase();
  if (c.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt()));
}

/* ✅ إصلاح vh بالموبايل */
function setVh(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVh();
window.addEventListener("resize", setVh);
window.addEventListener("orientationchange", setVh);

/* ✅ Drawer المتواجدين (موبايل فقط) */
const onlineCard = document.getElementById("onlineCard");
const openOnlineBtn = document.getElementById("openOnlineBtn");
const onlineOverlay = document.getElementById("onlineOverlay");

function isMobileView(){ return window.matchMedia("(max-width: 900px)").matches; }
function openOnlineDrawer(){
  if (!isMobileView()) return;
  onlineCard.classList.add("drawer-open");
  onlineOverlay.classList.add("show");
}
function closeOnlineDrawer(){
  onlineCard.classList.remove("drawer-open");
  onlineOverlay.classList.remove("show");
}
if (openOnlineBtn){
  openOnlineBtn.addEventListener("click", ()=>{
    if (onlineCard.classList.contains("drawer-open")) closeOnlineDrawer();
    else openOnlineDrawer();
  });
}
if (onlineOverlay){
  onlineOverlay.addEventListener("click", closeOnlineDrawer);
}

const root = document.documentElement;
document.addEventListener("mousemove", (e)=>{
  const xRatio = e.clientX / window.innerWidth - 0.5;
  const yRatio = e.clientY / window.innerHeight - 0.5;
  const maxShift = 40;
  root.style.setProperty("--grid-x", (xRatio * maxShift).toFixed(1) + "px");
  root.style.setProperty("--grid-y", (yRatio * maxShift).toFixed(1) + "px");
});

function setErr(el, msg){
  el.style.display = msg ? "block" : "none";
  el.textContent = msg || "";
}
function collapseSpaces(s){ return String(s||"").replace(/\s+/g," ").trim(); }
function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}
function formatTime(tsMs){
  if (!tsMs || Number.isNaN(tsMs)) return "";
  const d = new Date(tsMs);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}
function statusLabel(s){
  switch(s){
    case "online": return "🟢 متصل";
    case "busy": return "⛔ مشغول";
    case "work": return "💼 بالعمل";
    case "car": return "🚗 بالسيارة";
    case "food": return "🍔 طعام";
    case "out": return "🌙 بالخارج";
    default: return "🟢 متصل";
  }
}
function isProfane(text){
  const t = String(text||"").toLowerCase();
  return BAD_WORDS.some(w => t.includes(w));
}
function randHexColor(){
  const n = Math.floor(Math.random()*0xFFFFFF);
  return "#" + n.toString(16).padStart(6,"0");
}

function showAppModal({title="تنبيه", text="—", actions=[{label:"حسناً", onClick:()=>hideAppModal()}]}={}){
  appModalTitle.textContent = title;
  appModalText.textContent = text;
  appModalActions.innerHTML = "";
  actions.forEach(a=>{
    const b = document.createElement("button");
    b.className = "modalBtn";
    b.type = "button";
    b.textContent = a.label || "حسناً";
    b.addEventListener("click", ()=>{
      try{ a.onClick && a.onClick(); }catch{}
    });
    appModalActions.appendChild(b);
  });
  appModal.style.display = "flex";
}
function hideAppModal(){ appModal.style.display = "none"; }
appModal.addEventListener("click",(e)=>{ if (e.target === appModal) hideAppModal(); });

/* ✅ color + download open new tabs */
if (colorBtn) colorBtn.addEventListener("click", ()=> window.open("color.html", "_blank"));
if (downloadBtn) downloadBtn.addEventListener("click", ()=> window.open("downloadpc.html", "_blank"));

/* ✅ Emoji picker */
let activeEmojiTarget = null;
function buildEmojiGrid(){
  emojiGrid.innerHTML = "";
  EMOJIS.forEach(em=>{
    const b = document.createElement("div");
    b.className = "emojiItem";
    b.textContent = em;
    b.addEventListener("click", ()=>{
      if (activeEmojiTarget) insertAtCursor(activeEmojiTarget, em);
      hideEmoji();
    });
    emojiGrid.appendChild(b);
  });
}
buildEmojiGrid();

function showEmojiFor(inputEl){
  activeEmojiTarget = inputEl;
  emojiPicker.style.display = "block";
  emojiPicker.setAttribute("aria-hidden","false");
}
function hideEmoji(){
  emojiPicker.style.display = "none";
  emojiPicker.setAttribute("aria-hidden","true");
  activeEmojiTarget = null;
}
function insertAtCursor(input, text){
  const start = input.selectionStart ?? input.value.length;
  const end   = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0,start) + text + input.value.slice(end);
  const pos = start + text.length;
  input.setSelectionRange(pos,pos);
  input.focus();
}

document.addEventListener("click",(e)=>{
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) hideEmoji();
  if (!ctxMenu.contains(e.target)) hideCtxMenu();
  if (!roomMenu.contains(e.target) && e.target !== bgBtn && e.target !== adminMenuBtn && !e.target.closest?.(".adminRoomDots")) hideRoomMenu();
});

if (emojiBtn) emojiBtn.addEventListener("click",(e)=>{ e.preventDefault(); showEmojiFor(msgInput); });

/* ✅ Ignore */
function loadIgnoreWindows(){
  try{ ignoreWindows = JSON.parse(localStorage.getItem(ignoreKey(user.uid)) || "{}"); }
  catch{ ignoreWindows = {}; }
  refreshIgnoreCount();
}
function saveIgnoreWindows(){
  localStorage.setItem(ignoreKey(user.uid), JSON.stringify(ignoreWindows));
  refreshIgnoreCount();
}
function refreshIgnoreCount(){
  let count=0;
  for (const k in ignoreWindows){
    const arr = ignoreWindows[k] || [];
    if (arr.some(w => w.end == null)) count++;
  }
  ignoreCount.textContent = `تجاهل: ${count}`;
}
function isCurrentlyIgnored(uid){
  const arr = ignoreWindows[uid] || [];
  return arr.some(w => w.end == null);
}
function isInIgnoreWindow(uid, t){
  const arr = ignoreWindows[uid] || [];
  for (const w of arr){
    const start = w.start ?? 0;
    const end = (w.end == null) ? Infinity : w.end;
    if (t >= start && t <= end) return true;
  }
  return false;
}
function toggleIgnore(uid){
  if (ADMIN_UIDS.includes(uid)) return;
  ignoreWindows[uid] = ignoreWindows[uid] || [];
  const arr = ignoreWindows[uid];
  const activeIdx = arr.findIndex(w => w.end == null);
  const now = nowMs();
  if (activeIdx >= 0) arr[activeIdx].end = now;
  else arr.push({start: now, end: null});
  saveIgnoreWindows();
}

/* ✅ Context menu */
let ctxUser = null;
function showCtxMenu(x,y){
  ctxMenu.style.left = x + "px";
  ctxMenu.style.top  = y + "px";
  ctxMenu.style.display = "block";
}
function hideCtxMenu(){
  ctxMenu.style.display = "none";
  ctxUser = null;
}

function showRoomMenu(x,y){
  roomMenu.style.left = x + "px";
  roomMenu.style.top  = y + "px";
  roomMenu.style.display = "block";

  const showAdmin = !!isAdmin;

  // admin-only items
  if (roomLockBtn)   roomLockBtn.style.display   = showAdmin ? "block" : "none";
  if (roomUnlockBtn) roomUnlockBtn.style.display = showAdmin ? "block" : "none";
  if (roomLogBtn)    roomLogBtn.style.display    = showAdmin ? "block" : "none";
  if (radioBtn)      radioBtn.style.display      = showAdmin ? "block" : "none";

  if (bg1Btn) bg1Btn.style.display = showAdmin ? "block" : "none";
  if (bg2Btn) bg2Btn.style.display = showAdmin ? "block" : "none";
  if (bg3Btn) bg3Btn.style.display = showAdmin ? "block" : "none";
  if (bg4Btn) bg4Btn.style.display = showAdmin ? "block" : "none";
  if (bg5Btn) bg5Btn.style.display = showAdmin ? "block" : "none";
  if (bg0Btn) bg0Btn.style.display = showAdmin ? "block" : "none";

  // rank+admin: capsule selector
  const showCapsule = !!isAdmin || (user && hasAnyRank(user.uid));
  if (capsuleBtn) capsuleBtn.style.display = showCapsule ? "block" : "none";
}
function hideRoomMenu(){ roomMenu.style.display = "none"; }

function openAdminMenuFrom(el){
  if (!el) return;
  const r = el.getBoundingClientRect();
  showRoomMenu(Math.round(r.left), Math.round(r.bottom + 8));
}

bgBtn.addEventListener("click",(e)=>{
  e.preventDefault();
  e.stopPropagation();
  if (!isAdmin) return;
  openAdminMenuFrom(bgBtn);
});

if (adminMenuBtn){
  adminMenuBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) return;
    openAdminMenuFrom(adminMenuBtn);
  });
}

async function writeSystemText(text, type="system", actor={}){
  await addDoc(collection(db, "globalMessages"), {
    system:true, type, text,
    actorUid: actor.uid || null,
    actorName: actor.name || null,
    createdAt: serverTimestamp(),
    createdAtMs: nowMs()
  });
}

async function writePrivateSystem(text, toUids=[], type="private"){
  await addDoc(collection(db, "globalMessages"), {
    system:true, type,
    text,
    private:true,
    to: Array.from(new Set(toUids)).filter(Boolean),
    createdAt: serverTimestamp(),
    createdAtMs: nowMs()
  });
}

async function writeActionLog(action, details=""){
  try{
    await addDoc(collection(db, "globalLogs"), {
      action,
      details,
      byUid: user?.uid || null,
      byName: (isAdmin ? ADMIN_DISPLAY_NAME : (profile?.name || "—")),
      byRank: isAdmin ? "admin" : (myRank() || "none"),
      atMs: nowMs(),
      createdAt: serverTimestamp()
    });
  }catch{}
}

function showLogsModal(lines){
  showAppModal({
    title:"📜 سجل",
    text: lines.join("\n") || "لا يوجد سجل حالياً.",
    actions:[{label:"إغلاق", onClick:()=>hideAppModal()}]
  });
}

logBtn.addEventListener("click", async ()=>{
  if (!isAdmin) return;
  try{
    const ql = query(collection(db, "globalLogs"), orderBy("atMs","desc"), limit(80));
    const snap = await getDocs(ql);
    const lines = [];
    snap.forEach(d=>{
      const x = d.data()||{};
      const t = formatTime(Number(x.atMs||0));
      const who = x.byName || "—";
      const rk = x.byRank || "—";
      lines.push(`${t} • ${who} (${rk}) • ${x.action}${x.details ? " — " + x.details : ""}`);
    });
    showLogsModal(lines.reverse());
  }catch(err){
    showLogsModal(["تعذر تحميل السجل (تحقق من صلاحيات Firestore Rules لمجموعة globalLogs)."]);
  }
});

if (roomLogBtn){
  roomLogBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    try{ logBtn.click(); }catch{}
  });
}

/* ✅ Moderation */
async function adminKick(targetUid, targetName){
  await update(ref(rtdb, `moderation/${targetUid}`), { kickedAt: nowMs(), reason:"kick", by:user.uid });
  await writeSystemText(`🚪 تم طرد ${targetName} بواسطة ${ADMIN_DISPLAY_NAME}`, "kick", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog("kick", targetName);
}
async function adminBan(targetUid, targetName){
  await update(ref(rtdb, `moderation/${targetUid}`), { banned:true, bannedAt: nowMs(), reason:"ban", by:user.uid });
  await writeSystemText(`⛔ تم حظر ${targetName} بواسطة ${ADMIN_DISPLAY_NAME}`, "ban", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog("ban", targetName);
}
async function adminUnban(targetUid, targetName){
  await update(ref(rtdb, `moderation/${targetUid}`), { banned:false, unbannedAt: nowMs(), reason:"unban", by:user.uid });
  await writeSystemText(`✅ تم إلغاء حظر ${targetName} بواسطة ${ADMIN_DISPLAY_NAME}`, "unban", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog("unban", targetName);
}
async function adminMute(targetUid, targetName){
  await update(ref(rtdb, `moderation/${targetUid}`), { muted:true, mutedUntil:0, reason:"mute", by:user.uid, mutedAt: nowMs() });
  await update(ref(rtdb, `onlineUsers/${targetUid}`), { muted:true });
  await writeSystemText(`🔇 تم كتم ${targetName} بواسطة ${ADMIN_DISPLAY_NAME}`, "mute", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog("mute", targetName);
}
async function adminUnmute(targetUid, targetName){
  await update(ref(rtdb, `moderation/${targetUid}`), { muted:false, mutedUntil:0, reason:"unmute", by:user.uid, unmutedAt: nowMs() });
  await update(ref(rtdb, `onlineUsers/${targetUid}`), { muted:false });
  await writeSystemText(`🔊 تم إلغاء كتم ${targetName} بواسطة ${ADMIN_DISPLAY_NAME}`, "unmute", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog("unmute", targetName);
}

async function setRank(targetUid, targetName, rank){
  if (!isAdmin) return;
  if (!targetUid || targetUid === user.uid) return;

  const r = (rank && RANKS[rank]) ? rank : "none";
  await set(ref(rtdb, `ranks/${targetUid}`), {
    rank: r,
    by: user.uid,
    byName: ADMIN_DISPLAY_NAME,
    at: nowMs()
  });

  try{ await update(ref(rtdb, `onlineUsers/${targetUid}`), { rank: r }); }catch{}

  const msg = (r === "none")
    ? `🧽 تم إزالة الرتبة عن ${targetName}`
    : `🏷️ تم إعطاء ${targetName} رتبة ${rankEmoji(r)}`;

  await writePrivateSystem(msg, [user.uid, targetUid], "rank");
  await writeActionLog("rank", `${targetName} -> ${r}`);

  ranksMap[targetUid] = r;
}

/* =========================
   ✅✅✅ FIX: CLEAR IMMEDIATE + HARD DELETE
   ========================= */

let globalClearedAtMs = 0;

/* ✅ Clear: يمسح فورًا + يحذف الرسائل نهائيًا */
async function adminClearForAll(){
  if (!isAdmin) return;

  const clearedAtMs = nowMs();

  // ✅ 1) Optimistic: فضّي عند الأدمن فورًا
  globalClearedAtMs = clearedAtMs;
  try{ messagesDiv.innerHTML = ""; }catch{}

  // ✅ 2) اعلن المسح للكل فورًا عبر meta (حتى قبل ما يكتمل حذف الرسائل)
  await setDoc(doc(db, "globalMeta", "clear"), {
    clearedAtMs,
    byUid: user.uid,
    byName: ADMIN_DISPLAY_NAME,
    createdAt: serverTimestamp()
  }, { merge: true });

  // ✅ 3) HARD DELETE: حذف نهائي لكل رسائل globalMessages (Batch)
  try{
    const snap = await getDocs(collection(db, "globalMessages"));

    let batch = writeBatch(db);
    let n = 0;
    const commits = [];

    snap.forEach((d)=>{
      batch.delete(doc(db, "globalMessages", d.id));
      n++;

      // ✅ كل 450 عملية نعمل commit (احتياط)
      if (n >= 450){
        commits.push(batch.commit());
        batch = writeBatch(db);
        n = 0;
      }
    });

    if (n > 0) commits.push(batch.commit());
    await Promise.all(commits);

    await writeActionLog("clear", "hard delete");
  }catch(err){
    console.error("HARD CLEAR ERROR:", err);
  }
  await writeSystemText(`🧹 ${ADMIN_DISPLAY_NAME} مسح الدردشة`, "clear", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
}

adminClearBtn.addEventListener("click",(e)=>{
  e.preventDefault();
  adminClearForAll();
});

/* ✅ كل الأجهزة: أول ما meta تتغير، فضّي الواجهة فورًا */
function startClearMetaListener(){
  let prev = 0;
  onSnapshot(doc(db, "globalMeta", "clear"), (snap)=>{
    if (!snap.exists()) return;
    const d = snap.data() || {};
    const next = Number(d.clearedAtMs || 0);
    if (!next) return;

    if (next !== prev){
      prev = next;
      globalClearedAtMs = next;
      try{ messagesDiv.innerHTML = ""; }catch{}
    }
  });
}

/* =========================
   ✅ Presence + Join/Leave
   ========================= */

async function updatePresenceStatus(statusVal, first=false){
  const onlineRef = ref(rtdb, "onlineUsers/" + user.uid);
  const device = window.matchMedia("(pointer: coarse)").matches ? "mobile" : "pc";

  const displayName = (isAdmin ? ADMIN_DISPLAY_NAME : profile.name);

  const payload = {
    uid: user.uid,
    name: displayName,
    gender: profile.gender,
    age: profile.age,
    country: profile.country || "",
    nameColor: profile.nameColor,
    textColor: profile.textColor,
    status: statusVal || "online",
    statusText: statusLabel(statusVal || "online"),
    device,
    isAdmin,
    isGuest,
    muted:false,
    rank: rankOf(user.uid),
    joinedAtMs: joinAtMs || nowMs()
  };
  await set(onlineRef, payload);
  if (first) onDisconnect(onlineRef).remove();
}

async function writeJoinLeave(type){
  const who = isAdmin ? ADMIN_DISPLAY_NAME : (profile?.name || "—");
  const text =
    type === "join" ? `${who} دخل الشات` :
    type === "leave" ? `${who} خرج من الشات` : "";
  return addDoc(collection(db, "globalMessages"), {
    system:true, type, text,
    actorUid:user.uid, actorName:who,
    createdAt: serverTimestamp(), createdAtMs: nowMs()
  });
}

function watchConnection(){
  const connRef = ref(rtdb, ".info/connected");
  onValue(connRef, (snap)=>{
    const connected = snap.val() === true;
    connDot.classList.toggle("on", connected);
    connText.textContent = connected ? "متصل" : "غير متصل";
  });
}

function startModerationListener(){
  onValue(ref(rtdb, `moderation/${user.uid}`), async (snap)=>{
    const m = snap.val();
    if (!m) return;

    if (m.banned === true){
      showAppModal({
        title:"⛔ تم حظرك",
        text:"تم حظرك من الشات.\nسيتم إخراجك الآن.",
        actions:[{label:"رجوع للهوم", onClick:()=>forceExitToHome()}]
      });
      setTimeout(forceExitToHome, 1200);
      return;
    }

    if (m.kickedAt && nowMs() - m.kickedAt < 15000){
      showAppModal({
        title:"🚪 تم طردك",
        text:"تم طردك من الشات.\nسيتم إخراجك الآن.",
        actions:[{label:"رجوع للهوم", onClick:()=>forceExitToHome()}]
      });
      setTimeout(forceExitToHome, 1200);
      return;
    }

    const until = m.mutedUntil || 0;
    const muted = (m.muted === true) || (nowMs() < until);

    if (roomLocked && !canWriteWhenLocked()){
      msgInput.disabled = true;
      sendBtn.disabled = true;
      msgInput.placeholder = "🚫 الروم مقفل بواسطة الأدمن";
    } else {
      if (isAdmin){
        msgInput.disabled = false;
        sendBtn.disabled = false;
        msgInput.placeholder = "اكتب رسالتك...";
      } else {
        msgInput.disabled = muted;
        sendBtn.disabled = muted;
        msgInput.placeholder = muted ? "تم كتمك" : "اكتب رسالتك...";
      }
    }

    try{ await update(ref(rtdb, `onlineUsers/${user.uid}`), { muted: !!muted }); }catch{}
  });
}

function forceExitToHome(){
  try{ remove(ref(rtdb, "onlineUsers/" + user.uid)); }catch{}
  location.href = "index.html";
}

function startRoomLockListener(){
  onValue(ref(rtdb, "roomState/locked"), (snap)=>{
    roomLocked = snap.val() === true;
    chatHint.innerHTML = roomLocked ? "🚫 الروم مقفل" : 'دردش وخلي الشباب <span style="color:#facc15">تستفاد</span>';

    if (roomLocked && !canWriteWhenLocked()){
      msgInput.disabled = true;
      sendBtn.disabled = true;
      msgInput.placeholder = "🚫 الروم مقفل بواسطة الأدمن";
    } else {
      if (msgInput.placeholder === "🚫 الروم مقفل بواسطة الأدمن"){
        msgInput.disabled = false;
        sendBtn.disabled = false;
        msgInput.placeholder = "اكتب رسالتك...";
      }
    }
  });
}

async function setRoomLocked(next){
  if (!isAdmin) return;
  await set(ref(rtdb, "roomState/locked"), !!next);
  await writeSystemText(next ? `🔒 ${ADMIN_DISPLAY_NAME} قفل الروم` : `🔓 ${ADMIN_DISPLAY_NAME} فتح الروم`, next ? "lock" : "unlock", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
  await writeActionLog(next ? "lock" : "unlock", "");
}

roomLockBtn.addEventListener("click", async ()=>{
  hideRoomMenu();
  await setRoomLocked(true);
});
roomUnlockBtn.addEventListener("click", async ()=>{
  hideRoomMenu();
  await setRoomLocked(false);
});

/* ✅ Global background (admin sets; all users see) */
const BG_DOC = doc(db, "globalSettings", "ui");
function bgUrlFromChoice(n){
  const nn = Number(n||0);
  if (nn === 1) return 'url("back1.gif")';
  if (nn === 2) return 'url("back2.gif")';
  if (nn === 3) return 'url("back3.gif")';
  if (nn === 4) return 'url("back4.gif")';
  if (nn === 5) return 'url("back5.gif")';
  return "none";
}
function applySiteBg(choice){
  const css = bgUrlFromChoice(choice);
  siteBgLayer.style.backgroundImage = css === "none" ? "" : css;
  siteBgLayer.style.display = css === "none" ? "none" : "block";
}
function startGlobalBgListener(){
  onSnapshot(BG_DOC, (snap)=>{
    if (!snap.exists()) { applySiteBg(0); return; }
    const d = snap.data() || {};
    applySiteBg(Number(d.bgChoice || 0));
  }, ()=>{});
}
async function setGlobalBg(choice){
  if (!isAdmin) return;
  await setDoc(BG_DOC, {
    bgChoice: Number(choice||0),
    updatedAt: serverTimestamp(),
    updatedBy: user?.uid || null
  }, { merge:true });
  await writeActionLog("bg", `bgChoice=${Number(choice||0)}`);
}
bg1Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(1); });
bg2Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(2); });
bg3Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(3); });
bg4Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(4); });
bg5Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(5); });
bg0Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(0); });

/* ✅ Radio (admin -> all users) */
const RADIO_REF = ref(rtdb, "radio");
const radioAudio = new Audio();
radioAudio.preload = "auto";
radioAudio.loop = true;
radioAudio.volume = 1.0;

let radioState = { url:"", playing:false, startedAtMs:0 };

function setRadioBtnLabel(){
  if (!radioBtn) return;
  radioBtn.textContent = radioState.playing ? "⏹️ إيقاف الراديو" : "📻 تشغيل الراديو";
}

function applyRadioFromState(st){
  radioState = st || { url:"", playing:false, startedAtMs:0 };
  setRadioBtnLabel();

  const url = String(radioState.url || "").trim();
  if (!radioState.playing || !url){
    try{ radioAudio.pause(); }catch{}
    return;
  }

  const needNewSrc = (radioAudio.src !== url);
  if (needNewSrc){
    try{
      radioAudio.src = url;
      radioAudio.load();
    }catch{}
  }

  // best-effort sync (looped audio)
  try{
    const started = Number(radioState.startedAtMs || 0);
    if (started){
      const offset = Math.max(0, Math.floor((nowMs() - started) / 1000));
      if (!Number.isNaN(offset) && Number.isFinite(offset)){
        // try seek (may fail if not buffered)
        radioAudio.currentTime = offset;
      }
    }
  }catch{}

  radioAudio.play().catch(()=>{ /* autoplay may be blocked until user interaction */ });
}

function startRadioListener(){
  onValue(RADIO_REF, (snap)=>{
    const st = snap.val() || {};
    applyRadioFromState({
      url: st.url || "",
      playing: st.playing === true,
      startedAtMs: Number(st.startedAtMs || 0)
    });
  }, ()=>{});
}

if (capsuleBtn){
  capsuleBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    if (!user) return;

    const myIsAdmin = !!isAdmin;
    const myR = myIsAdmin ? "admin" : rankOf(user.uid);
    if (!myIsAdmin && (!myR || myR === "none")) return;

    const current = capsuleChoiceOf(user.uid) || 0;

    const actions = [];
    for (let i=1;i<=5;i++){
      actions.push({
        label: (i === current ? `✅ صورة ${i}` : `صورة ${i}`),
        onClick: async ()=>{
          hideAppModal();
          try{
            await set(ref(rtdb, `capsules/${user.uid}`), { choice:i, rank: myR, atMs: nowMs() });
          }catch{}
          try{ await writeActionLog("capsule", `${myR}#${i}`); }catch{}
        }
      });
    }
    actions.push({ label:"إغلاق", onClick:()=>hideAppModal() });

    showAppModal({
      title:"🎴 كبسولة الاسم",
      text:`اختر صورة الكبسولة الخاصة برتبتك (${myR}).
(ارفع الصور بالمسار: ./chat/media/ranks/ )
مثال: ${myR}1.gif ... ${myR}5.gif`,
      actions
    });
  });
}

if (radioBtn){
  radioBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    if (!isAdmin || !user) return;

    if (radioState.playing){
      try{
        await set(RADIO_REF, { url: radioState.url || "", playing:false, startedAtMs: radioState.startedAtMs || 0, by:user.uid, atMs: nowMs() });
      }catch{}
      try{ await writeSystemText(`⏹️ ${ADMIN_DISPLAY_NAME} أوقف الراديو`, "radioStop", {uid:user.uid,name:ADMIN_DISPLAY_NAME}); }catch{}
      try{ await writeActionLog("radio", "stop"); }catch{}
      return;
    }

    const url = prompt("🔗 حط رابط مباشر للأغنية (MP3/Stream):");
    if (!url) return;

    const startedAtMs = nowMs();
    try{
      await set(RADIO_REF, { url: String(url).trim(), playing:true, startedAtMs, by:user.uid, atMs: startedAtMs });
    }catch{}
    try{ await writeSystemText(`📻 ${ADMIN_DISPLAY_NAME} شغّل الراديو`, "radioPlay", {uid:user.uid,name:ADMIN_DISPLAY_NAME}); }catch{}
    try{ await writeActionLog("radio", "play"); }catch{}
  });
}

/* ✅ Watch ranks in RTDB */
function startCapsulesListener(){
  onValue(ref(rtdb, "capsules"), (snap)=>{
    capsulesMap = snap.val() || {};
  }, ()=>{});
}

function startRanksListener(){
  onValue(ref(rtdb, "ranks"), (snap)=>{
    const v = snap.val() || {};
    const map = {};
    Object.keys(v).forEach(uid=>{
      const r = v[uid]?.rank || "none";
      map[uid] = (RANKS[r] ? r : "none");
    });
    ranksMap = map;

    if (user && profile){
      try{ update(ref(rtdb, `onlineUsers/${user.uid}`), { rank: rankOf(user.uid) }); }catch{}
    }

    adminClearBtn.style.display = isAdmin ? "inline-flex" : "none";

    // ✅ re-check theme when rank info arrives
    try{ ensureThemeStillAllowed(); }catch{}
  });
}

/* ... باقي الملف كما أرسلته أنت بدون أي تغيير ... */

