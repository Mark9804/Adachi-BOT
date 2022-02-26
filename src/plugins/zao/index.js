import { hasEntrance } from "#utils/config";
import { doWan, doZao } from "./zao.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "zao", "zao"):
      doZao(msg);
      break;
    case hasEntrance(msg.text, "zao", "wan"):
      doWan(msg);
      break;
  }
}

export { Plugin as run };
