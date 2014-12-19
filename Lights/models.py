from django.db import models
from Core.devicemodels import *
from Core.inputoutputmodels import *
from Core.communication_controller import *

class ScrollModes(models.Model):
	##############
	# Parameters #
	##############
	Name = models.TextField()
	RValues = models.TextField()
	GValues = models.TextField()
	BValues = models.TextField()
	Speed = models.IntegerField()
	ChangeMode = models.TextField()
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'ScrollModes'


class LightDevice(OutputDevice):
	####################
	# View Parameters #
	####################
	ViewPartial = 'pages/Lights/_Light'
	def getJsPartials(self):
		result = super(LightDevice, self).getJsPartials()
		result.extend(["pages/Lights/_LightJs.html"])
		return 	result
	
	##############
	# Parameters #
	##############
	IsOn = models.BooleanField(default=False)
	
	##################
	# Object Methods #
	##################
	def listActions(self):
		result = super(LightDevice, self).listActions()
		result.extend(["setOnOff"])
		return result
	
	def	handleAction(self, function, parameters):
		if function == "setOnOff":
			if parameters.has_key('value'):
				return self.setOnOff(parameters['value'])
			else:
				return False
		else:
			return super(LightDevice, self).handleAction(function, parameters)
		self.save()
	
	def getState(self):
		result = super(LightDevice, self).getState()
		result.update({"IsOn":self.IsOn})
		return result
	
	def setOnOff(self, setOn):
		pass
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class RGBLight(LightDevice):
	####################
	# Class Parameters #
	####################
	ViewPartial = 'pages/Lights/_RGBLight'
	def getJsPartials(self):
		result = super(RGBLight, self).getJsPartials()
		result.extend(["pages/Lights/_RGBLightJs.html", "JsHelpers/_x-editable.html", "JsHelpers/_farbtastic.html"])
		return 	result
	
	##############
	# Parameters #
	##############
	R = models.IntegerField()
	G = models.IntegerField()
	B = models.IntegerField()
	Scroll = models.ForeignKey(ScrollModes, blank=True, null=True, related_name="RGBLights")
	
	#################
	# Class Methods #
	#################
	def listActions(self):
		result = super(RGBLight, self).listActions()
		result.extend(["setRGB", "setR", "setG", "setB", "setScroll"])
		return result
	
	def	handleAction(self, function, parameters):
		if function == "setRGB":
			if parameters.has_key('R') and parameters.has_key('G') and parameters.has_key('B'):
				return self.setRGB(parameters['R'], parameters['G'], parameters['B'])
			else:
				return False
		elif function == "setR":
			if parameters.has_key('value'):
				return self.setR(parameters['value'])
			else:
				return False
		elif function == "setG":
			if parameters.has_key('value'):
				return self.setG(parameters['value'])
			else:
				return False
		elif function == "setB":
			if parameters.has_key('value'):
				return self.setB(parameters['value'])
			else:
				return False
		elif function == "setSroll":
			return self.setScroll(parameters[0])
		else:
			return super(RGBLight, self).handleAction(function, parameters)
	
	def getState(self):
		result = super(RGBLight, self).getState()
		result.update({"R":self.R, "G":self.G, "B":self.B, "Scroll":self.getScroll()})
		return result
		
	##################
	# Object Methods #
	##################
	def getScroll(self):
		if self.Scroll:
			return self.Scroll.Name
		else:
			return "Off"
	
	def setOnOff(self, setOn):
		if setOn == 'On':
			if self.R != 0 and self.G != 0 and self.B != 0:
				self.setRGB(self.R, self.G, self.B)
			else:
				self.setRGB(255, 255, 255)
			self.isOn = True
			self.save()
			return True
		else:
			self.setRGB(0, 0, 0)
			self.isOn = False
			self.save()
			return True
		
	def setR(self, r):
		if self.checkColourInt(r):
			return self.setRGB(r, self.G, self.B)
		else:
			return False
	
	def setG(self, g):
		if self.checkColourInt(g):
			return self.setRGB(self.R, g, self.B)
		else:
			return False
	
	def setB(self, b):
		if self.checkColourInt(b):
			return self.setRGB(self.R, self.G, b)
		else:
			return False
	
	def getDisplayR(self):
		if self.IsOn > 0:
			return self.R
		else:
			return 0
	
	def getDisplayG(self):
		if self.IsOn > 0:
			return self.G
		else:
			return 0
	
	def getDisplayB(self):
		if self.IsOn > 0:
			return self.B
		else:
			return 0
	
	def setScroll(self, scrollModeName):
		self.Scroll = ScrollModes.objects.get(name=scrollModeName)
		self.save()
	
	def setRGB(self, r, g, b):
		pass
	
	def checkColourInt(self, colour):
		colour = int(colour)
		if 0 <= colour <= 255:
			return True
		else:
			return False
	
	########
	# Meta #
	########
	class Meta:
		abstract = True

class ArduinoRGBLight(RGBLight):
	##################
	# Object Methods #
	##################
	def setRGB(self, r, g, b):
		if self.checkColourInt(r) and self.checkColourInt(g) and self.checkColourInt(b):
			r = int(r)
			g = int(g)
			b = int(b)
			if r!=0 and g!=0 and b!=0:
				self.R = r
				self.G = g
				self.B = b
				self.IsOn = True
			else:
				self.IsOn = False
			
			if self.IpAddress and self.Port:
				message = "r=" + str(r) + ",g=" + str(g) + ",b=" + str(b) + ","
			#	try:
			#		CommunicationControl().sendTCPMessage(self.IpAddress, self.Port, message)
			#	except :
			#		pass
			self.save()
			return True
		else:
			return False
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'ArdinoRGBLights'

