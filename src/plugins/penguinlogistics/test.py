import requests

item_id = "30012"


text = requests.get(
	url = "https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&itemFilter=" + item_id + "&server=CN&show_closed_zones=false",
	headers = {
	'accept': 'application/json;charset=UTF-8'
	}
	)

with open("result.json","w") as f:
	f.write(text.text)
	f.close()