import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const memesdir = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "src/plugins/chatbot/memes"
);

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let groupName = "group" === type ? Message.group_name : undefined;
  let isGroup = Message.hasOwnProperty("group_id") ? true : false;

  // bot.logger.debug(`${msg}`);

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
      /(这个?|我的).{0,5}([花毛沙杯头]|圣遗物).{0,5}(怎么?样|.*[吗么]|行不|能用|差不多|毕业)/
    )
  ) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}]是想知道这个圣遗物怎么样吗？我可以帮忙。\n发送“评分 [背包中的圣遗物截图（黄白背景）]，我就可以给这个圣遗物评分了！`,
      type
    );
    await bot.sendMessage(
      sendID,
      `举例：\n评分 [CQ:image,file=${memesdir}/artifact_sample.png]`,
      type
    );
    return null;
  }

  if (msg.match(/火盆/g)) {
    await bot.sendMessage(
      sendID,
      `[CQ:image,file=${memesdir}/campfire.gif]`,
      type
    );
    return null;
  }

  return null;
}

export { Plugin as run };
