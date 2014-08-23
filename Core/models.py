from django.db import models

##
# Location Types
##
class World(models.Model):
	name = models.CharField(max_length=30)
	homes = models.ManyToManyField(Home)
	class Meta:
		db_table = u'Worlds'
	
class Home(models.Model):
	name = models.CharField(max_length=30)
	rooms = models.ManyToManyField(Room)
	class Meta:
		db_table = u'Homes'

class Room(models.Model):
	name = models.CharField(max_length=30)
	class Meta:
		db_table = u'Rooms'

##
# Device Types
##
class Device(models.Model):
	name = models.CharField(max_length=30)
	
	class Meta:
		abstract = True

class OutputDevice(Device):
	actions = models.ManyToManyField(Action)
	
	class Meta:
	 	abstract = True

class InputDevice(Device):
	events = models.ManyToManyField(Event)
	
	class Meta:
		abstract = True	



##
# Input/Output
##
class Action(models.Model):
	name = models.CharField(max_length=30)
	
	def run()
	
	class Meta:
		abstract = True


class Event(models.Model):
	name = models.CharField(max_length=30)
	actions = models.ManyToMany(Action)
	
	def call():
		for (action in self.actions):
			action.run()
	
	class Meta:
		abstract = True


