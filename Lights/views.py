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
		light = self.getLight()
		if light:
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
				return self.setColour('R', light)
			elif self.Command == 'setB':
				return self.setColour('B', light)
			elif self.Command == 'setG':
				return self.setColour('G', light)
			elif self.Command == 'setRGB':
				return self.setColour('RGB', light)
			elif self.Command == 'getState':
				return HttpResponse(json.dumps({"R":light.R, "G":light.G, "B":light.B, "Scroll":light.getScroll()}))
			else:
				return self.handleUserError('Command Not Recognised')
		else:
			return self.handleUserError('Light Not Found')
	
	def setColour(self, colour, light):
		if colour == 'R':
			result = light.setR(int(self.request.POST.get('value','-1')))
		elif colour == 'G':
			result = light.setG(int(self.request.POST.get('value','-1')))
		elif colour == 'B':
			result = light.setB(int(self.request.POST.get('value','-1')))
		elif colour == 'RGB':
			r = int(self.request.POST.get('r','-1'))
			g = int(self.request.POST.get('g','-1'))
			b = int(self.request.POST.get('b','-1'))
			result = light.setRGB(r, g, b)
		else:
			result = False
		
		if result:
			return self.returnOk()
		else:
			self.handleUserError('Please Enter A Value Between 0 and 255')
	
	def getLight(self):
		light = None
		if self.Kwarguments.has_key('lightType') and self.Kwarguments.has_key('lightId'):
			for aLight in Device.getDevices(self.Kwarguments, self.Kwarguments['lightType']):
				if str(aLight.id) == str(self.Kwarguments['lightId']):
					light = aLight
		return light












