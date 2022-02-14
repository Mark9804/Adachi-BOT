import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsondir = path.resolve(__dirname, "..", "..", "..", "src/plugins/quote");

const keqingDB = JSON.parse(fs.readFileSync(`${jsondir}/keqing.json`));
var keys = Object.keys(keqingDB);

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = type === "group" ? groupID : userID;

  const random = Math.floor(Math.random() * keys.length);

  const title = keys[random];
  const text = keqingDB[keys[random]][0]["text"];
  const array = [title, text];
  const fulltext = array.join("：");

  const audiourl = keqingDB[keys[random]][0]["audio"];
  const audio = "[CQ:record,file=" + audiourl + ",cache=1]";

  await bot.sendMessage(sendID, `${fulltext}`, type, false);
  try {
    await bot.sendMessage(sendID, `${audio}`, type, false);
  } catch (err) {
    bot.logger.error(`发送语音失败：${err}`);
  }
  return null;
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
