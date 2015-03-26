from OctaHomeCore.baseviews import *
from OctaHomeCore.devicemodels import *
from OctaHomeCore.locationmodels import *
import json

class handleAppCommandCommand(commandRequestHandler):
	def runCommand(self):
		if self.Command == 'GetLocations':
			worldsJson = []
			countriesJson = []
			housesJson = []
			roomsJson = []
			for world in World.objects.all():
				worldsJson.append({'id':world.id, 'name':world.Name})
			for country in Country.objects.all():
				countriesJson.append({'id':country.id, 'name':country.Name, 'world':country.World.id})
			for house in Home.objects.all():
				housesJson.append({'id':house.id, 'name':house.Name, 'country':house.Country.id, 'remote':house.IsRemote})
			for room in Room.objects.all():
				roomsJson.append({'id':room.id, 'name':room.Name, 'house':room.Home.id})
			return self.returnJSONResult({'worlds':worldsJson, 'countries':countriesJson, 'houses':housesJson, 'rooms': roomsJson})
		elif self.Command == 'GetDevices':
			deviceObjects = Device.objects.all()
			returnDevices = []
			for deviceObject in deviceObjects:
				returnDevices.append(deviceObject.getState())
			return self.returnJSONResult(returnDevices)
		else:
			return self.returnJSONResult({ 'status':'error', 'error':'CommandNotFound' })