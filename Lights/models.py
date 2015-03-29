from django.db import models
from OctaHomeCore.devicemodels import *
from OctaHomeCore.inputoutputmodels import *
from OctaHomeCore.communication_controller import *

class LightScrollMode(DeviceMode):
	##############
	# Parameters #
	##############
	RValues = models.TextField()
	GValues = models.TextField()
	BValues = models.TextField()
	Speed = models.IntegerField()
	ChangeMode = models.TextField()
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'LightScrollMode'


class LightDevice(OutputDevice):
	####################
	# View Parameters #
	####################
	ViewPartial = 'OctaHomeLights/_Light'
	@property
	def JsPartials(self):
		result = super(LightDevice, self).JsPartials
		result.extend(["OctaHomeLights/_LightJs.html"])
		return 	result
	
	@classmethod
	def getSectionName(cls):
		return 'Lights'
	
	@classmethod
	def getSectionSlug(cls):
		return 'Lights'
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class RGBLight(LightDevice):
	####################
	# Class Parameters #
	####################
	ViewPartial = 'OctaHomeLights/_RGBLight'
	
	@property
	def JsPartials(self):
		result = super(RGBLight, self).JsPartials
		result.extend(["OctaHomeLights/_RGBLightJs.html", "OctaHomeCore/JsHelpers/_x-editable.html", "OctaHomeCore/JsHelpers/_farbtastic.html"])
		return 	result
	
	##############
	# Parameters #
	##############
	Colour = models.ColourField()
	R = models.IntegerField(default=0)
	G = models.IntegerField(default=0)
	B = models.IntegerField(default=0)
	Scroll = models.ForeignKey(LightScrollMode, blank=True, null=True, related_name="RGBLights")
	
	#################
	# Class Methods #
	#################
	def listActions(self):
		result = super(RGBLight, self).listActions()
		result.extend(["setColour", "setRGB", "setR", "setG", "setB", "setScroll"])
		return result
	
	def	handleAction(self, action, parameters):
		if action == "setRGB":
			if parameters.has_key('R') and parameters.has_key('G') and parameters.has_key('B'):
				return self.setRGB(parameters['R'], parameters['G'], parameters['B'])
			else:
				return False
		elif parameters.has_key('value') and action in ["setR", "setG", "setB", "setLightScrollScene"]:
			if action == "setR":
				return self.setR(parameters['value'])
			elif action == "setG":
				return self.setG(parameters['value'])
			elif action == "setB":
				return self.setB(parameters['value'])
			elif action == "setLightScrollScene":
				return self.setScroll(parameters['value'])
			else:
				return False
		else:
			return super(RGBLight, self).handleAction(action, parameters)
	
	def getState(self):
		result = super(RGBLight, self).getState()
		result.update({"Colour":{"DisplayName":"Colour", "Type":"Colour", "value":self.Colour}})
		result.update({"R":{"DisplayName":"Red Level", "Type":"Int", "MinValue":0, "MaxValue":255, "value":self.R}})
		result.update({"G":{"DisplayName":"Green Level", "Type":"Int", "MinValue":0, "MaxValue":255, "value":self.G}})
		result.update({"B":{"DisplayName":"Blue Level", "Type":"Int", "MinValue":0, "MaxValue":255, "value":self.B}})
		result.update({"Scroll":{"DisplayName":"Scroll Mode", "Type":"Mode", "ModeType":"LightScrollMode", "value":self.getScroll()}})
		return result
		
	##################
	# Object Methods #
	##################
	def getScroll(self):
		if self.Scroll:
			return self.Scroll.Name
		else:
			return "None"
	
	def setIsOn(self, setOn):
		if setOn == 'True':
			if self.R != 0 and self.G != 0 and self.B != 0:
				self.setRGB(self.R, self.G, self.B)
			else:
				self.setRGB(255, 255, 255)
			self.isOn = True
			self.save()
			return True
		elif setOn == 'Toggle':
			if self.isOn == True:
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
		else:
			self.setRGB(0, 0, 0)
			self.isOn = False
			self.save()
			return True
		
	
	def setColour(self, colour):
		self.Colour = colour
	
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
		self.Scroll = LightScrollMode.objects.get(Name=scrollModeName)
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

