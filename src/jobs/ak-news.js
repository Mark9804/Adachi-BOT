import lodash from "lodash";
import moment from "moment-timezone";
import fetch from "node-fetch";
import path from "path";
import { checkAuth } from "#utils/auth";
import { getCache } from "#utils/cache";
import db from "#utils/database";

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

function akNewsNotice() {
  initDB();
}

export { akNewsNotice, akNewsUpdate };
