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
  const isGroup = Object.prototype.hasOwnProperty.call(Message, "group_id") ? true : false;

  let isArknightsGroup = false;
  if (isGroup === true) {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }

  // bot.logger.debug(`${isGroup}, ${groupName}, ${isArknightsGroup}`);

  const favFood = isArknightsGroup ? "炭烤沙虫腿" : "派蒙";
  const nickname = isArknightsGroup ? "博士" : "旅行者";

  const breakfastItem = Math.random() < 0.98 ? breakfast[getRandomInt(breakfast.length) - 1] : favFood;
  const lunchItem = Math.random() < 0.98 ? lunch[getRandomInt(lunch.length) - 1] : favFood;
  const dinnerItem = Math.random() < 0.98 ? dinner[getRandomInt(dinner.length) - 1] : favFood;
  const eatMoreVegetable = `${breakfastItem}${lunchItem}${dinnerItem}`.match(/[煎炸炒烤油]/)
    ? `\n${nickname}记得多吃蔬菜，不要上火哦。`
    : "";

  const message = `为${nickname}推荐的菜单是：
早餐：${breakfastItem}
午餐：${lunchItem}
晚餐：${dinnerItem}${eatMoreVegetable}`;

  await bot.sendMessage(sendID, message, type, userID);
  return null;
}

export { Plugin as run };
