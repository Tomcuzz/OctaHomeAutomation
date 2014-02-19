from django.db import models

class ButtonInputDevice(models.Model):
	Name = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	ButonOneAction = models.TextField()
	ButonTwoAction = models.TextField()
	
	class Meta:
		db_table = u'ButtonInputDevice'

class MotionInputDevice(models.Model):
	Name = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	TriggerAction = models.TextField()
	WaitTime = models.IntegerField() # in seconds
	TimeOutTaskCeleryId = models.TextField()
	TimeOutAction = models.TextField()
	
	class Meta:
		db_table = u'MotionInputDevice'