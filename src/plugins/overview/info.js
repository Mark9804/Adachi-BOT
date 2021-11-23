/* global alias */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { getInfo } from "../../utils/api.js";

function getNotFoundText(name, guess = []) {
  let notFoundText = `查询失败，未知的名称${name}。`;

  if (!alias.allNames.includes(name) && guess.length > 0) {
    notFoundText += `\n旅行者要查询的是不是：\n${guess.join("、")}`;
  }

  return notFoundText;
}

async function doInfo(msg, name, guess = []) {
  let data;

  if (!name) {
    msg.bot.say(msg.sid, "请输入名称。", msg.type, msg.uid, true);
    return;
  }

  name = "string" === typeof name ? name.toLowerCase() : "";

  try {
    data = await getInfo(alias.all[name] || name);
  } catch (e) {
    const text = getNotFoundText(name, guess);
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
    return;
  }

  render(msg, data, "genshin-overview");
}

export { doInfo };
