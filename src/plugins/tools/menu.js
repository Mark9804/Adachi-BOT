/* global config */
/* eslint no-undef: "error" */

import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = config.menu;

async function menu(msg) {
  const groupName = "group" === type ? msg.group_name : undefined;

  let isArknightsGroup = false;
  if (msg.type === "group") {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }
  bot.logger.debug(`${isArknightsGroup}`);
  const favFood = isArknightsGroup ? "炭烤沙虫腿" : "派蒙";
  const nickname = isArknightsGroup ? "博士" : "旅行者";

  const message = `为${nickname}推荐的菜单是：
早餐：${
    Math.random() < 0.98
      ? breakfast[getRandomInt(breakfast.length) - 1]
      : favFood
  }
午餐：${Math.random() < 0.98 ? lunch[getRandomInt(lunch.length) - 1] : favFood}
晚餐：${
    Math.random() < 0.98 ? dinner[getRandomInt(dinner.length) - 1] : favFood
  }`;

  await msg.bot.say(msg.sid, message, msg.type, msg.uid);
}

export { menu };
