import path from "path";
import lodash from "lodash";
import db from "./database.js";
import { checkAuth } from "./auth.js";
import { getCache } from "./cache.js";

const running = { mysNewsNotice: false };

function initDB() {
  for (const t of ["announcement", "event", "information"]) {
    if (!db.includes("news", "timestamp", "type", t)) {
      db.push("news", "timestamp", { type: t, time: 0 });
    }
  }
}

function wrapContent(rawContent) {
  let isSentenceEnd = false;
  const lastCharIsEndingChar = "。！？～~".split("").includes(rawContent[rawContent.length - 1]);
  if (rawContent.length < 80) {
    isSentenceEnd = true;
  } else if (lastCharIsEndingChar) {
    // 如果内容最后一个字符串是结束性质符号，则认为说完了
    isSentenceEnd = true;
  }
  return `${rawContent}${isSentenceEnd ? "" : "……"}`;
}

async function mysNewsNotice() {
  if (1 !== global.config.noticeMysNews) {
    return;
  }

  if (true === running.mysNewsNotice) {
    return;
  }

  // XXX currently no return before set this false
  running.mysNewsNotice = true;

  initDB();

  const cacheDir = path.resolve(global.rootdir, "data", "image", "news");
  const data = db.get("news", "data");

  for (const t of Object.keys(data)) {
    if (!lodash.hasIn(data[t], ["data", "list"]) || !Array.isArray(data[t].data.list)) {
      continue;
    }

    const news = data[t].data.list;

    for (const n of lodash.reverse(news)) {
      if (!lodash.hasIn(n, "post")) {
        continue;
      }

      const timestamp = db.get("news", "timestamp");
      let lastTimeStamp = (timestamp.find((c) => t === c.type) || {}).time || 0;
      const silent = 0 === lastTimeStamp;
      const post = n.post || {};
      const { subject, content } = post;
      let image;

      if ("string" === typeof post.images[0]) {
        try {
          image = await getCache(post.images[0], cacheDir, "base64");
        } catch (e) {
          // do nothing
        }
      }

      const imageCQ = undefined !== image ? `[CQ:image,type=image,file=base64://${image}]` : "";
      const url = "string" === typeof post.post_id ? `https://bbs.mihoyo.com/ys/article/${post.post_id}` : "";
      const items = [
        "string" === typeof subject ? subject : "",
        imageCQ,
        "string" === typeof content ? wrapContent(content) : "",
        url,
      ];
      const stamp = post.created_at || 0;

      // 立即写入，忽略所有的发送失败
      lastTimeStamp = Math.max(stamp, lastTimeStamp);
      db.update("news", "timestamp", { type: t }, { time: lastTimeStamp });

      if (false === silent && stamp > lastTimeStamp && lodash.some(items, (c) => "string" === typeof c && "" !== c)) {
        const message = items.filter((c) => "string" === typeof c && "" !== c).join("\n");

        for (const bot of global.bots) {
          const ms = bot.boardcast(
            message,
            "group",
            (c) => false !== checkAuth({ sid: c.group_id }, global.innerAuthName.mysNews, false)
          );
          await new Promise((resolve) => setTimeout(resolve, ms));
        }
      }
    }
  }

  running.mysNewsNotice = false;
}

export { mysNewsNotice };
