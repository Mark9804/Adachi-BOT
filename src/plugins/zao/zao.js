import db from "#utils/database";

const dbName = "wakeup";
const replies = {
  good_morning: "早安，早上的状态会为一天奠定基调，就算仍有困意，也要强迫自己打起精神来！",
  wakeup_too_late: "睡到这个点才起床？耽误太多时间，事情可就做不完了！",
  already_woken: "我记得你刚才已经起床过了，不会是刚才背着我偷偷跑去睡回笼觉了吧？",
  good_night: "辛苦了，祝你好梦。我吗？…嗯，还有十来件事要处理，做完就能休息了。",
  sleep_too_early: "才刚起床就睡觉？？劳逸结合是不错，但也别放松过头！",
  not_woken_yet: "还没起床就睡觉？？？无论是冒险还是做生意，机会都稍纵即逝！",
};

function doZao(msg) {
  const wakeupTime = new Date();
  const wakeupTimestamp = wakeupTime.getTime();
  const wakeupHour = wakeupTime.getHours();

  let reply;
  if (db.includes(dbName, "user", "qqid", msg.uid)) {
    const userLastData = db.get(dbName, "user", { qqid: msg.uid }) || { qqid: msg.uid, time: 0 };
    // 获得以分钟为单位的距离上一次起床的时间
    const timeDiff = Math.floor((wakeupTime - userLastData.time) / 1000 / 60);
    if (timeDiff <= 120) {
      reply = replies.already_woken;
    } else {
        reply = wakeupHour >= 12 ? replies.wakeup_too_late : replies.good_morning;
        db.update(dbName, "user", userLastData, { qqid: msg.uid, time: wakeupHour });
    }
  } else {
    // 用户在一个周期内第一次使用"早"命令
    reply = wakeupHour >= 12 ? replies.wakeup_too_late : replies.good_morning;
    db.push(dbName, "user", { qqid: msg.uid, time: wakeupTimestamp });
  }

  if (reply !== "") {
    msg.bot.say(msg.sid, reply, msg.type, msg.uid, true);
  }
}

function doWan(msg) {
  const sleepTime = new Date();
  const sleepHour = sleepTime.getHours();
  const sleepTooEarlyReply = "你今天怎么睡的这么早，不会是生病了吧？";

  const preGoodnightWords = (goodnightTime) => goodnightTime < 18 && goodnightTime > 10 ? sleepTooEarlyReply : "";

  let reply;

  if (db.includes(dbName, "user", "qqid", msg.uid)) {
    const userLastData = db.get(dbName, "user", { qqid: msg.uid }) || { qqid: msg.uid, time: 0 };
    // 获得以分钟为单位的距离上一次起床的时间
    const timeDiff = Math.floor((sleepTime - userLastData.time) / 1000 / 60);
    const awakenHours = Math.floor(timeDiff / 60);
    const awakenMinutes = Math.floor(timeDiff % 60);
    if (timeDiff <= 120) {
      reply = replies.sleep_too_early;
    } else {
      reply = `${preGoodnightWords(sleepHour)}你今天已经清醒了${awakenHours}小时${awakenMinutes}分钟，${replies.good_night}`;
      db.remove(dbName, "user", userLastData);
    }
  } else {
    // 如果数据库中没有数据，就说明用户在一个周期内没有使用过"早"命令
    reply = replies.not_woken_yet;
  }

  if (reply !== "") {
    msg.bot.say(msg.sid, reply, msg.type, msg.uid, true);
  }
}

// eslint-disable-next-line sort-exports/sort-exports
export { doZao, doWan };
