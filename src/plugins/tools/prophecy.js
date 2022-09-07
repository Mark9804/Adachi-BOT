import { getRandomInt } from "#utils/tools";

("use strict");

async function prophecy(msg) {
  const data = global.prophecy.data[getRandomInt(global.prophecy.data.length)];
  const message = `${data.text}。\n${data.annotation}`;
  // const message = `${data.lucky}\n${data.summary}：${data.text}。\n${data.annotation}`;
  msg.bot.say(msg.sid, message, msg.type, msg.uid, true, "\n");
}

export { prophecy };
