from django.db import models

# Create your models here.
class TempControl(models.Model):
	Name = models.TextField()
	Room = models.TextField()
	IpAddress = models.TextField()
	Type = models.TextField()
	Speed = models.TextField()
	TwistState = models.TextField()
	AutoState = models.TextField()
	class Meta:
		db_table = u'TempControl'
