from Core.views import *
from models import *

class handleLightView(viewRequestHandler):
	page=''
	
	def recieveRequest(self, request, protocal='html', page='home'):
		self.page = page
		return handleRequest(self, request, protocal)
	
	def getViewParameters(self):
		return {'lights':LightDevice.objects.all(), 'scrollModes':ScrollModes.objects.all()}
	
	def getTemplate(self):
		if self.page == 'home':
			return 'pages/Lights/Main.html'
		elif self.page == 'addLightPage':
			return 'pages/Lights/AddLight.html'
		else:
			return 'pages/Lights/Main.html'