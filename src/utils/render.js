/* global config, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const settings = {
  hello: {
    "genshin-aby": true,
    "genshin-artifact": false,
    "genshin-card": true,
    "genshin-character": false,
    "genshin-gacha": false,
    "genshin-overview": false,
    "genshin-info": true,
  },
  scale: {
    "genshin-aby": 2,
    "genshin-artifact": 1.2,
    "genshin-card": 1.5,
    "genshin-character": 1.5,
    "genshin-gacha": 1.5,
    "genshin-overview": 1.2,
    "genshin-info": 1.5,
  },
};
const settingsDefault = { hello: false, scale: 1.5 };
let browser;

async function launch() {
  if (undefined === browser) {
    browser = await puppeteer.launch({
      headless: 0 === config.viewDebug,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

async function render(msg, data, name) {
  let base64;

  if ((settings.hello[name] || settingsDefault.hello) && config.warnTimeCosts) {
    msg && msg.bot.say(msg.sid, "正在绘图，请稍等……", msg.type, msg.uid);
  }

  try {
    const dataStr = JSON.stringify(data);

    if ("string" === typeof rootdir) {
      // 该文件仅用于辅助前端调试，无实际作用亦不阻塞
      const record = path.resolve(rootdir, "data", "record", `${name}.json`);
      fs.writeFile(record, dataStr, () => {});
    }

    await launch();
    const page = await browser.newPage();

    // 只在机器人发送图片时设置 viewport
    if (msg) {
      await page.setViewport({
        width: await page.evaluate(() => document.body.clientWidth),
        height: await page.evaluate(() => document.body.clientHeight),
        deviceScaleFactor: settings.scale[name] || settingsDefault.scale,
      });
    }

    // 数据使用 URL 参数传入
    const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
    await page.goto(`http://localhost:9934/src/views/${name}.html?${new URLSearchParams(param).toString()}`);

    const html = await page.$("body", { waitUntil: "networkidle0" });
    base64 = await html.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });

    if (0 === config.viewDebug) {
      await page.close();
    }
  } catch (e) {
    msg && msg.bot.logger.error(`${name} 功能绘图失败：${e}`, msg.uid);
    msg && msg.bot.say(msg.sid, `${name} 功能绘图失败：${e}`, msg.type, msg.uid);
    return;
  }

  if (base64) {
    const imageCQ = `[CQ:image,file=base64://${base64}]`;
    msg && msg.bot.say(msg.sid, imageCQ, msg.type, msg.uid, "\n");
  }
}

export { render };
