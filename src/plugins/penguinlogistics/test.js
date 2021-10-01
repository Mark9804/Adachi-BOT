import fetch from "node-fetch";
import { alias } from "../../utils/alias-arknights.js";
import { getInfo } from "../../utils/api.js";

let msg = "掉落查询 固源岩";
let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);

if (cmd.startsWith("掉落")) {
  let [item] = msg.split(/(?<=^\S+)\s/).slice(1); // 截取目标产物

  if (!item) {
    console.log(`[CQ:at,qq=${userID}] 请正确输入掉落目标名称。`);
  }

  const headers = {
    accept: "application/json;charset=UTF-8",
  };

  var items = await fetch(
    "https://penguin-stats.io/PenguinStats/api/v2/items",
    {
      method: "GET",
      headers,
    }
  );
  var items = await items.json();
  console.log(items);

  const stages = await fetch(
    "https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN",
    {
      method: "GET",
      headers,
    }
  );
  let stages_index = Object.keys(stages);

  var keys = Object.keys(items);
  var dict = {};

  keys.forEach((elem, index) => {
    var name = items[index]["name"];
    dict[name] = items[index]["itemId"]; // dict = {'固源岩': '30012',… }
  });

  try {
    data = await getInfo(alias(item)); // 目标产物的变量名是item，别给爷写着写着就忘了
  } catch (err) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 查询${item}失败，请检查名称是否正确。`,
      type
    );
  }

  var itemId = dict[item]; // e.g. 30012

  const dropMatrix = await fetch(
    `https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=${itemId}&server=CN&show_closed_zones=false`,
    {
      method: "GET",
      headers,
    }
  );
  var dropStages = Object.keys(dropMatrix["matrix"]);

  var dropDetails = {}; // {'main_01-07': 1.2442008776021094, …}

  dropStages.forEach((elem, index) => {
    var name = dropMatrix["matrix"][index]["stageId"];
    var dropRate =
      dropMatrix["matrix"][index]["quantity"] /
      dropMatrix["matrix"][index]["times"];
    dropDetails[name] = dropRate;
  });

  var pricePerformance = {};
  stages_index.forEach((elem, index) => {
    var stagename = stages[index]["stageId"];
    var stageAP = stages[index]["apCost"];
    pricePerformance[stagename] = stageAP / dropDetails[stagename];
  });
  var idealStage = "";
  var minimumAP = 99999;
  for (const [key, value] of Object.entries(pricePerformance)) {
    if (!isNaN(value)) {
      if (value <= minimumAP) {
        idealStage = key;
        minimumAP = value.toFixed(2);
      }
    }
  }
  await bot.sendMessage(
    sendID,
    `[CQ:at,qq=${userID}] ${item}：${itemId}的最小理智掉落关卡为${idealStage}，期望理智为${minimumAP}`,
    type
  );
}
