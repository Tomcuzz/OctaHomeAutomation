from Core.views import *
from Core.models import *
from models import *
import json

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
		if items.has_key('lightName'):
			light = items['lightName']
			if self.Command == 'toggleLightState':
				if light.IsOn:
					light.setOnOff(False)
				else:
					light.setOnOff(True)
				return self.returnOk()
			elif self.Command == 'turnOn':
				light.setOnOff(True)
				return self.returnOk()
			elif self.Command == 'turnOff':
				light.setOnOff(False)
				return self.returnOk()
			elif self.Command == 'setR':
				return setColout('R')
			elif self.Command == 'setB':
				return setColout('B')
			elif self.Command == 'setG':
				return setColout('G')
			elif self.Command == 'setRGB':
				return setColout('RGB')
			elif self.Command == 'getState':
				return HttpResponse(json.dumps({"R":light.R, "G":light.G, "B":light.B, "Scroll":light.getScroll()}))
			else:
				self.handleUserError('Command Not Recognised')
	
	def setColout(self, colour):
		if colour == 'R':
			result = light.setR(self.request.GET.get('value','-1')):
		elif colour == 'G':
			result = light.setG(self.request.GET.get('value','-1')):
		elif colour == 'B':
			result = light.setB(self.request.GET.get('value','-1')):
		elif colour == 'RGB':
			r = self.request.GET.get('r','-1')
			g = self.request.GET.get('g','-1')
			b = self.request.GET.get('b','-1')
			result = light.setRGB(r, g, b)
		else:
			result = False
		
		if result:
			return self.returnOk()
		else:
			self.handleUserError('Please Enter A Value Between 0 and 255')
	
	def getLight(self):
		return []
