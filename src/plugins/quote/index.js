import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsondir = path.resolve(__dirname, "..", "..", "..", "src/plugins/quote");

const keqingDB = JSON.parse(fs.readFileSync(`${jsondir}/keqing.json`));
var keys = Object.keys(keqingDB);

async function Plugin(msg) {

  const random = Math.floor(Math.random() * keys.length);

  const title = keys[random];
  const text = keqingDB[keys[random]][0]["text"];
  const array = [title, text];
  const fulltext = array.join("：");

  const audiourl = keqingDB[keys[random]][0]["audio"];
  const audio = "[CQ:record,file=" + audiourl + ",cache=1]";

  await msg.bot.say(msg.sid, `${fulltext}`, msg.type);
  try {
    await msg.bot.say(msg.sid, `${audio}`, msg.type);
  } catch (err) {
    bot.logger.error(`发送语音失败：${err}`);
  }
  return null;
}

export { Plugin as run };
