from django.db import models

# Create your models here.

class World(models.Model):
	name = models.CharField(max_length=30)
	homes = models.ManyToManyField(Home)
	
class Home(models.Model):
	name = models.CharField(max_length=30)
	rooms = models.ManyToManyField(Room)

class Room(models.Model):
	name = models.CharField(max_length=30)

class Device(models.Model):
	name = models.CharField(max_length=30)
	ipAddress = models.CharField(max_length=30)
	
	class Meta:
		abstract = True

class OutputDevice(Device):
	currentState = models.BooleanField()
	controlPort = models.IntegerField()
	
	 class Meta:
	 	abstract = True