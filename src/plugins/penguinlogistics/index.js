import { alias } from "../../utils/alias-arknights.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);

  if (cmd.startsWith("掉落")) {
  }

  return null;
}
