import db from "../../utils/database.js";
import { errMsg, musicID, musicSrc } from "./data.js";

async function doMusic(msg) {
  const data = db.get("music", "source", { ID: msg.sid });
  const src = data ? data.Source : global.all.functions.options.music_source[163] || "163";
  const ret = await musicID(msg.text, src);

  if (ret in errMsg) {
    msg.bot.say(msg.sid, errMsg[ret], msg.type, msg.uid);
    return;
  }

  if (undefined !== ret.id) {
    switch (msg.type) {
      case "group":
        msg.group.shareMusic(ret.type, ret.id);
        break;
      case "private":
        msg.friend.shareMusic(ret.type, ret.id);
        break;
    }
  }
}

async function doMusicSource(msg) {
  const ret = musicSrc(msg.text, msg.sid);
  msg.bot.say(msg.sid, ret ? `音乐源已切换为 ${ret} 。` : "音乐源切换失败。", msg.type, msg.uid, true);
}

export { doMusic, doMusicSource };
