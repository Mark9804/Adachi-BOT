import fetch from "node-fetch";
import { loadYML } from "../../utils/yaml.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);

  if (cmd.startsWith("掉落") || cmd.startsWith("查询掉落")) {
    try {
      bot.logger.debug("检测到掉落查询请求");
      let [item] = msg.split(/(?<=^\S+)\s/).slice(1); // 截取目标产物

      const data = loadYML("alias-arknights");

      let itemAlias = {};

      for (const [key, value] of Object.entries(data)) {
        value.forEach((elem, index) => {
          itemAlias[elem] = key;
        });
      }

      try {
        item = itemAlias[item];
      } catch (err) {
        await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] 查询${item}失败，请检查名称是否正确。\n错误信息：\n${err}`,
          type
        );
        return;
      }

      if (!item) {
        await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] 请正确输入掉落目标名称。`,
          type
        );
        return;
      }

      const headers = {
        accept: "application/json;charset=UTF-8",
      };

      const items_raw = await fetch(
        "https://penguin-stats.io/PenguinStats/api/v2/items",
        {
          method: "GET",
          headers,
        }
      );

      const stages_raw = await fetch(
        "https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN",
        {
          method: "GET",
          headers,
        }
      );

      const items = await items_raw.json();
      const stages = await stages_raw.json();
      let stages_index = Object.keys(stages);

      let keys = Object.keys(items);

      var dict = {};

      keys.forEach((elem, index) => {
        var name = items[index]["name"];
        dict[name] = items[index]["itemId"]; // dict = {'固源岩': '30012',… }
      });

      var itemId = dict[item]; // e.g. 30012

      const dropMatrix_raw = await fetch(
        `https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=${itemId}&server=CN&show_closed_zones=false`,
        {
          method: "GET",
          headers,
        }
      );

      const dropMatrix = await dropMatrix_raw.json();
      var dropStages = Object.keys(dropMatrix["matrix"]);

      var dropDetails = {}; // {'main_01-07': 1.2442008776021094, …}

      dropStages.forEach((elem, index) => {
        var name = dropMatrix["matrix"][index]["stageId"];
        var dropRate =
          dropMatrix["matrix"][index]["quantity"] /
          dropMatrix["matrix"][index]["times"];
        dropDetails[name] = dropRate;
      });

      let pricePerformance = {};
      let stagesMap = {};
      stages_index.forEach((elem, index) => {
        let stagename = stages[index]["stageId"];
        let stageAP = stages[index]["apCost"];
        let stageCode = stages[index]["code"];
        pricePerformance[stagename] = stageAP / dropDetails[stagename];
        stagesMap[stagename] = stageCode;
      });
      let idealStage = "";
      let idealStage_main = "";
      let idealStage_optional = "";
      let minimumAP = 99999;
      let minimumAP_main = 99999;
      let minimumAP_optional = 99999;
      for (const [key, value] of Object.entries(pricePerformance)) {
        if (!isNaN(value)) {
          if (value <= minimumAP) {
            idealStage = key;
            if (!idealStage.match(/(act|rep)/)) {
              // 是主线
              idealStage_main = key;
              minimumAP_main = value.toFixed(2);
            }
            minimumAP = value.toFixed(2);
          }
          if (value <= minimumAP_optional && key !== "main_01-07") {
            idealStage_optional = key;
            minimumAP_optional = value.toFixed(2);
          }
        }
      }
      let additionalInfo = "";
      let additionalInfo_01_07 = "";
      if (idealStage.match(/(act|rep)/)) {
        idealStage_main = stagesMap[idealStage_main];
        additionalInfo = `\n主线最小理智掉落关卡为${idealStage_main}，期望理智为${minimumAP_main}`;
      } else if (
        idealStage === "main_01-07" ||
        idealStage_optional === "main01-07"
      ) {
        idealStage_optional = stagesMap[idealStage_optional];
        additionalInfo_01_07 = `\n考虑1-7的精污程度，提供备选方案${idealStage_optional}，期望理智${minimumAP_optional}`;
      }

      idealStage = stagesMap[idealStage];
      await bot.sendMessage(
        sendID,
        `${item} (${itemId})的掉落情况为：\n最小理智掉落关卡为${idealStage}，期望理智为${minimumAP}${additionalInfo}${additionalInfo_01_07}\n仅计算目标掉落，不考虑副产物及合成，以上情况请自行使用 https://aog.wiki/`,
        type
      );
    } catch (err) {
      await bot.sendMessage(sendID, `查询失败，网络错误。`, type);
    }
  }
  return null;
}

export { Plugin as run };
