import re
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
	Colour = models.TextField(default="#000000")
	Scroll = models.ForeignKey(LightScrollMode, blank=True, null=True, related_name="RGBLights")
	
	#################
	# Class Methods #
	#################
	def listActions(self):
		result = super(RGBLight, self).listActions()
		result.extend(["setColour", "setScroll"])
		return result
	
	def	handleAction(self, action, parameters):
		if action == "setRGB":
			if parameters.has_key('R') and parameters.has_key('G') and parameters.has_key('B'):
				return self.setRGB(parameters['R'], parameters['G'], parameters['B'])
			else:
				return False
		elif parameters.has_key('value') and action in ["setColour", "setLightScrollScene"]:
			if action == "setColour":
				return self.setColour(parameters['value'])
			elif action == "setLightScrollScene":
				return self.setScroll(parameters['value'])
			else:
				return False
		else:
			return super(RGBLight, self).handleAction(action, parameters)
	
	def getState(self):
		result = super(RGBLight, self).getState()
		result.update({"Colour":{"DisplayName":"Colour", "Type":"Colour", "value":self.Colour}})
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
			if self.Colour != "#000000" and self.Colour != "#000" and self.Colour != "":
				self.setColour(self.Colour)
			else:
				self.setColour("#FFFFFF")
			self.IsOn = True
			self.save()
			return True
		elif setOn == 'Toggle':
			if self.IsOn == True:
				if self.Colour != "#000000" and self.Colour != "#000" and self.Colour != "":
					self.setColour(self.Colour)
				else:
					self.setColour("#FFFFFF")
				self.IsOn = True
				self.save()
				return True
			else:
				self.setColour("#000000")
				self.IsOn = False
				self.save()
				return True
		else:
			self.setColour("#000000")
			self.IsOn = False
			self.save()
			return True
		
	
	def setColour(self, colour):
		if not re.match('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', colour):
			return False
		
		self.Colour = colour
		self.save()
		return True
	
	def setScroll(self, scrollModeName):
		self.Scroll = LightScrollMode.objects.get(Name=scrollModeName)
		self.save()
	
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
		db_table = u'ArduinoRGBLights'

