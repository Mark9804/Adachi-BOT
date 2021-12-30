import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { guessPossibleNames } from "../../utils/tools.js";
import { doCharacter } from "./character.js";
import { getName } from "./name.js";

async function Plugin(msg) {
  const name = getName(msg.text);
  const guess = guessPossibleNames(name, global.names.character);

  if (name === "男妈妈" || guess[0] === "男妈妈") {
    msg.bot.say(msg.sid, "男妈妈是大家的捏", msg.type, msg.uid, true);
    return;
  }

  switch (true) {
    case hasEntrance(msg.text, "character", "character"):
      if (guess.length > 0 && false !== checkAuth(msg, "character")) {
        doCharacter(msg, 1 === guess.length ? guess[0] : name, true, guess);
      }
      break;
    case hasEntrance(msg.text, "character", "others_character"):
      if (guess.length > 0 && false !== checkAuth(msg, "others_character")) {
        doCharacter(msg, 1 === guess.length ? guess[0] : name, false, guess);
      }
      break;
  }
}

export { Plugin as run };
