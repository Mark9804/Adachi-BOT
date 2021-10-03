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
  let groupName = "group" === type ? Message.group_name : undefined;

  if (msg.match(/金丝虾球/g)) {
    await bot.sendMessage(sendID, `金丝虾球！`, type);

    await bot.sendMessage(
      sendID,
      `[CQ:image,file=${memesdir}/keqing_want.png]`,
      type
    );
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
  }
  if (msg.match(/兑换码/g)) {
    await bot.sendMessage(sendID, `2.2版本兑换码如下：`, type);
    await bot.sendMessage(sendID, `JARHE4CR6A52`, type);
    await bot.sendMessage(sendID, `HS8HXMCR6A46`, type);
    await bot.sendMessage(sendID, `SAQHWLVRPTPS`, type);
  }
  //   if (msg.match(/[啊阿刻]晴.*(骗你的|怎么会有)/g)) {
  //   await bot.sendMessage(
  //     sendID,
  //     `[CQ:image,file=${memesdir}/be_human_please.jpg]`,
  //     type
  //   );
  // }
  if (msg.match(/^help$/gi)) {
    const helpMessage = `阿晴还在学习，目前可以做到：
🔘 信息 <角色名|武器名>: 查询角色或武器的游戏数据
🔘 十连|wish: 进行一次十连抽卡
🔘 卡池 <常驻|角色|武器>: 切换【十连】的卡池
🔘 定轨 <武器名>: 定轨武器卡池并清除命定值
🔘 查看/取消定轨
🔘 副本: 查询所有圣遗物副本ID
🔘 圣遗物 [副本ID]: 掉落一个圣遗物
🔘 强化: 强化掉落的上一个圣遗物
🔘 评分 <背包中的圣遗物截图（黄白背景）>: 为截图中的圣遗物评分
🔘 roll [1-100]: 掷一个面数为n的骰子
🔘 阿晴语录|刻晴语录
🔘 今天吃什么
-------------------
由于网络问题，有这个功能但是暂时不可用：
❌ 米游社 [米游社通行证ID]: 查询并更新角色信息
❌ uid [游戏内UID]: 查询并更新角色信息
❌ 深渊 [游戏内UID]
❌ 上期深渊 [游戏内UID]
❌ 武器: 武器素材表
❌ 天赋: 天赋素材表
❌ 周本: 周本材料表
------------------- 
后续会做到：
◻︎ 敌人信息
◻︎ 材料采集地点
◻︎ 活动时间轴
◻︎ 锄地组队系统（太复杂了，说不定做一半鸽了）
-------------------
<> 表示必填，[] 表示可选，前面需加空格
阿晴会主动回复，不需要[CQ:at,qq=${bot.uin}]`;

    const helpMessage_arknights = `香香还在学习，目前可以做到：
🔘 掉落查询 | 查询掉落 | 掉落 [物品名]: 查询企鹅物流上该物品期望理智最低的掉落关卡
示例：掉落查询 固源岩
-------------------
香香会主动回复，不需要[CQ:at,qq=${bot.uin}]`;

    try {
      if (groupName.match(/方舟/g)) {
        await bot.sendMessage(sendID, helpMessage_arknights, type);
      } else {
        await bot.sendMessage(sendID, helpMessage, type);
        await bot.sendMessage(
          sendID,
          "详细开发进度可以参考：\nhttps://github.com/Mark9804/Adachi-BOT/blob/master/todo.md",
          type
        );
      }
    } catch (err) {
      await bot.sendMessage(sendID, helpMessage, type);
      await bot.sendMessage(
        sendID,
        "详细开发进度可以参考：\nhttps://github.com/Mark9804/Adachi-BOT/blob/master/todo.md",
        type
      );
    }


  }

  return null;
}

export { Plugin as run };
