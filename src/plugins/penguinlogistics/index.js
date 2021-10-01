import fetch from "node-fetch";
import { alias } from "../../utils/alias-arknights.js";
import { getInfo } from "../../utils/api.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);

  if (cmd.startsWith("掉落")) {
    let [item] = msg.split(/(?<=^\S+)\s/).slice(1); // 截取目标产物

    if (!item) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 请正确输入掉落目标名称。`,
        type
      );
      return;
    }

    const headers = {
      accept: "application/json;charset=UTF-8",
    };

    const items = await fetch(
      "https://penguin-stats.io/PenguinStats/api/v2/items",
      {
        method: "GET",
        headers,
      }
    );

    const stages = await fetch(
      "https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN",
      {
        method: "GET",
        headers,
      }
    );

    var keys = Object.keys(items);
    var dict = {};

    keys.forEach((elem, index) => {
      var name = items[index]["name"];
      dict[name] = items[index]["itemId"]; // dict = {'固源岩': '30012',… }
    });

    try {
      data = await getInfo(alias(item)); // 目标产物的变量名是item，别给爷写着写着就忘了
    } catch (err) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 查询${item}失败，请检查名称是否正确。`,
        type
      );
      return;
    }

    var itemId = dict[item]; // e.g. 30012

    let dropMatrix = await fetch(
      `https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=${itemId}&server=CN&show_closed_zones=false`,
      method: "GET",
      headers,
      )
  }

  return null;
}
