import datetime
import json
from django.db import models

from Core.devicemodels import *
from Core.communication_controller import *

class TempMonitorDevice(InputDevice):
	LastTemp = models.IntegerField()
	LastUpdate = models.DateTimeField()
	
	def updateTemp(temp):
		self.LastTemp = temp
		self.LastUpdate = datetime.datetime.now()
	
	class Meta:
		abstract = True
	

class TempControlDevice(OutputDevice):
	TargetTemp = models.IntegerField()
	AutoTempControl = models.BooleanField(default=False)
	
	class Meta:
		abstract = True

class CenturalHeating(TempControlDevice):
	TimeStatuses = models.TextField()
	
	def setTimeStatuses(self, x):
		self.TimeStatuses = json.dumps(x)
	
	def getTimeStatuses(self, x):
		return json.loads(self.TimeStatuses)
	
	class Meta:
		abstract = True

class Fan(TempControlDevice):
	MaxFanSpeed = models.IntegerField()
	FanSpeed = models.IntegerField()
	TwistState = models.BooleanField(default=False)
	
	class Meta:
		abstract = True



#Arduino devices	
class ArduinoCenturalHeating(CenturalHeating):
	class Meta:
		db_table = u'ArduinoCenturalHeating'

class ArduinoFan(Fan):
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
