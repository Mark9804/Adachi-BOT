/* global config */
/* eslint no-undef: "error" */

import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = config.menu;

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = type === "group" ? groupID : userID;
  const groupName = "group" === type ? Message.group_name : undefined;
  const isGroup = Message.hasOwnProperty("group_id") ? true : false;

  const favFood = "派蒙";
  const message = `为旅行者推荐的菜单是：
早餐：${breakfast ? breakfast[getRandomInt(breakfast.length) - 1] : favFood}
午餐：${lunch ? lunch[getRandomInt(lunch.length) - 1] : favFood}
晚餐：${dinner ? dinner[getRandomInt(dinner.length) - 1] : favFood}`;
  await bot.sendMessage(sendID, message, type, userID);
  return null;
}

export { Plugin as run };
