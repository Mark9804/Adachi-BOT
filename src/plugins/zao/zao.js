import db from "#utils/database";

const dbName = "wakeup";

function isArknightsGroup(msg) {
  const groupName = "group" === msg.type ? msg.group_name : undefined;
  const isGroup = Object.prototype.hasOwnProperty.call(msg, "group_id");

  let groupIsArknights = false;
  if (isGroup) {
    if (groupName.match(/方舟/g)) {
      groupIsArknights = true;
    }
  }
  return groupIsArknights;
}

function getRepliesByGroupName(msg) {
  const replies_genshin = {
    good_morning: "早安，早上的状态会为一天奠定基调，就算仍有困意，也要强迫自己打起精神来！",
    wakeup_too_late: "睡到这个点才起床？耽误太多时间，事情可就做不完了！",
    already_woken: "我记得你刚才已经起床过了，不会是背着我偷偷跑去睡回笼觉了吧？",
    good_night: "辛苦了，祝你好梦。我吗？…嗯，还有十来件事要处理，做完就能休息了。",
    sleep_too_early: "才刚起床就睡觉？？劳逸结合是不错，但也别放松过头！",
    user_sleep_twice: "嗯？之前不是在睡觉吗，怎么又晚安了？劳逸结合是不错，但也别放松过头！",
    not_woken_yet: "还没起床就睡觉？？？无论是冒险还是做生意，机会都稍纵即逝！",
  };
  const replies_arknights = {
    good_morning: "早上好，……博士。嗯，博士。我们去出任务吧？要记得用好我的能力。",
    wakeup_too_late: "博士原来会睡到这个时候起床吗，我记住了。",
    already_woken: "博士，你刚刚已经起床过了。不要觉得我记性差到那种程度。",
    good_night: "辛苦了，博士。祝你好梦。轻轻地，安稳地睡吧。",
    sleep_too_early: "博士，您还有许多事情需要处理。现在还不能休息哦。",
    user_sleep_twice: "博士，你之前就已经在睡觉了。",
    not_woken_yet: "博士，不要还没有起床就和我说晚安……我很困惑。",
  };

  return isArknightsGroup(msg) ? replies_arknights : replies_genshin;
}

function doZao(msg) {
  const wakeupTime = new Date();
  const wakeupTimestamp = wakeupTime.getTime();
  const wakeupHour = wakeupTime.getHours();
  const replies = getRepliesByGroupName(msg);
  let reply;
  if (db.includes(dbName, "user", "qqid", msg.uid)) {
    const userLastData = db.get(dbName, "user", { qqid: msg.uid }) || { qqid: msg.uid, lastActivity: "sleep", time: 0 };
    const lastActivity = userLastData.lastActivity || "sleep";
    // 获得以分钟为单位的距离上一次事件的时间
    const timeDiff = Math.floor((wakeupTime - userLastData.time) / 1000 / 60);
    const lastEventDurationHours = Math.floor(timeDiff / 60);
    const lastEventDurationMinutes = Math.floor(timeDiff % 60);
    const arknights = isArknightsGroup(msg);
    const personalPronoun = arknights ? "博士" : "你";

    if (timeDiff <= 60) {
      if (lastActivity === "awake") {
        // 如果起床了两次
        reply = replies.already_woken;
      } else {
        // 如果上一次是睡觉
        reply = arknights
          ? `${replies.good_morning}博士只睡了……嗯……${timeDiff}分钟，真的不会有事吗？`
          : `${replies.good_morning}\n话是这么说……你只睡了${timeDiff}分钟，就睡这么一会没问题吗？`;
        db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "awake", time: wakeupTimestamp });
      }
    } else {
      if (lastActivity === "sleep" || timeDiff >= 480) {
        if (timeDiff >= 1440) {
          // 如果用户睡了太久，忽略睡眠时长信息
          reply = wakeupHour >= 12 ? replies.wakeup_too_late : replies.good_morning;
          db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "awake", time: wakeupTimestamp });
        } else {
          reply =
            wakeupHour >= 12
              ? `${replies.wakeup_too_late}\n${personalPronoun}总共睡了${lastEventDurationHours}小时${lastEventDurationMinutes}分钟，感觉如何？`
              : `${personalPronoun}总共睡了${lastEventDurationHours}小时${lastEventDurationMinutes}分钟。${replies.good_morning}`;
          db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "awake", time: wakeupTimestamp });
        }
      } else {
        reply = arknights
          ? `我记得博士已经起床过了…嗯，在这里，我在终端上记下来了。博士${lastEventDurationHours}小时前已经起床过了。博士也容易忘记事情吗？`
          : `你${lastEventDurationHours}小时之前已经起床过一次了，忘记了吗？`;
      }
    }
  } else {
    // 用户在一个周期内第一次使用"早"命令
    reply = wakeupHour >= 12 ? replies.wakeup_too_late : replies.good_morning;
    db.push(dbName, "user", { qqid: msg.uid, lastActivity: "awake", time: wakeupTimestamp });
  }

  msg.bot.say(msg.sid, reply, msg.type, msg.uid, true);
}

function doWan(msg) {
  const sleepTime = new Date();
  const sleepTimestamp = sleepTime.getTime();
  const sleepHour = sleepTime.getHours();
  const arknights = isArknightsGroup(msg);
  const personalPronoun = arknights ? "博士" : "你";
  const sleepTooEarlyReply = `${personalPronoun}今天怎么睡的这么早，不会是生病了吧？`;
  const preGoodnightWords = (goodnightTime) => (goodnightTime < 18 && goodnightTime > 10 ? sleepTooEarlyReply : "");
  const replies = getRepliesByGroupName(msg);
  let reply;

  if (db.includes(dbName, "user", "qqid", msg.uid)) {
    const userLastData = db.get(dbName, "user", { qqid: msg.uid }) || { qqid: msg.uid, lastActivity: "awake", time: 0 };
    const lastActivity = userLastData.lastActivity || "awake";
    // 获得以分钟为单位的距离上一次起床的时间
    const timeDiff = Math.floor((sleepTime - userLastData.time) / 1000 / 60);
    const lastEventDurationHours = Math.floor(timeDiff / 60);
    const lastEventDurationMinutes = Math.floor(timeDiff % 60);
    if (timeDiff <= 60) {
      if (lastActivity === "awake") {
        reply = replies.sleep_too_early;
      } else {
        reply = replies.user_sleep_twice;
      }
    } else if (userLastData.time === 0) {
      reply = `${preGoodnightWords(sleepHour)}我已经记不清${personalPronoun}是什么时候起床的了，总之${
        replies.good_night
      }`;
      db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "sleep", time: sleepTimestamp });
    } else if (timeDiff >= 1440 || (22 <= sleepHour && sleepHour <= 4)) {
      reply = `${preGoodnightWords(
        sleepHour
      )}${personalPronoun}已经清醒了${lastEventDurationHours}小时${lastEventDurationMinutes}分钟，记得不要勉强自己。${
        replies.good_night
      }`;
      db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "sleep", time: sleepTimestamp });
    } else {
      reply = `${preGoodnightWords(
        sleepHour
      )}${personalPronoun}已经清醒了${lastEventDurationHours}小时${lastEventDurationMinutes}分钟，${
        replies.good_night
      }`;
      db.update(dbName, "user", userLastData, { qqid: msg.uid, lastActivity: "sleep", time: sleepTimestamp });
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
