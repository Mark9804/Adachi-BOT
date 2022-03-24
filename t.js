import levenshtein from "fastest-levenshtein";
import { readConfig } from "./src/utils/config.js";
import { similarity } from "./src/utils/tools.js";

const similarityMaxValue = 0.5;

console.time("配置读取时间");
readConfig();
const aliases = Object.values(names.all);
console.timeEnd("配置读取时间");
console.log();

const n0 = "神里";

const n1 = process.argv[2] === undefined ? n0 : process.argv[2];

function guessPossibleNames(name, names) {
  let count = 0;
  let bestMatch = false;
  let candidates = {};
  for (const candidate of aliases) {
    count++;
    if (bestMatch === false) {
      const l = name.length / candidate.length;
      let best = Number.MAX_SAFE_INTEGER;
      let n;

      if (candidate.startsWith(name) || (candidate.endsWith(name) && l >= 0.3)) {
        n = (1 - l) / 2;
        best = n;
      }
      n = similarity(name, candidate);
      best = n < best ? n : best;

      if (best <= similarityMaxValue) {
        candidates[candidate] = best;
        bestMatch = 0 === best;
      }
    }
  }
  return [candidates, count];
}

function getSimilarity(string) {
  const sim = (1 - similarity(n0, string)) * 100;
  return sim.toFixed(2) + "%";
}

console.time("\n匹配时间");

const [possibleNames, counts] = guessPossibleNames(n0, aliases);
let i = 0;
Object.keys(possibleNames).forEach((key) => (console.log(n0 + " - " + key + " - " + getSimilarity(key)), i++));
console.log(`共匹配了 ${counts} 次，接受 ${i} 个建议`);
console.timeEnd("\n匹配时间");
