from Core.views import *
from Core.models import *
from models import *

class lightFactory():
	def getAllLights(self):
		lights = []
		rooms = Room.objects.all()
		for room in rooms.all():
			devices = room.Devices.all()
			for device in devices:
				lights.append(device)
		
		return lights
	


class handleLightView(viewRequestHandler):
	def getViewParameters(self):
		lights = lightFactory().getAllLights()
		parameters = {'lights':lights, 'scrollModes':ScrollModes.objects.all()}
		
		kwargs = self.Kearguments
		if kwargs.has_key('house'):
			parameters.update({'house':kwargs['house']})
		if kwargs.has_key('room'):
			parameters.update({'room':kwargs['room']})
		
		return parameters
	
	def getTemplate(self):
		items = self.Kearguments
		if items.has_key('page'):
			if items['page'] == 'AddLight':
				return 'pages/Lights/AddLight'
			else:
				return 'pages/Lights/Main'
		else:
			return 'pages/Lights/Main'
	
	def getSidebarUrlName(self):
		return 'Lights'

class handleLightCommand(commandRequestHandler):
	def runCommand(self):
		return ''
