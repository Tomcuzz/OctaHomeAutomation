from django.db import models

class ButtonInputDevice(models.Model):
	Name = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	ButonOneAction = models.ForeignKey('Alarm.Tasks', related_name="oneButtonActions", blank=True, null=True, on_delete=models.SET_NULL)
	ButonTwoAction = models.ForeignKey('Alarm.Tasks', related_name="twoButtonActions", blank=True, null=True, on_delete=models.SET_NULL)
	
	class Meta:
		db_table = u'ButtonInputDevice'

class MotionInputDevice(models.Model):
	Name = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	TriggerAction = models.ForeignKey('Alarm.Tasks', related_name="motionActions", blank=True, null=True, on_delete=models.SET_NULL)
	WaitTime = models.IntegerField() # in seconds
	TimeOutTaskCeleryId = models.TextField()
	TimeOutAction = models.ForeignKey('Alarm.Tasks', related_name="motionTimeoutActions", blank=True, null=True, on_delete=models.SET_NULL)
	
	class Meta:
		db_table = u'MotionInputDevice'

