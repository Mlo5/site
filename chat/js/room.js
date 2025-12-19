import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, where, orderBy, onSnapshot, doc, setDoc,
  getDocs, limit, limitToLast, writeBatch
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getDatabase, ref, set, onDisconnect, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ⚠️ ضع قيمك الأصلية هنا كما هي */
const firebaseConfig = {
  apiKey: "AIzaSyBnxruqFdBHEHTSVXl-QK848lsGvwBBH9U",
  authDomain: "mlo5-users.firebaseapp.com",
  // ✅ FIX: كان فيها Y بالغلط
  databaseURL: "https://mlo5-users-default-rtdb.firebaseio.com",
  projectId: "mlo5-users",
  appId: "1:142086858806:web:64c50f3a8d6250a2049097"
};

/* ⚠️ نفس القيم الأصلية عندك */
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

// ✅ Expose minimal Firebase helpers for external modules (radio.js)
window.MLO5 = window.MLO5 || {};
window.MLO5.rtdb = rtdb;
window.MLO5.fb = { ref, onValue, set, update };
window.MLO5.nowMs = nowMs;
window.MLO5.getIsAdmin = () => isAdmin;
window.MLO5.getUid = () => user?.uid || null;

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
const ctxRankNone   = document.getElementById("ctxRankNone");

/* ✅ OPTIONAL: إذا أضفت زر MASTER بالـ HTML */
const ctxRankMaster = document.getElementById("ctxRankMaster");

const roomMenu = document.getElementById("roomMenu");
const roomLockBtn = document.getElementById("roomLockBtn");
const roomUnlockBtn = document.getElementById("roomUnlockBtn");

/* ✅ OPTIONAL: هذه الأزرار قد تكون محذوفة من HTML — ما نخليها تكسر الملف */
const selfMuteBtn = document.getElementById("selfMuteBtn");
const selfUnmuteBtn = document.getElementById("selfUnmuteBtn");

const bg1Btn = document.getElementById("bg1Btn");
const bg2Btn = document.getElementById("bg2Btn");
const bg3Btn = document.getElementById("bg3Btn");
const bg0Btn = document.getElementById("bg0Btn");
/* ✅ NEW optional buttons */
const bg4Btn = document.getElementById("bg4Btn");
const bg5Btn = document.getElementById("bg5Btn");

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
  none:   { label:"بدون",     emoji:"",   rowClass:"" },
  legend: { label:"Legendary",emoji:"⚡",  rowClass:"rank-legend" },
  vip:    { label:"VIP",      emoji:"💎",  rowClass:"rank-vip" },
  root:   { label:"ROOT",     emoji:"🛡️",  rowClass:"rank-root" },
  girl:   { label:"GIRL",     emoji:"🎀",  rowClass:"rank-girl" },
  master: { label:"MASTER",   emoji:"🧪",  rowClass:"rank-master" } // ✅ NEW
};

let ranksMap = {}; // uid -> rank
function rankOf(uid){ return ranksMap?.[uid] || "none"; }
function rankEmoji(r){ return (RANKS[r] || RANKS.none).emoji || ""; }

function myRank(){ return rankOf(user?.uid); }
function hasAnyRank(uid){ return rankOf(uid) && rankOf(uid) !== "none"; }
function canWriteWhenLocked(){ return isAdmin || hasAnyRank(user?.uid); }
function canClear(){ return isAdmin; }
function canKick(){
  const r = myRank();
  return isAdmin || r === "root" || r === "vip" || r === "girl" || r === "master";
}
function canMute(){
  const r = myRank();
  return isAdmin || r === "root" || r === "vip" || r === "legend" || r === "girl" || r === "master";
}
function canBan(){
  const r = myRank();
  return isAdmin || r === "root";
}

function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}

/* ✅ Fixed colors for rank names (ignore user's chosen nameColor for ranked users) */
function rankNameColor(rank){
  switch(rank){
    case "legend": return "#f97316"; // Legendary orange
    case "girl":   return "#ec4899"; // Girl pink
    case "root":   return "#ef4444"; // Root red
    case "vip":    return "#2563eb"; // VIP blue
    case "master": return "#a3ff12"; // Master phosphoric
    default:       return null;
  }
}
function effectiveNameColorFor(uid, fallback){
  const r = rankOf(uid);
  const c = rankNameColor(r);
  return c || (fallback || "#facc15");
}

function rankIconHtml(r){
  if (!r || r === "none") return "";
  return `<span class="rankIcon" title="${escapeHtml(RANKS[r]?.label||"")}">${escapeHtml(rankEmoji(r))}</span>`;
}

/* =========================
   ✅ THEMES
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

  if (theme === "dark") return;

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
  try{ const t = localStorage.getItem(THEME_KEY(user.uid)); if (t) theme = t; }catch{}
  try{ const g = localStorage.getItem(THEME_GRAD_KEY(user.uid)); if (g) gradient = JSON.parse(g); }catch{}
  return { theme, gradient };
}
function redirectToBuy(){ location.href = "color.html"; }

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

/* ✅ Fix vh */
function setVh(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVh();
window.addEventListener("resize", setVh);
window.addEventListener("orientationchange", setVh);

const onlineCard = document.getElementById("onlineCard");
const openOnlineBtn = document.getElementById("openOnlineBtn");
const onlineOverlay = document.getElementById("onlineOverlay");

function isMobileView(){ return window.matchMedia("(max-width: 900px)").matches; }
function openOnlineDrawer(){
  if (!isMobileView()) return;
  onlineCard?.classList.add("drawer-open");
  onlineOverlay?.classList.add("show");
}
function closeOnlineDrawer(){
  onlineCard?.classList.remove("drawer-open");
  onlineOverlay?.classList.remove("show");
}
if (openOnlineBtn){
  openOnlineBtn.addEventListener("click", ()=>{
    if (onlineCard?.classList.contains("drawer-open")) closeOnlineDrawer();
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
  if (!el) return;
  el.style.display = msg ? "block" : "none";
  el.textContent = msg || "";
}
function collapseSpaces(s){ return String(s||"").replace(/\s+/g," ").trim(); }

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
  if (!appModalTitle || !appModalText || !appModalActions || !appModal) return;
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
function hideAppModal(){
  if (appModal) appModal.style.display = "none";
}
if (appModal){
  appModal.addEventListener("click",(e)=>{ if (e.target === appModal) hideAppModal(); });
}

/* ✅ color + download open new tabs (safe) */
if (colorBtn) colorBtn.addEventListener("click", ()=> window.open("color.html", "_blank"));
if (downloadBtn) downloadBtn.addEventListener("click", ()=> window.open("downloadpc.html", "_blank"));

/* ✅ Emoji picker */
let activeEmojiTarget = null;
function buildEmojiGrid(){
  if (!emojiGrid) return;
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
  if (!emojiPicker) return;
  activeEmojiTarget = inputEl;
  emojiPicker.style.display = "block";
  emojiPicker.setAttribute("aria-hidden","false");
}
function hideEmoji(){
  if (!emojiPicker) return;
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
  if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) hideEmoji();
  if (ctxMenu && !ctxMenu.contains(e.target)) hideCtxMenu();
  if (roomMenu && !roomMenu.contains(e.target) && e.target !== bgBtn && !e.target.closest?.(".adminRoomDots")) hideRoomMenu();
});
if (emojiBtn){
  emojiBtn.addEventListener("click",(e)=>{ e.preventDefault(); showEmojiFor(msgInput); });
}

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
  if (!ignoreCount) return;
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
  if (!ctxMenu) return;
  ctxMenu.style.left = x + "px";
  ctxMenu.style.top  = y + "px";
  ctxMenu.style.display = "block";
}
function hideCtxMenu(){
  if (!ctxMenu) return;
  ctxMenu.style.display = "none";
  ctxUser = null;
}

/* ✅ Room menu */
function showRoomMenu(x,y){
  if (!roomMenu) return;
  roomMenu.style.left = x + "px";
  roomMenu.style.top  = y + "px";
  roomMenu.style.display = "block";

  const showAdmin = !!isAdmin;

  if (selfMuteBtn) selfMuteBtn.style.display   = showAdmin ? "block" : "none";
  if (selfUnmuteBtn) selfUnmuteBtn.style.display = showAdmin ? "block" : "none";

  if (bg1Btn) bg1Btn.style.display = showAdmin ? "block" : "none";
  if (bg2Btn) bg2Btn.style.display = showAdmin ? "block" : "none";
  if (bg3Btn) bg3Btn.style.display = showAdmin ? "block" : "none";
  if (bg4Btn) bg4Btn.style.display = showAdmin ? "block" : "none";
  if (bg5Btn) bg5Btn.style.display = showAdmin ? "block" : "none";
  if (bg0Btn) bg0Btn.style.display = showAdmin ? "block" : "none";
}
function hideRoomMenu(){
  if (roomMenu) roomMenu.style.display = "none";
}

if (bgBtn){
  bgBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    if (!isAdmin) return;
    const r = bgBtn.getBoundingClientRect();
    showRoomMenu(Math.round(r.left), Math.round(r.bottom + 8));
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

if (logBtn){
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
    }catch{
      showLogsModal(["تعذر تحميل السجل (تحقق من صلاحيات Firestore Rules لمجموعة globalLogs)."]);
    }
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
   ✅✅✅ CLEAR IMMEDIATE + HARD DELETE
========================= */
let globalClearedAtMs = 0;

async function adminClearForAll(){
  if (!isAdmin) return;

  const clearedAtMs = nowMs();
  globalClearedAtMs = clearedAtMs;
  try{ messagesDiv.innerHTML = ""; }catch{}

  await setDoc(doc(db, "globalMeta", "clear"), {
    clearedAtMs,
    byUid: user.uid,
    byName: ADMIN_DISPLAY_NAME,
    createdAt: serverTimestamp()
  }, { merge: true });

  try{
    const snap = await getDocs(collection(db, "globalMessages"));
    let batch = writeBatch(db);
    let n = 0;
    const commits = [];

    snap.forEach((d)=>{
      batch.delete(doc(db, "globalMessages", d.id));
      n++;
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

if (adminClearBtn){
  adminClearBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    adminClearForAll();
  });
}

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
    rank: rankOf(user.uid)
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
    if (connDot) connDot.classList.toggle("on", connected);
    if (connText) connText.textContent = connected ? "متصل" : "غير متصل";
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
    if (chatHint){
      chatHint.innerHTML = roomLocked ? "🚫 الروم مقفل" : 'دردش وخلي الشباب <span style="color:#facc15">تستفاد</span>';
    }

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

if (roomLockBtn){
  roomLockBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    await setRoomLocked(true);
  });
}
if (roomUnlockBtn){
  roomUnlockBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    await setRoomLocked(false);
  });
}

/* ✅ OPTIONAL: self mute buttons (won't crash if removed) */
if (selfMuteBtn){
  selfMuteBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    if (!isAdmin || !user) return;
    await update(ref(rtdb, `moderation/${user.uid}`), { muted:true, mutedUntil:0, reason:"selfMute", by:user.uid, mutedAt: nowMs() });
    await update(ref(rtdb, `onlineUsers/${user.uid}`), { muted:true });
    await writeSystemText(`🔇 الأدمن كتم نفسه`, "selfMute", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
    await writeActionLog("selfMute", "");
  });
}
if (selfUnmuteBtn){
  selfUnmuteBtn.addEventListener("click", async ()=>{
    hideRoomMenu();
    if (!isAdmin || !user) return;
    await update(ref(rtdb, `moderation/${user.uid}`), { muted:false, mutedUntil:0, reason:"selfUnmute", by:user.uid, unmutedAt: nowMs() });
    await update(ref(rtdb, `onlineUsers/${user.uid}`), { muted:false });
    await writeSystemText(`🔊 الأدمن فك كتم نفسه`, "selfUnmute", {uid:user.uid,name:ADMIN_DISPLAY_NAME});
    await writeActionLog("selfUnmute", "");
  });
}

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
  if (!siteBgLayer) return;
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
if (bg1Btn) bg1Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(1); });
if (bg2Btn) bg2Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(2); });
if (bg3Btn) bg3Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(3); });
if (bg4Btn) bg4Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(4); });
if (bg5Btn) bg5Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(5); });
if (bg0Btn) bg0Btn.addEventListener("click", async ()=>{ hideRoomMenu(); await setGlobalBg(0); });

/* ✅ Watch ranks in RTDB */
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

    if (adminClearBtn) adminClearBtn.style.display = isAdmin ? "inline-flex" : "none";

    try{ ensureThemeStillAllowed(); }catch{}
  });
}

function startOnlineListener(){
  onValue(ref(rtdb, "onlineUsers"), (snap)=>{
    const users = snap.val() || {};
    const arr = Object.values(users);

    if (onlineCount) onlineCount.textContent = String(arr.length);
    if (onlineList) onlineList.innerHTML = "";

    arr.sort((a,b)=>{
      const aAdmin = (a.isAdmin === true) || ADMIN_UIDS.includes(a.uid);
      const bAdmin = (b.isAdmin === true) || ADMIN_UIDS.includes(b.uid);
      if (aAdmin !== bAdmin) return aAdmin ? -1 : 1;
      return (a.name||"").localeCompare(b.name||"");
    }).forEach((u)=>{
      const isRowAdmin = (u.isAdmin === true) || ADMIN_UIDS.includes(u.uid);
      const row = document.createElement("div");

      // ✅ FIX: مهم لسهم الكبسولة
      row.dataset.uid = u.uid;

      const ru = isRowAdmin ? "none" : (u.rank || rankOf(u.uid));
      const rankRowClass = (ru && ru !== "none") ? (RANKS[ru]?.rowClass || "") : "";

      row.className = "userRow" + (isRowAdmin ? " admin adminCapsule" : "") + (rankRowClass ? (" " + rankRowClass) : "");

      const left = document.createElement("div");
      left.className = "userMeta";

      const guestHtml = u.isGuest ? `<span class="guestPill">[ضيف]</span>` : "";
      const mutedBadge = (u.muted === true) ? `<span class="mutedEmoji" title="مكتوم">🔇</span>` : "";
      const flag = countryCodeToFlagEmoji(u.country || "");

      const nmColor = isRowAdmin ? "#fff" : effectiveNameColorFor(u.uid, u.nameColor || "#facc15");

      const nameHtml = isRowAdmin
        ? `${ADMIN_ICONS_HTML}<span class="adminNameBig" style="color:#fff;font-weight:900">${escapeHtml(ADMIN_DISPLAY_NAME)}</span> ${guestHtml}`
        : `
          ${(!isRowAdmin && ru && ru !== "none") ? rankIconHtml(ru) : ""}
          <span style="color:${escapeHtml(nmColor)};font-weight:900">${escapeHtml(u.name || "مستخدم")}</span>
          ${guestHtml}
        `;

      const devIcon = (u.device === "mobile") ? "📱" : "🖥️";

      left.innerHTML = `
        <b><span title="الدولة">${flag}</span> ${nameHtml} ${mutedBadge}</b>
        <span>
          <span class="miniPill">
            <span class="devIcon" title="الجهاز">${devIcon}</span>
            <span>${escapeHtml(u.statusText || statusLabel(u.status || "online"))}</span>
          </span>
          ${u.uid === user.uid ? `<span class="miniPill" style="color:${escapeHtml(effectiveNameColorFor(user.uid, profile?.nameColor||"#facc15"))};border-color:rgba(250,204,21,.55)">أنت</span>` : ""}
        </span>
      `;
      row.appendChild(left);

      const actions = document.createElement("div");
      actions.className = "actionsRow";

      if (isRowAdmin && isAdmin){
        const dots = document.createElement("button");
        dots.type = "button";
        dots.className = "adminRoomDots";
        dots.textContent = "⋮";
        dots.title = "قائمة الأدمن";
        dots.addEventListener("click",(e)=>{
          e.stopPropagation();
          if (roomLockBtn) roomLockBtn.style.display = roomLocked ? "none" : "block";
          if (roomUnlockBtn) roomUnlockBtn.style.display = roomLocked ? "block" : "none";
          showRoomMenu(e.clientX, e.clientY);
        });
        actions.appendChild(dots);
      }

      if (u.uid !== user.uid){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ignoreBtn";

        const targetIsAdmin = isRowAdmin;
        const ignored = isCurrentlyIgnored(u.uid);

        btn.textContent = ignored ? "🚫" : "⛔";
        btn.classList.toggle("ignored", ignored);
        btn.disabled = targetIsAdmin;
        btn.title = targetIsAdmin ? "لا يمكن تجاهل الأدمن" : (ignored ? "إلغاء التجاهل" : "تجاهل");

        btn.addEventListener("click",(e)=>{
          e.stopPropagation();
          if (targetIsAdmin) return;
          toggleIgnore(u.uid);
          const nowIgnored = isCurrentlyIgnored(u.uid);
          btn.textContent = nowIgnored ? "🚫" : "⛔";
          btn.classList.toggle("ignored", nowIgnored);
        });

        actions.appendChild(btn);

        const canSeeDots = isAdmin || canMute() || canKick() || canBan();
        if (canSeeDots){
          const more = document.createElement("button");
          more.type = "button";
          more.className = "moreBtn";
          more.textContent = "⋮";
          more.title = "خيارات";

          more.addEventListener("click",(e)=>{
            e.stopPropagation();
            ctxUser = { uid: u.uid, name: u.name, isAdmin: isRowAdmin, isGuest: u.isGuest === true };

            const targetIsAdmin2 = ctxUser.isAdmin === true;
            const showMod = !targetIsAdmin2 && ctxUser.uid !== user.uid;

            const allowKick = showMod && canKick();
            const allowMute = showMod && canMute();
            const allowBan  = showMod && canBan();

            if (modActions) modActions.style.display = (showMod && (allowKick || allowMute || allowBan)) ? "block" : "none";
            if (ctxKickBtn) ctxKickBtn.style.display = allowKick ? "block" : "none";
            if (ctxMuteBtn) ctxMuteBtn.style.display = allowMute ? "block" : "none";
            if (ctxUnmuteBtn) ctxUnmuteBtn.style.display = allowMute ? "block" : "none";
            if (ctxBanBtn) ctxBanBtn.style.display = allowBan ? "block" : "none";
            if (ctxUnbanBtn) ctxUnbanBtn.style.display = allowBan ? "block" : "none";

            if (rankActions) rankActions.style.display = (isAdmin && showMod) ? "block" : "none";
            showCtxMenu(e.clientX, e.clientY);
          });

          actions.appendChild(more);
        }
      }

      row.appendChild(actions);
      onlineList?.appendChild(row);
    });
  });
}

function renderMsgTextToHtml(text){
  let esc = escapeHtml(text || "");
  esc = esc.replace(/:!!10/g, '__EMOJI10__');
  esc = esc.replace(/:!!9/g,  '__EMOJI9__');
  esc = esc.replace(/:!!8/g,  '__EMOJI8__');
  esc = esc.replace(/:!!7/g,  '__EMOJI7__');
  esc = esc.replace(/:!!6/g,  '__EMOJI6__');
  esc = esc.replace(/:!!5/g,  '__EMOJI5__');
  esc = esc.replace(/:!!4/g,  '__EMOJI4__');
  esc = esc.replace(/:!!3/g,  '__EMOJI3__');
  esc = esc.replace(/:!!2/g,  '__EMOJI2__');
  esc = esc.replace(/:!!/g,   '__EMOJI1__');

  for (let i=1;i<=10;i++){
    esc = esc.replaceAll(`__EMOJI${i}__`, `<img class="chatEmojiImg" src="emoji${i}.gif" alt="emoji${i}">`);
  }
  return esc;
}

function renderMessagesFromSnap(snap){
  if (!messagesDiv) return;
  messagesDiv.innerHTML = "";
  const isFirst = !initialLoaded;
  const cutoff = Math.max(joinAtMs || 0, globalClearedAtMs || 0);

  const items = [];
  snap.forEach((docx)=>{
    const m = docx.data();
    const tServer = m.createdAt?.toMillis ? m.createdAt.toMillis() : 0;
    const t = Number(tServer || m.createdAtMs || 0);
    items.push({ id: docx.id, m, t });
  });

  items.sort((a,b)=>{
    if (a.t !== b.t) return a.t - b.t;
    return a.id.localeCompare(b.id);
  });

  for (const it of items){
    const m = it.m;
    const t = it.t;

    if (t < cutoff) continue;

    if (m.system && m.private === true){
      const to = Array.isArray(m.to) ? m.to : [];
      if (!user || !to.includes(user.uid)) continue;
    }

    if (!m.system && m.uid && isInIgnoreWindow(m.uid, t)) continue;

    if (m.system){
      const div = document.createElement("div");
      const isBigBoss = (m.type === "bigBoss");
      div.className = "system" + (isBigBoss ? " systemBigBoss" : "");
      div.textContent = m.text || "";
      messagesDiv.appendChild(div);

      if (!isFirst && (m.type==="join" || m.type==="leave") && m.actorUid && m.actorUid !== user.uid){
        const now = nowMs();
        if (now - lastSoundAt > 800){
          lastSoundAt = now;
          toastSound.currentTime = 0;
          toastSound.play().catch(()=>{});
        }
      }
    } else {
      const row = document.createElement("div");
      row.className = "msgRow" + (m.uid === user.uid ? " me" : "");

      const div = document.createElement("div");
      const isMsgAdmin = (m.isAdmin === true) || (m.uid && ADMIN_UIDS.includes(m.uid));
      div.className = "msg" + (m.uid === user.uid ? " me" : "") + (isMsgAdmin ? " adminMsg" : "");
      div.dataset.mid = it.id;

      const guestHtml = m.isGuest ? `<span class="guestPill">[ضيف]</span>` : "";

      const r = (m.rank && RANKS[m.rank]) ? m.rank : rankOf(m.uid);
      const rankIcon = (!isMsgAdmin && r && r !== "none") ? rankIconHtml(r) : "";
      const nameSizeClass = (!isMsgAdmin && r && r !== "none") ? "rankBig" : "";

      const nmColor = isMsgAdmin ? "#fff" : (rankNameColor(r) || (m.nameColor || "#facc15"));

      const nameHtml = isMsgAdmin
        ? `${ADMIN_ICONS_HTML}<span class="adminNameInChat">${escapeHtml(ADMIN_DISPLAY_NAME)}</span> ${guestHtml}`
        : `${rankIcon}<span style="color:${escapeHtml(nmColor)};font-weight:900;font-size:${(r&&r!=="none") ? "1.15rem" : "1rem"}">${escapeHtml(m.name||"مستخدم")}</span> ${guestHtml}`;

      const replyBlock = m.replyTo && m.replyTo.name && m.replyTo.text
        ? `<div class="replyQuote"><b>رد على: ${escapeHtml(m.replyTo.name)}</b><div>${escapeHtml(m.replyTo.text)}</div></div>`
        : "";

      div.innerHTML = `
        <div class="msgHead">
          <div class="nameTag ${nameSizeClass} ${isMsgAdmin ? "adminNameTag" : ""}">
            ${nameHtml}
          </div>
        </div>
        ${replyBlock}
        <div class="msgText" style="color:${escapeHtml(m.textColor || "#f9fafb")}">${renderMsgTextToHtml(m.text||"")}</div>
        <div class="msgTimeUnder">${escapeHtml(formatTime(t))}</div>
        <button class="replyBtn" type="button" title="رد">↩ رد</button>
      `;

      div.querySelector(".replyBtn")?.addEventListener("click", ()=>{
        replyTarget = {
          id: it.id,
          uid: m.uid,
          name: m.name || "مستخدم",
          text: String(m.text||"").slice(0,160)
        };
        if (replyPreviewName) replyPreviewName.textContent = `رد على: ${replyTarget.name}`;
        if (replyPreviewText) replyPreviewText.textContent = replyTarget.text;
        if (replyPreview) replyPreview.style.display = "flex";
        msgInput?.focus();
      });

      row.appendChild(div);
      messagesDiv.appendChild(row);
    }
  }

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  initialLoaded = true;
}

function startGlobalMessagesListener(){
  initialLoaded = false;
  const q = query(
    collection(db, "globalMessages"),
    orderBy("createdAtMs", "asc"),
    limitToLast(600)
  );

  onSnapshot(q, (snap)=>{
    __lastMessagesSnap = snap;
    renderMessagesFromSnap(snap);
  }, (err)=>{
    console.error("messages listener error:", err);
  });
}

if (replyCancelBtn){
  replyCancelBtn.addEventListener("click", ()=>{
    replyTarget = null;
    if (replyPreview) replyPreview.style.display = "none";
  });
}

/* ctx actions (safe) */
if (ctxKickBtn) ctxKickBtn.addEventListener("click", async ()=>{
  if (!ctxUser || ctxUser.isAdmin) return;
  if (!canKick()) return;
  await adminKick(ctxUser.uid, ctxUser.name || "مستخدم");
  hideCtxMenu();
});
if (ctxMuteBtn) ctxMuteBtn.addEventListener("click", async ()=>{
  if (!ctxUser || ctxUser.isAdmin) return;
  if (!canMute()) return;
  await adminMute(ctxUser.uid, ctxUser.name || "مستخدم");
  hideCtxMenu();
});
if (ctxUnmuteBtn) ctxUnmuteBtn.addEventListener("click", async ()=>{
  if (!ctxUser || ctxUser.isAdmin) return;
  if (!canMute()) return;
  await adminUnmute(ctxUser.uid, ctxUser.name || "مستخدم");
  hideCtxMenu();
});
if (ctxBanBtn) ctxBanBtn.addEventListener("click", async ()=>{
  if (!ctxUser || ctxUser.isAdmin) return;
  if (!canBan()) return;
  await adminBan(ctxUser.uid, ctxUser.name || "مستخدم");
  hideCtxMenu();
});
if (ctxUnbanBtn) ctxUnbanBtn.addEventListener("click", async ()=>{
  if (!ctxUser || ctxUser.isAdmin) return;
  if (!canBan()) return;
  await adminUnban(ctxUser.uid, ctxUser.name || "مستخدم");
  hideCtxMenu();
});

/* rank buttons */
if (ctxRankLegend) ctxRankLegend.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "legend"); hideCtxMenu(); });
if (ctxRankVip)    ctxRankVip.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "vip"); hideCtxMenu(); });
if (ctxRankRoot)   ctxRankRoot.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "root"); hideCtxMenu(); });
if (ctxRankGirl)   ctxRankGirl.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "girl"); hideCtxMenu(); });
if (ctxRankMaster) ctxRankMaster.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "master"); hideCtxMenu(); });
if (ctxRankNone)   ctxRankNone.addEventListener("click", async ()=>{ if (!isAdmin || !ctxUser || ctxUser.isAdmin) return; await setRank(ctxUser.uid, ctxUser.name || "مستخدم", "none"); hideCtxMenu(); });

/* ✅ Mobile-only send */
let __lastSpaceSendAt = 0;
if (msgInput){
  msgInput.addEventListener("keydown",(e)=>{
    if (!__MOBILE_DEVICE) return;

    if (e.key === "Enter"){
      e.preventDefault();
      if (!msgInput.disabled) chatForm?.requestSubmit();
      return;
    }

    if (e.key === " "){
      const v = msgInput.value || "";
      const now = Date.now();
      const fast = (now - __lastSpaceSendAt) < 320;
      __lastSpaceSendAt = now;

      if (fast && collapseSpaces(v).length > 0){
        e.preventDefault();
        if (!msgInput.disabled) chatForm?.requestSubmit();
      }
    }
  });
}

if (chatForm){
  chatForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if (!user || !profile) return;

    const text = collapseSpaces(msgInput.value);
    if (!text) return;

    if (roomLocked && !canWriteWhenLocked()){
      showAppModal({ title:"🚫 الروم مقفل", text:"الأدمن قفل الروم، ما بتقدر تكتب الآن.", actions:[{label:"حسناً", onClick:()=>hideAppModal()}] });
      return;
    }
    if (msgInput.disabled) return;

    if (!isAdmin && isProfane(text)){
      showAppModal({ title:"❌ رسالة مرفوضة", text:"الرسالة مرفوضة (كلام غير لائق).", actions:[{label:"حسناً", onClick:()=>hideAppModal()}] });
      return;
    }

    const replyTo = replyTarget ? { uid: replyTarget.uid, name: replyTarget.name, text: replyTarget.text, id: replyTarget.id } : null;

    msgInput.value = "";
    replyTarget = null;
    if (replyPreview) replyPreview.style.display = "none";

    const finalName = isAdmin ? ADMIN_DISPLAY_NAME : profile.name;

    await addDoc(collection(db, "globalMessages"), {
      system:false, text,
      uid:user.uid,
      name: finalName,
      gender:profile.gender,
      age:profile.age,
      country: profile.country || "",
      nameColor:profile.nameColor,
      textColor:profile.textColor,
      isAdmin, isGuest,
      replyTo,
      rank: rankOf(user.uid),
      createdAt: serverTimestamp(),
      createdAtMs: nowMs()
    });
  });
}

function cleanupGuestLocal(){
  try{
    if (user?.isAnonymous){
      localStorage.removeItem(profKey(user.uid));
      localStorage.removeItem(statusKey(user.uid));
      localStorage.removeItem(ignoreKey(user.uid));
      localStorage.removeItem(adminSessionKey(user.uid));
    }
  }catch{}
}

if (exitBtn){
  exitBtn.addEventListener("click", async ()=>{
    try{
      if (user && profile){
        await writeJoinLeave("leave");
        await remove(ref(rtdb, "onlineUsers/" + user.uid));
      }
    }catch{}
    cleanupGuestLocal();
    location.href = "index.html";
  });
}

if (statusSelect){
  statusSelect.addEventListener("change", async ()=>{
    if (!user || !profile) return;
    const s = statusSelect.value || "online";
    localStorage.setItem(statusKey(user.uid), s);
    await updatePresenceStatus(s);
  });
}

if (adminLoginBtn){
  adminLoginBtn.addEventListener("click", ()=>{
    setErr(adminErr, "");
    if (!user) return;
    const uidAllowed = ADMIN_UIDS.includes(user.uid);
    if (!uidAllowed){
      setErr(adminErr, "هذه الصلاحية غير متاحة لهذا الحساب.");
      return;
      document.body.classList.add("isAdmin");
    }
    const u = (adminUser?.value || "").trim();
    const p = (adminPass?.value || "").trim();
    if (u !== ADMIN_USERNAME || p !== ADMIN_PASSWORD){
      setErr(adminErr, "بيانات ADMIN غير صحيحة.");
      return;
    }
    localStorage.setItem(adminSessionKey(user.uid), "1");
    setErr(adminErr, "✅ تم تفعيل الأدمن.");
    isAdmin = true;
    document.getElementById("radioBtn")?.style?.setProperty("display","inline-flex");

    if (logBtn) logBtn.style.display = "inline-flex";
    if (bgBtn)  bgBtn.style.display  = "inline-flex";
    if (adminClearBtn) adminClearBtn.style.display = "inline-flex";
    document.body.dataset.admin = "1";

    try{ ensureThemeStillAllowed(); }catch{}
    try{ writeSystemText("✨ دخل كبيرهم ✨", "bigBoss", {uid:user.uid,name:ADMIN_DISPLAY_NAME}); }catch{}
  });
}

function showForm(){ if (formBox) formBox.style.display = "block"; }

if (homeBtn){
  homeBtn.addEventListener("click", ()=>{
    cleanupGuestLocal();
    location.href = "index.html";
  });
}
if (backListBtn){
  backListBtn.addEventListener("click", ()=>{
    setErr(modalErr,"");
    if (formBox) formBox.style.display = "none";
  });
}

if (chooseLogin){
  chooseLogin.addEventListener("click", ()=>{
    setErr(modalErr,"");
    if (!user){ location.href = "login.html"; return; }
    if (user.isAnonymous){ location.href = "login.html"; return; }
    isGuest = false;
    showForm();
  });
}

if (chooseGuest){
  chooseGuest.addEventListener("click", async ()=>{
    setErr(modalErr,"");
    if (user && !user.isAnonymous){
      setErr(modalErr, "أنت مسجل دخول بالفعل—استخدم خيار تسجيل دخول.");
      return;
    }
    try{
      if (!user){
        await signInAnonymously(auth);
      }
      isGuest = true;
      showForm();
    }catch(err){
      setErr(modalErr, "❌ فشل الدخول كضيف. جرّب مرة ثانية.");
      console.error(err);
    }
  });
}

if (enterBtn){
  enterBtn.addEventListener("click", async ()=>{
    setErr(modalErr, "");

    const rawName = collapseSpaces(nameInput?.value);
    const g = genderInput?.value;
    const age = Number(ageInput?.value);
    const country = (countryInput?.value || "").trim().toUpperCase();

    if (!rawName || rawName.length < 3){ setErr(modalErr, "الاسم لازم يكون 3 أحرف على الأقل."); return; }
    if (!g){ setErr(modalErr, "اختار الجنس."); return; }
    if (!Number.isFinite(age) || age < 10){ setErr(modalErr, "العمر لازم يكون 10 أو أكثر."); return; }
    if (!country || country.length !== 2){ setErr(modalErr, "اختار الدولة."); return; }
    if (!user){ setErr(modalErr, "اختر طريقة الدخول أولاً."); return; }

    profile = {
      name: rawName,
      gender: g,
      age,
      country,
      nameColor: nameColorInput?.value || "#facc15",
      textColor: textColorInput?.value || "#f9fafb"
    };

    if (!user.isAnonymous){
      localStorage.setItem(profKey(user.uid), JSON.stringify(profile));
    }

    const savedStatus = localStorage.getItem(statusKey(user.uid)) || "online";
    if (statusSelect) statusSelect.value = savedStatus;

    try{
      await enterChat(savedStatus);
    }catch(err){
      console.error(err);
      setErr(modalErr, "❌ صار خطأ بالدخول للشات. جرّب مرة ثانية.");
    }
  });
}

async function enterChat(statusVal){
  isGuest = !!user?.isAnonymous;
  isAdmin = ADMIN_UIDS.includes(user.uid) && (localStorage.getItem(adminSessionKey(user.uid)) === "1") && !isGuest;
  document.getElementById("radioBtn")?.style?.setProperty(
  "display",
  isAdmin ? "inline-flex" : "none"
    
);

  if (profile && isAdmin){
    profile.name = ADMIN_DISPLAY_NAME;
  }

  if (logBtn) logBtn.style.display = isAdmin ? "inline-flex" : "none";
  if (bgBtn)  bgBtn.style.display  = isAdmin ? "inline-flex" : "none";
  if (adminClearBtn) adminClearBtn.style.display = isAdmin ? "inline-flex" : "none";

  msgInput.disabled = false;
  sendBtn.disabled = false;

  joinAtMs = nowMs();

  await updatePresenceStatus(statusVal, true);
  await writeJoinLeave("join");

  if (modal) modal.style.display = "none";

  initThemeSystem();
  loadIgnoreWindows();
  startGlobalBgListener();
  startRanksListener();
  startClearMetaListener();
  startRoomLockListener();
  startOnlineListener();
  startGlobalMessagesListener();
  startModerationListener();

  if (roomLocked && !canWriteWhenLocked()){
    msgInput.disabled = true;
    sendBtn.disabled = true;
    msgInput.placeholder = "🚫 الروم مقفل بواسطة الأدمن";
  }

  startDhikrLoop();
  closeOnlineDrawer();
}

onAuthStateChanged(auth, async (u)=>{
  user = u || null;
  if (meBadge) meBadge.textContent = "أنت";
  watchConnection();

  let loadedSaved = false;
  if (user && !user.isAnonymous){
    const savedProfile = localStorage.getItem(profKey(user.uid));
    if (savedProfile){
      try{
        const p = JSON.parse(savedProfile);
        if (nameInput) nameInput.value = p.name || "";
        if (genderInput) genderInput.value = p.gender || "";
        if (ageInput) ageInput.value = p.age || "";
        if (countryInput) countryInput.value = p.country || "JO";
        if (nameColorInput) nameColorInput.value = p.nameColor || randHexColor();
        if (textColorInput) textColorInput.value = p.textColor || randHexColor();
        loadedSaved = true;
      }catch{}
    }
  }
  if (!loadedSaved){
    if (nameColorInput) nameColorInput.value = randHexColor();
    if (textColorInput) textColorInput.value = randHexColor();
    if (countryInput) countryInput.value = "JO";
  }

  if (formBox) formBox.style.display = "none";
  setErr(modalErr, "");
  setErr(adminErr, "");
  if (modal) modal.style.display = "flex";
});

window.addEventListener("beforeunload", ()=>{
  try{
    if (user && profile){
      writeJoinLeave("leave");
      remove(ref(rtdb, "onlineUsers/" + user.uid));
    }
  }catch{}
  cleanupGuestLocal();
});

/* ✅ Dhikr notifications */
const DHIKR = ["صلي على النبي", "سبحان الله", "الحمد لله", "لا اله الا الله", "الله اكبر"];
let __dhikrStarted = false;
function showDhikr(){
  const txt = DHIKR[Math.floor(Math.random()*DHIKR.length)];
  const side = Math.random() < .5 ? "left" : "right";
  const top = Math.floor(90 + Math.random() * (window.innerHeight - 200));
  const el = document.createElement("div");
  el.className = "dhikrToast";
  el.textContent = txt;
  el.style.top = top + "px";
  el.style[side] = "14px";
  document.body.appendChild(el);
  setTimeout(()=>{ try{ el.remove(); }catch{} }, 5200);
}
function startDhikrLoop(){
  if (__dhikrStarted) return;
  __dhikrStarted = true;
  setTimeout(showDhikr, 1500);
  setInterval(showDhikr, 30000);
}

/* =========================================================
   ✅ Capsule Arrow (Online List) - SAFE PATCH
   ضعه آخر room.js (تم تثبيته هنا بشكل صحيح)
========================================================= */

const CAPSULE_PREVIEW_IMAGES = [
  "../media/ranks/capsule1.gif",
  "../media/ranks/capsule2.gif",
  "../media/ranks/capsule3.gif",
  "../media/ranks/capsule4.gif",
  "../media/ranks/capsule5.gif",
];


let capDropEl = null;

function ensureCapDropdown(){
  if (capDropEl) return capDropEl;

  capDropEl = document.createElement("div");
  capDropEl.className = "capDropdown";
  capDropEl.innerHTML = `
    <div class="capGrid" id="capGrid"></div>
    <button class="capReset" type="button">🧽 افتراضي</button>
  `;
  document.body.appendChild(capDropEl);

  // build images
  const grid = capDropEl.querySelector("#capGrid");
  CAPSULE_PREVIEW_IMAGES.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "capOpt";
    btn.innerHTML = `<img src="${src}" alt="capsule-${idx+1}">`;
    btn.addEventListener("click", () => {
      const target = document.getElementById(`capsulePick${idx+1}`);
      if (target) target.click();
      hideCapDropdown();
    });
    grid.appendChild(btn);
  });

  // reset
  capDropEl.querySelector(".capReset")?.addEventListener("click", () => {
    const target = document.getElementById("capsuleReset");
    if (target) target.click();
    hideCapDropdown();
  });

  // close on outside click
  document.addEventListener("mousedown", (e) => {
    if (!capDropEl) return;
    if (capDropEl.style.display !== "block") return;
    if (capDropEl.contains(e.target)) return;
    // لو كبست على السهم نفسه لا تسكر فوراً
    if (e.target && e.target.classList && e.target.classList.contains("capArrow")) return;
    hideCapDropdown();
  });

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideCapDropdown();
  });

  return capDropEl;
}

function showCapDropdown(anchorBtn){
  const el = ensureCapDropdown();
  const r = anchorBtn.getBoundingClientRect();
  el.style.display = "block"; // أولاً عشان offsetWidth يكون صحيح
  const w = el.offsetWidth || 280;
  el.style.left = Math.max(12, Math.min(window.innerWidth - 12 - w, r.left)) + "px";
  el.style.top  = (r.bottom + 10) + "px";
}
function hideCapDropdown(){
  if (!capDropEl) return;
  capDropEl.style.display = "none";
}

// ✅ نضيف السهم بجانب “الحالة تحت الاسم” لصفّك أنت فقط
function attachCapsuleArrowToMyRow(){
  if (!user || !user.uid) return;

  const rows = Array.from(document.querySelectorAll("#onlineList .userRow"));
  if (!rows.length) return;

  // يعتمد على dataset.uid (أضفناه بالأعلى)
  const myRow = rows.find(r => r.dataset && r.dataset.uid === user.uid);
  if (!myRow) return;

  // سطر الحالة: .userMeta > span (هو الثاني)
  const statusLine = myRow.querySelector(".userMeta > span");
  if (!statusLine) return;

  // لا تكرر
  if (statusLine.querySelector(".capArrow")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "capArrow";
  btn.title = "تغيير الكبسولة";
  btn.textContent = "🔽";

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const el = ensureCapDropdown();
    if (el.style.display === "block") hideCapDropdown();
    else showCapDropdown(btn);
  });

  statusLine.appendChild(btn);
}

// 🔁 شغّلها كل شوي بشكل “لطيف” لأن قائمة المتواجدين بتنعاد رسمها
setInterval(attachCapsuleArrowToMyRow, 800);









