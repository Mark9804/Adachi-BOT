import fs from "fs";
import lodash from "lodash";
import path from "path";
import puppeteer from "puppeteer";
import { mkdir } from "#utils/file";

// selector: 截图的页面元素。遵循 CSS 选择器语法。
// hello:    耗时操作是否给提示
// scale:    截图时的缩放比例。在纵横方向上各应使用多少屏幕实际像素来绘制单个CSS像素。效果约等同于 devicePixelRatio 。
// delete:   是否撤回消息
//
// selector -> view (string): selector (string)
// hello    -> view (string): hello (boolean)
// scale    -> view (string): scale (number)
// hello    -> view (string): delete (boolean)
//
// 如果没有设置则使用 settingsDefault 中的默认值
const settings = {
  selector: {
    "arknights": "body > div"
  },
  hello: {
    "genshin-aby": true,
    "genshin-card": true,
    "genshin-card-8": true,
    "genshin-package": true,
  },
  scale: {
    "genshin-aby": 2,
    "genshin-artifact": 1.2,
    "genshin-card-8": 2,
    "genshin-character": 2,
    "genshin-material": 2,
    "genshin-overview": 2,
    "arknights": 4,
  },
  delete: {
    "genshin-artifact": true,
    "genshin-gacha": true,
  },
};
const settingsDefault = {
  selector: "body",
  hello: false,
  scale: 1.5,
  delete: false,
};
const renderPath = puppeteer.executablePath();

async function renderOpen() {
  if (undefined === global.browser) {
    global.browser = await puppeteer.launch({
      defaultViewport: null,
      headless: lodash.hasIn(global.config, "viewDebug") ? 1 !== global.config.viewDebug : false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--process-per-site",
        "--no-default-browser-check",
        "--disable-infobars",
      ],
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
    });
  }
}

async function renderClose() {
  if (undefined !== global.browser) {
    await global.browser.close();
    global.browser = undefined;
  }
}

async function render(msg, data, name) {
  const recordDir = path.resolve(global.rootdir, "data", "record");
  let binary;

  if ((settings.hello[name] || settingsDefault.hello) && global.config.warnTimeCosts && undefined !== msg.bot) {
    msg.bot.say(msg.sid, "正在绘图，请稍等……", msg.type, msg.uid, true);
  }

  // 抽卡信息太多时减少缩放比
  if ("genshin-gacha" === name && Array.isArray(data.data) && data.data.length > 10) {
    settings.scale["genshin-gacha"] = 1;
  }

  try {
    const dataStr = "arknights" === name ? data : JSON.stringify(data);

    if (undefined !== msg.bot && "arknights" !== name) {
      // 该文件仅用于辅助前端调试，无实际作用亦不阻塞
      const record = path.resolve(mkdir(path.resolve(recordDir, "last_params")), `${name}.json`);
      fs.writeFile(record, dataStr, () => {});

      if (undefined !== msg.bot) {
        msg.bot.logger.debug(`render：已生成 ${name} 功能的数据调试文件。`);
      }
    }

    if (undefined === global.browser) {
      throw "未找到可用的浏览器";
    }

    const page = await global.browser.newPage();
    const scale = settings.scale[name] || settingsDefault.scale;

    // 只在机器人发送图片时设置 viewport
    if (undefined !== msg.bot || "arknights" === name) {
      await page.setViewport({
        width: "arknights" === name ? 360 : await page.evaluate(() => document.body.clientWidth),
        height: await page.evaluate(() => document.body.clientHeight),
        deviceScaleFactor: scale,
      });
    }

    if (undefined !== msg.bot && "arknights" !== name) {
      msg.bot.logger.debug(`render：已设置 ${name} 功能的缩放比为 ${scale} 。`);
    }

    // 数据使用 URL 参数传入
    if ("arknights" !== name) {
      const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
      await page.goto(`http://localhost:9934/src/views/${name}.html?${new URLSearchParams(param)}`);
    } else {
      const cssDir = path.resolve(global.rootdir, "src", "views", "component", "arknights", "normalize.css")
      await page.goto(data);
      await page.addStyleTag({ path: cssDir });
    }

    const html = await page.$(settings.selector[name] || settingsDefault.selector, { waitUntil: "networkidle0" });
    binary = await html.screenshot({
      encoding: "binary",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });

    if (1 !== global.config.viewDebug) {
      await page.close();
    }
  } catch (e) {
    if (undefined !== msg.bot && "arknights" !== name) {
      msg.bot.logger.error(`render： ${name} 功能绘图失败：${e}`, msg.uid);
      msg.bot.say(msg.sid, `render： ${name} 功能绘图失败：${e}`, msg.type, msg.uid, true);
    }
    return;
  }

  if (binary) {
    const base64 = new Buffer.from(binary, "utf8").toString("base64");
    const imageCQ = `[CQ:image,type=image,file=base64://${base64}]`;
    const toDelete = undefined === settings.delete[name] ? settingsDefault.delete : settings.delete[name];
    const currentTimestamp = new Date().getTime();
    const record =
      "arknights" !== name
      ? path.resolve(mkdir(path.resolve(recordDir, name)), `${msg.sid}.jpeg`)
      : path.resolve(mkdir(path.resolve(recordDir, name)), `${currentTimestamp}.jpeg`);

    if (undefined !== msg.bot || "arknights" === name) {
      if (1 === global.config.saveImage) {
        fs.writeFile(record, binary, () => {});
      }
      if ("arknights" !== name) {
        msg.bot.say(msg.sid, imageCQ, msg.type, msg.uid, toDelete, "\n");
      } else {
        return imageCQ;
      }
    }
  }
}

export { render, renderClose, renderOpen, renderPath };
