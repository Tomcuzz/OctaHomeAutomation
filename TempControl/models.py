import datetime
import json
from django.db import models

from OctaHomeCore.models import *
from OctaHomeCore.communication_controller import *

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
