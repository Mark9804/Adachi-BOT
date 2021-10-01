import { alias } from "../../utils/alias.js";
import { loadYML } from "../../utils/yaml.js";
import fetch from "node-fetch";

let item = "紫薯";

const data = loadYML("alias-arknights");

let itemAlias = {};

for (const [key, value] of Object.entries(data)) {
  value.forEach((elem, index) => {
    itemAlias[elem] = key;
  });
}

console.log(itemAlias[item]);

const headers = {
  accept: "application/json;charset=UTF-8",
};

const stages_raw = await fetch(
  "https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN",
  {
    method: "GET",
    headers,
  }
);
const stages = await stages_raw.json();

let stages_index = Object.keys(stages);
// console.log(stages_index)

let stagesMap = {};

stages_index.forEach((elem, index) => {
  let stagename = stages[index]["stageId"];
  let stageCode = stages[index]["code"];
  stagesMap[stagename] = stageCode;
});

console.log(stagesMap);
