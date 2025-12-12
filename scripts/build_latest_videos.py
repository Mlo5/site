import os, re, json, requests, feedparser
from datetime import datetime, timezone

CHANNEL_HANDLE_URL = os.environ.get("CHANNEL_HANDLE_URL", "").strip()
OUT_PATH = os.environ.get("OUT_PATH", "latest-videos.json")
LIMIT = int(os.environ.get("LIMIT", "15"))

def now_iso():
  return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def get_channel_id(handle_url: str) -> str:
  html = requests.get(handle_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30).text
  m = re.search(r'"channelId"\s*:\s*"([^"]+)"', html)
  if not m:
    m = re.search(r'channelId=([A-Za-z0-9_\-]+)', html)
  if not m:
    raise RuntimeError("Could not resolve channelId from handle URL")
  return m.group(1)

def video_id_from_link(link: str) -> str:
  m = re.search(r"v=([A-Za-z0-9_\-]{6,})", link)
  return m.group(1) if m else ""

def thumb_from_id(vid: str) -> str:
  return f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg" if vid else ""

def main():

  channel_id = "UCJ7ltkpYPM7xI3DgMR1vvbg"
  feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"

  feed = feedparser.parse(feed_url)
  items = []
  for e in feed.entries[:LIMIT]:
    vid = getattr(e, "yt_videoid", "") or video_id_from_link(getattr(e, "link", ""))
    title = getattr(e, "title", "") or ""
    link = getattr(e, "link", "") or ""

    date_str = ""
    try:
      if getattr(e, "published_parsed", None):
        dt = datetime(*e.published_parsed[:6], tzinfo=timezone.utc)
        date_str = dt.strftime("%Y-%m-%d")
    except Exception:
      date_str = ""

    items.append({
      "title": title,
      "url": link,
      "type": "long",
      "duration": "",
      "date": date_str,
      "thumb": thumb_from_id(vid),
      "videoId": vid
    })

  out = {
    "generatedAt": now_iso(),
    "channelHandleUrl": CHANNEL_HANDLE_URL,
    "channelId": channel_id,
    "videos": items
  }

  os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
  with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
  main()
