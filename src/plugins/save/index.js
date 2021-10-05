import db from "../../utils/database.js";
import { hasEntrance } from "../../utils/config.js";
import { getID } from "../../utils/id.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let id = await getID(msg, userID); // 米游社 ID，这里正则限定了 msg 必然有 ID
  let mhyID = id;

  if ("string" === typeof id) {
    await bot.sendMessage(sendID, id, type, userID);
    return;
  }

  if (hasEntrance(msg, "save", "save")) {
    if (!(await db.includes("map", "user", "userID", userID))) {
      await db.push("map", "user", { userID, mhyID });

      if (!(await db.includes("time", "user", "mhyID", mhyID))) {
        await db.push("time", "user", { mhyID, time: 0 });
      }

      await bot.sendMessage(
        sendID,
        `通行证绑定成功，使用【${command.functions.entrance.card[0]}】来查询游戏信息并更新您的游戏角色。`,
        type,
        userID
      );
    } else {
      await bot.sendMessage(
        sendID,
        `已绑定通行证，请使用【${command.functions.entrance.change[0]} ${mhyID}】。`,
        type,
        userID
      );
    }
  } else if (hasEntrance(msg, "save", "change")) {
    if (await db.includes("map", "user", "userID", userID)) {
      await db.update("map", "user", { userID }, { mhyID });
      await bot.sendMessage(
        sendID,
        `通行证改绑成功，使用【${command.functions.entrance.card[0]}】来查询游戏信息并更新您的游戏角色。`,
        type,
        userID
      );
    } else {
      await bot.sendMessage(
        sendID,
        `还未绑定通行证，请使用【${command.functions.entrance.save[0]} ${mhyID}】。`,
        type,
        userID
      );
    }
  }
}

export { Plugin as run };
