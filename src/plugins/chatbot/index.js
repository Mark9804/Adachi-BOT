import path from "path";
import url from "url";
import { getRandomInt } from "../../utils/tools.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memesdir = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "src/plugins/chatbot/image/memes"
);

const imagedir = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "src/plugins/chatbot/image"
);

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = type === "group" ? groupID : userID;
  const groupName = "group" === type ? Message.group_name : undefined;
  const isGroup = Message.hasOwnProperty("group_id");
  const isAtBot = Message.atme;

  const timeNow = new Date();

  let isArknightsGroup = false;
  if (isGroup === true) {
    if (groupName.match(/方舟/g)) {
      isArknightsGroup = true;
    }
  }

  // bot.logger.debug(`${msg}`);
  // bot.logger.debug(`${isAtBot}`);
  // bot.logger.debug(`${isGroup}`);

  // message events
  // interface CommonMessageEventData extends CommonEventData {
  //   post_type: "message",
  //   message: MessageElem[], //消息链
  //   raw_message: string, //字符串格式的消息
  //   message_id: string,
  //   user_id: number,
  //   font: string,
  //   atMe: boolean
  //   reply(message: Sendable, auto_escape?: boolean): Promise<Ret<{ message_id: string }>>,
  // }

  if (msg.match(/生日?快乐?/)) {
    bot.logger.debug("生日祝福");

    if (isArknightsGroup) {
      return;
    }
    let isBirthday = false;
    if (timeNow.getMonth() === 10 && timeNow.getDate() === 20) {
      isBirthday = true;
    }

    if (isBirthday && isAtBot) {
      // JS月份从0开始
      await bot.sendMessage(
        sendID,
        `谢谢旅行者！在这个特别的日子，我想和你定下一个约定——等到新时代的璃月港落成之时，来看看吧，我来领路。只有让你亲眼见证这里的脱胎换骨，才不会辜负你对我的陪伴和支持。`,
        type,
        userID
      );
    } else if (isBirthday && !isGroup) {
      await bot.sendMessage(
        sendID,
        `谢谢旅行者！在这个特别的日子，我想和你定下一个约定——等到新时代的璃月港落成之时，来看看吧，我来领路。只有让你亲眼见证这里的脱胎换骨，才不会辜负你对我的陪伴和支持。`,
        type,
        userID
      );
    } else if (!isBirthday && isAtBot) {
      await bot.sendMessage(
        sendID,
        `今天不是我的生日啊，旅行者是不是记错了？`,
        type,
        userID
      );
    } else if (!isBirthday && !isGroup) {
      await bot.sendMessage(
        sendID,
        `今天不是我的生日啊，旅行者是不是记错了？`,
        type,
        userID
      );
    }
    return;
  }

  if (msg.match(/([啊阿晴]|(香|迷迭)香).{0,5}(爬|可爱|坏)/g)) {
    let emotion; // 情感态度 1：爬 2：可爱 3:可爱地爬
    switch (true) {
      case /可爱[得地的]?爬/.test(msg):
        emotion = 3;
        break;
      case /[^不]可爱/.test(msg):
        emotion = 2;
        break;
      case /爬|不可爱/.test(msg):
        emotion = 1;
        break;
      case /坏/.test(msg):
        emotion = 0;
        break;
    }

    if (isArknightsGroup || msg.match(/香/g)) {
      if (!msg.match(/晴/g)) {
        switch (emotion) {
          case 3: // 3：可爱地爬
            await bot.sendMessage(
              sendID,
              `[CQ:image,file=${memesdir}/rosmontis_question.jpg]`,
              type
            );
            break;
          case 2: // 2：可爱
            await bot.sendMessage(
              sendID,
              `[CQ:image,file=${memesdir}/rosmontis_heart.jpg]`,
              type
            );
            break;
          case 1: // 1：爬
            await bot.sendMessage(
              sendID,
              `[CQ:image,file=${memesdir}/rosmontis_cry.jpg]`,
              type
            );
            break;
        }
      }
      return;
    } else {
      switch (emotion) {
        case 3: // 3：可爱地爬
          await bot.sendMessage(
            sendID,
            `[CQ:bface,file=8f0c0095d1e39b41edd34eafd9e3717663326338376333666466313837373563209162,text=我拒绝]`,
            type
          );
          break;
        case 2: // 2：可爱
          await bot.sendMessage(
            sendID,
            `[CQ:image,file=${memesdir}/keqing_adorable.jpg]`,
            type
          );
          break;
        case 1: // 1：爬
          const possibility = getRandomInt(2);
          switch (possibility) {
            case 1:
              await bot.sendMessage(
                sendID,
                `[CQ:bface,file=b72af30525f8c4c1d68149876e3cc53263326338376333666466313837373563209162,text=赌气]`,
                type
              );
              break;
            case 2:
              await bot.sendMessage(
                sendID,
                `[CQ:record,file=https://genshin.honeyhunterworld.com/audio/quotes/keqing/200003_cn.wav,cache=1]`,
                type
              );
              break;
          }
          break;
        case 0: // 0：坏
          await bot.sendMessage(
            sendID,
            `[CQ:image,file=${memesdir}/keqing_punch.gif]`,
            type
          );
          break;
      }
    }
    return null;
  }

  if (!isArknightsGroup && msg.match(/[Mm][Uu]+[Aa]/g) && isAtBot) {
    const reply = getRandomInt(10);
    if (reply <= 8 || userID === "1561382166") {
      await bot.sendMessage(
        sendID,
        `[CQ:face,id=305,text=/右亲亲]`,
        type,
        userID
      );
    } else {
      await bot.sendMessage(sendID, `爬`, type, userID);
    }
    return;
  }

  if (msg.match(/金丝虾球/g)) {
    if (isGroup === true) {
      // 是群聊
      if (!groupName.match(/方舟/g)) {
        // 如果群名没有方舟
        await bot.sendMessage(sendID, `金丝虾球！`, type);
        await bot.sendMessage(
          sendID,
          `[CQ:image,file=${memesdir}/keqing_want.png]`,
          type
        );
        return null;
      }
    } else {
      // 是私聊
      await bot.sendMessage(sendID, `金丝虾球！`, type);
      await bot.sendMessage(
        sendID,
        `[CQ:image,file=${memesdir}/keqing_want.png]`,
        type
      );
      return null;
    }
  }

  if (
    msg.match(
      /(这个?|我的).{0,5}([花毛沙杯头]|圣遗物).{0,5}(怎么?样|[吗么]|行不|能用|差不多|毕业)/
    )
  ) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}]是想知道这个圣遗物怎么样吗？我可以帮忙。\n发送“评分 [背包中的圣遗物截图（黄白背景）]，我就可以给这个圣遗物评分了！`,
      type
    );
    await bot.sendMessage(
      sendID,
      `举例：\n评分 [CQ:image,file=${imagedir}/artifact_sample.png]`,
      type
    );
    return null;
  }

  if (msg.match(/火盆/g)) {
    await bot.sendMessage(
      sendID,
      `[CQ:image,file=${imagedir}/campfire.gif]`,
      type
    );
    return null;
  }

  return null;
}

export { Plugin as run };
