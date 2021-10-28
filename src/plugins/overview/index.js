/* global alias */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { getInfo } from "../../utils/api.js";
import { loadYML } from "../../utils/yaml.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  const groupName = "group" === type ? Message.group_name : undefined;
  const isGroup = Message.hasOwnProperty("group_id") ? true : false;

  if (isGroup === true) {
    // 是群聊
    if (groupName.match(/方舟/g)) {
      // 如果群名有方舟
      return null;
    }
  }

  let data;

  if (
    !(await hasAuth(userID, "overview")) ||
    !(await hasAuth(sendID, "overview"))
  ) {
    await sendPrompt(sendID, userID, name, "查询游戏数据", type, bot);
    return;
  }

  if (!text) {
    await bot.sendMessage(sendID, "请输入名称。", type, userID);
    return;
  }

  try {
    data = await getInfo(
      alias["string" === typeof text ? text.toLowerCase() : text] || text
    );
  } catch (e) {
    // 如果查询失败的话，给出一个可能的清单
    const data = loadYML("alias");
    let suggestion = "\n旅行者是否在查找：\n";
    for (const [key, value] of Object.entries(data)) {
      for (const elem of value) {
        let string = `${elem}`;
        if (key.match(text)) {
          suggestion += `${key}\n`;
          break;
        } else if (string.match(text)) {
          suggestion += `${key}：${string}\n`;
          break;
        }
      }
    }
    if (suggestion === "\n旅行者是否在查找：\n") {
      suggestion = "";
    } else {
      suggestion = suggestion.slice(0, -1);
    }
    await bot.sendMessage(
      sendID,
      `查询失败，请检查名称是否正确。${suggestion}`,
      type,
      userID
    );
    return;
  }

  await render(data, "genshin-overview", sendID, type, userID, bot, 2);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
