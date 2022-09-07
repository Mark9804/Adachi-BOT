import db from "#utils/database";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "#utils/detail";
import { getID } from "#utils/id";
import { render } from "#utils/render";
import { filterWordsByRegex } from "#utils/tools";

("use strict");

async function doPackage(msg) {
  const args = filterWordsByRegex(msg.text, ...global.command.functions.entrance.package);
  let dbInfo = getID(msg.text, msg.uid, false); // UID

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
        return;
      }

      const baseInfo = await baseDetail(dbInfo, msg.uid, msg.bot);
      const uid = baseInfo[0];
      dbInfo = getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
        return;
      }
    }

    const detailInfo = await indexDetail(...dbInfo, msg.uid, msg.bot);
    await characterDetail(...dbInfo, detailInfo, false, msg.bot);
  } catch (e) {
    if (handleDetailError(msg, e)) {
      return;
    }
  }

  let qqid;

  if (msg.text.includes("[CQ:at")) {
    qqid = parseInt(msg.text.match(/\d+/g)[0]);
  }

  if ("" === args) {
    qqid = msg.uid;
  }

  const data = Object.assign(db.get("info", "user", { uid: dbInfo[0] }), {
    character: global.info.character.map((c) => ({ id: c.id, name: c.name })),
    qqid,
  });

  render(msg, data, "genshin-card");
}

export { doPackage };
