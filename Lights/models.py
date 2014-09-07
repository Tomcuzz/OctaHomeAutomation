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
	
	def setOnOff(setOn):
		self.isOn = setOn
		if setOn:
			self.setRGB(self.R, self.G, self.B)
		else:
			self.setRGB(0, 0, 0)
		self.save()
	
	def setR(r):
		self.setRGB(r, self.G, self.B)
	
	def setG(g):
		self.setRGB(self.R, g, self.B)
	
	def setB(b):
		self.setRGB(self.R, self.G, b)
	
	def setScroll(scrollModeName):
		self.Scroll = ScrollModes.objects.get(name=scrollModeName)
		self.save()
	
	
	def setRGB(r, g, b):
		pass
	
	class Meta:
		abstract = True

class ArduinoRGBLight(RGBLights):
	def setRGB(r, g, b):
		if r!=0 and g!=0 and b!=0:
			self.R = r
			self.G = g
			self.B = b
		
		message = "r=" + r + ",g=" + g + ",b=" + b + ","
		CommunicationControl().sendTCPMessage(self.ipAddress, self.port, message)
		self.save()
	
	class Meta:
		db_table = u'ArdinoRGBLights'

