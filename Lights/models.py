from django.db import models
from Core.models import *
from Core.communication_controller import *

class ScrollModes(models.Model):
	Name = models.TextField()
	RValues = models.TextField()
	GValues = models.TextField()
	BValues = models.TextField()
	Speed = models.IntegerField()
	ChangeMode = models.TextField()
	
	class Meta:
		db_table = u'ScrollModes'


class LightDevice(OutputDevice):
	IsOn = models.BooleanField(default=False)
	
	def setOnOff(setOn):
		pass
	
	def getObjectType(self):
		supersType = super(LightDevice, self).getObjectType()
		return supersType + ["LightDevice"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'LightDevice')
	
	class Meta:
		abstract = True


class RGBLights(LightDevice):
	R = models.IntegerField()
	G = models.IntegerField()
	B = models.IntegerField()
	Scroll = models.ForeignKey(ScrollModes, blank=True, null=True, related_name="RGBLights")
	
	def listActions(self):
		return ["turnOn", "setRGB", "setSroll"];
	
	def	handleAction(self, function, parameters):
		if function == "turnOn":
			self.setOnOff(parameters[0])
		elif function == "setRGB":
			self.setRGB(parameters[0], parameters[1], parameters[2])
		elif function == "setSroll":
			self.setScroll(parameters[0])
		self.save()
	
	def getScroll(self):
		if self.Scroll:
			return self.Scroll.Name
		else:
			return "Off"
	
	def setOnOff(self, setOn):
		self.isOn = setOn
		if setOn:
			self.setRGB(self.R, self.G, self.B)
		else:
			self.setRGB(0, 0, 0)
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
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'RGBLightDevice')
	
	def getObjectType(self):
		supersType = super(RGBLights, self).getObjectType()
		return supersType + ["RGBLightDevice"]
	
	class Meta:
		abstract = True

class ArduinoRGBLight(RGBLights):
	def setRGB(self, r, g, b):
		if self.checkColourInt(r) and self.checkColourInt(g) and self.checkColourInt(b):
			r = int(r)
			g = int(g)
			b = int(b)
			if r!=0 and g!=0 and b!=0:
				self.R = r
				self.G = g
				self.B = b
			
			message = "r=" + r + ",g=" + g + ",b=" + b + ","
			CommunicationControl().sendTCPMessage(self.ipAddress, self.port, message)
			self.save()
			return True
		else:
			return False
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'ArduinoRGBLightDevice')
	
	def getObjectType(self):
		supersType = super(ArduinoRGBLight, self).getObjectType()
		return supersType + ['ArduinoRGBLightDevice']
	
	class Meta:
		db_table = u'ArdinoRGBLights'

