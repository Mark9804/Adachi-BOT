import levenshtein from "fastest-levenshtein";
import { readConfig } from "./src/utils/config.js";

console.time("配置读取时间");
readConfig();
const aliases = Object.values(names.all);
console.timeEnd("配置读取时间");
console.log();

const n0 = "迪";

const n1 = process.argv[2] === undefined ? n0 : process.argv[2];

console.time("\n匹配时间");
let count = 0;
let total = 0;
let accepted = 0;
let acceptedList = [];
for (const n2 of aliases) {
  total += 1;
  const d = ((n2.startsWith(n1) || n2.endsWith(n1)) && n1.length / n2.length >= 0.5) ? 0.3 : levenshtein.distance(n1, n2) / Math.min(n1.length, n2.length);

  if (d < 1) {
    count += 1;
    const result = d <= 0.5 ? "接受" : "拒绝";
    if (result === "接受") {
      accepted += 1;
      acceptedList.push(n2);
    }
    console.log(`${n1} - ${n2} - ${d}，${result}`);
  }

}

const acceptedWords = acceptedList.length !== 0 ? acceptedList.join("、") : "没有接受的建议";
console.log(`共匹配了${total}次，找到${count}个建议，接受${accepted}个建议`);
console.log(`${acceptedWords}`);
console.timeEnd("\n匹配时间");