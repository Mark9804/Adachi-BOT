// noinspection JSUnresolvedVariable
import lodash from "lodash";
import moment from "moment-timezone";
import fetch from "node-fetch";
import path from "path";
import { checkAuth } from "#utils/auth";
import { getCache } from "#utils/cache";
import db from "#utils/database";
import { render } from "#utils/render";
import { getWordByRegex } from "#utils/tools";

function getWeiboUrl(uid) {
  return `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=107603${uid}`;
}

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
      db.push("ak-news", "timestamp", { type: t, identifier: 98 }); // 方舟开服公告是 98
    }
  }
}

function getJsonContent(weiboUid) {
  const queryUrl = weiboUid.toString().includes("https://ak-conf") ? weiboUid : getWeiboUrl(weiboUid);
  try {
    return fetch(queryUrl, {
      method: "GET",
      headers: general_header,
    }).then((res) => res.json());
  } catch (e) {
    global.bots.logger.error(`获取明日方舟${queryUrl.includes("weibo") ? "官微内容" : "游戏内公告"}失败，原因为${e}`);
    return undefined;
  }
}

async function akNewsUpdate() {
  initDB();

  const arknightsOfficialWeiboUid = 6279793937;
  const endfieldWeiboUid = 7745672941;
  const cubesCollectiveWeiboUid = 7719744839;
  const inGameQueryUrl = "https://ak-conf.hypergryph.com/config/prod/announce_meta/IOS/announcement.meta.json";

  const weiboContents = await getJsonContent(arknightsOfficialWeiboUid);
  if (undefined !== weiboContents && lodash.hasIn(weiboContents, "data.cards")) {
    const weiboCardContents = weiboContents.data.cards || [];
    db.set("ak-news", "cards", weiboCardContents);
  }
  const inGameContent = await getJsonContent(inGameQueryUrl);
  if (undefined !== inGameContent && lodash.hasIn(inGameContent, "announceList")) {
    const inGameContents = inGameContent.announceList || [];
    db.set("ak-news", "ingame_news", inGameContents);
  }
  const endfieldWeiboContent = await getJsonContent(endfieldWeiboUid);
  if (undefined !== endfieldWeiboContent && lodash.hasIn(endfieldWeiboContent, "data.cards")) {
    const endfieldWeiboContents = endfieldWeiboContent.data.cards || [];
    db.set("ak-news", "endfield_news", endfieldWeiboContents);
  }
  const cubesCollectiveWeiboContent = await getJsonContent(cubesCollectiveWeiboUid);
  if (undefined !== cubesCollectiveWeiboContent && lodash.hasIn(cubesCollectiveWeiboContent, "data.cards")) {
    const cubesCollectiveWeiboContents = cubesCollectiveWeiboContent.data.cards || [];
    db.set("ak-news", "cubes_collective_news", cubesCollectiveWeiboContents);
  }
  return !(undefined === weiboContents && undefined === inGameContent && undefined === endfieldWeiboContent);
}

async function doWeiboNotice(weiboDatas, senderName="明日方舟官微") {
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

  const weiboNews = [];
  const { identifier: lastWeiboSentTime } = db.get("ak-news", "timestamp", { type: "weibo" });
  const lastWeiboTimestamp = parseInt(lastWeiboSentTime);
  let weiboSentTime = lastWeiboTimestamp;

  // noinspection JSUnresolvedVariable
  for (const n of lodash.orderBy(weiboDatas, [(c) => parseInt(c.mblog.id)], "asc")) {
    // noinspection JSUnresolvedVariable
    const singleBlog = n.mblog;
    const news = {};

    if (!lodash.hasIn(singleBlog, "text")) {
      continue;
    }

    const created_at = singleBlog.created_at || 0;
    const text = singleBlog.text || "";
    const pics = singleBlog.pics || [];
    if (moment(new Date(created_at)).tz("Asia/Shanghai") - moment(lastWeiboTimestamp).tz("Asia/Shanghai") > 0) {
      // 只发送最新的微博
      console.log(`发送时间戳为${created_at}（${moment(new Date(created_at)).tz("Asia/Shanghai").valueOf()}）的微博`);
      if (!lodash.hasIn(singleBlog, "retweeted_status")) {
        // 如果不是转发内容，则结构化消息中不会有 retweeted_status 这个键
        news["text"] =
          undefined !== constructWeiboContent(text)
            ? `来自${senderName}的微博消息：\n` + constructWeiboContent(text)
            : " ";
        news["full_content_url"] = getFullContentLink(text);
        const origPics = [];
        for (const pic of pics) {
          const picUrl = getOrigWeiboPic(pic);
          origPics.push(picUrl);
        }
        news["pics"] = origPics;
      } else {
        // 如果有 retweeted_status，代表是转发消息（废话）
        const retweetedBlog = singleBlog.retweeted_status || {};
        const retweetedText = retweetedBlog.text || "";
        const retweetedPics = retweetedBlog.pics || [];

        news["text"] =
          undefined !== constructWeiboContent(retweetedText)
            ? `来自${senderName}的微博消息：\n` + constructWeiboContent(retweetedText)
            : " ";
        news["full_content_url"] = getFullContentLink(retweetedText);
        const origPics = [];
        for (const pics of retweetedPics) {
          const picUrl = getOrigWeiboPic(pics);
          origPics.push(picUrl);
        }
        news["pics"] = origPics;
      }
      weiboNews.push(news);
      const sentTimestamp = moment(new Date(created_at)).tz("Asia/Shanghai").valueOf();
      if (sentTimestamp > weiboSentTime) {
        weiboSentTime = sentTimestamp;
        console.log(`设置最后发送时间戳为${weiboSentTime}`);
      }
      console.log(`将${weiboSentTime}写入数据库`);
      db.update("ak-news", "timestamp", { type: "weibo" }, { identifier: weiboSentTime });
    } else {
      console.log(
        `忽略创建时间戳为${created_at}（${moment(new Date(created_at)).tz("Asia/Shanghai").valueOf()}）<= ${moment(
          lastWeiboTimestamp
        )
          .tz("Asia/Shanghai")
          .valueOf()}的微博内容`
      );
    }
  }

  // 推送微博内容
  const cacheDir = path.resolve(global.rootdir, "data", "image", "ak-news");
  for (const n of weiboNews) {
    const text =
      n.text.endsWith("全文") && undefined !== n.full_content_url ? `${n.text}：${n.full_content_url}` : n.text + " ";
    for (const bot of global.bots) {
      const ms = bot.boardcast(
        text,
        "group",
        (c) => true === checkAuth({ sid: c.group_id }, global.innerAuthName.akNews, false)
      );
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
    // 推送微博图片
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
          const ms = bot.boardcast(
            picMessage,
            "group",
            (c) => true === checkAuth({ sid: c.group_id }, global.innerAuthName.akNews, false)
          );
          await new Promise((resolve) => setTimeout(resolve, ms));
        }
      }
    }
  }
}

async function akNewsNotice() {
  initDB();

  const weiboDatas = db.get("ak-news", "cards");
  await doWeiboNotice(weiboDatas, "明日方舟官微");

  const endfieldWeiboDatas = db.get("ak-news", "endfield_news");
  await doWeiboNotice(endfieldWeiboDatas, "明日方舟终末地官微");

  const cubesCollectiveWeiboDatas = db.get("ak-news", "cubes_collective_news");
  await doWeiboNotice(cubesCollectiveWeiboDatas, "CubesCollective官微");

  // 获取游戏内公告内容
  const ingameNews = [];
  const ingameDatas = db.get("ak-news", "ingame_news");
  const { identifier: lastPostSentIdentifier } = db.get("ak-news", "timestamp", { type: "ingame" }) || 0;

  for (const n of lodash.orderBy(ingameDatas, [(c) => parseInt(c.announceId)], "asc")) {
    const news = {};
    const { announceId: postIdentifier, title: postTitle, webUrl: postUrl } = n;

    if (postIdentifier > lastPostSentIdentifier) {
      news["text"] = postTitle || "";
      news["url"] = postUrl || "";
      news["announceId"] = postIdentifier || 98;
      ingameNews.push(news);
    }
  }

  // 推送制作组通讯
  for (const n of ingameNews) {
    const noticeText = n.text || "";
    const imageUrl = n.url || "";
    const postIdentifier = n.announceId ? parseInt(n.announceId) : 98;
    if ("" !== imageUrl) {
      // 返回ImageCQ
      const imageCQ = await render({ bot: undefined }, imageUrl, "arknights");
      const text = `《明日方舟》游戏内公告：\n--------\n${noticeText}:\n${undefined !== imageCQ ? imageCQ : ""}`;

      for (const bot of global.bots) {
        const ms = bot.boardcast(
          text,
          "group",
          (c) => true === checkAuth({ sid: c.group_id }, global.innerAuthName.akNews, false)
        );
        await new Promise((resolve) => setTimeout(resolve, ms));
      }
    }
    db.update("ak-news", "timestamp", { type: "ingame" }, { identifier: postIdentifier });
  }
}

export { akNewsNotice, akNewsUpdate };
