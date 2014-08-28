from django.db import models
from Core.models import *

class LightDevice(OutputDevice):
	isOn = models.BooleanField()
	
	@abstractmethod
	def setOnOff(setOn):
		pass
	
	class Meta:
		abstract = True


class RGBLights(LightDevice):
	R = models.IntegerField()
	G = models.IntegerField()
	B = models.IntegerField()
	Scroll = models.ForeignKey(Home, related_name="ScrollModes")
	
	def setOnOff(setOn):
		self.isOn = setOn
		if setOn == True:
			self.setRGB(r=self.R, g=self.G, b=self.B):
		else:
			self.setRGB(r=0, g=0, b=0):
	
	@abstractmethod
	def setRGB(r=-1, g=-1, b=-1):
		pass
	
	@abstractmethod
	def setScroll(scrollMode):
		pass
	
	class Meta:
		abstract = True


class ArduinoRGBLight(OutputDevice):
	IpAddress = models.TextField()
	DeviceType = models.TextField()
	LightType = models.TextField()
	LightState = models.TextField()
	R = models.IntegerField()
	G = models.IntegerField()
	B = models.IntegerField()
	Scroll = models.TextField()
	BeingSetId = models.IntegerField()
	
	class Meta:
		db_table = u'Lights'

class ScrollModes(models.Model):
	Name = models.TextField()
	RValues = models.TextField()
	GValues = models.TextField()
	BValues = models.TextField()
	Speed = models.IntegerField()
	ChangeMode = models.TextField()
	
	class Meta:
		db_table = u'ScrollModes'

class LightScenes(models.Model):
	Name = models.TextField()
	RValue = models.TextField()
	GValue = models.TextField()
	BValue = models.TextField()
	
	class Meta:
		db_table = u'LightScenes'
