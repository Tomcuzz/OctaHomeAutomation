from Core.views import *
from models import *

class handleLightView(viewRequestHandler):
	page = 'home'
	
	def getViewParameters(self):
		#LightDevice.objects.all()
		return {'lights':[], 'scrollModes':ScrollModes.objects.all()}
	
	def getTemplate(self):
		if self.page == 'home':
			return 'pages/Lights/Main'
		elif self.page == 'addLightPage':
			return 'pages/Lights/AddLight'
		else:
			return 'pages/Lights/Main'
	
	def getSidebarUrlName(self):
		return 'Lights'

class handleLightCommand(commandRequestHandler):
	def runCommand(self):
		return ''
