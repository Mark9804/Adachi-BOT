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

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;

  if (msg.match(/金丝虾球/g)) {
    await bot.sendMessage(sendID, `金丝虾球！`, type);

    await bot.sendMessage(
      sendID,
      `[CQ:image,file=${memesdir}/keqing_wantthat.png]`,
      type
    );
  }

  return null;
}

export { Plugin as run };
