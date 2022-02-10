import { getRandomInt } from "../../utils/tools.js";

function menu(msg) {
  const { eat, drink } = global.menu;
  const { breakfast, lunch, dinner, snack } = eat;
  const { base, topping, sweetness } = drink;

  const groupName = "group" === msg.type ? msg.group_name : undefined;
  const isGroup = Object.prototype.hasOwnProperty.call(msg, "group_id");

  let isArknightsGroup = false;
  if (isGroup) {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }

  const nickname = isArknightsGroup ? "博士" : "旅行者";
  const favFood = isArknightsGroup ? "炭烤沙虫腿" : "派蒙";

  const snackText = Math.random() < 0.5 ? "夜宵" : "下午茶";

  const eatText = `今日给${nickname}的推荐菜单是：
早餐：${Math.random() < 0.01 ? favFood : breakfast[getRandomInt(breakfast.length)] || ""}
午餐：${Math.random() < 0.01 ? favFood : lunch[getRandomInt(lunch.length)] || ""}
晚餐：${Math.random() < 0.01 ? favFood : dinner[getRandomInt(dinner.length)] || ""}
${snackText}：${Math.random() < 0.2 ? favFood : snack[getRandomInt(snack.length)] || ""}`;
  const baseText = base[getRandomInt(base.length)] || "水";
  const toppingText =
    Math.random() < 0.5 && baseText.endsWith("奶茶") ? "加" + (topping[getRandomInt(topping.length)] || "量") : "";
  const sweetnessText = sweetness[getRandomInt(sweetness.length)] || "";
  const drinkText = `来一杯${sweetnessText}${toppingText}的${baseText}！`;

  msg.bot.say(msg.sid, /喝(什么|啥)/.test(msg.text) ? drinkText : eatText, msg.type, msg.uid, true);
}

export { menu };
