import requests
import json

with open("itemlist.json","r") as f:
	itemlist = f.read()
	f.close()

itemlist = json.loads(itemlist)

for i in itemlist:
	print(i['name'] + ":")
	for j in i['alias']['zh']:
		print("  " + "- " + str(j))
	# print(i['name'],i['alias']['zh'])