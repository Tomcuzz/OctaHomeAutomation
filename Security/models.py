from django.db import models

# Create your models here.
from django.db import models

class Lights(models.Model):
	LightName = models.TextField()
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
