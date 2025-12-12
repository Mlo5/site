// scripts/fetch-latest-long.js
// يجلب آخر فيديو "طويل" (أكثر من 60 ثانية) من القناة ويكتب latest-long.json

const fs = require("fs");

const API_KEY = process.env.YT_API_KEY;
const CHANNEL_ID = process.env.YT_CHANNEL_ID;

if (!API_KEY) {
  console.error("❌ Missing YT_API_KEY");
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error("❌ Missing YT_CHANNEL_ID");
  process.exit(1);
}

// تحويل مدة ISO 8601 (مثل PT1H2M3S) إلى ثواني
function iso8601ToSeconds(iso) {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

async function yt(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`YouTube API error ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function main() {
  // 1) جلب بيانات القناة + Playlist الرفع
  const channelRes = await yt(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${encodeURIComponent(
      CHANNEL_ID
    )}&key=${encodeURIComponent(API_KEY)}`
  );

  const channel = channelRes.items?.[0];
  if (!channel) throw new Error("Channel not found");

  const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error("Uploads playlist not found");

  // 2) جلب آخر 25 فيديو مرفوع
  const playlistRes = await yt(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${encodeURIComponent(
      uploadsId
    )}&maxResults=25&key=${encodeURIComponent(API_KEY)}`
  );

  const videos = (playlistRes.items || [])
    .map((item) => ({
      id: item.contentDetails?.videoId,
      title: item.snippet?.title,
      publishedAt:
        item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt,
      thumbnail:
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url,
    }))
    .filter((v) => v.id);

  if (!videos.length) throw new Error("No videos found");

  // 3) جلب تفاصيل المدة والبث
  const ids = videos.map((v) => v.id).join(",");
  const detailsRes = await yt(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,liveStreamingDetails,status&id=${encodeURIComponent(
      ids
    )}&key=${encodeURIComponent(API_KEY)}`
  );

  const byId = new Map();
  for (const it of detailsRes.items || []) {
    byId.set(it.id, {
      duration: it.contentDetails?.duration || "PT0S",
      isLive: !!it.liveStreamingDetails,
      privacy: it.status?.privacyStatus,
    });
  }

  // 4) اختيار أول فيديو طويل (غير بث مباشر، عام، أكثر من 60 ثانية)
  const latestLong = videos.find((v) => {
    const d = byId.get(v.id);
    if (!d) return false;
    if (d.privacy !== "public") return false;
    if (d.isLive) return false;
    return iso8601ToSeconds(d.duration) > 60;
  });

  if (!latestLong) {
    throw new Error("No long public non-live video found");
  }

  // 5) إخراج الملف
  const output = {
    channelId: CHANNEL_ID,
    updatedAt: new Date().toISOString(),
    latestLong: {
      id: latestLong.id,
      url: `https://www.youtube.com/watch?v=${latestLong.id}`,
      title: latestLong.title,
      publishedAt: latestLong.publishedAt,
      thumbnail: latestLong.thumbnail,
    },
  };

  fs.writeFileSync("latest-long.json", JSON.stringify(output, null, 2), "utf8");
  console.log("✅ latest-long.json updated");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
