from django.db import models
from Core.models import *
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
	##############
	# Parameters #
	##############
	IsOn = models.BooleanField(default=False)
	
	#################
	# Class Methods #
	#################
	def listActions(self):
		return super(LightDevice, self).listActions().append(["setOnOff"])
	
	def	handleAction(self, function, parameters):
		if function == "setOnOff":
			self.setOnOff(parameters[0])
		else:
			super(LightDevice, self).handleAction(function, parameters)
		self.save()
	
	def getState(self):
		return super(LightDevice, self).getState().update({"IsOn":self.IsOn})
	
	##################
	# Object Methods #
	##################
	def setOnOff(setOn):
		pass
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class RGBLight(LightDevice):
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
		return super(RGBLight, self).listActions().append(["setRGB", "setScroll"])
	
	def	handleAction(self, function, parameters):
		if function == "setRGB":
			self.setRGB(parameters[0], parameters[1], parameters[2])
		elif function == "setSroll":
			self.setScroll(parameters[0])
		else:
			super(RGBLight, self).handleAction(function, parameters)
		self.save()
	
	def getState(self):
		return super(RGBLight, self).getState().update({"R":self.R, "G":self.G, "B":self.B, "Scroll":self.getScroll()})
		
	##################
	# Object Methods #
	##################
	def getScroll(self):
		if self.Scroll:
			return self.Scroll.Name
		else:
			return "Off"
	
	def setOnOff(self, setOn):
		if setOn:
			self.setRGB(self.R, self.G, self.B)
		else:
			self.setRGB(0, 0, 0)
		self.isOn = setOn
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

