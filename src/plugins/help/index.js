async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let groupName = "group" === type ? Message.group_name : undefined;
  let isGroup = Message.hasOwnProperty("group_id") ? true : false;

  const helpMessage = `阿晴还在学习，目前可以做到：
🔘 信息 <角色名|武器名>: 查询角色或武器的游戏数据
🔘 十连｜wish: 进行一次十连抽卡
🔘 卡池 <常驻｜角色｜武器>: 切换【十连】的卡池
🔘 定轨 <武器名>: 定轨武器卡池并清除命定值
🔘 查看定轨/取消定轨
🔘 副本: 查询所有圣遗物副本ID
🔘 圣遗物 [副本ID]: 掉落一个圣遗物
🔘 强化: 强化掉落的上一个圣遗物
🔘 评分 <背包中的圣遗物截图（黄白背景）>: 为截图中的圣遗物评分
🔘 roll [1-100]: 掷一个面数为n的骰子
🔘 阿晴语录|刻晴语录
🔘 今天吃什么/今晚吃什么/今个儿吃什么……
-------------------
由于网络问题，有这个功能但是不一定能用：
？ 米游社 [米游社通行证ID]: 查询并更新角色信息
？ uid [游戏内UID]: 查询并更新角色信息
？ 深渊 [游戏内UID]
？ 上期深渊 [游戏内UID]
？ 武器: 武器素材表
？ 天赋: 天赋素材表
？ 周本: 周本材料表
------------------- 
后续在做：
◻︎ 敌人信息
◻︎ 御神签抽签（诚招文案中）
-------------------
<> 表示必填，[] 表示可选，前面需加空格
阿晴会主动回复，不需要[CQ:at,qq=${bot.uin}]`;

  const helpMessage_arknights = `香香还在学习，目前可以做到：
🔘 掉落查询 | 查询掉落 | 掉落 [物品名]: 查询企鹅物流上该物品期望理智最低的掉落关卡
  示例：掉落查询 固源岩
🔘 今天吃什么/今晚吃什么/今个儿吃什么……
-------------------
香香会主动回复，不需要[CQ:at,qq=${bot.uin}]`;

  if (isGroup === true) {
    // 是群聊
    if (groupName.match(/方舟/g)) {
      // 如果群名有方舟
      await bot.sendMessage(sendID, helpMessage_arknights, type);
      return null;
    }
  }
  // 如果不是方舟，则不会提前return
  await bot.sendMessage(sendID, helpMessage, type);
  await bot.sendMessage(sendID, "详细开发进度可以参考：\nhttps://github.com/Mark9804/Adachi-BOT/projects/1", type);

  return null;
}

export { Plugin as run };
