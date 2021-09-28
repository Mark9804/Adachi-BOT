import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsondir = path.resolve(__dirname, "..", "..", "..", "src/plugins/quote");

const keqingDB = JSON.parse(fs.readFileSync(`${jsondir}/keqing.json`));
var keys = Object.keys(keqingDB);

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;

  const random = Math.floor(Math.random() * keys.length);

  let title = keys[random];
  let text = keqingDB[keys[random]][0]["text"];
  var array = [title, text];
  var fulltext = array.join("：");

  let audiourl = keqingDB[keys[random]][0]["audio"];
  let audio = "[CQ:record,file=" + audiourl + ",cache=1]";

  await bot.sendMessage(sendID, `${fulltext}`, type);
  try {
    await bot.sendMessage(sendID, `${audio}`, type);
  } catch (err) {
    bot.logger.error(`发送语音失败：${err}`);
  }
  return null;
}

export { Plugin as run };
