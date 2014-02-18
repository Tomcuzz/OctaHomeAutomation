from django.db import models

class Lights(models.Model):
	LightName = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	RoomName = models.TextField()
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
