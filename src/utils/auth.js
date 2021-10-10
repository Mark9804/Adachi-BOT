import db from "./database.js";

async function sendPrompt(sendID, userID, name, auth, type, bot) {
  await bot.sendMessage(
    sendID,
    `您当前无${auth}权限。牛头人是不好的！\n可能是管理为防止刷屏限制了此功能，如果仍想尝试，可以私聊`,
    type,
    userID
  );
}

async function setAuth(auth, target, isOn) {
  const data = await db.get("authority", "user", { userID: target });

  if (undefined === data) {
    await db.push("authority", "user", { userID: target, [auth]: isOn });
  } else {
    await db.update(
      "authority",
      "user",
      { userID: target },
      { ...data, [auth]: isOn }
    );
  }
}

async function hasAuth(userID, auth) {
  const data = await db.get("authority", "user", { userID });
  return undefined === data || undefined === data[auth] || true === data[auth];
}

export { sendPrompt, setAuth, hasAuth };
