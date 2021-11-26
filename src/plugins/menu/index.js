/* global config */
/* eslint no-undef: "error" */

import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = global.menu;

async function Plugin(Message, bot) {
  // bot.logger.debug("吃什么");
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = type === "group" ? groupID : userID;
  const groupName = "group" === type ? Message.group_name : undefined;
  const isGroup = Message.hasOwnProperty("group_id");

  let isArknightsGroup = false;
  if (isGroup === true) {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }

  // bot.logger.debug(`${isGroup}, ${groupName}, ${isArknightsGroup}`);

  const favFood = isArknightsGroup ? "炭烤沙虫腿" : "派蒙";
  const nickname = isArknightsGroup ? "博士" : "旅行者";

  const message = `为${nickname}推荐的菜单是：
早餐：${Math.random() < 0.98 ? breakfast[getRandomInt(breakfast.length) - 1] : favFood}
午餐：${Math.random() < 0.98 ? lunch[getRandomInt(lunch.length) - 1] : favFood}
晚餐：${Math.random() < 0.98 ? dinner[getRandomInt(dinner.length) - 1] : favFood}`;

  await bot.sendMessage(sendID, message, type, userID);
  return null;
}

export { Plugin as run };
