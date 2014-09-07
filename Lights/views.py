from Core.views import *
from Core.models import *
from models import *

class handleLightView(viewRequestHandler):
	def getViewParameters(self):
		#lights = lightFactory().getAllLights(self.Kearguments)
		
		lights = LightDevice.getDevices(self.Kearguments)
		
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
