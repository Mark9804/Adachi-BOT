/* global command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { getID } from "../../utils/id.js";

function setCacheTimeout(uid, mhyID, bot) {
  if (db.includes("map", "user", "userID", uid)) {
    const { UID: id } = db.get("map", "user", { userID: uid }) || {};
    const reason = "因米游社 ID 变更而强制超时";

    if (id) {
      db.merge("time", "user", { aby: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的深渊数据${reason}。`);
      db.merge("time", "user", { uid: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的玩家数据${reason}。`);
    }
  }
}

function doSave(msg, action = "save") {
  const id = getID(msg.text, msg.uid); // 米游社 ID，这里正则限定了 msg 必然有 ID
  const mhyID = id;
  const cardCmd = command.functions.name.card;
  const saveCmd = command.functions.name.save;
  const changeCmd = command.functions.name.change;
  const okMsg = `使用【${cardCmd}】来查询游戏信息并更新旅行者的游戏角色。`;
  const existMsg = `旅行者已绑定通行证，使用【${changeCmd} ${mhyID}】。`;
  const unexistMsg = `旅行者还未绑定通行证，使用【${saveCmd} ${mhyID}】。`;

  if ("string" === typeof id) {
    msg.bot.say(msg.sid, id, msg.type, msg.uid);
    return;
  }

  switch (action) {
    case "save":
      if (!db.includes("map", "user", "userID", msg.uid)) {
        db.push("map", "user", { userID: msg.uid, mhyID });
        msg.bot.say(msg.sid, `通行证绑定成功，${okMsg}`, msg.type, msg.uid);
        setCacheTimeout(msg.uid, mhyID, msg.bot);
      } else {
        msg.bot.say(msg.sid, existMsg, msg.type, msg.uid);
      }
      break;
    case "change":
      if (db.includes("map", "user", "userID", msg.uid)) {
        db.merge("map", "user", { userID: msg.uid }, { mhyID });
        msg.bot.say(msg.sid, `通行证改绑成功，${okMsg}`, msg.type, msg.uid);
        setCacheTimeout(msg.uid, mhyID, msg.bot);
      } else {
        msg.bot.say(msg.sid, unexistMsg, msg.type, msg.uid);
      }
      break;
  }
}

export { doSave };
