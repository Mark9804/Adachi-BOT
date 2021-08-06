const helpMessage =
    `🔘 绑定 <米游社通行证ID>
🔘 改绑 <米游社通行证ID>
🔘 米游社 [米游社通行证ID] 👉 查询并更新米游社ID的角色信息
🔘 UID <游戏内UID> 👉 查询并更新此UID的角色信息
🔘 深渊 <游戏内UID> 👉 查询深渊战绩
🔘 上期深渊 <游戏内UID> 👉 查询上期深渊战绩
🔘 我的 <角色名> 👉 查询绑定米游社ID下的角色（需手动更新角色信息）
🔘 角色 <角色名> 👉 查询角色的游戏数据
🔘 武器 <武器名> 👉 查询武器的游戏数据
🔘 十连
🔘 卡池 <常驻|角色|武器> 👉 切换【十连】的卡池
🔘 定轨 <武器名>/空 👉 定轨指定武器（将清除命定值）/取消定轨
🔘 查看定轨 👉 查看当前定轨的武器和命定值
🔘 圣遗物 [副本ID] 👉 掉落一个圣遗物
🔘 强化 👉 强化掉落的上一个圣遗物
🔘 副本 👉 查询所有副本ID
🔘 武器 👉 武器素材表
🔘 天赋 👉 天赋素材表
🔘 周本 👉 周本材料表
🔘 roll [数字] 👉 掷骰子
🔘 点歌 <关键字...> 👉 点歌
🔘 音乐源 <QQ|163> 👉 切换【点歌】的音乐源
🔘 今天吃什么
🔘 伟大的升华
🔘 带个话 <文本...> 👉 给主人带个话
🔘 管理 👉 查询管理命令
-------------------
📎 <> 表示必填，[] 表示可选，前面需加空格
📎 可选项不填通常约定自己、上一个或随机`;

module.exports = async (id, type) => {
    await bot.sendMessage(id, helpMessage, type);
}
