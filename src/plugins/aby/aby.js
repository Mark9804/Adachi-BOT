import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { basePromise, abyPromise, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function doAby(msg, schedule_type = 1) {
  let dbInfo = getID(msg.text, msg.uid, false); // UID

  if ("string" === typeof dbInfo) {
    await msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID

      if ("string" === typeof dbInfo) {
        await msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }

      const baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      const uid = baseInfo[0];
      dbInfo = getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        await msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }
    }

    const abyInfo = await abyPromise(...dbInfo, msg.uid, schedule_type.toString(), msg.bot);

    if (!abyInfo) {
      await msg.bot.say(msg.sid, "旅行者似乎从未挑战过深境螺旋。劳逸结合是不错，但也别放松过头。", msg.type, msg.uid);
      return;
    }

    if (!abyInfo.floors.length) {
      await msg.bot.say(msg.sid, "无渊月螺旋记录。耽误太多时间，事情可就做不完了。", msg.type, msg.uid);
      return;
    }
  } catch (e) {
    const ret = handleDetailError(e);

    if (!ret) {
      await msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && (await msg.bot.say(msg.sid, ret[0], msg.type, msg.uid));
      ret[1] && (await msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid));
      return;
    }
  }

  const data = db.get("aby", "user", { uid: dbInfo[0] });
  msg.bot.say(msg.sid, `正在处理${dbInfo[0]}的深渊记录，请等待至多30秒。`, msg.type, msg.uid);
  render(msg, data, "genshin-aby", 2);
}

export { doAby };
