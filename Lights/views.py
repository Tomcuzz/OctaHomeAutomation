from Core.baseviews import *
from Core.devicemodels import *
from models import *
import json

class handleLightView(viewRequestHandler):
	def getViewParameters(self):
		if self.Page == 'AddLight':
			deviceNames = LightDevice.getClassNames()
			rooms = Room.objects.all()
			return {'deviceName':deviceNames, 'rooms':rooms}
		else:
			lights = LightDevice.getDevices(self.Kwarguments)
			
			parameters = {'lights':lights, 'scrollModes':ScrollModes.objects.all()}
			
			if self.Kwarguments.has_key('house'):
				if self.Kwarguments['house'] == 'all':
					houseId = 'all'
				else:
					houseId = int(self.Kwarguments['house'])
				parameters.update({'house':houseId})
			else:
				parameters.update({'houses':Home.objects.all()})
				
			if self.Kwarguments.has_key('room'):
				parameters.update({'rooms':self.Kwarguments['room']})
			else:
				parameters.update({'rooms':Room.objects.all()})
			
			return parameters
	
	def getTemplate(self):
		if self.Protocal == 'cisco':
			if not self.Kwarguments.has_key('house'):
				return 'pages/Lights/Houses'
			elif not self.Kwarguments.has_key('room'):
				return 'pages/Lights/Rooms'
			elif not self.Kwarguments.has_key('page'):
				return 'pages/Lights/Lights'
		
		if self.Page == 'AddLight':
			return 'pages/Lights/AddLight'
		else:
			return 'pages/Lights/Main'
	
	def getSidebarUrlName(self):
		return 'Lights'

class handleLightCommand(commandRequestHandler):
	def runCommand(self):
		light = self.getLight()
		if light:
			if self.Command == 'getState':
				return HttpResponse(json.dumps({"R":light.R, "G":light.G, "B":light.B, "Scroll":light.getScroll()}))
			else:
				return self.handleUserError('Command Not Recognised')
				
		elif self.Command == 'AddLight':
			if self.Post.has_key('devicetype'):
				newLight = LightDevice(self.Post['devicetype'], self.Post)
				if newLight != None:
					newLight.save()
					return self.returnOk()
				else:
					return self.handleUserError('Error In Creation')
			else:
				return self.handleUserError('Device Type Not Found')
		else:
			return self.handleUserError('Light Not Found')
	
	def getLight(self):
		light = None
		if self.Kwarguments.has_key('lightType') and self.Kwarguments.has_key('lightId'):
			for aLight in Device.getDevices():
				if str(aLight.id) == str(self.Kwarguments['lightId']) and (aLight.__class__.__name__ == self.Kwarguments['lightType']):
					light = aLight
		return light
