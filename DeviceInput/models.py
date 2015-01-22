from django.db import models
from OctaHomeCore.locationmodels import *
from OctaHomeCore.devicemodels import *

class ButtonInputDevice(InputDevice):
	ButtonOneAction = models.ForeignKey('OctaHomeCore.TriggerEvent', related_name="oneButtonActions", blank=True, null=True, on_delete=models.SET_NULL)
	ButtonTwoAction = models.ForeignKey('OctaHomeCore.TriggerEvent', related_name="twoButtonActions", blank=True, null=True, on_delete=models.SET_NULL)
	
	class Meta:
		db_table = u'ButtonInputDevice'

class MotionInputDevice(InputDevice):
	TriggerAction = models.ForeignKey('OctaHomeCore.TriggerEvent', related_name="motionActions", blank=True, null=True, on_delete=models.SET_NULL)
	WaitTime = models.IntegerField() # in seconds
	TimeOutTaskCeleryId = models.TextField()
	TimeOutAction = models.ForeignKey('OctaHomeCore.TriggerEvent', related_name="motionTimeoutActions", blank=True, null=True, on_delete=models.SET_NULL)
	Activated = models.BooleanField(default=False)
	Armed = models.BooleanField(default=False)
	
	class Meta:
		db_table = u'MotionInputDevice'

