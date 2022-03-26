import moment from "moment-timezone";

console.log(moment(new Date("Tue Mar 22 11:01:19 +0800 2022")).tz("Asia/Shanghai").valueOf());
