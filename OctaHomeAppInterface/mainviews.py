from OctaHomeCore.baseviews import *
from OctaHomeCore.devicemodels import *
from OctaHomeCore.devicecommands import *
from OctaHomeCore.locationmodels import *
import json

class handleBaseAppCommand(commandRequestHandler):
	def securityFails(self):
		if self.isSecuredArea:
			if not self.isUserAuthenticated:
				return True
				if 'HTTP_AUTHORIZATION' in self.Request.META:
					auth = self.Request.META['HTTP_AUTHORIZATION'].split()
					if len(auth) == 2:
						if auth[0].lower() == "basic":
							uname, passwd = base64.b64decode(auth[1]).split(':')
							device = DeviceUser.objects.get(pk=int(uname))
							if device is not None and device.User is not None and device.checkToken(loginItems[1]):
								device.User.backend = 'django.contrib.auth.backends.ModelBackend'
								login(self.Request, device.User)
								return False
				return True
			else:
				return False
		else:
			return False
	
	def handleAuthenticationFailue(self):
		response = HttpResponse()
		response.status_code = 401
		response['WWW-Authenticate'] = 'Basic realm=""'
		return response
	


class handleAppCommandCommand(handleBaseAppCommand):
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

class handleAppSingleDeviceCommand(handleBaseAppCommand):
	pass