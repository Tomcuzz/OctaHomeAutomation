import datetime
import json
from django.db import models

from Core.models import *
from Core.communication_controller import *

class TempMonitorDevice(InputDevice):
	LastTemp = models.IntegerField()
	LastUpdate = models.DateTimeField()
	
	def updateTemp(temp):
		self.LastTemp = temp
		self.LastUpdate = datetime.datetime.now()
	
	def getObjectType(self):
		supersType = super(TempMonitorDevice, self).getObjectType()
		return supersType + ["TempMonitorDevice"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'TempMonitorDevice')
	
	class Meta:
		abstract = True
	

class TempControlDevice(OutputDevice):
	TargetTemp = models.IntegerField()
	AutoTempControl = models.BooleanField(default=False)
	
	def getObjectType(self):
		supersType = super(TempControlDevice, self).getObjectType()
		return supersType + ["TempControlDevice"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'TempControlDevice')
	
	class Meta:
		abstract = True

class CenturalHeating(TempControlDevice):
	TimeStatuses = models.TextField()
	
	def setTimeStatuses(self, x):
		self.TimeStatuses = json.dumps(x)
	
	def getTimeStatuses(self, x):
		return json.loads(self.TimeStatuses)
	
	def getObjectType(self):
		supersType = super(CenturalHeating, self).getObjectType()
		return supersType + ["CenturalHeating"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'CenturalHeating')
	
	class Meta:
		abstract = True

class Fan(TempControlDevice):
	MaxFanSpeed = models.IntegerField()
	FanSpeed = models.IntegerField()
	TwistState = models.BooleanField(default=False)
	
	def getObjectType(self):
		supersType = super(Fan, self).getObjectType()
		return supersType + ["Fan"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'Fan')
	
	class Meta:
		abstract = True



#Arduino devices	
class ArduinoCenturalHeating(CenturalHeating):
	def getObjectType(self):
		supersType = super(ArduinoCenturalHeating, self).getObjectType()
		return supersType + ["ArduinoCenturalHeating"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'ArduinoCenturalHeating')
	
	class Meta:
		db_table = u'ArduinoCenturalHeating'

class ArduinoFan(Fan):
	def getObjectType(self):
		supersType = super(ArduinoFan, self).getObjectType()
		return supersType + ["ArduinoFan"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'ArduinoFan')
	
	class Meta:
		db_table = u'ArduinoFan'



# Create your models here.
#class TempControl(models.Model):
#	Name = models.TextField()
#	Room = models.TextField()
#	IpAddress = models.TextField()
#	Type = models.TextField()
#	Speed = models.TextField()
#	TwistState = models.TextField()
#	AutoState = models.TextField()
#	class Meta:
#		db_table = u'TempControl'
