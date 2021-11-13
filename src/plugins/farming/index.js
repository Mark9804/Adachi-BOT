import db from "../../utils/database.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let date = Date.now();

  if (msg.match(/锄地\s*房主\[CQ:at.*\]/g) || msg.match(/锄地\s*[点时\:：]/g)) {
    try {
      var host = parseInt(msg.match(/[0-9]{5,}/g)[0]);
    } catch (err) {
      var host = userID;
    }
    await db.push("farming", "user", {
      date: date,
      host: host,
      participants: [],
    });
    // await db.write("farming", date, {"host": host, "participants": []});

    if (host !== userID) {
      await bot.logger.debug("host不等于userid");
      await db.update("farming", "user", {
        date: date,
        host: host,
        participants: [userID],
      });
      // await db.write("farming", date, {"host": host, "participants": [userID]});
    }
  }
  await bot.logger.debug(`锄地房主${host},添加时间${date},参与用户${userID}`);

  let testdb = await db.get("farming", "user");

  bot.logger.debug(`${testdb}`);
  return null;
}

export { Plugin as run };
