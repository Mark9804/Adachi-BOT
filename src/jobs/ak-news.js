// noinspection ES6UnusedImports
import lodash from "lodash";
import moment from "moment-timezone";
import fetch from "node-fetch";
import path from "path";
import { checkAuth } from "#utils/auth";
import { getCache } from "#utils/cache";
import db from "#utils/database";
import { getWordByRegex } from "#utils/tools";

const weiboQueryUrl =
  "https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937";
const inGameQueryUrl = "https://ak-conf.hypergryph.com/config/prod/announce_meta/IOS/announcement.meta.json";

const general_header = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "zh",
};

function initDB() {
  for (const t of ["weibo", "ingame"]) {
    if (!db.includes("ak-news", "timestamp", { type: t })) {
      db.push("ak-news", "timestamp", { type: t, identifier: 0 });
    }
  }
}

function getJsonContent(type) {
  const queryUrl = "weibo" === type ? weiboQueryUrl : inGameQueryUrl;
  try {
    return fetch(queryUrl, {
      method: "GET",
      headers: general_header,
    }).then((res) => res.json());
  } catch (e) {
    global.bots.logger.error(`获取明日方舟${"weibo" === type ? "官微内容" : "游戏内公告"}失败，原因为${e}`);
    return undefined;
  }
}

async function akNewsUpdate() {
  initDB();
  const weiboContents = await getJsonContent("weibo");
  if (undefined !== weiboContents && lodash.hasIn(weiboContents, "data.cards")) {
    const weiboCardContents = weiboContents.data.cards || [];
    db.set("ak-news", "cards", weiboCardContents);
  }
  const inGameContent = await getJsonContent("ingame");
  if (undefined !== inGameContent && lodash.hasIn(inGameContent, "announceList")) {
    const inGameContents = inGameContent.announceList || [];
    db.set("ak-news", "ingame_news", inGameContents);
  }
  return !(undefined === weiboContents && undefined === inGameContent);
}

async function akNewsNotice() {
  initDB();

  //构建结构化数据
  const constructWeiboContent = (rawText) =>
    rawText
      .replace(/<br \/>/g, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/^\s*\\n\s*/g, "");
  const getOrigWeiboPic = (rawPicObject) =>
    lodash.hasIn(rawPicObject, "large") ? rawPicObject.large.url : rawPicObject.url;
  const getFullContentLink = (rawText) => {
    const status = getWordByRegex(rawText, "/status/[0-9]+")[0];
    return undefined !== status ? "https://m.weibo.cn" + status : "";
  };

  const weiboDatas = db.get("ak-news", "cards");
  const weiboNews = [];
  const { identifier: lastWeiboSentTime } = db.get("ak-news", "timestamp", { type: "weibo" });
  const lastWeiboTimestamp = parseInt(lastWeiboSentTime);

  for (const n of lodash.orderBy(weiboDatas, [(c) => parseInt(c.id)], "desc")) {
    // noinspection JSUnresolvedVariable
    const singleBlog = n.mblog;
    const news = {};

    if (!lodash.hasIn(singleBlog, "text")) {
      continue;
    }

    const created_at = singleBlog.created_at || 0;
    const text = singleBlog.text || "";
    const pics = singleBlog.pics || [];
    if (moment(new Date(created_at)).tz("Asia/Shanghai") - moment(lastWeiboTimestamp).tz("Asia/Shanghai") >= 0) {
      news["text"] = constructWeiboContent(text);
      news["full_content_url"] = getFullContentLink(text);
      const origPics = [];
      for (const pic of pics) {
        const picUrl = getOrigWeiboPic(pic);
        origPics.push(picUrl);
      }
      news["pics"] = origPics;
      weiboNews.push(news);
    }
  }

  const ingameNews = [];
  const ingameDatas = db.get("ak-news", "ingame_news");
  const { identifier: lastPostSentIdentifier } = db.get("ak-news", "timestamp", { type: "ingame" }) || 0;

  for (const n of lodash.orderBy(ingameDatas, [(c) => parseInt(c.announceId)], "desc")) {
    const news = {};
    const { announceId: postIdentifier, title: postTitle, webUrl: postUrl } = n;

    if (postIdentifier > lastPostSentIdentifier) {
      news["text"] = postTitle || "";
      news["url"] = postUrl || "";

      ingameNews.push(news);
    }

    // 推送
    const cacheDir = path.resolve(global.rootdir, "data", "image", "ak-news");
    for (const n of weiboNews) {
      const text =
        n.text.endsWith("全文") && undefined !== n.full_content_url ? `${n.text}：${n.full_content_url}` : n.text;
      for (const bot of global.bots) {
        const ms = bot.boardcast(text, "group", (c) => true);
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
      // 推送图片
      const pics = n.pics || [];
      for (const c of pics) {
        let image64;
        try {
          image64 = await getCache(c, cacheDir, "base64");
        } catch (e) {
          //do nothing
        }
        if (undefined !== image64) {
          const picMessage = `[CQ:image,type=image,file=base64://${image64}]`;
          for (const bot of global.bots) {
            const ms = bot.boardcast(picMessage, "group", (c) => true);
            await new Promise((resolve) => setTimeout(resolve, ms));
          }
        }
      }

      const sentTimestamp = moment().tz("Asia/Shanghai").valueOf();
      db.update("ak-news", "timestamp", { type: "weibo" }, { identifier: sentTimestamp });
    }
  }
}

export { akNewsNotice, akNewsUpdate };
