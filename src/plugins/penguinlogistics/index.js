import fetch from "node-fetch";
import { alias } from "../../utils/alias-arknights.js";
import { getInfo } from "../../utils/api.js";

async function Plugin(Message) {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let type = Message.type;
    let sendID = "group" === type ? groupID : userID;
    let name = Message.sender.nickname;
    let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);

    if (cmd.startsWith("掉落")) {
        let item = msg.slice(3); // 截取目标产物

        const headers = {
            "accept": "application/json;charset=UTF-8"
        };
        const items = await fetch("https://penguin-stats.io/PenguinStats/api/v2/items", {
            method: "GET",
            headers
        });
        var keys = Object.keys(items)
        var dict = {}

        keys.forEach((elem, index) => {
            var name = items[index]["name"];
            dict[name] = items[index]["itemId"]; // {'基础作战记录': '2001',… }
        });

        console.log(dict)
    }

    return null;
}